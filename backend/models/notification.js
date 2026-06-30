const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    body: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      default: 'general',
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    animal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      default: null,
    },
    vaccination_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vaccination',
      default: null,
    },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    sent_via_fcm: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

notificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
