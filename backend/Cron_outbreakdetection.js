const cron = require("node-cron");
const Case = require("./models/healthCase");
const Farm = require("./models/farm");
const User = require("./models/user");
const { sendNotification } = require("./services/notificationService");

// 1. وظيفة إرسال التنبيهات
const sendOutbreakAlert = async (diseaseName, governorate, caseCount) => {
  const farms = await Farm.find({ governorate }).select("user_id");
  const userIds = [...new Set(farms.map((f) => f.user_id.toString()))];
  const users = await User.find({ _id: { $in: userIds }, is_active: true });

  for (const user of users) {
    await sendNotification({
      user,
      title: "⚠️ تحذير انتشار مرض",
      body: `تم رصد ${caseCount} حالات ${diseaseName} في محافظة ${governorate}. يُرجى الحذر وتحصين قطيعك.`,
      type: "outbreak_alert",
      data: { disease: diseaseName, governorate, case_count: caseCount.toString() },
    });
  }
};

// 2. وظيفة فحص الأوبئة (الـ Logic الأساسي)
const runOutbreakDetection = async () => {
  console.log("بدء عملية فحص الأوبئة...");
  
  const outbreaks = await Case.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
    { $group: { _id: { disease: "$diseaseName", gov: "$governorate" }, count: { $sum: 1 } } },
    { $match: { count: { $gte: 5 } } } 
  ]);

  for (const item of outbreaks) {
    await sendOutbreakAlert(item._id.disease, item._id.gov, item.count);
  }
  console.log("تم الانتهاء من فحص الأوبئة.");
};

// 3. جدولة المهمة
const startOutbreakDetectionJob = () => {
  cron.schedule("0 * * * *", runOutbreakDetection);
  console.log("✓ تم جدولة مهمة اكتشاف الأوبئة (كل ساعة)");
};

module.exports = { startOutbreakDetectionJob, runOutbreakDetection };