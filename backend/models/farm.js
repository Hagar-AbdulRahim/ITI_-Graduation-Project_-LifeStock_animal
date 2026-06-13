const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    governorate: {
      type: String,
      required: true,
      trim: true,
    },
    // GeoJSON Point — مطلوب لـ $geoNear queries في الـ Outbreak Detection
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: ([lng, lat]) =>
            lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
          message: "إحداثيات GPS غير صحيحة",
        },
      },
    },
    total_animals: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
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

// ── Indexes ──────────────────────────────────────────────────────────────────
farmSchema.index({ location: "2dsphere" });  // مطلوب للـ GeoJSON queries
farmSchema.index({ user_id: 1 });
farmSchema.index({ governorate: 1 });        // للـ Outbreak filtering

// ── Cascade: لو المزرعة اتحذفت، احذف كل حيواناتها ──────────────────────────
farmSchema.pre(
  "findOneAndDelete",
  async function (next) {
    const farm = await this.model.findOne(this.getQuery());
    if (farm) {
      await mongoose.model("Animal").deleteMany({ farm_id: farm._id });
    }
    next();
  }
);

module.exports = mongoose.model("Farm", farmSchema);