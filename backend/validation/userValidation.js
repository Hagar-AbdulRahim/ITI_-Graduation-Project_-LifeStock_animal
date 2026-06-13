const { body } = require("express-validator");

const EGYPTIAN_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر",
  "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية",
  "المنيا", "القليوبية", "الوادي الجديد", "السويس", "أسوان",
  "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية",
  "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر", "قنا",
  "شمال سيناء", "سوهاج",
];

const passwordRules = (field) =>
  body(field)
    .notEmpty().withMessage("كلمة المرور مطلوبة")
    .isLength({ min: 8 }).withMessage("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .matches(/[A-Z]/).withMessage("يجب أن تحتوي على حرف كبير واحد على الأقل")
    .matches(/[0-9]/).withMessage("يجب أن تحتوي على رقم واحد على الأقل");

const registerValidator = [
  body("name")
    .trim().notEmpty().withMessage("الاسم مطلوب")
    .isLength({ min: 2, max: 100 }).withMessage("الاسم يجب أن يكون بين 2 و100 حرف"),
  body("email")
    .trim().notEmpty().withMessage("البريد الإلكتروني مطلوب")
    .isEmail().withMessage("البريد الإلكتروني غير صحيح")
    .normalizeEmail(),
  body("phone")
    .trim().notEmpty().withMessage("رقم التليفون مطلوب")
    .matches(/^(\+2)?01[0125]\d{8}$/).withMessage("رقم التليفون المصري غير صحيح"),
  passwordRules("password"),
  body("governorate")
    .trim().notEmpty().withMessage("المحافظة مطلوبة")
    .isIn(EGYPTIAN_GOVERNORATES).withMessage("المحافظة غير صحيحة"),
];

const loginValidator = [
  body("email")
    .trim().notEmpty().withMessage("البريد الإلكتروني مطلوب")
    .isEmail().withMessage("البريد الإلكتروني غير صحيح")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("كلمة المرور مطلوبة"),
];

const googleAuthValidator = [
  body("id_token").notEmpty().withMessage("id_token مطلوب"),
  body("governorate")
    .optional().trim()
    .isIn(EGYPTIAN_GOVERNORATES).withMessage("المحافظة غير صحيحة"),
];

const updateProfileValidator = [
  body("name")
    .optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage("الاسم يجب أن يكون بين 2 و100 حرف"),
  body("phone")
    .optional().trim()
    .matches(/^(\+2)?01[0125]\d{8}$/).withMessage("رقم التليفون المصري غير صحيح"),
  body("governorate")
    .optional().trim()
    .isIn(EGYPTIAN_GOVERNORATES).withMessage("المحافظة غير صحيحة"),
  body("notifications_enabled")
    .optional().isBoolean().withMessage("يجب أن يكون true أو false"),
  body("fcm_token")
    .optional().isString().withMessage("FCM Token يجب أن يكون نص"),
];

const changePasswordValidator = [
  body("current_password").notEmpty().withMessage("كلمة المرور الحالية مطلوبة"),
  passwordRules("new_password"),
];

module.exports = {
  registerValidator,
  loginValidator,
  googleAuthValidator,
  updateProfileValidator,
  changePasswordValidator,
};