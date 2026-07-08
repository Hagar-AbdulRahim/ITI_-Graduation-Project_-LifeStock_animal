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
    vaccine_type: {
      type: String,
      enum: ["one_time", "recurring"],
      required: true,
      default: "recurring",
    },

    // ── تاريخ إعطاء الجرعة الفعلي ───────────────────────────────────────────
    administration_date: {
      type: Date,
      required: function () {
        return this.vaccine_type === "recurring";
      },
    },

    // ── فترة التكرار بالأشهر — للـ recurring فقط ────────────────────────────
    repeat_every_months: {
      type: Number,
      min: [1, "فترة التكرار يجب أن تكون أكبر من صفر"],
      default: null,
      required: function () {
        return this.vaccine_type === "recurring";
      },
    },

    // ── compatibility مع البيانات القديمة ────────────────────────────────────
    is_first_dose: { type: Boolean, default: false },
   

    next_due_date: {
      type: Date,
      required: function () {
        return this.vaccine_type === "recurring";
      },
    },
    next_due_date_auto_calculated: { type: Boolean, default: false },

    // ── للقاح لمرة واحدة ─────────────────────────────────────────────────────
    scheduled_date: {
      type: Date,
      required: function () {
        return this.vaccine_type === "one_time";
      },
    },

    // ── حالة الجرعة الحالية (مش اللقاح كله) ─────────────────────────────────
    completed:    { type: Boolean, default: false },
    completed_at: { type: Date, default: null },

    // ── إيقاف متابعة اللقاح نهائياً (بدون حذف) ──────────────────────────────
    is_active: { type: Boolean, default: true },

    dose_ml:         { type: Number, min: [0.1, "الجرعة يجب أن تكون أكبر من صفر"], default: null },
    administered_by: { type: String, trim: true, maxlength: 150, default: null },
    batch_number:    { type: String, trim: true, default: null },
    notes:           { type: String, trim: true, maxlength: 500, default: null },
    added_by:        { type: String, enum: ["user", "onboarding_agent"], default: "user" },

    reminder_sent:          { type: Boolean, default: false },
    reminder_sent_at:       { type: Date, default: null },
    day_of_reminder_sent:   { type: Boolean, default: false },
    day_of_reminder_sent_at:{ type: Date, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// ── حساب next_due_date تلقائياً عند الإنشاء ──────────────────────────────────
vaccinationSchema.pre("validate", function () {
  if (this.vaccine_type !== "recurring" || this.next_due_date) return;

  const baseDate = this.administration_date instanceof Date
    ? this.administration_date
    : new Date(this.administration_date);

  if (!baseDate || isNaN(baseDate.getTime())) return;
  if (!this.repeat_every_months) return;

  const calculatedDate = new Date(baseDate);
  calculatedDate.setMonth(calculatedDate.getMonth() + this.repeat_every_months);

  this.next_due_date = calculatedDate;
  this.next_due_date_auto_calculated = true;
});

// ── Virtual: تاريخ موحّد للتذكير ─────────────────────────────────────────────
vaccinationSchema.virtual("reminder_date").get(function () {
  return this.vaccine_type === "one_time" ? this.scheduled_date : this.next_due_date;
});

vaccinationSchema.set("toJSON", { virtuals: true });
vaccinationSchema.set("toObject", { virtuals: true });

vaccinationSchema.index({ next_due_date: 1, reminder_sent: 1 });
vaccinationSchema.index({ next_due_date: 1, day_of_reminder_sent: 1 });
vaccinationSchema.index({ scheduled_date: 1, reminder_sent: 1 });
vaccinationSchema.index({ scheduled_date: 1, day_of_reminder_sent: 1 });
vaccinationSchema.index({ animal_id: 1, next_due_date: 1 });
vaccinationSchema.index({ animal_id: 1, scheduled_date: 1 });
vaccinationSchema.index({ is_active: 1 });

module.exports = mongoose.model("Vaccination", vaccinationSchema);
