const Farm   = require("../models/farm");
const Animal = require("../models/animal");
const Vaccination = require("../models/vaccination");

// ── Create Farm ───────────────────────────────────────────────────────────────
const createFarm = async (req, res) => {
  try {
    const { name, governorate, description } = req.body;

    const farm = await Farm.create({
      user_id: req.user._id,
      name,
      governorate,
      description: description || null,
    });

    return res.status(201).json({
      success: true,
      message: "تم إنشاء المزرعة بنجاح",
      data:    farm,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "لديك مزرعة بهذا الاسم بالفعل" });
    }
    console.error("createFarm error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Get All Farms ─────────────────────────────────────────────────────────────
const getMyFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ user_id: req.user._id, is_active: true }).sort({
      created_at: -1,
    });
    return res.status(200).json({ success: true, count: farms.length, data: farms });
  } catch (err) {
    console.error("getMyFarms error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Get Single Farm ───────────────────────────────────────────────────────────
const getFarmById = async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id:       req.params.id,
      user_id:   req.user._id,
      is_active: true,
    });

    if (!farm) {
      return res.status(404).json({ success: false, message: "المزرعة غير موجودة" });
    }

    return res.status(200).json({ success: true, data: farm });
  } catch (err) {
    console.error("getFarmById error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Update Farm ───────────────────────────────────────────────────────────────
const updateFarm = async (req, res) => {
  try {
    const allowedFields = ["name", "governorate", "description"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id, is_active: true },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!farm) {
      return res.status(404).json({ success: false, message: "المزرعة غير موجودة" });
    }

    return res.status(200).json({
      success: true,
      message: "تم تحديث المزرعة بنجاح",
      data:    farm,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "لديك مزرعة بهذا الاسم بالفعل" });
    }
    console.error("updateFarm error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Delete Farm ───────────────────────────────────────────────────────────────
const deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({
      _id:     req.params.id,
      user_id: req.user._id,
    });

    if (!farm) {
      return res.status(404).json({ success: false, message: "المزرعة غير موجودة" });
    }

    return res.status(200).json({
      success: true,
      message: "تم حذف المزرعة وكل حيواناتها بنجاح",
    });
  } catch (err) {
    console.error("deleteFarm error:", err.stack || err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

// ── Get Farm Stats ─────────────────────────────────────────────────────────────
const getFarmStats = async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id:       req.params.id,
      user_id:   req.user._id,
      is_active: true,
    });

    if (!farm) {
      return res.status(404).json({ success: false, message: "المزرعة غير موجودة" });
    }

    const activeAnimals = await Animal.find({ farm_id: farm._id, is_active: true }).select("_id");
    const animalIds = activeAnimals.map(a => a._id);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const [speciesStats, healthStats, totalCount, upcomingVaccinationsCount] = await Promise.all([
      Animal.aggregate([
        { $match: { farm_id: farm._id, is_active: true } },
        { $group: { _id: "$species", count: { $sum: 1 } } },
      ]),
      Animal.aggregate([
        { $match: { farm_id: farm._id, is_active: true } },
        { $group: { _id: "$health_status", count: { $sum: 1 } } },
      ]),
      Animal.countDocuments({ farm_id: farm._id, is_active: true }),
      Vaccination.countDocuments({
        animal_id: { $in: animalIds },
        next_due_date: { $gte: new Date(), $lte: sevenDaysFromNow }
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        farm,
        stats: {
          total_animals:    totalCount,
          by_species:       speciesStats,
          by_health_status: healthStats,
          upcoming_vaccinations: upcomingVaccinationsCount,
        },
      },
    });
  } catch (err) {
    console.error("getFarmStats error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = { createFarm, getMyFarms, getFarmById, updateFarm, deleteFarm, getFarmStats };