/**
 * test_outbreak_conversation.js
 * ————————————————————————————————————————————————————————————
 * تيست كامل للسيناريو: "كذا يوزر من نفس المحافظة دخلوا نفس التشخيص
 * → نوتفكيشن للأدمن (اشتباه وباء) → الأدمن يوافق/يرفض
 * → لو وافق: نوتفكيشن لكل يوزرز المحافظة إن فيه وباء جديد"
 *
 * الفرق عن test_outbreak_seed.js: ده بيستخدم Consultation (يوزرز فريدين حقيقيين)
 * مش HealthCase (حيوانات)، عشان يطابق السيناريو اللي وصفتيه بالظبط.
 *
 * ————————————————————————————————————————————————————————————
 * تشغيل:
 *   node test_outbreak_conversation.js setup     → يجهز اليوزرز + الاستشارات ويشغل الفحص
 *   node test_outbreak_conversation.js verify     → يتأكد مين استلم إيه بعد ما تعملي approve/reject من Postman
 *   node test_outbreak_conversation.js cleanup    → يشيل كل بيانات التيست
 * ————————————————————————————————————————————————————————————
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");
const Consultation = require("./models/Consultation");
const Notification = require("./models/notification");
const OutbreakReport = require("./models/Outbreakreport");
const { runOutbreakDetection } = require("./services/outbreakDetection");

// ── عدّليها زي ما تحبي ────────────────────────────────────────────────────
const TEST_GOVERNORATE = "أسيوط";
const TEST_DIAGNOSIS   = "TEST_OUTBREAK_DIALOGUE"; // اسم مميز عشان التنظيف يبقى سهل ومايتلخبطش مع بيانات حقيقية
const USERS_TO_CREATE  = 6; // خليها >= OUTBREAK_CASE_THRESHOLD في الـ .env
const TEST_EMAIL_PREFIX = "outbreak.test.user"; // كل يوزرز التيست هيبقى إيميلهم يبدأ بيه

const mode = process.argv[2]; // setup | verify | cleanup

async function connect() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");
}

// ════════════════════════════════════════════════════════════════════════
// SETUP — بيعمل اليوزرز + الاستشارات ويشغل الفحص
// ════════════════════════════════════════════════════════════════════════
async function setup() {
  console.log(`\n🧪 هنعمل ${USERS_TO_CREATE} يوزر تجريبي في محافظة "${TEST_GOVERNORATE}"...\n`);

  const users = [];
  for (let i = 1; i <= USERS_TO_CREATE; i++) {
    const email = `${TEST_EMAIL_PREFIX}${i}@test.local`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: `مزارع تجريبي ${i}`,
        email,
        phone: `010000000${i}`,
        password: "Test1234", // هيتعمله hash تلقائي
        governorate: TEST_GOVERNORATE,
        auth_provider: "local",
        is_email_verified: true,
        is_active: true,
        notifications_enabled: true,
      });
      console.log(`  👤 اتعمل يوزر جديد: ${email}`);
    } else {
      console.log(`  👤 يوزر موجود بالفعل: ${email}`);
    }
    users.push(user);
  }

  // نتأكد إن فيه أدمن واحد على الأقل هيستقبل الإشعار (بس مش هنعمله إحنا)
  const adminsCount = await User.countDocuments({ role: { $in: ["admin", "sub_admin"] } });
  if (adminsCount === 0) {
    console.log("⚠️  تحذير: مفيش أي admin/sub_admin في الداتابيز — مفيش حد هيستقبل إشعار الاشتباه بالوباء!");
  } else {
    console.log(`\nℹ️  فيه ${adminsCount} admin/sub_admin هيستقبلوا إشعار الاشتباه بالوباء`);
  }

  const notifCountBefore = await Notification.countDocuments({});

  console.log(`\n📝 هنضيف استشارة (Consultation) واحدة لكل يوزر بنفس التشخيص "${TEST_DIAGNOSIS}"...\n`);
  const now = new Date();
  for (const user of users) {
    await Consultation.create({
      user_id: user._id,
      governorate: TEST_GOVERNORATE,
      symptoms: ["عرض تجريبي للتيست"],
      ai_diagnosis: TEST_DIAGNOSIS,
      severity: "yellow",
      confidence: "متوسطة",
      created_at: now,
    });
  }
  console.log(`✅ اتضافت ${users.length} استشارة`);

  console.log("\n🔍 بشغل runOutbreakDetection() فورًا...\n");
  await runOutbreakDetection();

  const report = await OutbreakReport.findOne({ disease_name: TEST_DIAGNOSIS }).sort({ detected_at: -1 });
  const notifCountAfter = await Notification.countDocuments({});
  const newNotifs = notifCountAfter - notifCountBefore;

  if (!report) {
    console.log("❌ مفيش OutbreakReport اتعمل — تأكدي إن USERS_TO_CREATE >= OUTBREAK_CASE_THRESHOLD في الـ .env");
    return process.exit(1);
  }

  console.log("🎉 تم! دي حالة الفاشية دلوقتي:");
  console.log({
    id: report._id.toString(),
    status: report.status,
    cases_count: report.cases_count,
    governorate: report.governorate,
    ai_warning_message: report.ai_warning_message,
  });
  console.log(`\n📬 عدد الإشعارات اللي اتسجلت في الداتابيز: ${newNotifs} (المفروض تبقى = عدد الـ admins/sub_admins)`);

  console.log("\n👉 الخطوة الجاية: افتحي Postman وشغّلي واحد من الاتنين (بتوكن أدمن):");
  console.log(`   PUT /api/admin/outbreaks/${report._id}/approve`);
  console.log(`   PUT /api/admin/outbreaks/${report._id}/reject`);
  console.log("\nثم شغّلي: node test_outbreak_conversation.js verify");

  process.exit(0);
}

// ════════════════════════════════════════════════════════════════════════
// VERIFY — بعد ما تعملي approve أو reject من Postman، شغّلي ده تتأكدي مين استلم إيه
// ════════════════════════════════════════════════════════════════════════
async function verify() {
  const report = await OutbreakReport.findOne({ disease_name: TEST_DIAGNOSIS }).sort({ detected_at: -1 });
  if (!report) {
    console.log("❌ مفيش OutbreakReport للتيست ده — شغّلي setup الأول");
    return process.exit(1);
  }

  console.log("📋 حالة الفاشية دلوقتي:", report.status);

  const testUserIds = (
    await User.find({ email: { $regex: `^${TEST_EMAIL_PREFIX}` } }).distinct("_id")
  );

  const outbreakNotifs = await Notification.find({
    user_id: { $in: testUserIds },
    type: "outbreak_alert",
  });

  if (report.status === "active") {
    console.log(`\n✅ الفاشية اتوافق عليها (active). عدد يوزرز المحافظة اللي استلموا إشعار "وباء جديد": ${outbreakNotifs.length} / ${testUserIds.length}`);
    if (outbreakNotifs.length > 0) {
      console.log("📩 نموذج من محتوى الإشعار اللي استلموه:");
      console.log({ title: outbreakNotifs[0].title, body: outbreakNotifs[0].body });
    }
    if (outbreakNotifs.length < testUserIds.length) {
      console.log("⚠️  مش كل اليوزرز استلموا — تأكدي إن notifications_enabled=true وis_active=true عندهم كلهم");
    }
  } else if (report.status === "rejected") {
    console.log(`\n🚫 الفاشية اتترفضت. عدد إشعارات "وباء جديد" اللي وصلت لليوزرز (المفروض = 0): ${outbreakNotifs.length}`);
    if (outbreakNotifs.length > 0) {
      console.log("❌ فيه مشكلة! يوزرز استلموا تحذير وباء رغم إن الأدمن رفضها");
    } else {
      console.log("✅ صح، محدش استلم تحذير لأن الأدمن رفض الفاشية");
    }
  } else {
    console.log("\n⏳ الفاشية لسه pending — روحي عملي approve أو reject الأول من Postman");
  }

  process.exit(0);
}

// ════════════════════════════════════════════════════════════════════════
// CLEANUP — يشيل كل بيانات التيست
// ════════════════════════════════════════════════════════════════════════
async function cleanup() {
  const testUsers = await User.find({ email: { $regex: `^${TEST_EMAIL_PREFIX}` } });
  const testUserIds = testUsers.map((u) => u._id);

  const { deletedCount: consultDeleted } = await Consultation.deleteMany({ ai_diagnosis: TEST_DIAGNOSIS });
  const { deletedCount: notifDeleted } = await Notification.deleteMany({ user_id: { $in: testUserIds } });
  const { deletedCount: outbreakDeleted } = await OutbreakReport.deleteMany({ disease_name: TEST_DIAGNOSIS });
  const { deletedCount: usersDeleted } = await User.deleteMany({ email: { $regex: `^${TEST_EMAIL_PREFIX}` } });

  console.log(`🧹 اتشال: ${usersDeleted} يوزر تجريبي، ${consultDeleted} استشارة، ${notifDeleted} إشعار، ${outbreakDeleted} تقرير وباء`);
  process.exit(0);
}

async function main() {
  await connect();
  if (mode === "setup") return setup();
  if (mode === "verify") return verify();
  if (mode === "cleanup") return cleanup();

  console.log("استخدام: node test_outbreak_conversation.js [setup|verify|cleanup]");
  process.exit(1);
}

main().catch((err) => {
  console.error("❌ خطأ:", err);
  process.exit(1);
});