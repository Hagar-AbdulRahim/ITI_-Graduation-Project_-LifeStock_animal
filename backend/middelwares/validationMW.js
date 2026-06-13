const { validationResult } = require("express-validator");

/**
 * Middleware يتحط بعد أي validator array في الـ route
 * لو فيه أخطاء → يرجع 422 بقايمة الأخطاء
 * لو مفيش → يكمل للـ controller
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "بيانات غير صحيحة",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = validate;