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
    console.error("deleteFarm error:", err.stack || err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

const Vaccination = require("../models/vaccination");
const HealthCase = require("../models/healthCase");

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

    // 1. Get farm animals IDs to filter vaccinations and health cases
    const animals = await Animal.find({ farm_id: farm._id, is_active: true }).select("_id species health_status created_at name tag_number");
    const animalIds = animals.map(a => a._id);

    // 2. Base Stats (Total, Species, Health)
    const totalCount = animals.length;
    const speciesStats = [];
    const healthStats = [];
    
    const speciesMap = {};
    const healthMap = {};
    animals.forEach(a => {
      speciesMap[a.species] = (speciesMap[a.species] || 0) + 1;
      healthMap[a.health_status] = (healthMap[a.health_status] || 0) + 1;
    });
    
    for (const [key, val] of Object.entries(speciesMap)) speciesStats.push({ _id: key, count: val });
    for (const [key, val] of Object.entries(healthMap)) healthStats.push({ _id: key, count: val });

    // 3. Upcoming Vaccinations (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const upcoming_vaccinations = await Vaccination.countDocuments({
      animal_id: { $in: animalIds },
      next_due_date: { $gte: new Date(), $lte: sevenDaysFromNow }
    });

    // 4. Emergencies (Unresolved red severity health cases)
    const emergencies = await HealthCase.countDocuments({
      animal_id: { $in: animalIds },
      resolved: false,
      severity: "red"
    });

    // 5. Weekly Health Trends (Sick cases per day for last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0,0,0,0);
    
    const recentCases = await HealthCase.find({
      animal_id: { $in: animalIds },
      created_at: { $gte: sevenDaysAgo }
    }).select("created_at");

    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const trendsMap = {};
    // Initialize last 7 days
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendsMap[d.getDay()] = { score: 100, label: days[d.getDay()], count: 0 };
    }
    
    recentCases.forEach(c => {
      const day = c.created_at.getDay();
      if(trendsMap[day]) {
        trendsMap[day].count += 1;
        trendsMap[day].score = Math.max(0, 100 - (trendsMap[day].count * 15)); // subtract 15 per sick case
      }
    });
    const weekly_health_trends = Object.values(trendsMap);

    // 6. AI Recommendations
    const ai_recommendations = [];
    const sickCount = healthMap['sick'] || 0;
    const criticalCount = healthMap['critical'] || 0;
    
    if (criticalCount > 0) {
      ai_recommendations.push({
        id: 1, priority: 'عالية', priorityLevel: 'high', title: 'حالات حرجة تتطلب تدخلاً فورياً',
        description: `يوجد ${criticalCount} حيوانات في حالة حرجة. يُرجى التحقق من سجلات الطوارئ وعزلها فوراً لمنع انتشار العدوى.`
      });
    } else if (sickCount > 0) {
      ai_recommendations.push({
        id: 2, priority: 'متوسطة', priorityLevel: 'medium', title: 'متابعة الحيوانات المريضة',
        description: `هناك ${sickCount} حيوانات قيد المراقبة. تأكد من إعطاء الأدوية الموصوفة ومتابعة درجات الحرارة يومياً.`
      });
    } else {
      ai_recommendations.push({
        id: 3, priority: 'منخفضة', priorityLevel: 'low', title: 'القطيع بصحة جيدة',
        description: 'تحليلات الذكاء الاصطناعي تشير إلى استقرار صحي في المزرعة. استمر في جدول التطعيمات الروتيني.'
      });
    }

    // 7. Recent Activities (Sort recent animals and cases)
    const recentActivities = [];
    
    // recent animals
    const recentAnimals = [...animals].sort((a,b) => b.created_at - a.created_at).slice(0, 3);
    recentAnimals.forEach(a => {
      recentActivities.push({
        type: 'success', text: `تم تسجيل حيوان جديد (${a.tag_number || a._id})`, time: a.created_at, icon: 'check'
      });
    });

    // recent cases
    const recentHealthCases = await HealthCase.find({ animal_id: { $in: animalIds }})
      .sort({ created_at: -1 }).limit(3).populate('animal_id', 'tag_number');
    recentHealthCases.forEach(c => {
      recentActivities.push({
        type: c.severity === 'red' ? 'alert' : 'vaccination', 
        text: `تم رصد حالة صحية (${c.animal_id?.tag_number || 'غير محدد'})`, 
        time: c.created_at, icon: c.severity === 'red' ? 'thermometer' : 'syringe'
      });
    });

    // sort unified and take top 5
    recentActivities.sort((a,b) => b.time - a.time);
    const final_activities = recentActivities.slice(0, 5).map((act, idx) => ({
      id: idx + 1, ...act,
      time: act.time.toLocaleDateString('ar-EG') // format date
    }));

    return res.status(200).json({
      success: true,
      data: {
        farm,
        stats: {
          total_animals: totalCount,
          by_species: speciesStats,
          by_health_status: healthStats,
          upcoming_vaccinations,
          emergencies,
          weekly_health_trends,
          ai_recommendations,
          recent_activities: final_activities
        },
      },
    });
  } catch (err) {
    console.error("getFarmStats error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = { createFarm, getMyFarms, getFarmById, updateFarm, deleteFarm, getFarmStats };