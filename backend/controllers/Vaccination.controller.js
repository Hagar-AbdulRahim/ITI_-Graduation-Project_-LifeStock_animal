// ════════════════════════════════════════════════════════════════════════════
// controllers/Vaccination.controller.js
// ════════════════════════════════════════════════════════════════════════════
const Vaccination = require("../models/vaccination");
const Animal = require("../models/animal");
const Farm = require("../models/farm");

// ── تحويل أي صيغة مدعومة لـ Date موحّد (نفس الدالة في الـ validation) ────────
const normalizeDate = (value) => {
  if (!value) return null;
  const dmy = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/.exec(value);
  const dateStr = dmy
    ? `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`
    : value;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const userOwnsAnimal = async (animalId, userId) => {
  const animal = await Animal.findOne({ _id: animalId, is_active: true }).populate(
    "farm_id",
    "user_id"
  );
  if (!animal) return null;
  if (animal.farm_id.user_id.toString() !== userId.toString()) return null;
  return animal;
};

// ── Create Vaccination ────────────────────────────────────────────────────────
const createVaccination = async (req, res) => {
  try {
    const {
      animal_id,
      vaccine_name,
      vaccine_type,
      is_first_dose,
      last_date,
      next_due_date,
      scheduled_date,
      dose_ml,
      administered_by,
      batch_number,
      notes,
    } = req.body;

    const animal = await userOwnsAnimal(animal_id, req.user._id);
    if (!animal) {
      return res.status(404).json({ success: false, message: "الحيوان غير موجود" });
    }

    const type = vaccine_type === "one_time" ? "one_time" : "recurring";
    const isFirstDose = is_first_dose === true || is_first_dose === "true";

    // ── تحقق منطقي حسب النوع وحالة "أول جرعة" ───────────────────────────────
    if (type === "recurring") {
      if (isFirstDose && last_date) {
        return res.status(400).json({
          success: false,
          message: "لا يمكن إدخال تاريخ آخر جرعة (last_date) — هذه أول جرعة للحيوان من هذا اللقاح",
        });
      }
      if (!isFirstDose && !last_date) {
        return res.status(400).json({
          success: false,
          message: "تاريخ آخر جرعة (last_date) مطلوب — إلا إذا كانت هذه أول جرعة (is_first_dose: true)",
        });
      }
    }

    if (type === "one_time" && !scheduled_date) {
      return res.status(400).json({
        success: false,
        message: "موعد إعطاء اللقاح (scheduled_date) مطلوب للقاحات الطارئة",
      });
    }

    const vaccination = await Vaccination.create({
      animal_id,
      vaccine_name,
      vaccine_type: type,
      is_first_dose: type === "recurring" ? isFirstDose : false,
      // ── استخدام normalizeDate قبل التخزين لتجنب سوء تفسير JS لصيغ DD-MM-YYYY ─
      last_date: type === "recurring" && !isFirstDose ? normalizeDate(last_date) : null,
      next_due_date: type === "recurring" ? (normalizeDate(next_due_date) || undefined) : undefined,
      scheduled_date: type === "one_time" ? normalizeDate(scheduled_date) : undefined,
      dose_ml: dose_ml || null,
      administered_by: administered_by || null,
      batch_number: batch_number || null,
      notes: notes || null,
      added_by: "user",
    });

    const message =
      type === "one_time"
        ? "تم تسجيل موعد اللقاح الطارئ بنجاح — ستصلك تذكيرات قبل الموعد"
        : isFirstDose
          ? "تم تسجيل أول جرعة — تم حساب موعد الجرعة القادمة تلقائياً"
          : vaccination.next_due_date_auto_calculated
            ? "تم تسجيل التطعيم — تم حساب موعد الجرعة القادمة تلقائياً"
            : "تم تسجيل التطعيم بنجاح";

    return res.status(201).json({ success: true, message, data: vaccination });
  } catch (err) {
    console.error("createVaccination error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

// ── Get All Vaccinations for an Animal ────────────────────────────────────────
const getVaccinationsByAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;

    const animal = await userOwnsAnimal(animalId, req.user._id);
    if (!animal) {
      return res.status(404).json({ success: false, message: "الحيوان غير موجود" });
    }

    const vaccinations = await Vaccination.find({ animal_id: animalId }).sort({
      created_at: -1,
    });

    const sorted = vaccinations.sort((a, b) => {
      const dateA = a.reminder_date ? new Date(a.reminder_date) : null;
      const dateB = b.reminder_date ? new Date(b.reminder_date) : null;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    });

    return res.status(200).json({
      success: true,
      count: sorted.length,
      data: sorted,
    });
  } catch (err) {
    console.error("getVaccinationsByAnimal error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Get Single Vaccination ────────────────────────────────────────────────────
const getVaccinationById = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id).populate({
      path: "animal_id",
      select: "tag_number species farm_id",
      populate: { path: "farm_id", select: "user_id" },
    });

    if (!vaccination) {
      return res.status(404).json({ success: false, message: "سجل التطعيم غير موجود" });
    }

    if (vaccination.animal_id.farm_id.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "غير مصرح" });
    }

    return res.status(200).json({ success: true, data: vaccination });
  } catch (err) {
    console.error("getVaccinationById error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Update Vaccination ────────────────────────────────────────────────────────
const updateVaccination = async (req, res) => {
  try {
    const existing = await Vaccination.findById(req.params.id).populate({
      path: "animal_id",
      select: "farm_id",
      populate: { path: "farm_id", select: "user_id" },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "سجل التطعيم غير موجود" });
    }

    if (existing.animal_id.farm_id.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "غير مصرح" });
    }

    const allowedFields = [
      "vaccine_name", "last_date", "next_due_date", "scheduled_date",
      "is_first_dose", "completed", "dose_ml", "administered_by",
      "batch_number", "notes",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // ── تطبيع التواريخ في الـ updates قبل الحفظ ────────────────────────────────
    if (updates.last_date) updates.last_date = normalizeDate(updates.last_date);
    if (updates.next_due_date) updates.next_due_date = normalizeDate(updates.next_due_date);
    if (updates.scheduled_date) updates.scheduled_date = normalizeDate(updates.scheduled_date);

    // ── منع التناقض: أول جرعة + last_date في نفس الوقت ───────────────────────
    const willBeFirstDose =
      updates.is_first_dose !== undefined ? updates.is_first_dose : existing.is_first_dose;
    const willHaveLastDate =
      updates.last_date !== undefined ? updates.last_date : existing.last_date;

    if (existing.vaccine_type === "recurring" && willBeFirstDose && willHaveLastDate) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن أن تكون أول جرعة ولها تاريخ آخر جرعة في نفس الوقت",
      });
    }

    if (updates.next_due_date || updates.scheduled_date) {
      updates.next_due_date_auto_calculated = false;
      updates.reminder_sent = false;
      updates.day_of_reminder_sent = false;
    }

    if (updates.completed === true && !existing.completed) {
      updates.completed_at = new Date();
    }

    const vaccination = await Vaccination.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "تم تحديث سجل التطعيم بنجاح",
      data: vaccination,
    });
  } catch (err) {
    console.error("updateVaccination error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

// ── Delete Vaccination ─────────────────────────────────────────────────────────
const deleteVaccination = async (req, res) => {
  try {
    const existing = await Vaccination.findById(req.params.id).populate({
      path: "animal_id",
      select: "farm_id",
      populate: { path: "farm_id", select: "user_id" },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "سجل التطعيم غير موجود" });
    }

    if (existing.animal_id.farm_id.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "غير مصرح" });
    }

    await Vaccination.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "تم حذف سجل التطعيم بنجاح",
    });
  } catch (err) {
    console.error("deleteVaccination error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  createVaccination,
  getVaccinationsByAnimal,
  getVaccinationById,
  updateVaccination,
  deleteVaccination,
};