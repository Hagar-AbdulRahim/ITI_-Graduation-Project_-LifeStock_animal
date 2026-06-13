const Animal = require("../models/animal");
const Farm = require("../models/farm");

// helper: verify farm belongs to the current user
const userOwnsFarm = async (farmId, userId) => {
  const farm = await Farm.findOne({ _id: farmId, user_id: userId, is_active: true });
  return farm;
};

// ── Create Animal ─────────────────────────────────────────────────────────────
const createAnimal = async (req, res) => {
  try {
    const { farm_id, name, species, gender, birth_date, weight_kg, breed, tag_number, notes } =
      req.body;

    // verify the farm belongs to the current user
    const farm = await userOwnsFarm(farm_id, req.user._id);
    if (!farm) {
      return res.status(404).json({ success: false, message: "المزرعة غير موجودة" });
    }

    const animal = await Animal.create({
      farm_id,
      name,
      species,
      gender,
      birth_date,
      weight_kg: weight_kg || null,
      breed: breed || null,
      tag_number: tag_number || null,
      notes: notes || null,
    });

    // increment total_animals counter on the farm
    await Farm.findByIdAndUpdate(farm_id, { $inc: { total_animals: 1 } });

    return res.status(201).json({
      success: true,
      message: "تم إضافة الحيوان بنجاح",
      data: animal,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "يوجد حيوان بهذا الاسم في نفس المزرعة",
      });
    }
    console.error("createAnimal error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Get All Animals in a Farm ─────────────────────────────────────────────────
const getAnimalsByFarm = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { species, health_status, gender } = req.query;

    const farm = await userOwnsFarm(farmId, req.user._id);
    if (!farm) {
      return res.status(404).json({ success: false, message: "المزرعة غير موجودة" });
    }

    const filter = { farm_id: farmId, is_active: true };
    if (species)       filter.species       = species;
    if (health_status) filter.health_status = health_status;
    if (gender)        filter.gender        = gender;

    const animals = await Animal.find(filter).sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      count: animals.length,
      data: animals,
    });
  } catch (err) {
    console.error("getAnimalsByFarm error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Get Single Animal ─────────────────────────────────────────────────────────
const getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findOne({ _id: req.params.id, is_active: true }).populate(
      "farm_id",
      "name governorate user_id"
    );

    if (!animal) {
      return res.status(404).json({ success: false, message: "الحيوان غير موجود" });
    }

    // verify the current user owns the farm this animal belongs to
    if (animal.farm_id.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "غير مصرح" });
    }

    return res.status(200).json({ success: true, data: animal });
  } catch (err) {
    console.error("getAnimalById error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Update Animal ─────────────────────────────────────────────────────────────
const updateAnimal = async (req, res) => {
  try {
    // fetch animal with its farm to check ownership
    const existing = await Animal.findOne({ _id: req.params.id, is_active: true }).populate(
      "farm_id",
      "user_id"
    );

    if (!existing) {
      return res.status(404).json({ success: false, message: "الحيوان غير موجود" });
    }

    if (existing.farm_id.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "غير مصرح" });
    }

    // gender and birth_date included so corrections are possible after creation
    const allowedFields = ["name", "weight_kg", "health_status", "notes", "breed", "tag_number", "gender", "birth_date"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "تم تحديث بيانات الحيوان بنجاح",
      data: animal,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "يوجد حيوان بهذا الاسم في نفس المزرعة",
      });
    }
    console.error("updateAnimal error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Delete Animal ─────────────────────────────────────────────────────────────
// findOneAndDelete triggers the cascade pre-hook in the model (deletes HealthCases + Vaccinations)
const deleteAnimal = async (req, res) => {
  try {
    const existing = await Animal.findOne({ _id: req.params.id }).populate("farm_id", "user_id");

    if (!existing) {
      return res.status(404).json({ success: false, message: "الحيوان غير موجود" });
    }

    if (existing.farm_id.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "غير مصرح" });
    }

    await Animal.findOneAndDelete({ _id: req.params.id });

    // decrement total_animals counter on the farm
    await Farm.findByIdAndUpdate(existing.farm_id._id, { $inc: { total_animals: -1 } });

    return res.status(200).json({
      success: true,
      message: "تم حذف الحيوان وكل سجلاته بنجاح",
    });
  } catch (err) {
    console.error("deleteAnimal error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = { createAnimal, getAnimalsByFarm, getAnimalById, updateAnimal, deleteAnimal };