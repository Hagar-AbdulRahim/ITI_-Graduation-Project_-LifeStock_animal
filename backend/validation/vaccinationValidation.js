const { body, param } = require("express-validator");

const normalizeDate = (value) => {
  if (!value) return null;
  const dmy = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/.exec(value);
  const dateStr = dmy
    ? `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`
    : value;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const isSimpleDate = (value) => normalizeDate(value) !== null;

// ── Create ────────────────────────────────────────────────────────────────────
const createVaccinationValidator = [
  body("animal_id")
    .notEmpty().withMessage("معرّف الحيوان مطلوب")
    .isMongoId().withMessage("معرّف الحيوان غير صحيح"),

  body("vaccine_name")
    .trim()
    .notEmpty().withMessage("اسم التطعيم مطلوب")
    .isLength({ min: 2, max: 150 }).withMessage("اسم التطعيم يجب أن يكون بين 2 و150 حرف"),

  body("vaccine_type")
    .optional()
    .isIn(["one_time", "recurring"]).withMessage("نوع اللقاح يجب أن يكون one_time أو recurring"),

  // ── administration_date — مطلوب دايماً ───────────────────────────────────
  // الصح
 body("administration_date")
  .if((value, { req }) => (req.body.vaccine_type || "recurring") === "recurring")
  .notEmpty().withMessage("تاريخ إعطاء الجرعة مطلوب للقاحات المتكررة")
  .bail()
  .custom(isSimpleDate).withMessage("تاريخ إعطاء الجرعة غير صحيح — استخدم صيغة مثل 2026-06-27"),

  // ── repeat_every_months — للـ recurring فقط ──────────────────────────────
  body("repeat_every_months")
    .if((value, { req }) => (req.body.vaccine_type || "recurring") === "recurring")
    .optional()
    .isInt({ min: 1, max: 120 }).withMessage("فترة التكرار يجب أن تكون بين 1 و120 شهر"),

  // ── scheduled_date — مطلوب للـ one_time فقط ──────────────────────────────
  body("scheduled_date")
    .if((value, { req }) => req.body.vaccine_type === "one_time")
    .notEmpty().withMessage("موعد إعطاء اللقاح مطلوب للقاحات الطارئة")
    .bail()
    .custom(isSimpleDate).withMessage("موعد اللقاح غير صحيح — استخدم صيغة مثل 2026-07-10"),

  body("dose_ml")
    .optional()
    .isFloat({ min: 0.1 }).withMessage("الجرعة يجب أن تكون أكبر من صفر"),

  body("administered_by")
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage("اسم من أعطى التطعيم يجب ألا يتجاوز 150 حرف"),

  body("batch_number")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("رقم الدفعة يجب ألا يتجاوز 100 حرف"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("الملاحظات يجب ألا تتجاوز 500 حرف"),
];

// ── Update ────────────────────────────────────────────────────────────────────
const updateVaccinationValidator = [
  body("vaccine_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage("اسم التطعيم يجب أن يكون بين 2 و150 حرف"),

  body("administration_date")
    .optional({ checkFalsy: true })
    .custom(isSimpleDate).withMessage("تاريخ إعطاء الجرعة غير صحيح — استخدم صيغة مثل 2026-06-27"),

  body("repeat_every_months")
    .optional()
    .isInt({ min: 1, max: 120 }).withMessage("فترة التكرار يجب أن تكون بين 1 و120 شهر"),

  body("next_due_date")
    .optional({ checkFalsy: true })
    .custom(isSimpleDate).withMessage("التاريخ غير صحيح — استخدم صيغة مثل 2026-12-27"),

  body("scheduled_date")
    .optional({ checkFalsy: true })
    .custom(isSimpleDate).withMessage("التاريخ غير صحيح — استخدم صيغة مثل 2026-07-10"),

  body("completed")
    .optional()
    .isBoolean().withMessage("completed يجب أن يكون true أو false"),

  body("dose_ml")
    .optional()
    .isFloat({ min: 0.1 }).withMessage("الجرعة يجب أن تكون أكبر من صفر"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("الملاحظات يجب ألا تتجاوز 500 حرف"),
];

const vaccinationIdValidator = [
  param("id").isMongoId().withMessage("معرّف التطعيم غير صحيح"),
];

module.exports = {
  createVaccinationValidator,
  updateVaccinationValidator,
  vaccinationIdValidator,
};