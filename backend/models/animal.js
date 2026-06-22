const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    tag_number: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      required: true,
      enum: ["cattle", "sheep", "goat"],
    },
    breed: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },

    // ── العمر كقيمة + وحدة بدل تاريخ الميلاد ────────────────────────────────
    age_value: {
      type: Number,
      required: true,
      min: [0, "العمر لا يمكن أن يكون بالسالب"],
    },
    age_unit: {
      type: String,
      required: true,
      enum: ["months", "years"],
      default: "months",
    },

    weight_kg: {
      type: Number,
      min: [0.1, "الوزن يجب أن يكون أكبر من صفر"],
      default: null,
    },
    health_status: {
      type: String,
      enum: ["healthy", "sick", "critical", "deceased"],
      default: "healthy",
    },

    // ── صورة الحيوان ──────────────────────────────────────────────────────────
    image: {
      type: String, // مسار الصورة: /uploads/animals/filename.jpg
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// ── Compound unique index: منع تكرار رقم الوسم في نفس المزرعة فقط ──────────
// (نفس رقم الوسم ممكن يتكرر في مزرعة تانية بدون مشكلة)
animalSchema.index({ farm_id: 1, tag_number: 1 }, { unique: true });
animalSchema.index({ farm_id: 1, health_status: 1 });
animalSchema.index({ farm_id: 1, species: 1 });

// ── Virtual: عمر الحيوان بالشهور دايماً (للمقارنات الداخلية لو احتجناها) ───
animalSchema.virtual("age_in_months").get(function () {
  if (this.age_value == null) return null;
  return this.age_unit === "years" ? this.age_value * 12 : this.age_value;
});

// ── Cascade: لو الحيوان اتحذف، احذف حالاته وتطعيماته ───────────────────────
animalSchema.pre("findOneAndDelete", async function () {
  const animal = await this.model.findOne(this.getQuery());
  if (animal) {
    await Promise.all([
      mongoose.model("HealthCase").deleteMany({ animal_id: animal._id }),
      mongoose.model("Vaccination").deleteMany({ animal_id: animal._id }),
    ]);
  }
});

module.exports = mongoose.model("Animal", animalSchema);