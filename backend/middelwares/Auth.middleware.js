const { verifyAccessToken } = require("../config/Jwt");
const User = require("../models/user");

/**
 * يتحقق من وجود access token صحيح في الـ Authorization header
 * بيضيف req.user لكل الـ controllers اللي بعده
 */
const protect = async (req, res, next) => {
  try {
    // ── استخراج الـ token ─────────────────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "غير مصرح — يرجى تسجيل الدخول",
      });
    }

    const token = authHeader.split(" ")[1];

    // ── التحقق من الـ token ───────────────────────────────────────────────
    const decoded = verifyAccessToken(token);

    // ── جلب اليوزر (تأكد إنه لسه موجود وactive) ─────────────────────────
    const user = await User.findById(decoded.id).select("-__v");
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: "الحساب غير موجود أو تم تعطيله",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "انتهت صلاحية الجلسة — يرجى تسجيل الدخول مجدداً"
        : "رمز المصادقة غير صحيح";

    return res.status(401).json({ success: false, message });
  }
};

module.exports = { protect };