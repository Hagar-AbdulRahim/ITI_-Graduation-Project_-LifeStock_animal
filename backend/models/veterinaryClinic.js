const mongoose = require("mongoose");

const veterinaryClinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    governorate: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: null,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    opening_hours: {
      type: String,
      default: null,
      trim: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
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

veterinaryClinicSchema.index({ governorate: 1, is_active: 1 });

module.exports = mongoose.model("VeterinaryClinic", veterinaryClinicSchema);
