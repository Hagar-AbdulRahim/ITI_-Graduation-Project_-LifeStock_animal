const mongoose = require("mongoose");
const { isStaff, canModifyLivestock } = require("../utils/accessControl");
const Animal = require("../models/animal");
const Farm   = require("../models/farm");
const fs     = require("fs");
const path   = require("path");

// helper: verify farm belongs to the current user
const userOwnsFarm = async (farmId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(farmId)) return null;
  const farm = await Farm.findOne({ _id: farmId, user_id: userId, is_active: true });
  return farm;
};

// ── Create Animal ─────────────────────────────────────────────────────────────
const createAnimal = async (req, res) => {
  try {
const { farm_id, tag_number, species, gender, age_value, age_unit, weight_kg, breed, notes, health_status } =
  req.body;
    // verify the farm belongs to the current user
    const farm = await userOwnsFarm(farm_id, req.user._id);
    if (!farm) {
      return res.status(404).json({ success: false, message: "المزرعة غير موجودة" });
    }

    const normalizedTagNumber = (tag_number || "").toString().trim() || `TAG-${Date.now()}`;

    const animal = await Animal.create({
      farm_id,
      tag_number: normalizedTagNumber,
      species,
      gender,
      age_value,
      age_unit,
      weight_kg: weight_kg || null,
      breed: breed || null,
      notes: notes || null,
      health_status: health_status || 'healthy',
    });

    // increment total_animals counter on the farm
    await Farm.findByIdAndUpdate(farm_id, { $inc: { total_animals: 1 } });

    return res.status(201).json({
      success: true,
      message: "تم إضافة الحيوان بنجاح",
      data: animal,
    });
  } catch (err) {
    // duplicate key error من MongoDB نفسه — مش من كود إضافي يدوي
    // ده بيضمن إن المقارنة exact match وملهاش علاقة بـ regex أو substring
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "يوجد حيوان بنفس هذا الرقم التعريفي (Tag Number) في هذه المزرعة",
      });
    }
    console.error("createAnimal error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};



// ── Search Animals ─────────────────────────────────────────────────────────────
const searchAnimals = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.status(200).json({ success: true, data: [] });
    }

    // Find all active farms for the current user
    const farms = await Farm.find({ user_id: req.user._id, is_active: true });
    const farmIds = farms.map(f => f._id);

    // Search by tag_number across user's farms
    const animals = await Animal.find({
      farm_id: { $in: farmIds },
      is_active: true,
      tag_number: { $regex: q.trim(), $options: "i" }
    })
    .limit(10)
    .populate("farm_id", "name");

    return res.status(200).json({
      success: true,
      data: animals,
    });
  } catch (err) {
    console.error("searchAnimals error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم أثناء البحث" });
  }
};

// ── Get All Animals in a Farm ─────────────────────────────────────────────────
const getAnimalsByFarm = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { species, health_status, gender } = req.query;

    // الأدمن يقدر يشوف حيوانات أي مزرعة بدون التحقق من الملكية
    let farm;
    if (isStaff(req.user)) {
      farm = await Farm.findOne({ _id: farmId, is_active: true });
    } else {
      farm = await userOwnsFarm(farmId, req.user._id);
    }

    if (!farm) {
      return res.status(404).json({ success: false, message: "المزرعة غير موجودة أو غير مصرح بدخولها" });
    }

    const filter = { farm_id: farmId, is_active: true };
    
    // تأمين الفلاتر ضد النصوص الفارغة القادمة من حقول الاختيار في الفرونت إند
    if (species && species.trim() !== "")       filter.species       = species.trim();
    if (health_status && health_status.trim() !== "") filter.health_status = health_status.trim();
    if (gender && gender.trim() !== "")         filter.gender         = gender.trim();

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
    let animal;

    if (isStaff(req.user)) {
      // الأدمن يقدر يشوف أي حيوان بدون قيد المزرعة
      animal = await Animal.findById(req.params.id).populate("farm_id");
    } else {
      const userFarmIds = await Farm.find({ user_id: req.user._id }).distinct("_id");
      animal = await Animal.findOne({ _id: req.params.id, farm_id: { $in: userFarmIds } }).populate("farm_id");
    }

    if (!animal) return res.status(404).json({ success: false, message: "الحيوان غير موجود" });

    res.json({ success: true, data: animal });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};
// ── Update Animal ─────────────────────────────────────────────────────────────
const updateAnimal = async (req, res) => {
  try {
    const existing = await Animal.findOne({ _id: req.params.id, is_active: true }).populate(
      "farm_id",
      "user_id"
    );

    if (!existing) {
      return res.status(404).json({ success: false, message: "الحيوان غير موجود" });
    }

    // الأدمن يقدر يعدل أي حيوان، غير كده لازم يكون صاحب المزرعة
    const isAdminUser = canModifyLivestock(req.user);
    const isOwner = existing.farm_id.user_id.toString() === req.user._id.toString();

    if (!isAdminUser && !isOwner) {
      return res.status(403).json({ success: false, message: "غير مصرح" });
    }

    const allowedFields = [
      "tag_number", "species", "gender", "age_value", "age_unit",
      "weight_kg", "health_status", "notes", "breed",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (isAdminUser && !isOwner) {
      console.log(`[AUDIT] Admin ${req.user._id} updated animal ${animal._id}`);
    }

    return res.status(200).json({
      success: true,
      message: "تم تحديث بيانات الحيوان بنجاح",
      data: animal,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "يوجد حيوان بنفس هذا الرقم التعريفي (Tag Number) في هذه المزرعة",
      });
    }
    console.error("updateAnimal error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Delete Animal ─────────────────────────────────────────────────────────────
const deleteAnimal = async (req, res) => {
  try {
    const existing = await Animal.findOne({ _id: req.params.id }).populate("farm_id", "user_id");

    if (!existing) {
      return res.status(404).json({ success: false, message: "الحيوان غير موجود" });
    }

    // الأدمن يقدر يحذف أي حيوان، غير كده لازم يكون صاحب المزرعة
    const isAdminUser = canModifyLivestock(req.user);
    const isOwner = existing.farm_id.user_id.toString() === req.user._id.toString();

    if (!isAdminUser && !isOwner) {
      return res.status(403).json({ success: false, message: "غير مصرح" });
    }

    await Animal.findOneAndDelete({ _id: req.params.id });

    // decrement total_animals counter on the farm — لا يقل عن صفر
    await Farm.findByIdAndUpdate(existing.farm_id._id, {
      $inc: { total_animals: -1 },
    });
    await Farm.updateOne(
      { _id: existing.farm_id._id, total_animals: { $lt: 0 } },
      { $set: { total_animals: 0 } }
    );

    if (isAdminUser && !isOwner) {
      console.log(`[AUDIT] Admin ${req.user._id} deleted animal ${existing._id}`);
    }

    return res.status(200).json({
      success: true,
      message: "تم حذف الحيوان وكل سجلاته بنجاح",
    });
  } catch (err) {
    console.error("deleteAnimal error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  createAnimal,
  getAnimalsByFarm,
  getAnimalById,
  updateAnimal,
  deleteAnimal,
  searchAnimals,
};