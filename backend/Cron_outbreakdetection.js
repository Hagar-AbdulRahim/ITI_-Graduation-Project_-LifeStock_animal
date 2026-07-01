const cron = require("node-cron");
const { runOutbreakDetection } = require("./services/outbreakDetection");

const startOutbreakDetectionJob = () => {
  cron.schedule("0 * * * *", runOutbreakDetection);
  console.log("✓ تم جدولة مهمة كشف الأوبئة (كل ساعة)");
};

module.exports = { startOutbreakDetectionJob, runOutbreakDetection };