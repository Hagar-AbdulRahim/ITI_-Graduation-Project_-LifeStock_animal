const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const crypto   = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, required: true, trim: true, minlength: 2, maxlength: 100,
    },
    email: {
      type: String, required: true, unique: true, lowercase: true, trim: true,
    },
    phone: {
      type: String, trim: true, default: null,
    },
    password: {
      type: String, minlength: 8, select: false, default: null,
    },
    governorate: {
      type: String, required: true, trim: true,
    },

    // ── Email Verification ────────────────────────────────────────────────
    is_email_verified: {
      type: Boolean, default: false,
    },
    email_verification_token: {
      type: String, select: false, default: null,
    },
    email_verification_expires: {
      type: Date, select: false, default: null,
    },
    email_verification_sent_at: {
      type: Date, select: false, default: null,
    },

    // ── Password Reset OTP ────────────────────────────────────────────────
    password_reset_otp: {
      type: String, select: false, default: null,
    },
    password_reset_otp_expires: {
      type: Date, select: false, default: null,
    },

    // ── Google OAuth ──────────────────────────────────────────────────────
    google_id: {
      type: String, unique: true, sparse: true, default: null,
    },
    avatar: {
      type: String, default: null,
    },
    auth_provider: {
      type: String, enum: ["local", "google"], default: "local",
    },

    // ── Role-Based Access ─────────────────────────────────────────────────
    role: {
      type: String,
      enum: ["user", "doctor", "admin"],
      default: "user",
    },
    specialization:     { type: String, default: null },
    license_number:     { type: String, default: null },
    assigned_governorates: [{ type: String }],

    // ── Notifications ─────────────────────────────────────────────────────
    notifications_enabled: { type: Boolean, default: true },
    fcm_token:             { type: String,  default: null  },
    is_active:             { type: Boolean, default: true  },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// ── Hash password ─────────────────────────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// ── توليد token التحقق من الإيميل ────────────────────────────────────────────
userSchema.methods.generateVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.email_verification_token   = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.email_verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  this.email_verification_sent_at = new Date();
  return rawToken;
};

// ── توليد OTP إعادة تعيين كلمة المرور ────────────────────────────────────────
userSchema.methods.generatePasswordResetOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.password_reset_otp         = crypto.createHash("sha256").update(otp).digest("hex");
  this.password_reset_otp_expires = new Date(Date.now() + 10 * 60 * 1000);
  return otp;
};

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ governorate: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);