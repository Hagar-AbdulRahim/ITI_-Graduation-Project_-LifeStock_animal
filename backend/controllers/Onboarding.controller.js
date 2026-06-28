const Animal      = require("../models/animal");
const Farm        = require("../models/farm");
const HealthCase  = require("../models/healthCase");   // ← حرف صغير
const Vaccination = require("../models/vaccination");  // ← حرف صغير
const { continueOnboardingConversation } = require("../services/Onboardingagent");

// ── helper ────────────────────────────────────────────────────────────────────
const getOwnedAnimalWithFarm = async (animalId, userId) => {
  const animal = await Animal.findOne({ _id: animalId, is_active: true }).populate(
    "farm_id",
    "user_id governorate"
  );
  if (!animal) return null;
  if (animal.farm_id.user_id.toString() !== userId.toString()) return null;
  return animal;
};

// ── تحويل تاريخ تقريبي لـ Date ───────────────────────────────────────────────
const parseApproximateDate = (dateStr) => {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// ════════════════════════════════════════════════════════════════════════════
// POST /api/onboarding/:animalId/chat
// ════════════════════════════════════════════════════════════════════════════
const chat = async (req, res) => {
  try {
    const { animalId }        = req.params;
    const { message, history } = req.body;

    const animal = await getOwnedAnimalWithFarm(animalId, req.user._id);
    if (!animal) {
      return res.status(404).json({ success: false, message: "الحيوان غير موجود" });
    }

    const result = await continueOnboardingConversation(
      animal,
      history || [],
      message || null
    );

    return res.status(200).json({
      success:        true,
      reply:          result.reply,
      is_complete:    result.isComplete,
      extracted_data: result.extractedData,
      history:        result.updatedHistory,
    });
  } catch (err) {
    console.error("onboarding chat error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// POST /api/onboarding/:animalId/confirm
// ════════════════════════════════════════════════════════════════════════════
const confirm = async (req, res) => {
  try {
    const { animalId }                    = req.params;
    const { medical_history, vaccinations } = req.body;

    const animal = await getOwnedAnimalWithFarm(animalId, req.user._id);
    if (!animal) {
      return res.status(404).json({ success: false, message: "الحيوان غير موجود" });
    }

    const savedHealthCases  = [];
    const savedVaccinations = [];

    // ── حفظ التاريخ المرضي ───────────────────────────────────────────────────
    if (Array.isArray(medical_history)) {
      for (const entry of medical_history) {
        if (!entry.disease_or_symptom) continue;

        const healthCase = await HealthCase.create({
          animal_id:    animal._id,
          user_id:      req.user._id,
          governorate:  animal.farm_id.governorate,
          symptoms:     [entry.disease_or_symptom],
          ai_diagnosis: entry.disease_or_symptom,
          is_historical: true,
          resolved:      true,
          reported_date: parseApproximateDate(entry.approximate_date),
        });

        savedHealthCases.push(healthCase);
      }
    }

    // ── حفظ اللقاحات ─────────────────────────────────────────────────────────
    if (Array.isArray(vaccinations)) {
      for (const entry of vaccinations) {
        if (!entry.vaccine_name) continue;

        // ── تحويل التاريخ وضمان إنه Date حقيقي ──────────────────────────────
        const lastDate = parseApproximateDate(entry.last_date) || new Date();

        const vaccination = await Vaccination.create({
          animal_id:    animal._id,
          vaccine_name: entry.vaccine_name,
          vaccine_type: "recurring", // اقتراحات الـ Agent دايماً لقاحات دورية معروفة
          last_date:    lastDate,
          // next_due_date بيتحسب تلقائياً في الـ pre-validate hook
          added_by: "onboarding_agent", // تمييز واضح للفرونت عن الإدخال اليدوي
        });

        savedVaccinations.push(vaccination);
      }
    }

    return res.status(201).json({
      success: true,
      message: "تم حفظ التاريخ المرضي واللقاحات بنجاح",
      data: {
        health_cases: savedHealthCases,
        vaccinations: savedVaccinations,
      },
    });
  } catch (err) {
    console.error("onboarding confirm error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

module.exports = { chat, confirm };