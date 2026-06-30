const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const Vaccination = require('../models/vaccination');
const User = require('../models/user');
const { protect } = require('../middelwares/Auth.middleware');
const { runVaccinationReminderJob } = require('../Cron_vaccinationreminder');

router.use(protect);

// ── جلب كل الـ notifications بتاعت اليوزر ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user._id })
      .sort({ created_at: -1 })
      .limit(50)
      .populate('animal_id', 'tag_number species');

    const unread_count = await Notification.countDocuments({
      user_id: req.user._id,
      is_read: false,
    });

    res.json({ success: true, unread_count, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// ── تعليم notification كمقروءة ────────────────────────────────────────────────
router.put('/:id/read', async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { is_read: true }
    );
    res.json({ success: true, message: 'تم التعليم كمقروء' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// ── تعليم كل الـ notifications كمقروءة ───────────────────────────────────────
router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user._id, is_read: false },
      { is_read: true }
    );
    res.json({ success: true, message: 'تم تعليم الكل كمقروء' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// ── debug شامل ────────────────────────────────────────────────────────────────
router.post('/test-run', async (req, res) => {
  try {
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    // 1. كل اللقاحات في الـ DB
    const allVaccinations = await Vaccination.find({});

    // 2. اللي day_of_reminder_sent = false
    const notSent = await Vaccination.find({ day_of_reminder_sent: false });

    // 3. اللي موعده فات أو النهارده
    const overdue = await Vaccination.find({
      day_of_reminder_sent: false,
      $or: [
        { vaccine_type: 'recurring', next_due_date: { $lte: today } },
        {
          vaccine_type: 'one_time',
          scheduled_date: { $lte: today },
          completed: false,
        },
      ],
    }).populate({
      path: 'animal_id',
      select: 'tag_number species farm_id',
      populate: { path: 'farm_id', select: 'name user_id' },
    });

    // 4. فحص كل لقاح فيهم
    const debugResults = [];
    for (const v of overdue) {
      const animal = v.animal_id;
      const farm = animal?.farm_id;
      const user = farm ? await User.findById(farm.user_id) : null;

      debugResults.push({
        vaccine_name: v.vaccine_name,
        next_due_date: v.next_due_date,
        animal_populated: !!animal,
        farm_populated: !!farm,
        user_found: !!user,
        user_is_active: user?.is_active,
        user_fcm_token: user?.fcm_token ? 'موجود' : 'مش موجود',
        notifications_enabled: user?.notifications_enabled,
      });
    }

    // 5. شغّل الـ job الفعلي
    await runVaccinationReminderJob();

    // 6. الإشعارات اللي اتخزنت
    const recent = await Notification.find({ type: 'vaccination_reminder' })
      .sort({ created_at: -1 })
      .limit(10);

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
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
