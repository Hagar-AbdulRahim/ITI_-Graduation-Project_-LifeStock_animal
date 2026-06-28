const mongoose = require("mongoose");

/**
 * سجل الاستشارات العامة — لما المزارع يستخدم الـ AI Agent بدون حيوان مسجل
 * مفيش ربط بـ Animal أو Farm، لكنها بتدخل في حسابات الـ Outbreak Detection
 * عبر governorate المأخوذة من بيانات المستخدم نفسه (User.governorate)
 */
const consultationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Denormalized من User.governorate وقت إنشاء الاستشارة ──────────────────
    // بتتاخد مرة واحدة عند الإنشاء — لو اليوزر غيّر محافظته بعدين، الاستشارات
    // القديمة تفضل مرتبطة بالمحافظة التي كانت وقت كتابتها (سجل تاريخي دقيق)
    governorate: {
      type: String,
      required: true,
      trim: true,
    },

    // ── بيانات الحيوان كنص حر — المزارع بيكتبها في سؤاله أو بنسألها ────────────
    species: {
      type: String,
      enum: ["cattle", "sheep", "goat", null],
      default: null,
    },

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

    // ── نتيجة الـ AI ──────────────────────────────────────────────────────────
    ai_diagnosis: { type: String, default: null },
    confidence:   { type: String, enum: ["عالية", "متوسطة", "منخفضة", null], default: null },
    severity:     { type: String, enum: ["green", "yellow", "red", null], default: null },
    matched_symptoms:  { type: [String], default: [] },
    suggested_actions: { type: [String], default: [] },
    vet_required: { type: Boolean, default: false },
    vet_urgency:  { type: String, default: null },

    ai_raw_response: {
      type: mongoose.Schema.Types.Mixed,
      select: false,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

consultationSchema.index({ user_id: 1, created_at: -1 });

// نفس index الـ HealthCase بالضبط — مطلوب لدمج الاثنين في Outbreak Aggregation
consultationSchema.index({ governorate: 1, ai_diagnosis: 1, created_at: -1 });

module.exports = mongoose.model("Consultation", consultationSchema);