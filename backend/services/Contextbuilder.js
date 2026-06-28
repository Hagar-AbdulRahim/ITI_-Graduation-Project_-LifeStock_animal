const HealthCase     = require("../models/healthCase");
const Vaccination    = require("../models/vaccination");
const OutbreakReport  = require("../models/Outbreakreport");

const SPECIES_LABELS = {
  cattle: "بقرة",
  sheep:  "خروف",
  goat:   "ماعز",
};

/**
 * يجمع كل السياق المطلوب عن حيوان معين قبل إرسال الـ prompt للـ AI:
 * - آخر 5 حالات مرضية سابقة
 * - حالة التطعيمات (مكتملة / متأخرة)
 * - الأوبئة النشطة في نفس المحافظة
 */
const buildAnimalContext = async (animal, governorate) => {
  // ── 1. التاريخ المرضي ──────────────────────────────────────────────────────
  const pastCases = await HealthCase.find({ animal_id: animal._id })
    .sort({ created_at: -1 })
    .limit(5)
    .select("symptoms ai_diagnosis severity created_at resolved");

  // ── 2. التطعيمات ────────────────────────────────────────────────────────────
  const vaccinations = await Vaccination.find({ animal_id: animal._id })
    .sort({ next_due_date: 1 })
    .select("vaccine_name last_date next_due_date");

  const now = new Date();
  const vaccinationStatus = vaccinations.map((v) => ({
    name: v.vaccine_name,
    status: v.next_due_date < now ? "متأخر" : "مكتمل",
    next_due_date: v.next_due_date,
  }));

  // ── 3. الأوبئة النشطة في نفس المحافظة ──────────────────────────────────────
  const activeOutbreaks = await OutbreakReport.find({
    governorate,
    status: "active",
  }).select("disease_name cases_count detected_at");

  return { pastCases, vaccinationStatus, activeOutbreaks };
};

/**
 * يبني نص الـ context الكامل بالعربي عشان يُحشر في الـ prompt
 */
const formatContextForPrompt = (animal, context, governorate) => {
  const { pastCases, vaccinationStatus, activeOutbreaks } = context;

  let text = `[بيانات الحيوان]\n`;
  text += `النوع: ${SPECIES_LABELS[animal.species] || animal.species}\n`;
  text += `الجنس: ${animal.gender === "male" ? "ذكر" : "أنثى"}\n`;
  text += `العمر: ${animal.age_value} ${animal.age_unit === "years" ? "سنة" : "شهر"}\n`;
  if (animal.weight_kg) text += `الوزن: ${animal.weight_kg} كجم\n`;
  if (animal.breed) text += `السلالة: ${animal.breed}\n`;

  if (pastCases.length > 0) {
    text += `\n[التاريخ المرضي السابق]\n`;
    pastCases.forEach((c) => {
      const date = new Date(c.created_at).toLocaleDateString("ar-EG");
      text += `- ${date}: ${c.ai_diagnosis || "غير محدد"} (خطورة: ${c.severity || "غير محدد"}) — الأعراض: ${c.symptoms.join("، ")}\n`;
    });
  } else {
    text += `\n[التاريخ المرضي السابق]\nلا يوجد حالات مسجلة سابقة\n`;
  }

  if (vaccinationStatus.length > 0) {
    text += `\n[حالة التطعيمات]\n`;
    vaccinationStatus.forEach((v) => {
      text += `- ${v.name}: ${v.status}\n`;
    });
  } else {
    text += `\n[حالة التطعيمات]\nلا توجد تطعيمات مسجلة\n`;
  }

  if (activeOutbreaks.length > 0) {
    text += `\n[تحذير: أوبئة نشطة في محافظة ${governorate}]\n`;
    activeOutbreaks.forEach((o) => {
      text += `- ${o.disease_name}: ${o.cases_count} حالة مسجلة\n`;
    });
  }

  return text;
};

module.exports = { buildAnimalContext, formatContextForPrompt };