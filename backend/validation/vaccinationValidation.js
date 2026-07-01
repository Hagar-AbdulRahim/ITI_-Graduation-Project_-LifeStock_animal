// ════════════════════════════════════════════════════════════════════════════
// validation/vaccinationValidation.js
// ════════════════════════════════════════════════════════════════════════════
const { body, param } = require("express-validator");

// ── تحويل أي صيغة مدعومة لـ Date موحّد ────────────────────────────────────────
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

// ── Create Vaccination ────────────────────────────────────────────────────────
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

  body("is_first_dose")
    .optional()
    .isBoolean().withMessage("is_first_dose يجب أن يكون true أو false"),

  // ── last_date — مطلوب فقط لو recurring وليست أول جرعة ────────────────────
  body("last_date")
    .if((value, { req }) => {
      const type = req.body.vaccine_type || "recurring";
      const isFirstDose = req.body.is_first_dose === true || req.body.is_first_dose === "true";
      return type === "recurring" && !isFirstDose;
    })
    .notEmpty().withMessage("تاريخ آخر جرعة مطلوب — إلا إذا كانت هذه أول جرعة (is_first_dose: true)")
    .bail()
    .custom(isSimpleDate).withMessage("تاريخ آخر جرعة غير صحيح — استخدمي صيغة بسيطة مثل 2026-06-27")
    .bail()
    .custom((value) => {
      const normalized = normalizeDate(value);
      return normalized <= new Date();
    })
    .withMessage("تاريخ آخر جرعة لا يمكن أن يكون في المستقبل"),

  // ── منع التناقض: أول جرعة ومعاها last_date ────────────────────────────────
  body("last_date")
    .if((value, { req }) => {
      const isFirstDose = req.body.is_first_dose === true || req.body.is_first_dose === "true";
      return isFirstDose && value;
    })
    .custom(() => false)
    .withMessage("لا يمكن إدخال تاريخ آخر جرعة (last_date) — هذه أول جرعة للحيوان من هذا اللقاح"),

  body("next_due_date")
    .optional({ checkFalsy: true })
    .custom(isSimpleDate).withMessage("موعد الجرعة القادمة غير صحيح — استخدمي صيغة بسيطة مثل 2026-12-27"),

  body("scheduled_date")
    .if((value, { req }) => req.body.vaccine_type === "one_time")
    .notEmpty().withMessage("موعد إعطاء اللقاح مطلوب للقاحات الطارئة")
    .bail()
    .custom(isSimpleDate).withMessage("موعد اللقاح غير صحيح — استخدمي صيغة بسيطة مثل 2026-07-10"),

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

// ── Update Vaccination ────────────────────────────────────────────────────────
const updateVaccinationValidator = [
  body("vaccine_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage("اسم التطعيم يجب أن يكون بين 2 و150 حرف"),

  body("is_first_dose")
    .optional()
    .isBoolean().withMessage("is_first_dose يجب أن يكون true أو false"),

  body("last_date")
    .optional({ checkFalsy: true })
    .custom(isSimpleDate).withMessage("التاريخ غير صحيح — استخدمي صيغة بسيطة مثل 2026-06-27")
    .bail()
    .custom((value) => {
      const normalized = normalizeDate(value);
      return normalized <= new Date();
    })
    .withMessage("تاريخ آخر جرعة لا يمكن أن يكون في المستقبل"),

  body("last_date")
    .if((value, { req }) => {
      const isFirstDose = req.body.is_first_dose === true || req.body.is_first_dose === "true";
      return isFirstDose && value;
    })
    .custom(() => false)
    .withMessage("لا يمكن أن تكون أول جرعة ولها تاريخ آخر جرعة في نفس الوقت"),

  body("next_due_date")
    .optional({ checkFalsy: true })
    .custom(isSimpleDate).withMessage("التاريخ غير صحيح — استخدمي صيغة بسيطة مثل 2026-12-27"),

  body("scheduled_date")
    .optional({ checkFalsy: true })
    .custom(isSimpleDate).withMessage("التاريخ غير صحيح — استخدمي صيغة بسيطة مثل 2026-07-10"),

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
  param("id")
    .isMongoId().withMessage("معرّف التطعيم غير صحيح"),
];

module.exports = {
  createVaccinationValidator,
  updateVaccinationValidator,
  vaccinationIdValidator,
};