const express = require("express");
const router  = express.Router();
const Notification = require("../models/notification");
const { protect } = require("../middelwares/Auth.middleware");

router.use(protect);

// 1. GET /api/notifications — جلب كل إشعارات المستخدم
router.get("/", async (req, res) => {
  try {
    const list = await Notification.find({ user_id: req.user._id }).sort({ created_at: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. PUT /api/notifications/read-all — تعيين الكل كمقروء (يجب قبل /:id)
router.put("/read-all", async (req, res) => {
  try {
    await Notification.updateMany({ user_id: req.user._id }, { $set: { is_read: true } });
    return res.status(200).json({ success: true, message: "تم تحديد جميع الإشعارات كمقروءة" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. PUT /api/notifications/:id/read — تعيين إشعار كمقروء
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

// 4. DELETE /api/notifications/:id — حذف إشعار
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id
    });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "الإشعار غير موجود" });
    }
    return res.json({ success: true, message: "تم حذف الإشعار بنجاح" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

module.exports = router;
