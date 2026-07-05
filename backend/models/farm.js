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

farmSchema.pre("findOneAndDelete", async function () {
  const farm = await this.model.findOne(this.getQuery());
  if (farm) {
    await mongoose.model("Animal").deleteMany({ farm_id: farm._id });
  }
});

module.exports = mongoose.model("Farm", farmSchema);