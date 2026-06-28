const { body, param } = require("express-validator");

const EGYPTIAN_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر",
  "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية",
  "المنيا", "القليوبية", "الوادي الجديد", "السويس", "أسوان",
  "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية",
  "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر", "قنا",
  "شمال سيناء", "سوهاج",
];

const createFarmValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("اسم المزرعة مطلوب")
    .isLength({ min: 2, max: 150 }).withMessage("اسم المزرعة يجب أن يكون بين 2 و150 حرف"),

  body("governorate")
    .trim()
    .notEmpty().withMessage("المحافظة مطلوبة")
    .isIn(EGYPTIAN_GOVERNORATES).withMessage("المحافظة غير صحيحة"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("الوصف يجب ألا يتجاوز 500 حرف"),
];

const updateFarmValidator = [
  body("name").optional().trim().isLength({ min: 2, max: 150 }),
  body("governorate").optional().trim().isIn(EGYPTIAN_GOVERNORATES),
  body("description").optional().trim().isLength({ max: 500 }),
];

const farmIdValidator = [param("id").isMongoId().withMessage("معرّف المزرعة غير صحيح")];

module.exports = { createFarmValidator, updateFarmValidator, farmIdValidator };