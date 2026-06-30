const { body, param } = require("express-validator");

// ── Diagnose ──────────────────────────────────────────────────────────────────
// جوة ملف الـ Validation الخاص بـ HealthCase:
const diagnoseValidator = [
  body("animal_id")
    .optional({ checkFalsy: true }) // بيخليه اختياري عشان الاستشارات العامة تشتغل بس لو جه يتأكد إنه MongoId صح
    .isMongoId().withMessage("معرّف الحيوان غير صحيح"),

  body("symptoms")
    .notEmpty().withMessage("الأعراض مطلوبة")
    .custom((value) => {
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length >= 1 && value.length <= 20;
      return false;
    })
    .withMessage("الأعراض يجب أن تكون نصاً أو قائمة من 1 إلى 20 عرض"),

  body("input_type")
    .optional()
    .isIn(["text", "voice", "image", "text+image", "voice+image"])
    .withMessage("نوع الإدخال غير صحيح"),
];

// ── Diagnose by Image ──────────────────────────────────────────────────────────
// مختلف عن diagnoseValidator: symptoms هنا اختيارية تماماً، لأن الصورة وحدها
// قد تكون كافية (المزارع يرفع صورة بدون يكتب أي وصف نصي)
const diagnoseImageValidator = [
  body("animal_id")
    .optional({ checkFalsy: true })
    .isMongoId().withMessage("معرّف الحيوان غير صحيح"),

  body("symptoms")
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (typeof value === "string") return true;
      if (Array.isArray(value)) return value.length <= 20;
      return false;
    })
    .withMessage("الأعراض يجب أن تكون نصاً أو قائمة من حد أقصى 20 عرض"),
];

// ── Resolve ───────────────────────────────────────────────────────────────────
const resolveCaseValidator = [
  param("id").isMongoId().withMessage("معرّف الحالة غير صحيح"),
  body("vet_consulted")
    .optional()
    .isBoolean().withMessage("vet_consulted يجب أن يكون true أو false"),
];

// ── Param ─────────────────────────────────────────────────────────────────────
const caseIdValidator = [
  param("id").isMongoId().withMessage("معرّف الحالة غير صحيح"),
];

const animalIdParamValidator = [
  param("animalId").isMongoId().withMessage("معرّف الحيوان غير صحيح"),
];

module.exports = {
  diagnoseValidator,
  diagnoseImageValidator,
  resolveCaseValidator,
  caseIdValidator,
  animalIdParamValidator,
};