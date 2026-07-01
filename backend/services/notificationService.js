const Notification           = require("../models/notification");
const { sendPushNotification } = require("./webPushService");
const User                   = require("../models/user");

const sendNotification = async ({
  user, title, body, type,
  data = {}, animal_id = null, vaccination_id = null,
}) => {
  // ── خزن في الداتابيز دايماً ──────────────────────────────────────────────
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

  // ── بعت Web Push لو عنده subscription ────────────────────────────────────
  if (user.push_subscription && user.notifications_enabled) {
    try {
      const result = await sendPushNotification(user.push_subscription, {
        title,
        body,
        data: {
          ...data,
          notification_id: notification._id.toString(),
          type,
          url: "/notifications",
        },
      });

      if (result === "expired") {
        // الـ subscription انتهت — نمسحها من الـ DB
        await User.findByIdAndUpdate(user._id, { push_subscription: null });
      } else if (result === true) {
        await Notification.findByIdAndUpdate(notification._id, { sent_via_fcm: true });
        console.log(`✅ Web Push sent to user: ${user._id}`);
      }
    } catch (err) {
      console.warn(`⚠️  Web Push failed for user ${user._id}:`, err.message);
    }
  }

  return notification;
};

module.exports = { sendNotification };