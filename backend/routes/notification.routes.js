const express = require("express");
const router  = express.Router();
const Notification = require("../models/notification");
const { protect } = require("../middelwares/Auth.middleware");

router.use(protect);

// GET /api/notifications
router.get("/", async (req, res) => {
  try {
    const list = await Notification.find({ user_id: req.user._id }).sort({ created_at: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", async (req, res) => {
  try {
    const doc = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { $set: { is_read: true } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: "الإشعار غير موجود" });
    return res.status(200).json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/read-all
router.put("/read-all", async (req, res) => {
  try {
    await Notification.updateMany({ user_id: req.user._id }, { $set: { is_read: true } });
    return res.status(200).json({ success: true, message: "تم تحديد جميع الإشعارات كمقروءة" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── حذف إشعار ─────────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id
    });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "الإشعار غير موجود" });
    }
    res.json({ success: true, message: "تم حذف الإشعار بنجاح" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// ── debug شامل ────────────────────────────────────────────────────────────────
router.post("/test-run", async (req, res) => {
  try {
    const today = new Date();
    const todayStart = new Date(today); todayStart.setHours(0,0,0,0);

    // 1. كل اللقاحات في الـ DB
    const allVaccinations = await Vaccination.find({});
    
    // 2. اللي day_of_reminder_sent = false
    const notSent = await Vaccination.find({ day_of_reminder_sent: false });

    // 3. اللي موعده فات أو النهارده
    const overdue = await Vaccination.find({
      day_of_reminder_sent: false,
      $or: [
        { vaccine_type: "recurring", next_due_date: { $lte: today } },
        { vaccine_type: "one_time",  scheduled_date: { $lte: today }, completed: false },
      ],
    }).populate({
      path: "animal_id",
      select: "tag_number species farm_id",
      populate: { path: "farm_id", select: "name user_id" },
    });

    // 4. فحص كل لقاح فيهم
    const debugResults = [];
    for (const v of overdue) {
      const animal = v.animal_id;
      const farm   = animal?.farm_id;
      const user   = farm ? await User.findById(farm.user_id) : null;

      debugResults.push({
        vaccine_name:          v.vaccine_name,
        next_due_date:         v.next_due_date,
        animal_populated:      !!animal,
        farm_populated:        !!farm,
        user_found:            !!user,
        user_is_active:        user?.is_active,
        user_fcm_token:        user?.fcm_token ? "موجود" : "مش موجود",
        notifications_enabled: user?.notifications_enabled,
      });
    }

    // 5. شغّل الـ job الفعلي
    if (typeof runVaccinationReminderJob !== "undefined") {
      await runVaccinationReminderJob();
    }

    // 6. الإشعارات اللي اتخزنت
    let recent = await Notification.find({ type: "vaccination_reminder" })
      .sort({ created_at: -1 })
      .limit(10);

    // إذا لم يتم إنشاء إشعارات حقيقية، ننشئ إشعار تجريبي لاختبار الواجهة
    if (recent.length === 0) {
      const dummyNotification = await Notification.create({
        user_id: req.user._id,
        title: "إشعار تجريبي جديد 🎉",
        message: "هذا الإشعار تم توليده تلقائياً لاختبار تصميم وشكل صفحة الإشعارات وعمل الأزرار (مقروء/حذف).",
        type: ["vaccination", "health", "alert", "outbreak_alert"][Math.floor(Math.random() * 4)],
        is_read: false
      });
      recent = [dummyNotification];
    }

    return res.json({
      success: true,
      total_vaccinations_in_db: allVaccinations.length,
      not_sent_yet: notSent.length,
      overdue_or_today: overdue.length,
      debug_per_vaccination: debugResults,
      notifications_after_run: recent.length,
      recent_notifications: recent,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/notifications/test
router.post("/test", async (req, res) => {
  try {
    const testNotifs = [
      {
        user_id: req.user._id,
        title: "تنبيه تطعيم قادم",
        message: "الماعز #GT-009 يحتاج للجرعة التنشيطية من اللقاح الرباعي غداً.",
        type: "vaccination",
      },
      {
        user_id: req.user._id,
        title: "تحديث السجل الطبي",
        message: "تم تحديث السجل الطبي للبقرة بيلا بنجاح.",
        type: "health",
      },
      {
        user_id: req.user._id,
        title: "حالة طارئة جديدة",
        message: "تم تسجيل حالة طارئة (حمى مرتفعة) في الجناح ب.",
        type: "alert",
      }
    ];
    const docs = await Notification.insertMany(testNotifs);
    return res.status(201).json({ success: true, data: docs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
