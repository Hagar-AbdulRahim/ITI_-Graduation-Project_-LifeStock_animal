const HealthCase     = require("../models/healthCase");
const Consultation   = require("../models/Consultation");
const OutbreakReport = require("../models/Outbreakreport");
const User           = require("../models/user");
const { chatModel }  = require("../config/gemini");
const { sendNotification } = require("./notificationService");

const OUTBREAK_CASE_THRESHOLD  = parseInt(process.env.OUTBREAK_CASE_THRESHOLD, 10)  || 6;
const OUTBREAK_WINDOW_HOURS    = parseInt(process.env.OUTBREAK_WINDOW_HOURS, 10)    || 48;
const CONSULTATION_DEDUP_HOURS = parseInt(process.env.CONSULTATION_DEDUP_HOURS, 10) || 1;

// HealthCase — عدّ حيوانات فريدة (animal_id) لكل {محافظة + تشخيص}
const getHealthCaseCandidates = async (sinceDate) => {
  return HealthCase.aggregate([
    {
      $match: {
        created_at:    { $gte: sinceDate },
        ai_diagnosis:  { $ne: null, $nin: ["غير محدد", ""] },
        governorate:   { $ne: null },
        is_historical: { $ne: true },
        animal_id:     { $ne: null },
      },
    },
    { $sort: { created_at: 1 } },
    {
      $group: {
        _id: {
          animal_id:   "$animal_id",
          diagnosis:   "$ai_diagnosis",
          governorate: "$governorate",
        },
        first_seen: { $first: "$created_at" },
      },
    },
    {
      $group: {
        _id: { governorate: "$_id.governorate", diagnosis: "$_id.diagnosis" },
        unique_animals_count: { $sum: 1 },
      },
    },
    { $match: { unique_animals_count: { $gte: OUTBREAK_CASE_THRESHOLD } } },
    {
      $project: {
        governorate: "$_id.governorate",
        diagnosis:   "$_id.diagnosis",
        cases_count: "$unique_animals_count",
        source:      { $literal: "health_case" },
        _id:         0,
      },
    },
  ]);
};

// Consultation — عدّ users فريدين مع dedup للتسجيلات المتكررة خلال ساعة
const getConsultationCandidates = async (sinceDate) => {
  const dedupMs = CONSULTATION_DEDUP_HOURS * 60 * 60 * 1000;

  return Consultation.aggregate([
    {
      $match: {
        created_at:   { $gte: sinceDate },
        ai_diagnosis: { $ne: null, $nin: ["غير محدد", ""] },
        governorate:  { $ne: null },
      },
    },
    { $sort: { user_id: 1, ai_diagnosis: 1, governorate: 1, created_at: 1 } },
    {
      $group: {
        _id: {
          user_id:     "$user_id",
          diagnosis:   "$ai_diagnosis",
          governorate: "$governorate",
        },
        times: { $push: "$created_at" },
      },
    },
    {
      $addFields: {
        independent_sessions: {
          $size: {
            $reduce: {
              input:        { $slice: ["$times", 1, { $subtract: [{ $size: "$times" }, 1] }] },
              initialValue: { count: 1, prev: { $arrayElemAt: ["$times", 0] } },
              in: {
                count: {
                  $add: [
                    "$$value.count",
                    { $cond: [{ $gt: [{ $subtract: ["$$this", "$$value.prev"] }, dedupMs] }, 1, 0] },
                  ],
                },
                prev: "$$this",
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: { governorate: "$_id.governorate", diagnosis: "$_id.diagnosis" },
        unique_users_count: { $sum: 1 },
      },
    },
    { $match: { unique_users_count: { $gte: OUTBREAK_CASE_THRESHOLD } } },
    {
      $project: {
        governorate: "$_id.governorate",
        diagnosis:   "$_id.diagnosis",
        cases_count: "$unique_users_count",
        source:      { $literal: "consultation" },
        _id:         0,
      },
    },
  ]);
};

// دمج النتيجتين
const getCombinedOutbreakCandidates = async (sinceDate) => {
  const [healthResults, consultationResults] = await Promise.all([
    getHealthCaseCandidates(sinceDate),
    getConsultationCandidates(sinceDate),
  ]);

  const merged = new Map();
  for (const r of [...healthResults, ...consultationResults]) {
    const key = `${r.governorate}|||${r.diagnosis}`;
    const existing = merged.get(key);
    if (existing) {
      existing.cases_count += r.cases_count;
      existing.sources.push(r.source);
    } else {
      merged.set(key, { ...r, sources: [r.source] });
    }
  }

  return Array.from(merged.values()).filter((c) => c.cases_count >= OUTBREAK_CASE_THRESHOLD);
};

// توليد رسالة التحذير بـ Gemini
const generateOutbreakWarningMessage = async (diagnosis, governorate, casesCount) => {
  try {
    const prompt = `
أنت مساعد بيطري. تم اكتشاف ارتفاع غير طبيعي في عدد حالات مرض.
المرض: ${diagnosis}
المحافظة: ${governorate}
عدد الحيوانات المصابة: ${casesCount} خلال ${OUTBREAK_WINDOW_HOURS} ساعة
اكتب رسالة تحذيرية قصيرة (2-3 جمل) بالعربية البسيطة تتضمن التنبيه ونصيحة فورية وتوصية بمتابعة القطيع. اكتب الرسالة فقط بدون عناوين.
    `.trim();
    const result = await chatModel.generateContent([{ text: prompt }]);
    return result.response.text().trim();
  } catch {
    return `تحذير: تم رصد ${casesCount} حالات ${diagnosis} في محافظة ${governorate}. يُرجى عزل الحيوانات المريضة والتواصل مع طبيب بيطري فوراً.`;
  }
};

// Upsert تقرير الوباء
const upsertOutbreakReport = async (diagnosis, governorate, casesCount) => {
  const existing = await OutbreakReport.findOne({
    disease_name: diagnosis,
    governorate,
    status: "active",
  });

  if (existing) {
    existing.cases_count = casesCount;
    await existing.save();
    return { report: existing, isNewOutbreak: false };
  }

  const ai_warning_message = await generateOutbreakWarningMessage(diagnosis, governorate, casesCount);
  const report = await OutbreakReport.create({
    disease_name: diagnosis,
    governorate,
    cases_count: casesCount,
    status: "active",
    ai_warning_message,
  });

  return { report, isNewOutbreak: true };
};

// إشعار كل المستخدمين
const broadcastOutbreakAlert = async (report) => {
  const allUsers = await User.find({ is_active: { $ne: false } })
    .select("fcm_token notifications_enabled");

  let sentCount = 0;
  for (const user of allUsers) {
    await sendNotification({
      user,
      type:  "outbreak_alert",
      title: `⚠️ تحذير: انتشار ${report.disease_name} في ${report.governorate}`,
      body:  report.ai_warning_message,
      data: {
        outbreak_report_id: report._id.toString(),
        governorate:        report.governorate,
        disease_name:       report.disease_name,
        cases_count:        report.cases_count.toString(),
      },
    });
    sentCount++;
  }
  return sentCount;
};

// الدالة الرئيسية
const runOutbreakDetection = async () => {
  console.log(`[${new Date().toISOString()}] بدء فحص الأوبئة (حد: ${OUTBREAK_CASE_THRESHOLD} حالة / ${OUTBREAK_WINDOW_HOURS} ساعة)...`);
  try {
    const sinceDate  = new Date(Date.now() - OUTBREAK_WINDOW_HOURS * 60 * 60 * 1000);
    const candidates = await getCombinedOutbreakCandidates(sinceDate);

    if (!candidates.length) {
      console.log("✓ لا يوجد أوبئة محتملة حالياً");
      return;
    }

    for (const candidate of candidates) {
      const { report, isNewOutbreak } = await upsertOutbreakReport(
        candidate.diagnosis, candidate.governorate, candidate.cases_count
      );
      console.log(`${isNewOutbreak ? "🆕 وباء جديد" : "🔁 تحديث"}: ${candidate.diagnosis} | ${candidate.governorate} | ${candidate.cases_count} حالة`);
      if (isNewOutbreak) {
        const sentCount = await broadcastOutbreakAlert(report);
        console.log(`✅ إشعار أُرسل لـ ${sentCount} مستخدم`);
      }
    }
  } catch (err) {
    console.error("خطأ في فحص الأوبئة:", err.message);
  }
};

module.exports = { runOutbreakDetection, OUTBREAK_CASE_THRESHOLD, OUTBREAK_WINDOW_HOURS };