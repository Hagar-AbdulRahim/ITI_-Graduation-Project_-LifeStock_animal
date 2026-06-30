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
