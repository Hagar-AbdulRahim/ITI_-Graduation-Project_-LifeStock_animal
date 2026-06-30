const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    animal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      default: null,
    },
    vaccination_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vaccination",
      default: null,
    },
    type: {
      type: String,
      enum: ["vaccination_reminder", "outbreak_alert", "health_case", "general"],
      default: "general",
    },
    title: { type: String, required: true },
    body:  { type: String, required: true },
    data:  { type: mongoose.Schema.Types.Mixed, default: {} },
    is_read: { type: Boolean, default: false },
    sent_via_fcm: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

notificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });

module.exports = mongoose.model("Notification", notificationSchema);