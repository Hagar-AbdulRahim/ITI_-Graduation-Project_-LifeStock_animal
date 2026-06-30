require("dotenv").config();
const mongoose = require("mongoose");
const { runVaccinationReminders } = require("./Cron_vaccinationreminder");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("متصل — بدء التشغيل اليدوي للتذكير...");
  await runVaccinationReminders();
  process.exit(0);
});