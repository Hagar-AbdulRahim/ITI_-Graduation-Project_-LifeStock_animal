const mongoose = require("mongoose");

const outbreakReportSchema = new mongoose.Schema(
  {
    disease_name: {
      type: String,
      required: true,
      trim: true,
    },
    governorate: {
      type: String,
      required: true,
      trim: true,
    },
    cases_count: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
    },
    ai_warning_message: {
      type: String,
      default: null,
    },
    detected_at: {
      type: Date,
      default: Date.now,
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

outbreakReportSchema.index({ governorate: 1, status: 1 });
outbreakReportSchema.index({ disease_name: 1, governorate: 1, detected_at: -1 });

module.exports = mongoose.model("OutbreakReport", outbreakReportSchema);