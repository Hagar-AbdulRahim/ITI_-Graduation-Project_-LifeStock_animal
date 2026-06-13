const { body, param } = require("express-validator");

// ── Create Vaccination ────────────────────────────────────────────────────────
const createVaccinationValidator = [
  body("animal_id")
    .notEmpty().withMessage("معرّف الحيوان مطلوب")
    .isMongoId().withMessage("معرّف الحيوان غير صحيح"),

  body("vaccine_name")
    .trim()
    .notEmpty().withMessage("اسم التطعيم مطلوب")
    .isLength({ min: 2, max: 150 }).withMessage("اسم التطعيم يجب أن يكون بين 2 و150 حرف"),

  body("last_date")
    .notEmpty().withMessage("تاريخ آخر جرعة مطلوب")
    .isISO8601().withMessage("التاريخ يجب أن يكون بصيغة YYYY-MM-DD")
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error("تاريخ التطعيم لا يمكن أن يكون في المستقبل");
      }
      return true;
    }),

  body("next_due_date")
    .notEmpty().withMessage("موعد الجرعة القادمة مطلوب")
    .isISO8601().withMessage("التاريخ يجب أن يكون بصيغة YYYY-MM-DD")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.last_date)) {
        throw new Error("موعد الجرعة القادمة يجب أن يكون بعد تاريخ آخر جرعة");
      }
      return true;
    }),

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

  body("next_due_date")
    .optional()
    .isISO8601().withMessage("التاريخ يجب أن يكون بصيغة YYYY-MM-DD"),

  body("dose_ml")
    .optional()
    .isFloat({ min: 0.1 }).withMessage("الجرعة يجب أن تكون أكبر من صفر"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("الملاحظات يجب ألا تتجاوز 500 حرف"),
];

// ── Param ─────────────────────────────────────────────────────────────────────
const vaccinationIdValidator = [
  param("id")
    .isMongoId().withMessage("معرّف التطعيم غير صحيح"),
];

module.exports = {
  createVaccinationValidator,
  updateVaccinationValidator,
  vaccinationIdValidator,
};