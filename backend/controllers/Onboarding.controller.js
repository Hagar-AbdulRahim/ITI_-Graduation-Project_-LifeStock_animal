const Animal      = require("../models/animal");
const Farm        = require("../models/farm");
const HealthCase  = require("../models/healthCase");
const Vaccination = require("../models/vaccination");
const { continueOnboardingConversation } = require("../services/Onboardingagent");

const getOwnedAnimalWithFarm = async (animalId, userId) => {
  const animal = await Animal.findOne({ _id: animalId, is_active: true }).populate(
    "farm_id",
    "user_id governorate"
  );
  if (!animal) return null;
  if (animal.farm_id.user_id.toString() !== userId.toString()) return null;
  return animal;
};

const parseApproximateDate = (dateStr) => {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

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

        const isFirstDose = entry.is_first_dose === true;
        const vaccineType = entry.vaccine_type === "emergency" ? "one_time" : "recurring";

        // ── one_time من الـ Agent — نادر بس ممكن (لو ذكر لقاح طارئ مستقبلي) ──
        if (vaccineType === "one_time") {
          const scheduledDate = parseApproximateDate(entry.last_date) || new Date();

          const vaccination = await Vaccination.create({
            animal_id:      animal._id,
            vaccine_name:   entry.vaccine_name,
            vaccine_type:   "one_time",
            scheduled_date: scheduledDate,
            added_by:       "onboarding_agent",
            notes:          entry.notes || null,
          });

          savedVaccinations.push(vaccination);
          continue;
        }

        // ── recurring — الحالة الشائعة ────────────────────────────────────────
        const vaccinationData = {
          animal_id:     animal._id,
          vaccine_name:  entry.vaccine_name,
          vaccine_type:  "recurring",
          is_first_dose: isFirstDose,
          added_by:      "onboarding_agent",
          notes:         entry.notes || null,
        };

        // لو مش أول جرعة، لازم last_date — لو الـ Agent ماجابش تاريخ صريح
        // (مجرد وصف غامض)، استخدمي تاريخ اليوم كـ fallback بدل ما يفشل الـ create
        if (!isFirstDose) {
          vaccinationData.last_date = parseApproximateDate(entry.last_date) || new Date();
        }
        // لو أول جرعة، last_date يفضل undefined تماماً (مش حتى null) عشان
        // الـ pre-validate hook يحسب next_due_date من تاريخ اليوم

        const vaccination = await Vaccination.create(vaccinationData);
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