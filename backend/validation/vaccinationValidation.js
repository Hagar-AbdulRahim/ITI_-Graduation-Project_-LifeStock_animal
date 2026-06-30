const { body, param } = require("express-validator");

/**
 * يقبل صيغ تاريخ بسيطة شائعة عند المزارعين بالإضافة للصيغة الرسمية:
 *   "2026-06-27"  أو  "27-06-2026"  أو  "27/06/2026"
 * بيرجع true لو أي صيغة منهم نتج عنها تاريخ صحيح
 */
const isSimpleDate = (value) => {
  if (!value) return false;
  // لو الصيغة DD-MM-YYYY أو DD/MM/YYYY نحوّلها لـ YYYY-MM-DD قبل الفحص
  const dmy = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/.exec(value);
  const dateStr = dmy ? `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}` : value;
  const parsed = new Date(dateStr);
  return !isNaN(parsed.getTime());
};

const dateField = (fieldName, label) =>
  body(fieldName)
    .custom((value) => isSimpleDate(value))
    .withMessage(`${label} غير صحيح — استخدمي صيغة بسيطة مثل 2026-06-27 أو 27-06-2026`);

// ── Create Vaccination ────────────────────────────────────────────────────────
// يدعم النوعين معاً: "recurring" (دوري) و "one_time" (طارئ مرة واحدة)
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

  // ── حقول النوع "recurring" — مطلوبة شرطياً فقط لو vaccine_type = recurring ──
  body("last_date")
    .if((value, { req }) => (req.body.vaccine_type || "recurring") === "recurring")
    .notEmpty().withMessage("تاريخ آخر جرعة مطلوب للقاحات الدورية")
    .bail()
    .custom(isSimpleDate).withMessage("تاريخ آخر جرعة غير صحيح — استخدمي صيغة بسيطة مثل 2026-06-27")
    .custom((value) => new Date(value) <= new Date())
    .withMessage("تاريخ آخر جرعة لا يمكن أن يكون في المستقبل"),

  body("next_due_date")
    .optional({ checkFalsy: true })
    .custom(isSimpleDate).withMessage("موعد الجرعة القادمة غير صحيح — استخدمي صيغة بسيطة مثل 2026-12-27"),

  // ── حقول النوع "one_time" — مطلوبة شرطياً فقط لو vaccine_type = one_time ────
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