const mongoose = require("mongoose");

const healthCaseSchema = new mongoose.Schema(
  {
    animal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Denormalized fields لتسريع الـ Outbreak Aggregation ──────────────────
    // بدل الـ $lookup على كل query، بنحفظ المحافظة مباشرة هنا
    governorate: {
      type: String,
      required: true,
      trim: true,
    },

    // ── Input ──────────────────────────────────────────────────────────────
    symptoms: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 20,
        message: "يجب إدخال عرض واحد على الأقل وبحد أقصى 20 عرض",
      },
    },
    input_type: {
      type: String,
      enum: ["text", "voice", "image"],
      default: "text",
    },
    image_url: {
      type: String,
      default: null,
    },

    // ── AI Output ──────────────────────────────────────────────────────────
    ai_diagnosis: {
      type: String,
      trim: true,
      default: null,
    },
    severity: {
      type: String,
      enum: ["green", "yellow", "red"],  // بسيطة / متابعة / طارئة
      default: null,
    },
    suggested_actions: {
      type: [String],
      default: [],
    },
    ai_raw_response: {
      type: mongoose.Schema.Types.Mixed, // الـ JSON كامل من الـ AI
      default: null,
      select: false, // مش بنرجعه في كل query
    },

    // ── Follow-up ──────────────────────────────────────────────────────────
    vet_consulted: {
      type: Boolean,
      default: false,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolved_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// الأهم: الـ Outbreak Detection Cron Job بيستخدم الاتنين دول
healthCaseSchema.index({ governorate: 1, created_at: -1 });
healthCaseSchema.index({ governorate: 1, ai_diagnosis: 1, created_at: -1 });

// للـ Animal Profile (تاريخ الحيوان المرضي)
healthCaseSchema.index({ animal_id: 1, created_at: -1 });

// للـ Dashboard
healthCaseSchema.index({ user_id: 1, severity: 1, created_at: -1 });
healthCaseSchema.index({ resolved: 1, severity: 1 });

// Text index للبحث في الأعراض والتشخيصات
healthCaseSchema.index(
  { symptoms: "text", ai_diagnosis: "text" },
  { default_language: "arabic" }
);

module.exports = mongoose.model("HealthCase", healthCaseSchema);