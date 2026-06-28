const HealthCase    = require("../models/healthCase");
const Consultation  = require("../models/Consultation");
const Animal        = require("../models/animal");
const Farm          = require("../models/farm");
const fs            = require("fs");
const { diagnoseSymptoms, analyzeImage } = require("../services/aiagent");
const { transcribeAudio }   = require("../voiceService");

// helper: تأكيد إن الحيوان ده ملك المزارع الحالي
const verifyAnimalOwnership = async (animalId, userId) => {
  const animal = await Animal.findOne({ _id: animalId, is_active: true }).populate(
    "farm_id",
    "user_id governorate"
  );
  if (!animal) return null;
  if (animal.farm_id.user_id.toString() !== userId.toString()) return null;
  return animal;
};

// ════════════════════════════════════════════════════════════════════════════
// POST /api/health-cases/diagnose
//
// الـ endpoint الموحّد للتشخيص — بيفرّق سلوكه حسب وجود animal_id:
//
// 1) فيه animal_id  → فتح من صفحة الحيوان — تشخيص كامل بالـ Context-Aware
//    (تاريخ مرضي + تطعيمات + أوبئة المحافظة) ويُخزَّن في HealthCase
//
// 2) مفيش animal_id → استشارة عامة من الشات المفتوح — تشخيص بالأعراض
//    ونوع الحيوان (لو مُحدد) فقط، ويُخزَّن في Consultation بدون أي ربط بحيوان
// ════════════════════════════════════════════════════════════════════════════
/**
 * المنطق المشترك للتشخيص — يُستخدم من /diagnose (نص) ومن /diagnose/voice (صوت)
 * بمجرد ما يكون النص جاهز (مكتوب أو مُفرَّغ من الصوت)، باقي الخطوات نفسها بالضبط
 *
 * @param {Object} req - يُستخدم فقط لـ req.user
 * @param {Object} body - { animal_id, species, symptoms (array أو نص), input_type }
 */
const runDiagnosis = async (req, body) => {
  const { animal_id, species, symptoms, input_type, image_url, image_findings } = body;

  const symptomsArray = Array.isArray(symptoms)
    ? symptoms.filter((item) => typeof item === "string" && item.trim().length > 0)
    : typeof symptoms === "string" && symptoms.trim()
    ? [symptoms.trim()]
    : [];

  const normalizedSymptoms = symptomsArray.length > 0
    ? symptomsArray
    : ["تحليل صورة الحالة"];

  const symptomsText = normalizedSymptoms.join("، ");

  // ──────────────────────────────────────────────────────────────────────────
  // الحالة 1: فيه animal_id → تشخيص مرتبط بحيوان مسجل
  // ──────────────────────────────────────────────────────────────────────────
  if (animal_id) {
    const animal = await verifyAnimalOwnership(animal_id, req.user._id);
    if (!animal) {
      return { status: 404, body: { success: false, message: "الحيوان غير موجود أو غير مصرح" } };
    }

    const governorate = animal.farm_id.governorate;

    const { diagnosis, rawResponse, knowledgeUsed } = await diagnoseSymptoms({
      symptomsText,
      animal,
      governorate,
      imageFindings: image_findings || null,
    });

    const healthCase = await HealthCase.create({
      animal_id,
      user_id: req.user._id,
      governorate,
      symptoms: normalizedSymptoms,
      input_type: input_type || "text",
      image_url: image_url || null,
      image_findings: image_findings || null,
      ai_diagnosis: diagnosis.diagnosis,
      confidence: diagnosis.confidence,
      severity: diagnosis.severity,
      matched_symptoms: diagnosis.matched_symptoms,
      suggested_actions: diagnosis.immediate_actions,
      vet_required: diagnosis.vet_required,
      vet_urgency: diagnosis.vet_urgency,
      ai_raw_response: rawResponse,
    });

    const healthStatusMap = { green: "healthy", yellow: "sick", red: "critical" };
    await Animal.findByIdAndUpdate(animal_id, {
      health_status: healthStatusMap[diagnosis.severity] || "sick",
    });

    return {
      status: 201,
      body: {
        success: true,
        message: "تم التشخيص بنجاح",
        consultation_type: "linked_to_animal",
        data: {
          case_id: healthCase._id,
          ...diagnosis,
          knowledge_sources: knowledgeUsed,
        },
      },
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // الحالة 2: مفيش animal_id → استشارة عامة بدون حيوان مسجل
  // ──────────────────────────────────────────────────────────────────────────
  if (!req.user.governorate) {
    return {
      status: 400,
      body: { success: false, message: "يرجى تحديد محافظتك في الملف الشخصي أولاً لاستخدام الاستشارة العامة" },
    };
  }

  const { diagnosis, rawResponse, knowledgeUsed } = await diagnoseSymptoms({
    symptomsText,
    species: species || null,
    imageFindings: image_findings || null,
  });

  const consultation = await Consultation.create({
    user_id: req.user._id,
    governorate: req.user.governorate,
    species: species || null,
    symptoms: normalizedSymptoms,
    input_type: input_type || "text",
    image_url: image_url || null,
    image_findings: image_findings || null,
    ai_diagnosis: diagnosis.diagnosis,
    confidence: diagnosis.confidence,
    severity: diagnosis.severity,
    matched_symptoms: diagnosis.matched_symptoms,
    suggested_actions: diagnosis.immediate_actions,
    vet_required: diagnosis.vet_required,
    vet_urgency: diagnosis.vet_urgency,
    ai_raw_response: rawResponse,
  });

  return {
    status: 201,
    body: {
      success: true,
      message: "تم التشخيص بنجاح (استشارة عامة)",
      consultation_type: "general",
      data: {
        consultation_id: consultation._id,
        ...diagnosis,
        knowledge_sources: knowledgeUsed,
      },
    },
  };
};

// ════════════════════════════════════════════════════════════════════════════
// POST /api/health-cases/diagnose
//
// الـ endpoint الموحّد للتشخيص — بيفرّق سلوكه حسب وجود animal_id:
//
// 1) فيه animal_id  → فتح من صفحة الحيوان — تشخيص كامل بالـ Context-Aware
//    (تاريخ مرضي + تطعيمات + أوبئة المحافظة) ويُخزَّن في HealthCase
//
// 2) مفيش animal_id → استشارة عامة من الشات المفتوح — تشخيص بالأعراض
//    ونوع الحيوان (لو مُحدد) فقط، ويُخزَّن في Consultation بدون أي ربط بحيوان
// ════════════════════════════════════════════════════════════════════════════
const diagnose = async (req, res) => {
  try {
    const result = await runDiagnosis(req, req.body);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error("diagnose error:", err);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التشخيص. حاول مرة أخرى.",
      error: err.message,
    });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// POST /api/health-cases/diagnose/voice
//
// نفس منطق /diagnose بالضبط، لكن المدخل ملف صوتي بدل نص مكتوب.
// الـ multer (uploadAudio) بيحط الملف في req.file، وباقي الحقول (animal_id,
// species) بتيجي عادي كـ form-data text fields جنب الملف.
//
// الخطوات: استقبال الملف → تفريغه لنص بـ Whisper → حذف الملف المؤقت →
// تمرير النص لنفس runDiagnosis() المُستخدمة في التشخيص النصي
// ════════════════════════════════════════════════════════════════════════════
const diagnoseVoice = async (req, res) => {
  let audioPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "ملف الصوت مطلوب" });
    }
    audioPath = req.file.path;

    // ── تفريغ الصوت لنص عربي ─────────────────────────────────────────────────
    const transcribedText = await transcribeAudio(audioPath);

    if (!transcribedText || !transcribedText.trim()) {
      return res.status(422).json({
        success: false,
        message: "لم نتمكن من فهم التسجيل الصوتي، يرجى المحاولة مرة أخرى بصوت أوضح",
      });
    }

    // ── تمرير النص المُفرَّغ لنفس منطق التشخيص النصي ──────────────────────────
    const result = await runDiagnosis(req, {
      animal_id: req.body.animal_id || null,
      species: req.body.species || null,
      symptoms: [transcribedText], // نص واحد طويل كعرض واحد، الـ AI بيفهم منه الأعراض
      input_type: "voice",
    });

    // نُرجع النص المُفرَّغ في الرد عشان الـ frontend يقدر يعرضه للمزارع للتأكيد
    result.body.transcribed_text = transcribedText;

    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error("diagnoseVoice error:", err);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء معالجة التسجيل الصوتي. حاول مرة أخرى.",
      error: err.message,
    });
  } finally {
    // تنظيف الملف الصوتي المؤقت من السيرفر دايماً، نجح التفريغ أو فشل
    if (audioPath) {
      fs.unlink(audioPath, (err) => {
        if (err) console.warn("لم يتم حذف الملف الصوتي المؤقت:", err.message);
      });
    }
  }
};

// ════════════════════════════════════════════════════════════════════════════
// GET /api/health-cases/animal/:animalId — تاريخ الحالات المرضية لحيوان معين
// ════════════════════════════════════════════════════════════════════════════
const diagnoseImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "الصورة مطلوبة" });
    }

    const imageUrl = `/uploads/health-cases/${req.file.filename}`;
    const inputType = req.body.symptoms ? "text+image" : "image";

    // ── تحليل الصورة بصرياً عبر Gemini Vision لاستخراج الأعراض الظاهرة ──────────
    let imageFindings = null;
    try {
      imageFindings = await analyzeImage(req.file.path, req.file.mimetype);
    } catch (visionErr) {
      console.error("analyzeImage error:", visionErr.message);
      // لو فشل تحليل الصورة، نكمل بدون image_findings بدل ما نفشل الطلب كله
    }

    const result = await runDiagnosis(req, {
      animal_id: req.body.animal_id || null,
      species: req.body.species || null,
      symptoms: req.body.symptoms || [],
      input_type: inputType,
      image_url: imageUrl,
      image_findings: imageFindings,
    });

    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error("diagnoseImage error:", err);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء معالجة الصورة. حاول مرة أخرى.",
      error: err.message,
    });
  }
};

const getCasesByAnimal = async (req, res) => {
  try {
    const animal = await verifyAnimalOwnership(req.params.animalId, req.user._id);
    if (!animal) {
      return res.status(404).json({ success: false, message: "الحيوان غير موجود أو غير مصرح" });
    }

    const cases = await HealthCase.find({ animal_id: req.params.animalId })
      .sort({ created_at: -1 });

    return res.status(200).json({ success: true, count: cases.length, data: cases });
  } catch (err) {
    console.error("getCasesByAnimal error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// GET /api/health-cases/consultations — سجل الاستشارات العامة للمستخدم الحالي
// ════════════════════════════════════════════════════════════════════════════
const getMyConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ user_id: req.user._id })
      .sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations,
    });
  } catch (err) {
    console.error("getMyConsultations error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// GET /api/health-cases/:id — تفاصيل حالة واحدة (مرتبطة بحيوان)
// ════════════════════════════════════════════════════════════════════════════
const getCaseById = async (req, res) => {
  try {
    const healthCase = await HealthCase.findById(req.params.id).populate(
      "animal_id",
      "tag_number species"
    );

    if (!healthCase) {
      return res.status(404).json({ success: false, message: "الحالة غير موجودة" });
    }

    if (healthCase.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "غير مصرح" });
    }

    return res.status(200).json({ success: true, data: healthCase });
  } catch (err) {
    console.error("getCaseById error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// PUT /api/health-cases/:id/resolve — إغلاق الحالة بعد الشفاء (حيوان مسجل فقط)
// ════════════════════════════════════════════════════════════════════════════
const resolveCase = async (req, res) => {
  try {
    const healthCase = await HealthCase.findById(req.params.id);
    if (!healthCase) {
      return res.status(404).json({ success: false, message: "الحالة غير موجودة" });
    }
    if (healthCase.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "غير مصرح" });
    }

    healthCase.resolved    = true;
    healthCase.resolved_at = new Date();
    if (req.body.vet_consulted !== undefined) {
      healthCase.vet_consulted = req.body.vet_consulted;
    }
    await healthCase.save();

    await Animal.findByIdAndUpdate(healthCase.animal_id, { health_status: "healthy" });

    return res.status(200).json({ success: true, message: "تم إغلاق الحالة بنجاح", data: healthCase });
  } catch (err) {
    console.error("resolveCase error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  diagnose,
  diagnoseVoice,
  diagnoseImage,
  getCasesByAnimal,
  getMyConsultations,
  getCaseById,
  resolveCase,
};