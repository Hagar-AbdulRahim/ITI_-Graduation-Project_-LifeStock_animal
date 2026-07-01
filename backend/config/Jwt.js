const jwt = require("jsonwebtoken");

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || "access_dev_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_dev_secret";

const ACCESS_EXPIRES  = "60m";   // قصير — بيتجدد عبر الـ refresh token
const REFRESH_EXPIRES = "7d";

// ── توليد الـ tokens ─────────────────────────────────────────────────────────
const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

// ── التحقق ───────────────────────────────────────────────────────────────────
const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

// ── إعدادات الـ cookie ────────────────────────────────────────────────────────
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,                              // مش ممكن يوصله JS في المتصفح
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,            // 7 أيام بالـ milliseconds
  path: "/api/auth",                           // بيتبعت بس على روتات الـ auth
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  REFRESH_COOKIE_OPTIONS,
};