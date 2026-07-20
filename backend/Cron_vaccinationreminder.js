const cron        = require("node-cron");
const Vaccination = require("./models/vaccination");
const User        = require("./models/user");
const { sendNotification } = require("./services/notificationService");

const SPECIES_LABELS = { cattle: "أبقار", sheep: "أغنام", goat: "ماعز" };

const dayRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const populateOptions = {
  path: "animal_id",
  select: "tag_number species farm_id",
  populate: { path: "farm_id", select: "name user_id" },
};

const sendBatch = async (vaccinations, flagField, timestampField, messageSuffix) => {
  let sentCount = 0;
  let skippedCount = 0;

  for (const vaccination of vaccinations) {
    const animal = vaccination.animal_id;
    const farm   = animal?.farm_id;
    if (!animal || !farm) { skippedCount++; continue; }

    const user = await User.findById(farm.user_id).select('+push_subscription');
    if (!user || !user.is_active) { skippedCount++; continue; }

    const speciesLabel = SPECIES_LABELS[animal.species] || animal.species;
    const animalLabel  = animal.tag_number ? `${speciesLabel} رقم ${animal.tag_number}` : speciesLabel;

    const title = vaccination.vaccine_type === "one_time"
      ? "تذكير بموعد لقاح طارئ 💉"
      : "تذكير بموعد تطعيم 🐄";

    const body = `موعد ${vaccination.vaccine_name} لـ ${animalLabel} في مزرعة ${farm.name} ${messageSuffix}`;

    const notification = await sendNotification({
      user, title, body,
      type: "vaccination_reminder",
      animal_id: animal._id,
      vaccination_id: vaccination._id,
      data: {
        vaccine_type: vaccination.vaccine_type,
        reminder_date: vaccination.reminder_date?.toISOString() || "",
      },
    });

    if (notification) {
      vaccination[flagField] = true;
      vaccination[timestampField] = new Date();
      await vaccination.save();
      sentCount++;
    } else {
      skippedCount++;
    }
  }

  return { sentCount, skippedCount };
};

const runVaccinationReminderJob = async () => {
  console.log(`[${new Date().toISOString()}] بدء فحص تذكيرات التطعيمات...`);

  try {
    const today    = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { start: todayStart,    end: todayEnd    } = dayRange(today);
    const { start: tomorrowStart, end: tomorrowEnd } = dayRange(tomorrow);

    // ── شرط is_active: true في كل الـ queries ────────────────────────────────

    // 1) تذكير قبل الميعاد بيوم
    const dueTomorrow = await Vaccination.find({
      is_active: true,           // ← جديد
      reminder_sent: { $ne: true },
      $or: [
        { vaccine_type: "recurring", next_due_date:  { $gte: tomorrowStart, $lte: tomorrowEnd } },
        { vaccine_type: "one_time",  scheduled_date: { $gte: tomorrowStart, $lte: tomorrowEnd }, completed: false },
      ],
    }).populate(populateOptions);

    const beforeResult = await sendBatch(dueTomorrow, "reminder_sent", "reminder_sent_at", "غداً");

    // 2) تذكير يوم الميعاد نفسه
    const dueToday = await Vaccination.find({
      is_active: true,           // ← جديد
      day_of_reminder_sent: { $ne: true },
      $or: [
        { vaccine_type: "recurring", next_due_date:  { $gte: todayStart, $lte: todayEnd } },
        { vaccine_type: "one_time",  scheduled_date: { $gte: todayStart, $lte: todayEnd }, completed: false },
      ],
    }).populate(populateOptions);

    const todayResult = await sendBatch(dueToday, "day_of_reminder_sent", "day_of_reminder_sent_at", "اليوم");

    // 3) لقاحات فات موعدها
    const dueOverdue = await Vaccination.find({
      is_active: true,           // ← جديد
      overdue_reminder_sent: { $ne: true },
      $or: [
        { vaccine_type: "recurring", next_due_date:  { $lt: todayStart } },
        { vaccine_type: "one_time",  scheduled_date: { $lt: todayStart }, completed: false },
      ],
    }).populate(populateOptions);

    const overdueResult = await sendBatch(dueOverdue, "overdue_reminder_sent", "overdue_reminder_sent_at", "— فات موعده");

    console.log(
      `انتهى الفحص — غداً: ${beforeResult.sentCount} | اليوم: ${todayResult.sentCount} | فات موعده: ${overdueResult.sentCount}`
    );
  } catch (err) {
    console.error("خطأ في تشغيل cron job تذكير التطعيمات:", err.message);
  }
};

// Separate job for overdue reminders (runs at midnight Cairo time)
const runOverdueJob = async () => {
  console.log(`[${new Date().toISOString()}] بدء فحص تذكيرات التطعيمات الفائتة...`);
  try {
    const today = new Date();
    const { start: todayStart } = dayRange(today);
    const dueOverdue = await Vaccination.find({
      is_active: true,
      overdue_reminder_sent: { $ne: true },
      $or: [
        { vaccine_type: "recurring", next_due_date: { $lt: todayStart } },
        { vaccine_type: "one_time", scheduled_date: { $lt: todayStart }, completed: false },
      ],
    }).populate(populateOptions);
    console.log(`Found ${dueOverdue.length} overdue vaccinations to process.`);
    const overdueResult = await sendBatch(dueOverdue, "overdue_reminder_sent", "overdue_reminder_sent_at", "— فات موعده");
    console.log(`Overdue reminders sent: ${overdueResult.sentCount}`);
  } catch (err) {
    console.error("خطأ في تشغيل cron job تذكير التطعيمات الفائتة:", err.message);
  }
};

const startVaccinationReminderJob = () => {
  cron.schedule("0 8 * * *", runVaccinationReminderJob, { timezone: "Africa/Cairo" });
  console.log("✓ تم جدولة مهمة تذكير التطعيمات (يومياً 8:00 ص بتوقيت القاهرة — قبل الميعاد بيوم + يوم المعيد)");
  cron.schedule("0 0 * * *", runOverdueJob, { timezone: "Africa/Cairo" });
  console.log("✓ تم جدولة مهمة تذكير التطعيمات الفائتة (يوميًا 00:00 ص بتوقيت القاهرة)");
};

module.exports = { startVaccinationReminderJob, runVaccinationReminderJob };