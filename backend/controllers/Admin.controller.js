const User          = require("../models/user");
const Farm          = require("../models/farm");
const Animal        = require("../models/animal");
const HealthCase    = require("../models/healthCase");
const Consultation  = require("../models/Consultation");
const Notification  = require("../models/notification");
const Vaccination   = require("../models/vaccination");
const VeterinaryClinic = require("../models/veterinaryClinic");
const KnowledgeBase = require("../models/knowledgeBase");
const mongoose      = require("mongoose");
const { sendNotification } = require("../services/notificationService");
const { parsePagination, paginatedResponse } = require("../utils/accessControl");
const { embeddingModel } = require("../config/gemini");
const { extractKnowledgeBaseChunks } = require("../scripts/ExtractJsonText");

// OutbreakReport — لأن ملف Outbreakreport.js الأساسي نسي المطور يعرّف فيه الـ Schema
let OutbreakModel;
try {
  OutbreakModel = mongoose.model("OutbreakReport");
} catch {
  const outbreakSchema = new mongoose.Schema({
    disease_name: { type: String, required: true },
    governorate: { type: String, required: true },
    cases_count: { type: Number, required: true },
    ai_warning_message: { type: String },
    status: { type: String, enum: ["active", "resolved"], default: "active" },
    detected_at: { type: Date, default: Date.now },
    resolved_at: { type: Date }
  });
  OutbreakModel = mongoose.model("OutbreakReport", outbreakSchema);
}

const getOutbreakModel = () => OutbreakModel;

// ════════════════════════════════════════════════════════════════════════════
// GET /api/admin/dashboard/stats
// ════════════════════════════════════════════════════════════════════════════
const getDashboardStats = async (req, res) => {
  try {
    const OutbreakModel = getOutbreakModel();

    const [
      totalUsers,
      totalFarms,
      totalAnimals,
      sickAnimals,
      activeOutbreaks,
      pendingConsultations,
    ] = await Promise.all([
      User.countDocuments({ is_active: true }),
      Farm.countDocuments({ is_active: true }),
      Animal.countDocuments({ is_active: true }),
      Animal.countDocuments({ is_active: true, health_status: { $in: ["sick", "critical"] } }),
      OutbreakModel ? OutbreakModel.countDocuments({ status: "active" }) : Promise.resolve(0),
      Consultation.countDocuments({ doctor_status: "pending" }),
    ]);

    const usersByRole = await User.aggregate([
      { $match: { is_active: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const animalsBySpecies = await Animal.aggregate([
      { $match: { is_active: true } },
      { $group: { _id: "$species", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        total_users: totalUsers,
        total_farms: totalFarms,
        total_animals: totalAnimals,
        sick_animals: sickAnimals,
        active_outbreaks: activeOutbreaks,
        pending_consultations: pendingConsultations,
        users_by_role: usersByRole,
        animals_by_species: animalsBySpecies,
      },
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Users CRUD
// ════════════════════════════════════════════════════════════════════════════
const getUsers = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.governorate) filter.governorate = req.query.governorate;
    if (req.query.is_active !== undefined) filter.is_active = req.query.is_active === "true";
    if (req.query.search) {
      const s = req.query.search.trim();
      filter.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select("-password -email_verification_token -password_reset_otp").sort({ created_at: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    paginatedResponse(res, users, total, page, limit);
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -email_verification_token -password_reset_otp");
    if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    const userFarmIds = await Farm.find({ user_id: user._id }).distinct("_id");

    const [farmsCount, animalsCount, consultationsCount, vaccinationsCount] = await Promise.all([
      Farm.countDocuments({ user_id: user._id, is_active: true }),
      Animal.countDocuments({ is_active: true, farm_id: { $in: userFarmIds } }),
      Consultation.countDocuments({ user_id: user._id }),
      Vaccination.countDocuments({ animal_id: { $in: await Animal.find({ farm_id: { $in: userFarmIds } }).distinct("_id") } }),
    ]);

    res.json({ success: true, data: { user, farms_count: farmsCount, animals_count: animalsCount, consultations_count: consultationsCount, vaccinations_count: vaccinationsCount } });
  } catch (err) {
    console.error("getUserById error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, governorate, role, specialization, license_number, assigned_governorates } = req.body;

    if (!["doctor", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "يمكن إنشاء حسابات طبيب أو مدير فقط من لوحة الإدارة" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: "البريد الإلكتروني مسجل بالفعل" });

    const user = await User.create({
      name,
      email,
      phone,
      password,
      governorate,
      role,
      specialization: specialization || null,
      license_number: license_number || null,
      assigned_governorates: assigned_governorates || [],
      is_email_verified: true,
      auth_provider: "local",
    });

    console.log(`[AUDIT] Admin ${req.user._id} created user ${user._id} with role ${role}`);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({ success: true, message: "تم إنشاء المستخدم بنجاح", data: safeUser });
  } catch (err) {
    console.error("createUser error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const allowed = ["name", "phone", "governorate", "role", "is_active", "specialization", "license_number", "assigned_governorates"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .select("-password -email_verification_token -password_reset_otp");

    if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    if (updates.role) {
      console.log(`[AUDIT] Admin ${req.user._id} changed user ${user._id} role to ${updates.role}`);
    }

    res.json({ success: true, message: "تم تحديث المستخدم", data: user });
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    user.is_active = !user.is_active;
    await user.save();

    console.log(`[AUDIT] Admin ${req.user._id} toggled user ${user._id} to ${user.is_active ? "active" : "inactive"}`);
    res.json({ success: true, message: user.is_active ? "تم تفعيل المستخدم" : "تم تعطيل المستخدم", data: { is_active: user.is_active } });
  } catch (err) {
    console.error("toggleUser error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { is_active: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    console.log(`[AUDIT] Admin ${req.user._id} deactivated user ${user._id}`);
    res.json({ success: true, message: "تم تعطيل المستخدم" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Farms
// ════════════════════════════════════════════════════════════════════════════
const getFarms = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { is_active: true };
    if (req.query.governorate) filter.governorate = req.query.governorate;
    if (req.query.user) filter.user_id = req.query.user;

    const [farms, total] = await Promise.all([
      Farm.find(filter).populate("user_id", "name email").sort({ created_at: -1 }).skip(skip).limit(limit),
      Farm.countDocuments(filter),
    ]);

    paginatedResponse(res, farms, total, page, limit);
  } catch (err) {
    console.error("getFarms error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getFarmById = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id).populate("user_id", "name email phone");
    if (!farm) return res.status(404).json({ success: false, message: "المزرعة غير موجودة" });

    const animals = await Animal.find({ farm_id: farm._id, is_active: true })
      .select("tag_number species health_status gender")
      .limit(50);

    const summary = await Animal.aggregate([
      { $match: { farm_id: farm._id, is_active: true } },
      { $group: { _id: "$health_status", count: { $sum: 1 } } },
    ]);

    res.json({ success: true, data: { farm, animals, health_summary: summary } });
  } catch (err) {
    console.error("getFarmById error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findByIdAndUpdate(req.params.id, { is_active: false }, { new: true });
    if (!farm) return res.status(404).json({ success: false, message: "المزرعة غير موجودة" });

    console.log(`[AUDIT] Admin ${req.user._id} deleted farm ${farm._id}`);
    res.json({ success: true, message: "تم حذف المزرعة" });
  } catch (err) {
    console.error("deleteFarm error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Animals
// ════════════════════════════════════════════════════════════════════════════
const getAnimals = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const farmFilter = { is_active: true };
    if (req.query.governorate) farmFilter.governorate = req.query.governorate;

    const farmIds = await Farm.find(farmFilter).distinct("_id");
    const filter = { is_active: true, farm_id: { $in: farmIds } };

    if (req.query.species) filter.species = req.query.species;
    if (req.query.health_status) filter.health_status = req.query.health_status;

    const [animals, total] = await Promise.all([
      Animal.find(filter)
        .populate({ path: "farm_id", select: "name governorate user_id", populate: { path: "user_id", select: "name" } })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Animal.countDocuments(filter),
    ]);

    paginatedResponse(res, animals, total, page, limit);
  } catch (err) {
    console.error("getAnimals error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Health Cases
// ════════════════════════════════════════════════════════════════════════════
const getHealthCases = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};

    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.status === "resolved") filter.resolved = true;
    if (req.query.status === "open") filter.resolved = false;
    if (req.query.governorate) filter.governorate = req.query.governorate;
    if (req.query.from || req.query.to) {
      filter.created_at = {};
      if (req.query.from) filter.created_at.$gte = new Date(req.query.from);
      if (req.query.to) filter.created_at.$lte = new Date(req.query.to);
    }

    const [cases, total] = await Promise.all([
      HealthCase.find(filter)
        .populate("animal_id", "tag_number species")
        .populate("user_id", "name email")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      HealthCase.countDocuments(filter),
    ]);

    paginatedResponse(res, cases, total, page, limit);
  } catch (err) {
    console.error("getHealthCases error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const updateHealthCase = async (req, res) => {
  try {
    const allowed = ["severity", "resolved", "vet_notes", "recommended_treatment", "vet_consulted"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (updates.resolved === true) updates.resolved_at = new Date();

    const healthCase = await HealthCase.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!healthCase) return res.status(404).json({ success: false, message: "الحالة غير موجودة" });

    res.json({ success: true, message: "تم تحديث الحالة", data: healthCase });
  } catch (err) {
    console.error("updateHealthCase error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Consultations
// ════════════════════════════════════════════════════════════════════════════
const getConsultations = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};
    if (req.query.status) filter.doctor_status = req.query.status;
    if (req.query.governorate) filter.governorate = req.query.governorate;

    const [consultations, total] = await Promise.all([
      Consultation.find(filter).populate("user_id", "name email phone").sort({ created_at: -1 }).skip(skip).limit(limit),
      Consultation.countDocuments(filter),
    ]);

    paginatedResponse(res, consultations, total, page, limit);
  } catch (err) {
    console.error("getConsultations error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Outbreaks
// ════════════════════════════════════════════════════════════════════════════
const getOutbreaks = async (req, res) => {
  try {
    const OutbreakModel = getOutbreakModel();
    if (!OutbreakModel) return res.json({ success: true, count: 0, data: [] });

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.governorate) filter.governorate = req.query.governorate;

    const outbreaks = await OutbreakModel.find(filter).sort({ detected_at: -1 });
    res.json({ success: true, count: outbreaks.length, data: outbreaks });
  } catch (err) {
    console.error("getOutbreaks error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const createOutbreak = async (req, res) => {
  try {
    const OutbreakModel = getOutbreakModel();
    if (!OutbreakModel) return res.status(503).json({ success: false, message: "نموذج الفاشية غير متوفر" });

    const { disease_name, governorate, cases_count, ai_warning_message, status } = req.body;

    const existing = await OutbreakModel.findOne({ disease_name, governorate, status: "active" });
    if (existing) {
      existing.cases_count = cases_count || existing.cases_count;
      existing.ai_warning_message = ai_warning_message || existing.ai_warning_message;
      await existing.save();
      return res.json({ success: true, message: "تم تحديث تقرير الفاشية", data: existing });
    }

    const outbreak = await OutbreakModel.create({
      disease_name,
      governorate,
      cases_count,
      ai_warning_message,
      status: status || "active",
    });

    res.status(201).json({ success: true, message: "تم إنشاء تقرير الفاشية", data: outbreak });
  } catch (err) {
    console.error("createOutbreak error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const resolveOutbreak = async (req, res) => {
  try {
    const OutbreakModel = getOutbreakModel();
    if (!OutbreakModel) return res.status(503).json({ success: false, message: "نموذج الفاشية غير متوفر" });

    const outbreak = await OutbreakModel.findByIdAndUpdate(
      req.params.id,
      { status: "resolved", resolved_at: new Date() },
      { new: true }
    );
    if (!outbreak) return res.status(404).json({ success: false, message: "التقرير غير موجود" });

    res.json({ success: true, message: "تم حل الفاشية", data: outbreak });
  } catch (err) {
    console.error("resolveOutbreak error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Clinics management
// ════════════════════════════════════════════════════════════════════════════
const getClinics = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { is_active: true };
    if (req.query.governorate) filter.governorate = req.query.governorate;

    const [clinics, total] = await Promise.all([
      VeterinaryClinic.find(filter).sort({ governorate: 1, name: 1 }).skip(skip).limit(limit),
      VeterinaryClinic.countDocuments(filter),
    ]);

    paginatedResponse(res, clinics, total, page, limit);
  } catch (err) {
    console.error("getClinics error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const createClinic = async (req, res) => {
  try {
    const { name, governorate, address, phone, opening_hours, latitude, longitude } = req.body;

    if (!name || !governorate) {
      return res.status(400).json({ success: false, message: "اسم العيادة والمحافظة مطلوبان" });
    }

    const clinic = await VeterinaryClinic.create({
      name,
      governorate,
      address: address || null,
      phone: phone || null,
      opening_hours: opening_hours || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
    });

    res.status(201).json({ success: true, message: "تم إضافة العيادة", data: clinic });
  } catch (err) {
    console.error("createClinic error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const updateClinic = async (req, res) => {
  try {
    const allowed = ["name", "governorate", "address", "phone", "opening_hours", "latitude", "longitude", "is_active"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const clinic = await VeterinaryClinic.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!clinic) return res.status(404).json({ success: false, message: "العيادة غير موجودة" });

    res.json({ success: true, message: "تم تحديث العيادة", data: clinic });
  } catch (err) {
    console.error("updateClinic error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const deleteClinic = async (req, res) => {
  try {
    const clinic = await VeterinaryClinic.findByIdAndUpdate(req.params.id, { is_active: false }, { new: true });
    if (!clinic) return res.status(404).json({ success: false, message: "العيادة غير موجودة" });

    res.json({ success: true, message: "تم حذف العيادة" });
  } catch (err) {
    console.error("deleteClinic error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Knowledge base management
// ════════════════════════════════════════════════════════════════════════════
const rebuildKnowledgeBase = async (req, res) => {
  try {
    const chunks = await extractKnowledgeBaseChunks();
    if (!chunks?.length) {
      return res.status(400).json({ success: false, message: "لا توجد بيانات جاهزة لإعادة البناء" });
    }

    await KnowledgeBase.deleteMany({});

    const docs = [];
    for (const chunk of chunks) {
      const embedding = await embeddingModel.embedQuery(chunk.text.trim());
      docs.push({ text: chunk.text, embedding, metadata: { type: chunk.type, source: chunk.source } });
    }

    await KnowledgeBase.insertMany(docs);

    res.json({ success: true, message: "تم إعادة بناء قاعدة المعرفة", data: { chunks_count: docs.length } });
  } catch (err) {
    console.error("rebuildKnowledgeBase error:", err);
    res.status(500).json({ success: false, message: "خطأ في إعادة البناء", error: err.message });
  }
};

const getKnowledgeBaseStats = async (req, res) => {
  try {
    const count = await KnowledgeBase.countDocuments({});
    res.json({ success: true, data: { chunks_count: count } });
  } catch (err) {
    console.error("getKnowledgeBaseStats error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Notifications
// ════════════════════════════════════════════════════════════════════════════
const getNotifications = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [notifications, total] = await Promise.all([
      Notification.find({}).populate("user_id", "name email").sort({ created_at: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({}),
    ]);
    paginatedResponse(res, notifications, total, page, limit);
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const broadcastNotification = async (req, res) => {
  try {
    const { title, body, governorate, type } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: "العنوان والمحتوى مطلوبان" });
    }

    const userFilter = { is_active: true, notifications_enabled: true };
    if (governorate) userFilter.governorate = governorate;

    const users = await User.find(userFilter);
    let sent = 0;

    for (const user of users) {
      await sendNotification({ user, title, body, type: type || "general" });
      sent++;
    }

    console.log(`[AUDIT] Admin ${req.user._id} broadcast notification to ${sent} users`);
    res.json({ success: true, message: `تم إرسال الإشعار إلى ${sent} مستخدم`, sent_count: sent });
  } catch (err) {
    console.error("broadcastNotification error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Analytics
// ════════════════════════════════════════════════════════════════════════════
const getUsersGrowth = async (req, res) => {
  try {
    const months = parseInt(req.query.months, 10) || 6;
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const growth = await User.aggregate([
      { $match: { created_at: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: "$created_at" }, month: { $month: "$created_at" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({ success: true, data: growth });
  } catch (err) {
    console.error("getUsersGrowth error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getHealthTrends = async (req, res) => {
  try {
    const trends = await HealthCase.aggregate([
      { $match: { resolved: false, severity: { $in: ["yellow", "red"] } } },
      { $group: { _id: { governorate: "$governorate", severity: "$severity" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, data: trends });
  } catch (err) {
    console.error("getHealthTrends error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getVaccinationAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const [overdue, upcoming] = await Promise.all([
      Vaccination.countDocuments({
        vaccine_type: "recurring",
        next_due_date: { $lt: now },
      }),
      Vaccination.countDocuments({
        $or: [
          { vaccine_type: "recurring", next_due_date: { $gte: now, $lte: in30Days } },
          { vaccine_type: "one_time", scheduled_date: { $gte: now, $lte: in30Days }, completed: false },
        ],
      }),
    ]);

    res.json({ success: true, data: { overdue, upcoming } });
  } catch (err) {
    console.error("getVaccinationAnalytics error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUser,
  deleteUser,
  getFarms,
  getFarmById,
  deleteFarm,
  getAnimals,
  getHealthCases,
  updateHealthCase,
  getConsultations,
  getOutbreaks,
  createOutbreak,
  resolveOutbreak,
  getClinics,
  createClinic,
  updateClinic,
  deleteClinic,
  getKnowledgeBaseStats,
  rebuildKnowledgeBase,
  getNotifications,
  broadcastNotification,
  getUsersGrowth,
  getHealthTrends,
  getVaccinationAnalytics,
};
