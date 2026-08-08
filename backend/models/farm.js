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

farmSchema.index({ user_id: 1 });
farmSchema.index({ governorate: 1 });
farmSchema.index({ user_id: 1, name: 1, governorate: 1 }, { unique: true });

// لما المزرعة تتحذف، امسح حيواناتها وكل اللي مرتبط بيهم
farmSchema.pre("findOneAndDelete", async function () {
  const farm = await this.model.findOne(this.getQuery());
  if (farm) {
    const animals = await mongoose.model("Animal").find({ farm_id: farm._id });
    const animalIds = animals.map(a => a._id);

    if (animalIds.length > 0) {
      await Promise.all([
        mongoose.model("HealthCase").deleteMany({ animal_id: { $in: animalIds } }),
        mongoose.model("Vaccination").deleteMany({ animal_id: { $in: animalIds } }),
        mongoose.model("Notification").deleteMany({ animal_id: { $in: animalIds } }),
      ]);
    }
    await mongoose.model("Animal").deleteMany({ farm_id: farm._id });
  }
});

module.exports = mongoose.model("Farm", farmSchema);