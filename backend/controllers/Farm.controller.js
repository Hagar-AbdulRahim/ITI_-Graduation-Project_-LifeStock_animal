const Farm        = require("../models/farm");
const Animal      = require("../models/animal");
const Vaccination = require("../models/vaccination");
const HealthCase  = require("../models/healthCase");

const ARABIC_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const formatRelativeTime = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
};

const buildWeeklyHealthTrends = (healthCases, days = 7) => {
  const trends = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const dayStart = new Date(today);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayCases = healthCases.filter((c) => {
      const created = new Date(c.created_at);
      return created >= dayStart && created < dayEnd;
    });

    const redCount = dayCases.filter((c) => c.severity === "red").length;
    const score = Math.max(0, Math.min(100, 100 - dayCases.length * 12 - redCount * 20));

    trends.push({
      day: ARABIC_DAYS[dayStart.getDay()],
      score,
      label: dayCases.length ? `${dayCases.length} حالة` : "لا حالات",
    });
  }

  return trends;
};

const buildAIRecommendations = ({ upcomingVaccinations, sickCount, criticalCount, openEmergencies, totalAnimals }) => {
  const recs = [];

  if (upcomingVaccinations > 0) {
    recs.push({
      id: "vac-upcoming",
      title: "مواعيد تطعيم قادمة",
      description: `لديك ${upcomingVaccinations} تطعيم${upcomingVaccinations > 1 ? "ات" : ""} خلال الـ 30 يوم القادمة. راجع جدول التطعيمات.`,
      priorityLevel: upcomingVaccinations >= 5 ? "high" : "medium",
    });
  }

  if (criticalCount > 0) {
    recs.push({
      id: "critical-animals",
      title: "حيوانات في حالة حرجة",
      description: `${criticalCount} حيوان${criticalCount > 1 ? "ات" : ""} بحالة حرجة. يُنصح بالتدخل البيطري الفوري.`,
      priorityLevel: "high",
    });
  } else if (sickCount > 0) {
    recs.push({
      id: "sick-animals",
      title: "مراقبة الحيوانات المريضة",
      description: `${sickCount} حيوان${sickCount > 1 ? "ات" : ""} بحالة مرضية. تابع الأعراض يومياً.`,
      priorityLevel: "medium",
    });
  }

  if (openEmergencies > 0) {
    recs.push({
      id: "open-emergencies",
      title: "حالات طوارئ مفتوحة",
      description: `${openEmergencies} حالة${openEmergencies > 1 ? "ات" : ""} صحية عالية الخطورة تحتاج متابعة.`,
      priorityLevel: "high",
    });
  }

  if (totalAnimals === 0) {
    recs.push({
      id: "add-animals",
      title: "ابدأ بإضافة حيوانات",
      description: "أضف حيواناتك للحصول على تحليلات صحية وتوصيات مخصصة.",
      priorityLevel: "low",
    });
  } else if (recs.length === 0) {
    recs.push({
      id: "all-good",
      title: "الوضع الصحي مستقر",
      description: "لا توجد تنبيهات عاجلة. استمر في المتابعة الدورية والتطعيمات.",
      priorityLevel: "low",
    });
  }

  return recs.slice(0, 4);
};

const buildRecentActivities = ({ recentAnimals, recentVaccinations, recentCases }) => {
  const activities = [];

  recentCases.forEach((c) => {
    activities.push({
      id: `case-${c._id}`,
      type: c.severity === "red" ? "alert" : "default",
      text: `تشخيص جديد: ${c.ai_diagnosis?.slice(0, 60) || "حالة صحية"}`,
      time: formatRelativeTime(c.created_at),
      actor: "الذكاء الاصطناعي",
      created_at: c.created_at,
    });
  });

  recentVaccinations.forEach((v) => {
    activities.push({
      id: `vac-${v._id}`,
      type: "vaccination",
      text: `تطعيم ${v.vaccine_name}${v.animal_id?.tag_number ? ` — ${v.animal_id.tag_number}` : ""}`,
      time: formatRelativeTime(v.created_at),
      actor: "المزارع",
      created_at: v.created_at,
    });
  });

  recentAnimals.forEach((a) => {
    activities.push({
      id: `animal-${a._id}`,
      type: "success",
      text: `تمت إضافة حيوان ${a.tag_number} (${a.species})`,
      time: formatRelativeTime(a.created_at),
      actor: "المزارع",
      created_at: a.created_at,
    });
  });

  return activities
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8)
    .map(({ created_at, ...rest }) => rest);
};

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

    const animalIds = await Animal.find({ farm_id: farm._id, is_active: true }).distinct("_id");

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      speciesStats,
      healthStats,
      totalCount,
      upcomingVaccinations,
      openEmergencies,
      healthCasesLast30,
      recentAnimals,
      recentVaccinations,
      recentCases,
    ] = await Promise.all([
      Animal.aggregate([
        { $match: { farm_id: farm._id, is_active: true } },
        { $group: { _id: "$species", count: { $sum: 1 } } },
      ]),
      Animal.aggregate([
        { $match: { farm_id: farm._id, is_active: true } },
        { $group: { _id: "$health_status", count: { $sum: 1 } } },
      ]),
      Animal.countDocuments({ farm_id: farm._id, is_active: true }),
      animalIds.length
        ? Vaccination.countDocuments({
            animal_id: { $in: animalIds },
            $or: [
              { vaccine_type: "recurring", next_due_date: { $lte: thirtyDaysFromNow } },
              { vaccine_type: "one_time", completed: false, scheduled_date: { $lte: thirtyDaysFromNow } },
            ],
          })
        : 0,
      animalIds.length
        ? HealthCase.countDocuments({
            animal_id: { $in: animalIds },
            resolved: false,
            severity: "red",
          })
        : 0,
      animalIds.length
        ? HealthCase.find({ animal_id: { $in: animalIds }, created_at: { $gte: thirtyDaysAgo } })
            .select("severity created_at")
            .lean()
        : [],
      Animal.find({ farm_id: farm._id, is_active: true })
        .sort({ created_at: -1 })
        .limit(5)
        .select("tag_number species created_at")
        .lean(),
      animalIds.length
        ? Vaccination.find({ animal_id: { $in: animalIds } })
            .sort({ created_at: -1 })
            .limit(5)
            .populate("animal_id", "tag_number")
            .lean()
        : [],
      animalIds.length
        ? HealthCase.find({ animal_id: { $in: animalIds } })
            .sort({ created_at: -1 })
            .limit(5)
            .select("ai_diagnosis severity created_at")
            .lean()
        : [],
    ]);

    const sickCount = healthStats.find((s) => s._id === "sick")?.count || 0;
    const criticalCount = healthStats.find((s) => s._id === "critical")?.count || 0;

    return res.status(200).json({
      success: true,
      data: {
        farm,
        stats: {
          total_animals:         totalCount,
          by_species:            speciesStats,
          by_health_status:      healthStats,
          upcoming_vaccinations: upcomingVaccinations,
          emergencies:           openEmergencies + criticalCount,
          weekly_health_trends:  buildWeeklyHealthTrends(healthCasesLast30, 7),
          weekly_health_trends_30: buildWeeklyHealthTrends(healthCasesLast30, 30),
          ai_recommendations:    buildAIRecommendations({
            upcomingVaccinations,
            sickCount,
            criticalCount,
            openEmergencies,
            totalAnimals: totalCount,
          }),
          recent_activities:     buildRecentActivities({ recentAnimals, recentVaccinations, recentCases }),
        },
      },
    });
  } catch (err) {
    console.error("getFarmStats error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = { createFarm, getMyFarms, getFarmById, updateFarm, deleteFarm, getFarmStats };