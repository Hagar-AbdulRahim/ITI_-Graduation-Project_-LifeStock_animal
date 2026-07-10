const User          = require("../models/user");
const Farm          = require("../models/farm");
const Animal        = require("../models/animal");
const HealthCase    = require("../models/healthCase");
const Consultation  = require("../models/Consultation");
const Notification  = require("../models/notification");
const Vaccination   = require("../models/vaccination");
const VeterinaryClinic = require("../models/veterinaryClinic");
const KnowledgeBase = require("../models/knowledgeBase");
const { sendNotification } = require("../services/notificationService");
const { parsePagination, paginatedResponse, isAdmin } = require("../utils/accessControl");
const { embeddingModel } = require("../config/gemini");
const { extractKnowledgeBaseChunks } = require("../scripts/ExtractJsonText");
const { runOutbreakDetection, OUTBREAK_CASE_THRESHOLD, OUTBREAK_WINDOW_HOURS } = require("../services/outbreakDetection");

const OutbreakModel = require("../models/Outbreakreport");
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

const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, governorate, role } = req.body;

    if (!name?.trim() || !email?.trim() || !password || !governorate?.trim()) {
      return res.status(400).json({ success: false, message: "الاسم والبريد وكلمة المرور والمحافظة مطلوبة" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
    }

    const allowedRoles = isAdmin(req.user) ? ["user", "sub_admin"] : ["user"];
    const assignedRole = allowedRoles.includes(role) ? role : "user";

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: "البريد الإلكتروني مسجل بالفعل" });
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      password,
      governorate: governorate.trim(),
      role: assignedRole,
      auth_provider: "local",
      is_email_verified: true,
      is_active: true,
    });

    await user.save();

    console.log(`[AUDIT] Admin ${req.user._id} created user ${user._id} with role ${assignedRole}`);

    const safeUser = await User.findById(user._id).select("-password -email_verification_token -password_reset_otp");

    res.status(201).json({
      success: true,
      message: "تم إنشاء المستخدم بنجاح",
      data: safeUser,
    });
  } catch (err) {
    console.error("createUser error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "البريد الإلكتروني مسجل بالفعل" });
    }
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


const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "لا يمكنك تعطيل حسابك الخاص" });
    }

    if (req.user.role === "sub_admin" && user.role === "admin") {
      return res.status(403).json({ success: false, message: "ليس لديك صلاحية تعديل حساب مدير النظام" });
    }

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
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "لا يمكنك تعطيل حسابك الخاص" });
    }

    if (req.user.role === "sub_admin" && user.role === "admin") {
      return res.status(403).json({ success: false, message: "ليس لديك صلاحية تعطيل حساب مدير النظام" });
    }

    await User.findByIdAndUpdate(req.params.id, { is_active: false }, { new: true });

    console.log(`[AUDIT] Admin ${req.user._id} deactivated user ${user._id}`);
    res.json({ success: true, message: "تم تعطيل المستخدم" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

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

    // أضف عدد الحيوانات لكل مزرعة
    const farmIds = farms.map((f) => f._id);
    const animalCounts = await Animal.aggregate([
      { $match: { farm_id: { $in: farmIds }, is_active: true } },
      { $group: { _id: "$farm_id", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(animalCounts.map((a) => [a._id.toString(), a.count]));
    const farmsWithCount = farms.map((f) => ({
      ...f.toObject(),
      total_animals: countMap[f._id.toString()] || 0,
    }));

    paginatedResponse(res, farmsWithCount, total, page, limit);
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
    if (!isAdmin(req.user)) {
      return res.status(403).json({ success: false, message: "ليس لديك صلاحية حذف المزارع" });
    }

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

    // فلترة بمزرعة معينة (لما اليوزر يضغط "عرض الحيوانات" من صفحة مزرعة بعينها)
    if (req.query.farm_id) filter.farm_id = req.query.farm_id;

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

    const healthCase = await HealthCase.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
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
      Consultation.find(filter).select("+ai_raw_response").populate("user_id", "name email phone").sort({ created_at: -1 }).skip(skip).limit(limit),
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

    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.governorate) filter.governorate = req.query.governorate;

    const [outbreaks, total] = await Promise.all([
      OutbreakModel.find(filter).sort({ detected_at: -1 }).skip(skip).limit(limit),
      OutbreakModel.countDocuments(filter),
    ]);

    paginatedResponse(res, outbreaks, total, page, limit);
  } catch (err) {
    console.error("getOutbreaks error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const createOutbreak = async (req, res) => {
  try {
    const OutbreakModel = getOutbreakModel();
    if (!OutbreakModel) return res.status(503).json({ success: false, message: "نموذج الفاشية غير متوفر" });

    const { disease_name, governorate, cases_count, ai_warning_message, status, symptoms, treatment, prevention, available_vaccines } = req.body;

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
      symptoms: symptoms || [],
      treatment: treatment || null,
      prevention: prevention || null,
      available_vaccines: available_vaccines || [],
    });

    // إرسال إشعار للمزارعين في المحافظة (أو الكل)
    const userQuery = { is_active: { $ne: false }, notifications_enabled: true };
    if (governorate !== "الكل") userQuery.governorate = governorate;

    const allUsers = await User.find(userQuery).select("+push_subscription");

    // بناء محتوى الإشعار المفصل
    let detailedBody = ai_warning_message || `تم رصد ${cases_count} حالة من ${disease_name} في محافظتك. يرجى توخي الحذر.`;
    
    let sentCount = 0;
    for (const user of allUsers) {
      await sendNotification({
        user,
        type:  "outbreak_alert",
        title: `⚠️ تحذير: انتشار ${disease_name} في ${governorate}`,
        body:  detailedBody,
        data: {
          outbreak_report_id: outbreak._id.toString(),
          governorate:        governorate,
          disease_name:       disease_name,
          cases_count:        cases_count.toString(),
        },
      });
      sentCount++;
    }

    res.status(201).json({ success: true, message: `تم إنشاء التقرير وإرسال تحذير لـ ${sentCount} مزارع`, data: outbreak });
  } catch (err) {
    console.error("createOutbreak error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const resolveOutbreak = async (req, res) => {
  try {
    const OutbreakModel = getOutbreakModel();
    if (!OutbreakModel) return res.status(503).json({ success: false, message: "نموذج الفاشية غير متوفر" });

    const outbreak = await OutbreakModel.findById(req.params.id);
    if (!outbreak) return res.status(404).json({ success: false, message: "الفاشية غير موجودة" });

    outbreak.status = "resolved";
    outbreak.resolved_at = new Date();
    await outbreak.save();

    res.json({ success: true, message: "تم تحديث حالة الفاشية بنجاح", data: outbreak });
  } catch (err) {
    console.error("resolveOutbreak error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const approveOutbreak = async (req, res) => {
  try {
    const OutbreakModel = getOutbreakModel();
    if (!OutbreakModel) return res.status(503).json({ success: false, message: "نموذج الفاشية غير متوفر" });

    const outbreak = await OutbreakModel.findById(req.params.id);
    if (!outbreak) return res.status(404).json({ success: false, message: "الفاشية غير موجودة" });

    if (outbreak.status !== "pending") return res.status(400).json({ success: false, message: "هذه الفاشية ليست قيد المراجعة" });

    outbreak.status = "active";
    await outbreak.save();

    // إرسال إشعار للمزارعين
    const userQuery = { is_active: { $ne: false }, notifications_enabled: true };
    if (outbreak.governorate !== "الكل") userQuery.governorate = outbreak.governorate;

    const allUsers = await User.find(userQuery).select("+push_subscription");

    let detailedBody = outbreak.ai_warning_message || `تم رصد ${outbreak.cases_count} حالة من ${outbreak.disease_name} في محافظتك. يرجى توخي الحذر.`;
    if (outbreak.symptoms && outbreak.symptoms.length > 0) detailedBody += `\nالأعراض: ${outbreak.symptoms.join('، ')}`;
    if (outbreak.treatment) detailedBody += `\nالعلاج: ${outbreak.treatment}`;
    if (outbreak.prevention) detailedBody += `\nالوقاية: ${outbreak.prevention}`;
    if (outbreak.available_vaccines && outbreak.available_vaccines.length > 0) detailedBody += `\nاللقاحات المتاحة: ${outbreak.available_vaccines.join('، ')}`;

    let sentCount = 0;
    for (const user of allUsers) {
      await sendNotification({
        user,
        type:  "outbreak_alert",
        title: `⚠️ تحذير: انتشار ${outbreak.disease_name} في ${outbreak.governorate}`,
        body:  detailedBody,
        data: {
          outbreak_report_id: outbreak._id.toString(),
          governorate:        outbreak.governorate,
          disease_name:       outbreak.disease_name,
        },
      });
      sentCount++;
    }

    res.json({ success: true, message: `تم تأكيد الفاشية ونشر التحذير لـ ${sentCount} مزارع`, data: outbreak });
  } catch (err) {
    console.error("approveOutbreak error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const rejectOutbreak = async (req, res) => {
  try {
    const OutbreakModel = getOutbreakModel();
    if (!OutbreakModel) return res.status(503).json({ success: false, message: "نموذج الفاشية غير متوفر" });

    const outbreak = await OutbreakModel.findById(req.params.id);
    if (!outbreak) return res.status(404).json({ success: false, message: "الفاشية غير موجودة" });

    if (outbreak.status !== "pending") return res.status(400).json({ success: false, message: "هذه الفاشية ليست قيد المراجعة" });

    outbreak.status = "rejected";
    await outbreak.save();

    res.json({ success: true, message: "تم تجاهل الفاشية", data: outbreak });
  } catch (err) {
    console.error("rejectOutbreak error:", err);
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

// ════════════════════════════════════════════════════════════════════════════
// Outbreak Analytics
// ════════════════════════════════════════════════════════════════════════════

// الأمراض المتكررة من HealthCases + Consultations بدون threshold filter
const getOutbreakCandidates = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const governorate = req.query.governorate;

    const matchBase = { created_at: { $gte: sinceDate }, ai_diagnosis: { $ne: null, $nin: ["غير محدد", ""] }, governorate: { $ne: null } };
    if (governorate) matchBase.governorate = governorate;

    // HealthCase — group by diagnosis + governorate
    const hcMatchFilter = { ...matchBase, is_historical: { $ne: true } };
    const hcResults = await HealthCase.aggregate([
      { $match: hcMatchFilter },
      { $group: { _id: { diagnosis: "$ai_diagnosis", governorate: "$governorate" }, count: { $sum: 1 }, sample_symptoms: { $push: { $slice: ["$symptoms", 3] } } } },
      { $project: { diagnosis: "$_id.diagnosis", governorate: "$_id.governorate", count: 1, source: { $literal: "health_case" }, sample_symptoms: { $slice: ["$sample_symptoms", 1] }, _id: 0 } },
    ]);

    // Consultation — group by diagnosis + governorate
    const cResults = await Consultation.aggregate([
      { $match: matchBase },
      { $group: { _id: { diagnosis: "$ai_diagnosis", governorate: "$governorate" }, count: { $sum: 1 }, sample_symptoms: { $push: { $slice: ["$symptoms", 3] } } } },
      { $project: { diagnosis: "$_id.diagnosis", governorate: "$_id.governorate", count: 1, source: { $literal: "consultation" }, sample_symptoms: { $slice: ["$sample_symptoms", 1] }, _id: 0 } },
    ]);

    // Merge results
    const merged = new Map();
    for (const r of [...hcResults, ...cResults]) {
      const key = `${r.governorate}|||${r.diagnosis}`;
      const existing = merged.get(key);
      if (existing) {
        existing.count += r.count;
        existing.sources = [...new Set([...existing.sources, r.source])];
      } else {
        merged.set(key, { ...r, sources: [r.source] });
      }
    }

    const candidates = Array.from(merged.values())
      .sort((a, b) => b.count - a.count)
      .map(c => ({
        ...c,
        threshold: OUTBREAK_CASE_THRESHOLD,
        threshold_reached: c.count >= OUTBREAK_CASE_THRESHOLD,
        percentage: Math.min(100, Math.round((c.count / OUTBREAK_CASE_THRESHOLD) * 100)),
      }));

    res.json({
      success: true,
      data: candidates,
      meta: { days, threshold: OUTBREAK_CASE_THRESHOLD, window_hours: OUTBREAK_WINDOW_HOURS }
    });
  } catch (err) {
    console.error("getOutbreakCandidates error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// الأعراض الأكثر تكراراً من HealthCases + Consultations
const getSymptomsStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const matchBase = { created_at: { $gte: sinceDate } };
    if (req.query.governorate) matchBase.governorate = req.query.governorate;

    const [hcSymptoms, cSymptoms] = await Promise.all([
      HealthCase.aggregate([
        { $match: { ...matchBase, is_historical: { $ne: true } } },
        { $unwind: "$symptoms" },
        { $group: { _id: "$symptoms", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 30 },
      ]),
      Consultation.aggregate([
        { $match: matchBase },
        { $unwind: "$symptoms" },
        { $group: { _id: "$symptoms", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 30 },
      ]),
    ]);

    const merged = new Map();
    for (const s of [...hcSymptoms, ...cSymptoms]) {
      const existing = merged.get(s._id);
      merged.set(s._id, { symptom: s._id, count: (existing?.count || 0) + s.count });
    }

    const symptoms = Array.from(merged.values()).sort((a, b) => b.count - a.count).slice(0, 25);
    res.json({ success: true, data: symptoms, meta: { days } });
  } catch (err) {
    console.error("getSymptomsStats error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// تشغيل فحص الأوبئة يدوياً
const triggerOutbreakDetection = async (req, res) => {
  try {
    console.log(`[AUDIT] Admin ${req.user._id} triggered manual outbreak detection`);
    await runOutbreakDetection();
    // عد الأوبئة النشطة بعد الفحص
    const activeCount = await OutbreakModel.countDocuments({ status: "active" });
    res.json({ success: true, message: "تم تشغيل الفحص بنجاح", data: { active_outbreaks: activeCount } });
  } catch (err) {
    console.error("triggerOutbreakDetection error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};


// ════════════════════════════════════════════════════════════════════════════
// Notifications
// ════════════════════════════════════════════════════════════════════════════
const getNotifications = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    
    // تجميع الإشعارات بناءً على العنوان والمحتوى لتجنب التكرار في صفحة الأدمن
    const pipeline = [
      {
        $group: {
          _id: { title: "$title", body: "$body", type: "$type" },
          created_at: { $max: "$created_at" },
          users_count: { $sum: 1 },
        }
      },
      { $sort: { created_at: -1 } }
    ];

    const allGrouped = await Notification.aggregate(pipeline);
    const total = allGrouped.length;
    
    const paginated = allGrouped.slice(skip, skip + limit).map(n => ({
      title: n._id.title,
      body: n._id.body,
      type: n._id.type,
      created_at: n.created_at,
      users_count: n.users_count,
    }));

    paginatedResponse(res, paginated, total, page, limit);
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const broadcastNotification = async (req, res) => {
  try {
    const { title, body, governorate, role } = req.body;

    const filter = { is_active: { $ne: false }, notifications_enabled: true };
    if (governorate) filter.governorate = governorate;
    if (role) filter.role = role;

    const users = await User.find(filter).select("+push_subscription");

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "لا يوجد مستخدمين متطابقين" });
    }

    let sentCount = 0;
    for (const user of users) {
      await sendNotification({
        user,
        type: "admin_broadcast",
        title,
        body,
        data: { broadcast: "true" },
      });
      sentCount++;
    }

    res.json({ success: true, message: `تم إرسال الإشعار لـ ${sentCount} مستخدم` });
  } catch (err) {
    console.error("broadcastNotification error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  getUserById,
  toggleUser,
  deleteUser,
  getClinics,
  createClinic,
  updateClinic,
  deleteClinic,
  getOutbreaks,
  createOutbreak,
  resolveOutbreak,
  approveOutbreak,
  rejectOutbreak,
  getConsultations,
  getKnowledgeBaseStats,
  rebuildKnowledgeBase,
  getUsersGrowth,
  getOutbreakCandidates,
  getSymptomsStats,
  triggerOutbreakDetection,
  getNotifications,
  broadcastNotification,
  getFarms,
  getFarmById,
  deleteFarm,
  getAnimals,
  getHealthCases,
  updateHealthCase,
};