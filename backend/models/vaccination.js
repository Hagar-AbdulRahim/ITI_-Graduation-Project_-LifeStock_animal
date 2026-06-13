const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema(
  {
    animal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true,
    },
    vaccine_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    last_date: {
      type: Date,
      required: true,
      validate: {
        validator: (v) => v <= new Date(),
        message: "تاريخ التطعيم لا يمكن أن يكون في المستقبل",
      },
    },
    next_due_date: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v > this.last_date;
        },
        message: "موعد الجرعة القادمة يجب أن يكون بعد تاريخ آخر جرعة",
      },
    },
    dose_ml: {
      type: Number,
      min: [0.1, "الجرعة يجب أن تكون أكبر من صفر"],
      default: null,
    },
    administered_by: {
      type: String,
      trim: true,
      maxlength: 150,
      default: null,
    },
    batch_number: {
      type: String,
      trim: true,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    // الـ Cron Job بيشوف الـ false ويبعت إشعار، وبعدين يحولها true عشان ميكررش
    reminder_sent: {
      type: Boolean,
      default: false,
    },
    reminder_sent_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// الأهم: الـ Cron Job كل يوم بيعمل هذا الـ query بالظبط
// "جيب كل التطعيمات اللي next_due_date جوه 7 أيام ولسه reminder_sent = false"
vaccinationSchema.index({ next_due_date: 1, reminder_sent: 1 });

// للـ Animal Profile
vaccinationSchema.index({ animal_id: 1, next_due_date: 1 });

module.exports = mongoose.model("Vaccination", vaccinationSchema);