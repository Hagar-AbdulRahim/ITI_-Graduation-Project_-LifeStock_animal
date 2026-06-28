const admin        = require("../config/firebase");
const Notification = require("../models/notification");

// ── بعت FCM + خزن في الداتابيز ────────────────────────────────────────────────
const sendNotification = async ({ user, title, body, type, data = {}, animal_id = null, vaccination_id = null }) => {
  // ── خزن في الداتابيز دايماً ───────────────────────────────────────────────
  const notification = await Notification.create({
    user_id:        user._id,
    animal_id,
    vaccination_id,
    type,
    title,
    body,
    data,
    sent_via_fcm: false,
  });

  // ── بعت FCM لو عنده token ──────────────────────────────────────────────────
  if (user.fcm_token && user.notifications_enabled) {
    try {
      await admin.messaging().send({
        token: user.fcm_token,
        notification: { title, body },
        data: { ...data, notification_id: notification._id.toString(), type },
        android: { priority: "high" },
        apns:    { payload: { aps: { sound: "default" } } },
      });

      await Notification.findByIdAndUpdate(notification._id, { sent_via_fcm: true });
      console.log(`✅ FCM sent to user: ${user._id}`);
    } catch (fcmErr) {
      console.warn(`⚠️  FCM failed for user ${user._id}:`, fcmErr.message);
    }
  }

  return notification;
};

module.exports = { sendNotification };