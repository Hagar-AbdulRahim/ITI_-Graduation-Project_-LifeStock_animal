const HealthCase    = require("../models/healthCase");
const Consultation  = require("../models/Consultation");
const Animal        = require("../models/animal");
const Farm          = require("../models/farm");
const User          = require("../models/user");
const fs            = require("fs");
const { diagnoseSymptoms } = require("../services/aiagent");
const { transcribeAudio }   = require("../voiceService");
const { isAdmin, isStaff } = require("../utils/accessControl");
const { sendNotification }  = require("../services/notificationService");

// ── إشعار صاحب المزرعة لما حالة الحيوان تبقى حرجة (severity = red) ─────────
const notifyIfCritical = async ({ severity, ownerId, animalId, tagNumber }) => {
  if (severity !== "red" || !ownerId) return;

  try {
    const owner = await User.findById(ownerId);
    if (!owner) return;

    await sendNotification({
      user:      owner,
      title:     "⚠️ حالة حرجة",
      body:      `حيوان رقم ${tagNumber || ""} في حالة صحية حرجة ويحتاج تدخل بيطري فوري`,
      type:      "health_case",
      animal_id: animalId,
    });
  } catch (err) {
    console.error("notifyIfCritical error:", err.message);
  }
};

// helper: وصول للحيوان (لم يتغير)
const verifyAnimalAccess = async (animalId, user, { requireOwnership = false } = {}) => {
  const animal = await Animal.findOne({ _id: animalId, is_active: true }).populate(
    "farm_id",
    "user_id governorate"
  );
  if (!animal) return null;

  if (isAdmin(user)) return animal;

  const isOwner = animal.farm_id.user_id.toString() === user._id.toString();

  if (requireOwnership) {
    if (!isOwner) return null;
    return animal;
  }

  if (isOwner) return animal;
  if (isStaff(user)) return animal; // admin/sub_admin: وصول للحالات في كل المحافظات

  return null;
};

const MAX_CLARIFICATION_QUESTIONS = 3;

const normalizeImageMime = (file) => {
  const ext = file.originalname?.split(".").pop()?.toLowerCase();
  const mimeMap = { jfif: "image/jpeg", jpe: "image/jpeg", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
  return mimeMap[ext] || file.mimetype || "image/jpeg";
};

const sanitizeChatHistory = (chatHistory = []) =>
  Array.isArray(chatHistory)
    ? chatHistory
        .filter((msg) => ["assistant", "user"].includes(msg?.role))
        .map((msg) => ({
          role: msg.role,
          content: String(msg.content || "").trim(),
        }))
        .filter((msg) => msg.content.length > 0)
        .slice(-MAX_CLARIFICATION_QUESTIONS * 2)
    : [];

const countClarificationQuestions = (chatHistory = []) =>
  chatHistory.filter((msg) => msg.role === "assistant").length;

// ════════════════════════════════════════════════════════════════════════════
// formatTreatment — يحول object العلاج القادم من الـ AI (result.treatment)
// إلى نص واحد مقروء يُعرض مباشرة في جدول الأدمن (recommended_treatment)
// ════════════════════════════════════════════════════════════════════════════
const formatTreatment = (treatment) => {
  if (!treatment) return null;

  const parts = [];

  if (Array.isArray(treatment.medicines) && treatment.medicines.length > 0) {
    const meds = treatment.medicines
      .filter((m) => m && m.name)
      .map((m) => {
        const details = [m.dose, m.route, m.duration].filter(Boolean).join(" - ");
        return details ? `${m.name} (${details})` : m.name;
      })
      .join("، ");
    if (meds) parts.push(meds);
  }

  if (Array.isArray(treatment.general_instructions) && treatment.general_instructions.length > 0) {
    parts.push(treatment.general_instructions.join("، "));
  }

  return parts.length > 0 ? parts.join(" | ") : null;
};

// ════════════════════════════════════════════════════════════════════════════
// runDiagnosis — المنطق المشترك (المُحدَّث لدعم الـ schema الجديد)
// ════════════════════════════════════════════════════════════════════════════
const runDiagnosis = async (req, body) => {
  const {
    animal_id, species, symptoms, input_type,
    image_url, image_urls = [],
    imagePath = null, imageMime = null,
  } = body;

  const symptomsArray = Array.isArray(symptoms)
    ? symptoms.filter((item) => typeof item === "string" && item.trim().length > 0)
    : typeof symptoms === "string" && symptoms.trim()
    ? [symptoms.trim()]
    : [];

  const imageUrlsArray = Array.isArray(image_urls)
    ? image_urls.filter((url) => typeof url === "string" && url.trim().length > 0)
    : image_url
    ? [image_url]
    : [];
  const imageUrl = imageUrlsArray[0] || null;

  const normalizedSymptoms = symptomsArray.length > 0
    ? symptomsArray
    : ["تحليل صورة الحالة"];

  const symptomsText = normalizedSymptoms.join("، ");

  const buildResponse = (result, savedRecord, consultationType) => ({
    status: 201,
    body: {
      success:           true,
      status:            result.status || "diagnosed",
      record_id:         savedRecord?._id,
      consultation_type: consultationType,
      image_url:         savedRecord?.image_url || imageUrl || null,
      image_urls:        savedRecord?.image_urls?.length ? savedRecord.image_urls : imageUrlsArray,
      data:              result,
    },
  });

  const saveAndRespond = async ({ animal, governorate, consultationType }) => {
    const result = await diagnoseSymptoms({
      symptomsText,
      animal:      animal || null,
      governorate: governorate || null,
      species:     species || null,
      imagePath,
      imageMime,
    });

    if (result.status === "needs_clarification") {
      return {
        status: 200,
        body: {
          success:           true,
          status:            "needs_clarification",
          question:          result.question,
          possible_diseases: result.possible_diseases || [],
        },
      };
    }

    let savedRecord = null;

    if (animal_id && animal) {
      savedRecord = await HealthCase.create({
        animal_id,
        user_id:           req.user._id,
        governorate,
        symptoms:          normalizedSymptoms,
        input_type:        input_type || "text",
        image_url:         imageUrl,
        image_urls:        imageUrlsArray,
        image_findings:    result.image_findings || null,
        ai_diagnosis:      result.diagnosis || null,
        confidence:        result.confidence || null,
        severity:          result.severity || null,
        matched_symptoms:  result.matched_symptoms || [],
        suggested_actions: result.immediate_actions || [],
        recommended_treatment: formatTreatment(result.treatment),
        vet_required:      result.vet_required || false,
        vet_urgency:       result.vet_urgency || null,
        ai_raw_response:   result,
      });

      const healthStatusMap = { green: "healthy", yellow: "sick", red: "critical" };
      await Animal.findByIdAndUpdate(animal_id, {
        health_status: healthStatusMap[result.severity] || "sick",
      });

      await notifyIfCritical({
        severity:  result.severity,
        ownerId:   animal?.farm_id?.user_id,
        animalId:  animal_id,
        tagNumber: animal?.tag_number,
      });
    } else {
      savedRecord = await Consultation.create({
        user_id:           req.user._id,
        governorate:       governorate || req.user.governorate,
        species:           species || null,
        symptoms:          normalizedSymptoms,
        input_type:        input_type || "text",
        image_url:         imageUrl || null,
        image_urls:        imageUrlsArray,
        image_findings:    result.image_findings || null,
        ai_diagnosis:      result.diagnosis || null,
        confidence:        result.confidence || null,
        severity:          result.severity || null,
        matched_symptoms:  result.matched_symptoms || [],
        suggested_actions: result.immediate_actions || [],
        recommended_treatment: formatTreatment(result.treatment),
        vet_required:      result.vet_required || false,
        vet_urgency:       result.vet_urgency || null,
        ai_raw_response:   result,
      });
    }

    return buildResponse(result, savedRecord, consultationType);
  };

  // ── الحالة 1: فيه animal_id → تشخيص مرتبط بحيوان مسجل ──────────────────
  if (animal_id) {
    const animal = await verifyAnimalAccess(animal_id, req.user, { requireOwnership: true });
    if (!animal) {
      return { status: 404, body: { success: false, message: "الحيوان غير موجود أو غير مصرح" } };
    }
    return saveAndRespond({
      animal,
      governorate:       animal.farm_id.governorate,
      consultationType:  "linked_to_animal",
    });
  }

  // ── الحالة 2: مفيش animal_id → استشارة عامة ─────────────────────────────
  if (!req.user.governorate) {
    return {
      status: 400,
      body: { success: false, message: "يرجى تحديد محافظتك في الملف الشخصي أولاً لاستخدام الاستشارة العامة" },
    };
  }

  return saveAndRespond({
    animal:           null,
    governorate:      req.user.governorate,
    consultationType: "general",
  });
};

// ── الدوال الباقية لم تتغير ───────────────────────────────────────────────────
// ── POST /api/health-cases/diagnose ───────────────────────────────────────────
// الـ chatHistory بيتبعت مع كل request عشان نحافظ على سياق المحادثة التشخيصية
const diagnose = async (req, res) => {
  try {
    const {
      animal_id,
      symptoms,
      input_type    = "text",
      species,
      chatHistory   = [],    // ← أسئلة وأجوبة توضيحية سابقة
    } = req.body;

    const symptomsText = Array.isArray(symptoms) ? symptoms.join("، ") : symptoms;
    const sanitizedChatHistory = sanitizeChatHistory(chatHistory);
    const clarificationCount = countClarificationQuestions(sanitizedChatHistory);

    let animal      = null;
    let governorate = null;
    let farm        = null;

    if (animal_id) {
      animal = await Animal.findById(animal_id);
      if (animal) {
        farm        = await Farm.findById(animal.farm_id);
        governorate = farm?.governorate;
      }
    } else {
      governorate = req.user?.governorate;
    }

    const result = await diagnoseSymptoms({
      symptomsText,
      animal,
      governorate,
      species,
      chatHistory: sanitizedChatHistory,
    });

    // ── لو الـ Agent لسه بيسأل — مرجّعلو السؤال من غير ما نخزن في DB ──────────
    if (result.status === "needs_clarification") {
      if (clarificationCount >= MAX_CLARIFICATION_QUESTIONS) {
        return res.json({
          success: true,
          status: "no_data",
          message: "لم نتمكن من الوصول لتشخيص موثوق بعد عدة أسئلة توضيحية. يُنصح بمراجعة طبيب بيطري.",
          clarification_count: clarificationCount,
          max_clarification_questions: MAX_CLARIFICATION_QUESTIONS,
        });
      }

      return res.json({
        success:         true,
        status:          "needs_clarification",
        question:        result.question,
        possible_diseases: result.possible_diseases || [],
        clarification_count: clarificationCount + 1,
        max_clarification_questions: MAX_CLARIFICATION_QUESTIONS,
      });
    }

    // ── لو التشخيص جاهز — نخزن في DB ──────────────────────────────────────────
    let savedRecord = null;

    if (animal_id && animal) {
      savedRecord = await HealthCase.create({
        animal_id,
        user_id:          req.user._id,
        governorate,
        symptoms:         Array.isArray(symptoms) ? symptoms : [symptoms],
        input_type,
        ai_diagnosis:     result.diagnosis || null,
        confidence:       result.confidence || null,
        severity:         result.severity || null,
        matched_symptoms: result.matched_symptoms || [],
        suggested_actions: result.immediate_actions || [],
        recommended_treatment: formatTreatment(result.treatment),
        vet_required:     result.vet_required || false,
        vet_urgency:      result.vet_urgency || null,
        ai_raw_response:  result,
        chat_history:     sanitizedChatHistory,
        clarification_count: clarificationCount,
      });

      // ── تحديث الحالة الصحية للحيوان حسب severity (كانت ناقصة هنا) ──────────
      const healthStatusMap = { green: "healthy", yellow: "sick", red: "critical" };
      await Animal.findByIdAndUpdate(animal_id, {
        health_status: healthStatusMap[result.severity] || "sick",
      });

      await notifyIfCritical({
        severity:  result.severity,
        ownerId:   farm?.user_id,
        animalId:  animal_id,
        tagNumber: animal?.tag_number,
      });
    } else {
      savedRecord = await Consultation.create({
        user_id:          req.user._id,
        governorate:      governorate || req.user.governorate,
        species:          species || null,
        symptoms:         Array.isArray(symptoms) ? symptoms : [symptoms],
        input_type,
        ai_diagnosis:     result.diagnosis || null,
        confidence:       result.confidence || null,
        severity:         result.severity || null,
        matched_symptoms: result.matched_symptoms || [],
        suggested_actions: result.immediate_actions || [],
        recommended_treatment: formatTreatment(result.treatment),
        vet_required:     result.vet_required || false,
        vet_urgency:      result.vet_urgency || null,
        ai_raw_response:  result,
        chat_history:     sanitizedChatHistory,
        clarification_count: clarificationCount,
      });
    }

    return res.status(201).json({
      success:           true,
      status:            result.status,
      record_id:         savedRecord._id,
      consultation_type: animal_id ? "linked_to_animal" : "general",
      clarification_count: clarificationCount,
      data:              result,
    });
  } catch (err) {
    console.error("diagnose error:", err);
    return res.status(500).json({ success: false, message: "خطأ في التشخيص", error: err.message });
  }
};

const diagnoseVoice = async (req, res) => {
  let audioPath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "ملف الصوت مطلوب" });
    }
    audioPath = req.file.path;

    const transcribedText = await transcribeAudio(audioPath);
    if (!transcribedText || !transcribedText.trim()) {
      return res.status(422).json({
        success: false,
        message: "لم نتمكن من فهم التسجيل الصوتي، يرجى المحاولة مرة أخرى بصوت أوضح",
      });
    }

    const result = await runDiagnosis(req, {
      animal_id:  req.body.animal_id || null,
      species:    req.body.species || null,
      symptoms:   [transcribedText],
      input_type: "voice",
    });

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
    if (audioPath) {
      fs.unlink(audioPath, (err) => {
        if (err) console.warn("لم يتم حذف الملف الصوتي المؤقت:", err.message);
      });
    }
  }
};

const diagnoseImage = async (req, res) => {
  let audioPath = null;
  try {
    const files = [];
    if (Array.isArray(req.files?.images)) files.push(...req.files.images);
    if (Array.isArray(req.files?.image)) files.push(...req.files.image);
    const audioFiles = Array.isArray(req.files?.audio) ? req.files.audio : req.files?.audio ? [req.files.audio] : [];

    if (!files.length && !audioFiles.length) {
      return res.status(400).json({ success: false, message: "الرجاء رفع صورة أو تسجيل صوتي أو كليهما" });
    }

    const imageUrls = files.map((file) => `/uploads/health-cases/${file.filename}`);
    const hasText = typeof req.body.symptoms === 'string' && req.body.symptoms.trim().length > 0;
    const hasAudio = audioFiles.length > 0;
    const hasImage = files.length > 0;

    let transcribedText = null;
    if (hasAudio) {
      audioPath = audioFiles[0].path;
      try {
        transcribedText = await transcribeAudio(audioPath);
      } catch (transcribeErr) {
        console.error("transcribeAudio error:", transcribeErr.message);
      }
    }

    const inputType = hasAudio && hasImage
      ? "voice+image"
      : hasAudio
      ? "voice"
      : hasImage
      ? "image"
      : "text";

    const symptomsPayload = [];
    if (hasText) symptomsPayload.push(req.body.symptoms);
    if (transcribedText) symptomsPayload.push(transcribedText);

    const result = await runDiagnosis(req, {
      animal_id:   req.body.animal_id || null,
      species:     req.body.species || null,
      symptoms:    symptomsPayload.length ? symptomsPayload : [],
      input_type:  inputType,
      image_url:   imageUrls[0] || null,
      image_urls:  imageUrls,
      imagePath:   hasImage ? files[0].path : null,
      imageMime:   hasImage ? normalizeImageMime(files[0]) : null,
    });

    if (transcribedText) {
      result.body.transcribed_text = transcribedText;
    }
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error("diagnoseImage error:", err);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء معالجة المدخلات. حاول مرة أخرى.",
      error: err.message,
    });
  } finally {
    if (audioPath) {
      fs.unlink(audioPath, (err) => {
        if (err) console.warn("لم يتم حذف الملف الصوتي المؤقت:", err.message);
      });
    }
  }
};

const getCasesByAnimal = async (req, res) => {
  try {
    const animal = await verifyAnimalAccess(req.params.animalId, req.user);
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

const getCaseById = async (req, res) => {
  try {
    const healthCase = await HealthCase.findById(req.params.id).populate(
      "animal_id",
      "tag_number species"
    );
    if (!healthCase) {
      return res.status(404).json({ success: false, message: "الحالة غير موجودة" });
    }

    const canRead =
      isStaff(req.user) ||
      healthCase.user_id.toString() === req.user._id.toString();

    if (!canRead) {
      return res.status(403).json({ success: false, message: "غير مصرح" });
    }

    return res.status(200).json({ success: true, data: healthCase });
  } catch (err) {
    console.error("getCaseById error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

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

    return res.status(200).json({
      success: true,
      message: "تم إغلاق الحالة بنجاح",
      data: healthCase,
    });
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