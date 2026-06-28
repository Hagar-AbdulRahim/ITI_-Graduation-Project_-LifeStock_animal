const express = require("express");
const router  = express.Router();
const { body } = require("express-validator");

const {
  register, verifyEmail, resendVerification,
  login, googleLogin, refreshToken, logout,
  forgotPassword, resetPassword,
} = require("../controllers/Auth.controller");

const { registerValidator, loginValidator, googleAuthValidator } = require("../validation/userValidation");
const validate = require("../middelwares/validationMW");

router.post("/register",            ...registerValidator,   validate, register);
router.get("/verify-email",         verifyEmail);
router.post("/resend-verification", body("email").isEmail().withMessage("إيميل غير صحيح"), validate, resendVerification);
router.post("/login",               ...loginValidator,      validate, login);
router.post("/google",              ...googleAuthValidator, validate, googleLogin);
router.post("/refresh",             refreshToken);
router.post("/logout",              logout);

// ── Password Reset ────────────────────────────────────────────────────────
router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("إيميل غير صحيح"),
  validate,
  forgotPassword
);

router.post(
  "/reset-password",
  body("email").isEmail().withMessage("إيميل غير صحيح"),
  body("otp")
    .isLength({ min: 6, max: 6 }).withMessage("الكود لازم يكون 6 أرقام")
    .isNumeric().withMessage("الكود لازم يكون أرقام فقط"),
  body("new_password")
    .isLength({ min: 8 }).withMessage("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .matches(/[A-Z]/).withMessage("يجب أن تحتوي على حرف كبير")
    .matches(/[0-9]/).withMessage("يجب أن تحتوي على رقم"),
  validate,
  resetPassword
);

module.exports = router;