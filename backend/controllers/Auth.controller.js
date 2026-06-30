const crypto           = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User             = require("../models/user");
const { sendVerificationEmail, sendPasswordResetOtp } = require("../config/email");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_OPTIONS,
} = require("../config/Jwt");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendTokens = (res, user, statusCode = 200) => {
  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(statusCode).json({
    success: true,
    access_token: accessToken,
    user: {
      _id:                   user._id,
      name:                  user.name,
      email:                 user.email,
      phone:                 user.phone,
      governorate:           user.governorate,
      role:                  user.role || "user",
      avatar:                user.avatar,
      auth_provider:         user.auth_provider,
      is_email_verified:     user.is_email_verified,
      notifications_enabled: user.notifications_enabled,
      specialization:        user.specialization,
      license_number:        user.license_number,
      assigned_governorates: user.assigned_governorates,
    },
  });
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password, governorate } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.auth_provider === "local" && !existing.is_email_verified) {
        const rawToken = existing.generateVerificationToken();
        await existing.save({ validateBeforeSave: false });
        await sendVerificationEmail(existing, rawToken);
        return res.status(200).json({
          success: true,
          message: "الحساب موجود بالفعل لكن لم يتم التحقق منه. تم إعادة إرسال إيميل التحقق.",
        });
      }
      return res.status(409).json({ success: false, message: "البريد الإلكتروني مسجل بالفعل" });
    }
   const ALLOWED_ROLES = ["user", "doctor", "admin"];
   const requestedRole = ALLOWED_ROLES.includes(req.body.role) ? req.body.role : "user";
   const user = new User({ name, email, phone, password, governorate, auth_provider: "local", role: requestedRole });
    const rawToken  = user.generateVerificationToken();
    await user.save();
    try {
      await sendVerificationEmail(user, rawToken);
    } catch (emailErr) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ success: false, message: "فشل إرسال إيميل التحقق. يرجى المحاولة مرة أخرى." });
    }
    res.status(201).json({
      success: true,
      message: `تم إنشاء الحساب. تم إرسال رابط التحقق إلى ${email}.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: "رمز التحقق مطلوب" });
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email_verification_token:   hashedToken,
      email_verification_expires: { $gt: Date.now() },
    }).select("+email_verification_token +email_verification_expires");
    if (!user) return res.status(400).json({ success: false, message: "رابط التحقق غير صحيح أو انتهت صلاحيته" });
    if (user.is_email_verified) {
      return sendTokens(res, user, 200);
    }
    user.is_email_verified          = true;
    user.email_verification_token   = null;
    user.email_verification_expires = null;
    await user.save({ validateBeforeSave: false });
    sendTokens(res, user, 200);
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    // ✅ نجيب email_verification_sent_at صراحةً لأنها select: false في الـ model
    const user = await User.findOne({ email }).select(
      "+email_verification_token +email_verification_expires +email_verification_sent_at"
    );
    if (!user) return res.json({ success: true, message: "لو الإيميل ده مسجل وغير محقق، هيوصلك رابط تحقق جديد." });
    if (user.is_email_verified) {
      return res.json({
        success: true,
        already_verified: true,
        message: "هذا الحساب محقق بالفعل — يمكنك تسجيل الدخول.",
      });
    }
    // منع الـ spam — دقيقة واحدة بين كل طلب
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    if (user.email_verification_sent_at && user.email_verification_sent_at > oneMinuteAgo) {
      const secondsLeft = Math.ceil(
        (user.email_verification_sent_at.getTime() + 60 * 1000 - Date.now()) / 1000
      );
      return res.status(429).json({
        success: false,
        message: `يرجى الانتظار ${secondsLeft} ثانية قبل إعادة الإرسال`,
      });
    }
    const rawToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(user, rawToken);
    res.json({ success: true, message: "تم إرسال رابط تحقق جديد — تحقق من بريدك الإلكتروني." });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }
    if (user.auth_provider === "google" && !user.password) {
      return res.status(401).json({ success: false, message: "هذا الحساب مرتبط بـ Google — استخدم تسجيل الدخول بـ Google" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }
    if (!user.is_email_verified) {
      return res.status(403).json({ success: false, message: "يرجى التحقق من بريدك الإلكتروني أولاً.", email_verified: false });
    }
    sendTokens(res, user);
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { id_token } = req.body;
    const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const { sub: google_id, email, name, picture: avatar } = ticket.getPayload();
    const user = await User.findOne({ $or: [{ google_id }, { email }] });
    if (!user) {
      return res.status(404).json({ success: false, message: "لا يوجد حساب مرتبط بهذا البريد الإلكتروني.", not_registered: true });
    }
    if (!user.is_active) return res.status(401).json({ success: false, message: "الحساب معطل" });
    let needsSave = false;
    if (!user.google_id)           { user.google_id = google_id; needsSave = true; }
    if (!user.avatar && avatar)    { user.avatar    = avatar;    needsSave = true; }
    if (!user.is_email_verified)   {
      user.is_email_verified = true; user.email_verification_token = null;
      user.email_verification_expires = null; needsSave = true;
    }
    if (needsSave) await user.save({ validateBeforeSave: false });
    sendTokens(res, user);
  } catch (err) {
    if (err.message?.includes("Token used too late") || err.message?.includes("Invalid token")) {
      return res.status(401).json({ success: false, message: "رمز Google غير صحيح أو منتهي الصلاحية" });
    }
    res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "لا يوجد refresh token" });
    const decoded = verifyRefreshToken(token);
    const user    = await User.findById(decoded.id);
    if (!user || !user.is_active) return res.status(401).json({ success: false, message: "الحساب غير موجود أو معطل" });
    res.json({ success: true, access_token: generateAccessToken(user._id) });
  } catch {
    res.status(401).json({ success: false, message: "انتهت صلاحية الجلسة — يرجى تسجيل الدخول مجدداً" });
  }
};

const logout = (req, res) => {
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.json({ success: true, message: "تم تسجيل الخروج" });
};

// ════════════════════════════════════════════════════════════════════════════
// POST /api/auth/forgot-password — بيبعت OTP على الإيميل
// ════════════════════════════════════════════════════════════════════════════
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("+password_reset_otp_expires");

    if (!user || !user.is_active) {
      return res.json({ success: true, message: "لو الإيميل ده مسجل، هيوصلك كود التحقق." });
    }

    if (user.auth_provider === "google") {
      return res.status(400).json({ success: false, message: "حسابك مرتبط بـ Google — لا يمكن تغيير كلمة المرور" });
    }

    // منع الـ spam — دقيقتين بين كل طلب
    if (
      user.password_reset_otp_expires &&
      user.password_reset_otp_expires > new Date(Date.now() - 2 * 60 * 1000)
    ) {
      return res.status(429).json({ success: false, message: "يرجى الانتظار دقيقتين قبل طلب كود جديد" });
    }

    const otp = user.generatePasswordResetOtp();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetOtp(user, otp);
    } catch (emailErr) {
      user.password_reset_otp         = null;
      user.password_reset_otp_expires = null;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: "فشل إرسال الإيميل. يرجى المحاولة مرة أخرى." });
    }

    res.json({ success: true, message: `تم إرسال كود التحقق إلى ${email}. صالح لمدة 10 دقائق.` });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// POST /api/auth/reset-password — بيتحقق من الـ OTP ويغير الباسورد
// ════════════════════════════════════════════════════════════════════════════
const resetPassword = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      password_reset_otp:         hashedOtp,
      password_reset_otp_expires: { $gt: Date.now() },
    }).select("+password +password_reset_otp +password_reset_otp_expires");

    if (!user) {
      return res.status(400).json({ success: false, message: "الكود غير صحيح أو انتهت صلاحيته" });
    }

    user.password                   = new_password; // الـ pre-save hook بيعمل hash
    user.password_reset_otp         = null;
    user.password_reset_otp_expires = null;
    await user.save();

    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن." });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
};

module.exports = {
  register, verifyEmail, resendVerification,
  login, googleLogin, refreshToken, logout,
  forgotPassword, resetPassword,
};