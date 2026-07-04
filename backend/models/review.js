const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "التقييم يجب أن يكون على الأقل 1"],
      max: [5, "التقييم يجب ألا يتجاوز 5"],
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "التعليق يجب ألا يتجاوز 500 حرف"],
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });

module.exports = mongoose.model("Review", reviewSchema);
