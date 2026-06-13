const { body, param } = require("express-validator");

const EGYPTIAN_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر",
  "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية",
  "المنيا", "القليوبية", "الوادي الجديد", "السويس", "أسوان",
  "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية",
  "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر", "قنا",
  "شمال سيناء", "سوهاج",
];

// ── Create Farm ───────────────────────────────────────────────────────────────
const createFarmValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("اسم المزرعة مطلوب")
    .isLength({ min: 2, max: 150 }).withMessage("اسم المزرعة يجب أن يكون بين 2 و150 حرف"),

  body("governorate")
    .trim()
    .notEmpty().withMessage("المحافظة مطلوبة")
    .isIn(EGYPTIAN_GOVERNORATES).withMessage("المحافظة غير صحيحة"),

  body("location.coordinates")
    .notEmpty().withMessage("إحداثيات GPS مطلوبة")
    .isArray({ min: 2, max: 2 }).withMessage("الإحداثيات يجب أن تكون [longitude, latitude]"),

  body("location.coordinates[0]")
    .isFloat({ min: -180, max: 180 }).withMessage("خط الطول يجب أن يكون بين -180 و180"),

  body("location.coordinates[1]")
    .isFloat({ min: -90, max: 90 }).withMessage("خط العرض يجب أن يكون بين -90 و90"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("الوصف يجب ألا يتجاوز 500 حرف"),
];

// ── Update Farm ───────────────────────────────────────────────────────────────
const updateFarmValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage("اسم المزرعة يجب أن يكون بين 2 و150 حرف"),

  body("governorate")
    .optional()
    .trim()
    .isIn(EGYPTIAN_GOVERNORATES).withMessage("المحافظة غير صحيحة"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("الوصف يجب ألا يتجاوز 500 حرف"),
];

// ── Param: MongoDB ObjectId ───────────────────────────────────────────────────
const farmIdValidator = [
  param("id")
    .isMongoId().withMessage("معرّف المزرعة غير صحيح"),
];

module.exports = { createFarmValidator, updateFarmValidator, farmIdValidator };