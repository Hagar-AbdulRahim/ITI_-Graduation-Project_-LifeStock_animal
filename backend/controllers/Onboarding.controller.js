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
    let anyStillAffected = false;

    // ── حفظ التاريخ المرضي ───────────────────────────────────────────────────
    if (Array.isArray(medical_history)) {
      for (const entry of medical_history) {
        if (!entry.disease_or_symptom) continue;

        // still_affected جايه من رد المزارع على سؤال "لسه مصاب ولا خف" —
        // لو true يبقى الحالة لسه مفتوحة (resolved=false)، لو false أو مش
        // متحدد نعتبرها اتقفلت زي قبل كده (سلوك افتراضي آمن)
        const stillAffected = entry.still_affected === true;
        if (stillAffected) anyStillAffected = true;

        const healthCase = await HealthCase.create({
          animal_id:    animal._id,
          user_id:      req.user._id,
          governorate:  animal.farm_id.governorate,
          symptoms:     entry.confirmed_symptoms?.length ? entry.confirmed_symptoms : [entry.disease_or_symptom],
          ai_diagnosis: entry.disease_or_symptom,
          is_historical: true,
          resolved:      !stillAffected,
          resolved_at:   stillAffected ? null : new Date(),
          reported_date: parseApproximateDate(entry.approximate_date),
        });

        savedHealthCases.push(healthCase);
      }
    }

    // ── حفظ اللقاحات ─────────────────────────────────────────────────────────
    if (Array.isArray(vaccinations)) {
      for (const entry of vaccinations) {
        if (!entry.vaccine_name) continue;

        // الـ FINAL_JSON بيرجع vaccination_type بالعربي ("دوري"/"مرة_واحدة")
        // الموديل بيتوقع "recurring"/"one_time" بالإنجليزي
        const mapVaccineType = (type) => {
          if (!type) return "recurring";
          const t = type.toString().trim();
          if (t === "one_time" || t.includes("مرة") || t.includes("واحدة") || t === "emergency") return "one_time";
          return "recurring";
        };

        const vaccineType   = mapVaccineType(entry.vaccination_type || entry.vaccine_type);
        const isFirstDose   = entry.is_first_dose === true;
        const scheduledDate = parseApproximateDate(entry.scheduled_date);
        const lastDate      = parseApproximateDate(entry.last_date);

        const vaccinationData = {
          animal_id:    animal._id,
          vaccine_name: entry.vaccine_name,
          vaccine_type: vaccineType,
          added_by:     "onboarding_agent",
          notes:        entry.notes || null,
        };

        // إضافة فترة التكرار لو موجودة (من الـ FINAL_JSON)
        if (vaccineType === "recurring") {
          vaccinationData.repeat_every_months = entry.revaccination_interval_months || 12;
        }

        if (vaccineType === "one_time") {
          vaccinationData.scheduled_date = scheduledDate || new Date();
        } else if (isFirstDose && scheduledDate) {
          vaccinationData.administration_date = scheduledDate;
        } else if (isFirstDose) {
          vaccinationData.administration_date = new Date();
        } else {
          vaccinationData.administration_date = lastDate || new Date();
        }

        const vaccination = await Vaccination.create(vaccinationData);
        savedVaccinations.push(vaccination);
      }
    }

    // ── لو فيه مرض لسه مصاب بيه الحيوان (still_affected=true)، حدّث حالته ─────
    // الصحية بدل ما تفضل "سليم" وهو فعلياً لسه مريض. منخليش الترقية تنزل حالة
    // أخطر (critical) لـ sick لو أصلاً محدثة من تشخيص حقيقي قبل كده.
    if (anyStillAffected && animal.health_status === "healthy") {
      await Animal.findByIdAndUpdate(animal._id, { health_status: "sick" });
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