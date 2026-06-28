const mongoose = require("mongoose");

// مدة التذكير التلقائي الموحّدة للقاحات الدورية — تُستخدم فقط لو المزارع
// لم يحدد next_due_date بنفسه عند إضافة لقاح من النوع "recurring"
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

    // ── نوع اللقاح يحدد إزاي نتعامل مع التواريخ ──────────────────────────────
    // one_time:  لقاح طارئ يُعطى مرة واحدة فقط — موعد مُجدَّل في المستقبل،
    //            بعد إعطائه تنتهي الدورة بالكامل ومفيش "جرعة قادمة" بعده
    // recurring: لقاح دوري يتكرر — له تاريخ آخر جرعة + موعد الجرعة القادمة
    vaccine_type: {
      type: String,
      enum: ["one_time", "recurring"],
      required: true,
      default: "recurring",
    },

    // ── حقول خاصة بـ "recurring" فقط ──────────────────────────────────────────
    last_date: {
      // تاريخ آخر جرعة فعلية أُخذت (مطلوب فقط لو recurring)
      type: Date,
      required: function () {
        return this.vaccine_type === "recurring";
      },
      validate: {
        validator: function (v) {
          if (this.vaccine_type !== "recurring") return true;
          return v <= new Date();
        },
        message: "تاريخ آخر جرعة لا يمكن أن يكون في المستقبل",
      },
    },
    next_due_date: {
      // موعد الجرعة القادمة المتوقعة (مطلوب فقط لو recurring)
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

    // ── حقول خاصة بـ "one_time" فقط ───────────────────────────────────────────
    scheduled_date: {
      // الموعد المُجدَّل لإعطاء اللقاح الطارئ في المستقبل (مطلوب فقط لو one_time)
      type: Date,
      required: function () {
        return this.vaccine_type === "one_time";
      },
    },
    completed: {
      // هل تم إعطاء اللقاح الطارئ فعلاً في موعده؟ — يخص one_time فقط
      type: Boolean,
      default: false,
    },
    completed_at: {
      type: Date,
      default: null,
    },

    // ── حقول مشتركة بين النوعين ────────────────────────────────────────────────
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

    // ── مصدر الإضافة — مين سجّل التطعيم ده ──────────────────────────────────────
    // مهم للفرونت عشان يميّز بصرياً بين اقتراح من الـ AI وإدخال يدوي من المزارع
    added_by: {
      type: String,
      enum: ["user", "onboarding_agent"],
      default: "user",
    },

    reminder_sent: {
      // إشعار "قبل الميعاد بيوم" — للنوعين معاً (next_due_date أو scheduled_date)
      type: Boolean,
      default: false,
    },
    reminder_sent_at: {
      type: Date,
      default: null,
    },
    day_of_reminder_sent: {
      // إشعار "يوم الميعاد نفسه" — مستقل عن reminder_sent تماماً
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

/**
 * الموعد الفعلي للتذكير، بغض النظر عن نوع اللقاح —
 * يُستخدم من الـ Cron Job بدل ما يفرّق بين next_due_date وscheduled_date
 * كل مرة، فيبقى عنده حقل واحد موحّد يستعلم عليه
 */
vaccinationSchema.virtual("reminder_date").get(function () {
  return this.vaccine_type === "one_time" ? this.scheduled_date : this.next_due_date;
});

vaccinationSchema.set("toJSON",   { virtuals: true });
vaccinationSchema.set("toObject", { virtuals: true });

// ── حساب next_due_date تلقائياً لو لم يُحدَّد يدوياً (recurring فقط) ───────────
vaccinationSchema.pre("validate", function () {
  if (this.vaccine_type === "recurring" && !this.next_due_date && this.last_date) {
    const lastDate =
      this.last_date instanceof Date ? this.last_date : new Date(this.last_date);

    if (isNaN(lastDate.getTime())) return;

    const calculatedDate = new Date(lastDate);
    calculatedDate.setMonth(calculatedDate.getMonth() + DEFAULT_BOOSTER_MONTHS);

    this.next_due_date                 = calculatedDate;
    this.next_due_date_auto_calculated = true;
  }
});

vaccinationSchema.index({ next_due_date: 1, reminder_sent: 1 });
vaccinationSchema.index({ next_due_date: 1, day_of_reminder_sent: 1 });
vaccinationSchema.index({ scheduled_date: 1, reminder_sent: 1 });
vaccinationSchema.index({ scheduled_date: 1, day_of_reminder_sent: 1 });
vaccinationSchema.index({ animal_id: 1, next_due_date: 1 });
vaccinationSchema.index({ animal_id: 1, scheduled_date: 1 });

module.exports = mongoose.model("Vaccination", vaccinationSchema);