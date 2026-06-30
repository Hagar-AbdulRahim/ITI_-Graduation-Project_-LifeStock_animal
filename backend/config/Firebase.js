const admin = require("firebase-admin");
const path  = require("path");
const fs    = require("fs");

const serviceAccountPath = path.join(__dirname, "firebase-service-account.json");

// 1. بناء الهيكل الافتراضي (Mock) كقاعدة أساسية ثابتة لحماية السيرفر
let firebaseAdminInstance = {
  initializeApp: () => { console.log("⚠️ [Firebase] تم محاكاة التهيئة بنجاح."); },
  messaging: () => ({
    send: async () => { console.log("📱 [Firebase] تم محاكاة إرسال الإشعار."); return "mock-id"; },
    sendMulticast: async () => { console.log("📱 [Firebase] تم محاكاة الإرسال الجماعي."); return { successCount: 1, failureCount: 0 }; }
  })
};

// 2. التحقق الآمن تماماً بدون استخدام .apps.length نهائياً لمنع الـ TypeError
try {
  if (fs.existsSync(serviceAccountPath)) {
    // محاولة استخدام الموديول الحقيقي فقط لو الملف موجود
    const actualAdmin = admin && admin.default ? admin.default : admin;
    
    if (actualAdmin && typeof actualAdmin.initializeApp === "function") {
      // نتحقق من التهيئة عبر try/catch لتفادي خطأ إعادة التهيئة بدلاً من قراءة المصفوفتة
      try {
        actualAdmin.initializeApp({
          credential: actualAdmin.credential.cert(serviceAccountPath),
        });
        console.log("🔥 Firebase Admin SDK Connected Successfully (Real)");
      } catch (e) {
        // لو متهيء مسبقاً سيمر هنا بسلام
      }
      firebaseAdminInstance = actualAdmin;
    }
  } else {
    console.log("💡 [Firebase Notice] ملف firebase-service-account.json غير موجود، تم تشغيل الـ Mock لحماية السيرفر.");
  }
} catch (globalErr) {
  console.warn("⚠️ حدث خطأ أثناء فحص Firebase، تم تفعيل نظام المحاكاة الآمن:", globalErr.message);
}

// 3. استخراج دالة الـ messaging بشكل آمن
const messaging = typeof firebaseAdminInstance.messaging === "function" 
  ? firebaseAdminInstance.messaging() 
  : firebaseAdminInstance.messaging;

module.exports = { admin: firebaseAdminInstance, messaging };