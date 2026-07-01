const webpush = require("web-push");

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * بيبعت push notification للمتصفح
 * @param {Object} subscription - الـ push_subscription المحفوظة في الـ user
 * @param {Object} payload - { title, body, data }
 */
const sendPushNotification = async (subscription, payload) => {
  if (!subscription) return null;

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body:  payload.body,
        data:  payload.data || {},
        icon:  "/icons/icon-192x192.png",
        badge: "/icons/badge-72x72.png",
      })
    );
    return true;
  } catch (err) {
    // لو الـ subscription انتهت أو invalid — 410 Gone
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.warn("push subscription انتهت صلاحيتها — هيتمسح من الـ DB");
      return "expired";
    }
    console.error("web push error:", err.message);
    return null;
  }
};

module.exports = { sendPushNotification };