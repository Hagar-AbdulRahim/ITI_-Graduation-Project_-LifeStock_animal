const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    age_value: {
      type: Number,
      required: true,
      min: 0,
    },
    age_unit: {
      type: String,
      required: true,
      enum: ["months", "years"],
    },
    image: {
      type: String,
      default: null,
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

// ── Compound indexes ───────────────────
animalSchema.index({ farm_id: 1, health_status: 1 }); // للـ Dashboard stats
animalSchema.index({ farm_id: 1, species: 1 });

// ── Virtual: عمر الحيوان بالأشهر ────────────────────────────────────────────
animalSchema.virtual("age_months").get(function () {
  if (this.age_value === undefined) return null;
  return this.age_unit === "years" ? this.age_value * 12 : this.age_value;
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