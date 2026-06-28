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

    // ── Denormalized — لتسريع الـ Outbreak Aggregation (بدون $lookup) ───────
    governorate: {
      type: String,
      required: true,
      trim: true,
    },

    // ── الإدخال ──────────────────────────────────────────────────────────────
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
      enum: ["text", "voice", "image", "text+image", "voice+image"],
      default: "text",
    },
    image_url: {
      type: String,
      default: null,
    },
    image_findings: {
      type: String, // وصف الـ Vision AI للصورة
      default: null,
    },

    // ── نتيجة الـ AI ─────────────────────────────────────────────────────────
    ai_diagnosis: {
      type: String,
      trim: true,
      default: null,
    },
    confidence: {
      type: String,
      enum: ["عالية", "متوسطة", "منخفضة"],
      default: null,
    },
    severity: {
      type: String,
      enum: ["green", "yellow", "red"],
      default: null,
    },
    matched_symptoms: {
      type: [String],
      default: [],
    },
    suggested_actions: {
      type: [String],
      default: [],
    },
    vet_required: {
      type: Boolean,
      default: false,
    },
    vet_urgency: {
      type: String,
      default: null,
    },
    ai_raw_response: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false,
    },

    // ── المتابعة ─────────────────────────────────────────────────────────────
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

    // ── حالات تاريخية مُدخَلة عبر Onboarding Agent (مش تشخيص AI حالي) ──────────
    is_historical: {
      type: Boolean,
      default: false,
    },
    reported_date: {
      // التاريخ التقريبي اللي ذكره المزارع وقت onboarding، يختلف عن created_at
      // (وقت الإدخال الفعلي في النظام)
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
healthCaseSchema.index({ governorate: 1, created_at: -1 });
healthCaseSchema.index({ governorate: 1, ai_diagnosis: 1, created_at: -1 }); // أهم index للـ Outbreak
healthCaseSchema.index({ animal_id: 1, created_at: -1 });
healthCaseSchema.index({ user_id: 1, severity: 1, created_at: -1 });
healthCaseSchema.index({ resolved: 1, severity: 1 });

module.exports = mongoose.model("HealthCase", healthCaseSchema);