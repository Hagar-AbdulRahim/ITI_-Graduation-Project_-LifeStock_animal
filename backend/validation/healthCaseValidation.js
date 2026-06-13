const { body, param } = require("express-validator");

// ── Create Health Case ────────────────────────────────────────────────────────
const createHealthCaseValidator = [
  body("animal_id")
    .notEmpty().withMessage("معرّف الحيوان مطلوب")
    .isMongoId().withMessage("معرّف الحيوان غير صحيح"),

  body("symptoms")
    .notEmpty().withMessage("الأعراض مطلوبة")
    .isArray({ min: 1, max: 20 }).withMessage("يجب إدخال عرض واحد على الأقل وبحد أقصى 20"),

  body("symptoms.*")
    .trim()
    .notEmpty().withMessage("الأعراض لا يمكن أن تكون فارغة")
    .isLength({ min: 1, max: 200 }).withMessage("كل عرض يجب ألا يتجاوز 200 حرف"),

  body("input_type")
    .optional()
    .isIn(["text", "voice", "image"]).withMessage("نوع الإدخال يجب أن يكون: text أو voice أو image"),

  body("image_url")
    .optional()
    .isURL().withMessage("رابط الصورة غير صحيح"),
];

// ── Resolve a Case ────────────────────────────────────────────────────────────
const resolveHealthCaseValidator = [
  param("id")
    .isMongoId().withMessage("معرّف الحالة غير صحيح"),

  body("vet_consulted")
    .optional()
    .isBoolean().withMessage("vet_consulted يجب أن يكون true أو false"),
];

// ── Param ─────────────────────────────────────────────────────────────────────
const healthCaseIdValidator = [
  param("id")
    .isMongoId().withMessage("معرّف الحالة غير صحيح"),
];

module.exports = {
  createHealthCaseValidator,
  resolveHealthCaseValidator,
  healthCaseIdValidator,
};