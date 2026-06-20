const { body, param } = require("express-validator");

// ── Create Animal ─────────────────────────────────────────────────────────────
const createAnimalValidator = [
  body("farm_id")
    .notEmpty().withMessage("معرّف المزرعة مطلوب")
    .isMongoId().withMessage("معرّف المزرعة غير صحيح"),

  body("age_value")
    .notEmpty().withMessage("قيمة العمر مطلوبة")
    .isNumeric().withMessage("العمر يجب أن يكون رقماً"),

  body("age_unit")
    .notEmpty().withMessage("وحدة العمر مطلوبة")
    .isIn(["months", "years"]).withMessage("وحدة العمر يجب أن تكون أشهر أو سنوات"),

  body("health_status")
    .optional()
    .isIn(["healthy", "sick", "critical", "deceased"])
    .withMessage("الحالة الصحية غير صحيحة"),

  body("species")
    .notEmpty().withMessage("نوع الحيوان مطلوب")
    .isIn(["cattle", "sheep", "goat"])
    .withMessage("نوع الحيوان يجب أن يكون: cattle أو sheep أو goat"),

  body("gender")
    .notEmpty().withMessage("الجنس مطلوب")
    .isIn(["male", "female"]).withMessage("الجنس يجب أن يكون male أو female"),



  body("weight_kg")
    .optional()
    .isFloat({ min: 0.1 }).withMessage("الوزن يجب أن يكون أكبر من صفر"),

  body("breed")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("اسم السلالة يجب ألا يتجاوز 100 حرف"),

  body("tag_number")
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage("رقم الوسم يجب ألا يتجاوز 50 حرف"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("الملاحظات يجب ألا تتجاوز 1000 حرف"),
];

// ── Update Animal ─────────────────────────────────────────────────────────────
const updateAnimalValidator = [
  body("age_value")
    .optional()
    .isNumeric().withMessage("العمر يجب أن يكون رقماً"),

  body("age_unit")
    .optional()
    .isIn(["months", "years"]).withMessage("وحدة العمر يجب أن تكون أشهر أو سنوات"),

  body("weight_kg")
    .optional()
    .isFloat({ min: 0.1 }).withMessage("الوزن يجب أن يكون أكبر من صفر"),

  body("health_status")
    .optional()
    .isIn(["healthy", "sick", "critical", "deceased"])
    .withMessage("الحالة الصحية يجب أن تكون: healthy أو sick أو critical أو deceased"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("الملاحظات يجب ألا تتجاوز 1000 حرف"),

  body("breed")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("اسم السلالة يجب ألا يتجاوز 100 حرف"),

  body("tag_number")
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage("رقم الوسم يجب ألا يتجاوز 50 حرف"),

  // allow updating gender if needed
  body("gender")
    .optional()
    .isIn(["male", "female"]).withMessage("الجنس يجب أن يكون male أو female"),


];

// ── Param: MongoDB ObjectId ───────────────────────────────────────────────────
const animalIdValidator = [
  param("id")
    .isMongoId().withMessage("معرّف الحيوان غير صحيح"),
];

module.exports = { createAnimalValidator, updateAnimalValidator, animalIdValidator };