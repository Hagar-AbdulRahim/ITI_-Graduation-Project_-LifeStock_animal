const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    tag_number: {
      type: String,
      trim: true,
      default: null,
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
    birth_date: {
      type: Date,
      required: true,
      validate: {
        validator: (v) => v <= new Date(),
        message: "تاريخ الميلاد لا يمكن أن يكون في المستقبل",
      },
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

// ── Compound unique index: منع تكرار الاسم في نفس المزرعة ───────────────────
// لو الحاج عبد الله حاول يضيف "مبروكة" تانية في نفس المزرعة → MongoDB بيرفض
animalSchema.index({ farm_id: 1, name: 1 }, { unique: true });
animalSchema.index({ farm_id: 1, health_status: 1 }); // للـ Dashboard stats
animalSchema.index({ farm_id: 1, species: 1 });

// ── Virtual: عمر الحيوان بالأشهر ────────────────────────────────────────────
animalSchema.virtual("age_months").get(function () {
  if (!this.birth_date) return null;
  const diff = Date.now() - this.birth_date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
});

// ── Cascade: لو الحيوان اتحذف، احذف حالاته وتطعيماته ───────────────────────
animalSchema.pre("findOneAndDelete", async function (next) {
  const animal = await this.model.findOne(this.getQuery());
  if (animal) {
    await Promise.all([
      mongoose.model("HealthCase").deleteMany({ animal_id: animal._id }),
      mongoose.model("Vaccination").deleteMany({ animal_id: animal._id }),
    ]);
  }
  next();
});

module.exports = mongoose.model("Animal", animalSchema);