const Vaccination = require("../models/vaccination");
const Animal = require("../models/animal");

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
  const animal = await Animal.findOne({ _id: animalId, is_active: true }).populate("farm_id", "user_id");
  if (!animal) return null;
  if (animal.farm_id.user_id.toString() !== userId.toString()) return null;
  return animal;
};

const calcNextDueDate = (administrationDate, repeatMonths) => {
  const base = new Date(administrationDate);
  base.setMonth(base.getMonth() + repeatMonths);
  return base;
};

// ── Create ────────────────────────────────────────────────────────────────────
const createVaccination = async (req, res) => {
  try {
    const {
      animal_id, vaccine_name, vaccine_type,
      administration_date, repeat_every_months,
      scheduled_date, dose_ml, administered_by, batch_number, notes,
    } = req.body;

    const animal = await userOwnsAnimal(animal_id, req.user._id);
    if (!animal) return res.status(404).json({ success: false, message: "الحيوان غير موجود" });

    const type = vaccine_type === "one_time" ? "one_time" : "recurring";

    if (type === "one_time" && !scheduled_date)
      return res.status(400).json({ success: false, message: "scheduled_date مطلوب للقاحات الطارئة" });

    if (type === "recurring" && !administration_date)
      return res.status(400).json({ success: false, message: "administration_date مطلوب للقاحات المتكررة" });

    const vaccination = await Vaccination.create({
      animal_id, vaccine_name,
      vaccine_type: type,
      administration_date: normalizeDate(administration_date),
      repeat_every_months: type === "recurring" ? repeat_every_months : null,
      scheduled_date: type === "one_time" ? normalizeDate(scheduled_date) : undefined,
      dose_ml: dose_ml || null,
      administered_by: administered_by || null,
      batch_number: batch_number || null,
      notes: notes || null,
      added_by: "user",
    });

    const message = type === "one_time"
      ? "تم تسجيل موعد اللقاح الطارئ بنجاح — ستصلك تذكيرات قبل الموعد"
      : `تم تسجيل التطعيم — الجرعة القادمة في ${vaccination.next_due_date?.toLocaleDateString("ar-EG")}`;

    return res.status(201).json({ success: true, message, data: vaccination });
  } catch (err) {
    console.error("createVaccination error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

// ── Get All ───────────────────────────────────────────────────────────────────
const getVaccinationsByAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;
    const animal = await userOwnsAnimal(animalId, req.user._id);
    if (!animal) return res.status(404).json({ success: false, message: "الحيوان غير موجود" });

    const vaccinations = await Vaccination.find({ animal_id: animalId });

    const sorted = vaccinations.sort((a, b) => {
      const dateA = a.reminder_date ? new Date(a.reminder_date) : null;
      const dateB = b.reminder_date ? new Date(b.reminder_date) : null;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    });

    return res.status(200).json({ success: true, count: sorted.length, data: sorted });
  } catch (err) {
    console.error("getVaccinationsByAnimal error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Get One ───────────────────────────────────────────────────────────────────
const getVaccinationById = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id).populate({
      path: "animal_id",
      select: "tag_number species farm_id",
      populate: { path: "farm_id", select: "user_id" },
    });

    if (!vaccination) return res.status(404).json({ success: false, message: "سجل التطعيم غير موجود" });

    if (vaccination.animal_id.farm_id.user_id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "غير مصرح" });

    return res.status(200).json({ success: true, data: vaccination });
  } catch (err) {
    console.error("getVaccinationById error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Update ────────────────────────────────────────────────────────────────────
const updateVaccination = async (req, res) => {
  try {
    const existing = await Vaccination.findById(req.params.id).populate({
      path: "animal_id",
      select: "farm_id",
      populate: { path: "farm_id", select: "user_id" },
    });

    if (!existing) return res.status(404).json({ success: false, message: "سجل التطعيم غير موجود" });

    if (existing.animal_id.farm_id.user_id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "غير مصرح" });

    const allowedFields = [
      "vaccine_name", "administration_date", "repeat_every_months",
      "next_due_date", "scheduled_date", "completed", "is_active",
      "dose_ml", "administered_by", "batch_number", "notes",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // ── تطبيع التواريخ ────────────────────────────────────────────────────────
    if (updates.administration_date) updates.administration_date = normalizeDate(updates.administration_date);
    if (updates.next_due_date)       updates.next_due_date       = normalizeDate(updates.next_due_date);
    if (updates.scheduled_date)      updates.scheduled_date      = normalizeDate(updates.scheduled_date);

    // ── إعادة حساب next_due_date ─────────────────────────────────────────────
    // فقط لو المستخدم مش حدده يدوياً، وفيه administration_date أو repeat_every_months جديد
    if (
      existing.vaccine_type === "recurring" &&
      !updates.next_due_date &&
      (updates.administration_date || updates.repeat_every_months)
    ) {
      const baseDate = updates.administration_date || existing.administration_date;
      const months   = updates.repeat_every_months  || existing.repeat_every_months;
      if (baseDate && months) {
        updates.next_due_date = calcNextDueDate(baseDate, months);
        updates.next_due_date_auto_calculated = true;
      }
    }

    // ── reset reminder flags لما الموعد يتغير ────────────────────────────────
    if (updates.next_due_date || updates.scheduled_date || updates.administration_date) {
      updates.reminder_sent           = false;
      updates.day_of_reminder_sent    = false;
      updates.reminder_sent_at        = null;
      updates.day_of_reminder_sent_at = null;
    }

    // ── تسجيل وقت إتمام الجرعة ───────────────────────────────────────────────
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

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteVaccination = async (req, res) => {
  try {
    const existing = await Vaccination.findById(req.params.id).populate({
      path: "animal_id",
      select: "farm_id",
      populate: { path: "farm_id", select: "user_id" },
    });

    if (!existing) return res.status(404).json({ success: false, message: "سجل التطعيم غير موجود" });

    if (existing.animal_id.farm_id.user_id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "غير مصرح" });

    await Vaccination.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "تم حذف سجل التطعيم بنجاح" });
  } catch (err) {
    console.error("deleteVaccination error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  createVaccination, getVaccinationsByAnimal,
  getVaccinationById, updateVaccination, deleteVaccination,
};
