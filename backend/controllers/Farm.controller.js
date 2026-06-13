const Farm = require("../models/farm");
const Animal = require("../models/animal");

// ── Create Farm ───────────────────────────────────────────────────────────────
const createFarm = async (req, res) => {
  try {
    const { name, governorate, location, description } = req.body;

    const farm = await Farm.create({
      user_id: req.user._id,
      name,
      governorate,
      location,
      description: description || null,
    });

    return res.status(201).json({
      success: true,
      message: "تم إنشاء المزرعة بنجاح",
      data: farm,
    });
  } catch (err) {
    // duplicate name for the same user
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "لديك مزرعة بهذا الاسم بالفعل",
      });
    }
    console.error("createFarm error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Get All Farms (current user) ──────────────────────────────────────────────
const getMyFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ user_id: req.user._id, is_active: true }).sort({
      created_at: -1,
    });

    return res.status(200).json({
      success: true,
      count: farms.length,
      data: farms,
    });
  } catch (err) {
    console.error("getMyFarms error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Get Single Farm ───────────────────────────────────────────────────────────
const getFarmById = async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      user_id: req.user._id,
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
    // location included so the farmer can correct GPS coordinates after creation
    const allowedFields = ["name", "governorate", "description", "location"];
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
      data: farm,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "لديك مزرعة بهذا الاسم بالفعل",
      });
    }
    console.error("updateFarm error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Delete Farm ───────────────────────────────────────────────────────────────
// animals are deleted via the cascade pre-hook defined in the Farm model
const deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({
      _id: req.params.id,
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
    console.error("deleteFarm error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── Get Farm Stats ─────────────────────────────────────────────────────────────
const getFarmStats = async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true,
    });

    if (!farm) {
      return res.status(404).json({ success: false, message: "المزرعة غير موجودة" });
    }

    const [speciesStats, healthStats, totalCount] = await Promise.all([
      Animal.aggregate([
        { $match: { farm_id: farm._id, is_active: true } },
        { $group: { _id: "$species", count: { $sum: 1 } } },
      ]),
      Animal.aggregate([
        { $match: { farm_id: farm._id, is_active: true } },
        { $group: { _id: "$health_status", count: { $sum: 1 } } },
      ]),
      Animal.countDocuments({ farm_id: farm._id, is_active: true }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        farm,
        stats: {
          total_animals: totalCount,
          by_species: speciesStats,
          by_health_status: healthStats,
        },
      },
    });
  } catch (err) {
    console.error("getFarmStats error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = { createFarm, getMyFarms, getFarmById, updateFarm, deleteFarm, getFarmStats };