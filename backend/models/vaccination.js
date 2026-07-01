// ════════════════════════════════════════════════════════════════════════════
// models/vaccination.js
// ════════════════════════════════════════════════════════════════════════════
const mongoose = require("mongoose");

const DEFAULT_BOOSTER_MONTHS = 12;

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

    vaccine_type: {
      type: String,
      enum: ["one_time", "recurring"],
      required: true,
      default: "recurring",
    },

    is_first_dose: {
      type: Boolean,
      default: false,
    },

    last_date: {
      type: Date,
      required: function () {
        return this.vaccine_type === "recurring" && !this.is_first_dose;
      },
      validate: {
        validator: function (v) {
          if (this.vaccine_type !== "recurring" || this.is_first_dose) return true;
          return v <= new Date();
        },
        message: "تاريخ آخر جرعة لا يمكن أن يكون في المستقبل",
      },
    },

    next_due_date: {
      type: Date,
      required: function () {
        return this.vaccine_type === "recurring";
      },
      validate: {
        validator: function (v) {
          if (this.vaccine_type !== "recurring" || !this.last_date) return true;
          return v > this.last_date;
        },
        message: "موعد الجرعة القادمة يجب أن يكون بعد تاريخ آخر جرعة",
      },
    },
    next_due_date_auto_calculated: {
      type: Boolean,
      default: false,
    },

    scheduled_date: {
      type: Date,
      required: function () {
        return this.vaccine_type === "one_time";
      },
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completed_at: {
      type: Date,
      default: null,
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

    added_by: {
      type: String,
      enum: ["user", "onboarding_agent"],
      default: "user",
    },

    reminder_sent: {
      type: Boolean,
      default: false,
    },
    reminder_sent_at: {
      type: Date,
      default: null,
    },
    day_of_reminder_sent: {
      type: Boolean,
      default: false,
    },
    day_of_reminder_sent_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

vaccinationSchema.virtual("reminder_date").get(function () {
  return this.vaccine_type === "one_time" ? this.scheduled_date : this.next_due_date;
});

vaccinationSchema.set("toJSON", { virtuals: true });
vaccinationSchema.set("toObject", { virtuals: true });

vaccinationSchema.pre("validate", function () {
  if (this.vaccine_type !== "recurring" || this.next_due_date) return;

  const baseDate = this.is_first_dose
    ? new Date()
    : this.last_date instanceof Date
      ? this.last_date
      : new Date(this.last_date);

  if (isNaN(baseDate?.getTime())) return;

  const calculatedDate = new Date(baseDate);
  calculatedDate.setMonth(calculatedDate.getMonth() + DEFAULT_BOOSTER_MONTHS);

  this.next_due_date = calculatedDate;
  this.next_due_date_auto_calculated = true;
});

vaccinationSchema.index({ next_due_date: 1, reminder_sent: 1 });
vaccinationSchema.index({ next_due_date: 1, day_of_reminder_sent: 1 });
vaccinationSchema.index({ scheduled_date: 1, reminder_sent: 1 });
vaccinationSchema.index({ scheduled_date: 1, day_of_reminder_sent: 1 });
vaccinationSchema.index({ animal_id: 1, next_due_date: 1 });
vaccinationSchema.index({ animal_id: 1, scheduled_date: 1 });

module.exports = mongoose.model("Vaccination", vaccinationSchema);