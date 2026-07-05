import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Loader2, Syringe, Info, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchAnimalById, addVaccination } from '../../redux/animalSlice';

const AddVaccinationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal, loading, error } = useSelector((state) => state.animal);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      vaccine_type: 'recurring',
      is_first_dose: true,
      vaccine_name: '',
      last_date: '',
      scheduled_date: '',
      dose_ml: '',
      next_due_date: '',
      notes: ''
    }
  });

  const vaccineType = watch('vaccine_type');
  const isFirstDose = watch('is_first_dose');
  const lastDate = watch('last_date');
  const nextDueDate = watch('next_due_date');

  useEffect(() => {
    if (id && (!animal || animal._id !== id)) {
      dispatch(fetchAnimalById(id));
    }
  }, [dispatch, id, animal]);

  // When vaccine type changes, reset irrelevant validations
  useEffect(() => {
    trigger();
  }, [vaccineType, isFirstDose, trigger]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    
    // Construct payload strictly based on form values & types
    const payload = {
      vaccine_name: data.vaccine_name.trim(),
      vaccine_type: data.vaccine_type,
    };

    if (data.vaccine_type === 'recurring') {
      payload.is_first_dose = data.is_first_dose === true || data.is_first_dose === 'true';
      if (!payload.is_first_dose) {
        payload.last_date = data.last_date;
      }
      if (data.dose_ml) {
        payload.dose_ml = Number(data.dose_ml);
      }
      // إرسال next_due_date بس لو المستخدم اختار قيمة فعلاً
      if (data.next_due_date && data.next_due_date.trim()) {
        payload.next_due_date = data.next_due_date;
      }
    } else {
      payload.scheduled_date = data.scheduled_date;
    }

    if (data.notes && data.notes.trim()) {
      payload.notes = data.notes.trim();
    }

    try {
      const response = await dispatch(addVaccination({ id, data: payload })).unwrap();
      // Use the message returned from API response
      toast.success(response.message || 'تم تسجيل التطعيم بنجاح');
      navigate(`/animals/${id}/vaccinations`);
    } catch (err) {
      toast.error(err || 'فشل في إضافة التطعيم');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (hasError) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all font-cairo bg-white
     ${
       hasError
         ? 'border-red-400 focus:ring-2 focus:ring-red-200'
         : 'border-stone-200 focus:ring-2 focus:ring-[#2a5c2a]/20 focus:border-[#2a5c2a]'
     }`;

  const labelCls = 'block text-[13px] font-bold text-stone-700 mb-2';

  // Get tomorrow's date for scheduled_date minimum limit (must be future date, disabled today or past)
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get today's date for last_date maximum limit (must be today or past, no future)
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (loading.animal && !animal) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5] font-cairo" dir="rtl">
      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/animals/${id}`)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-stone-50 text-stone-500 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-stone-900">
                تسجيل تطعيم جديد
              </h1>
              <p className="text-[11px] text-stone-400 font-medium">
                إضافة تطعيم للحيوان: <span className="font-semibold text-[#2a5c2a]">#{animal?.tag_number || '...'}</span>
              </p>
            </div>
          </div>
          <span className="text-[12px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Syringe className="w-3.5 h-3.5 text-[#2a5c2a]" />
            تطعيم جديد
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* ── TYPE TOGGLE SECTION ──────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-stone-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
              <Syringe className="w-4 h-4 text-[#2a5c2a]" />
              نوع التطعيم أو اللقاح
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setValue('vaccine_type', 'recurring');
                }}
                className={`py-3.5 px-4 rounded-xl border font-bold text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                  vaccineType === 'recurring'
                    ? 'bg-emerald-50 border-[#2a5c2a] text-[#2a5c2a] shadow-xs'
                    : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                }`}
              >
                <span>متكرر (دوري)</span>
                <span className="text-[10px] font-medium opacity-80">مثل لقاحات الحمى القلاعية، الجمرة الخبيثة</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setValue('vaccine_type', 'one_time');
                }}
                className={`py-3.5 px-4 rounded-xl border font-bold text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                  vaccineType === 'one_time'
                    ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                }`}
              >
                <span>لمرة واحدة (طارئ)</span>
                <span className="text-[10px] font-medium opacity-80">مثل لقاحات الشراء أو الحالات الطارئة</span>
              </button>
            </div>
          </div>

          {/* ── BASIC INFO SECTION ──────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-stone-200 shadow-sm p-6 space-y-5">
            <h2 className="text-[14px] font-bold text-stone-900 mb-2 pb-3 border-b border-stone-100">
              تفاصيل التطعيم الأساسية
            </h2>
            
            {/* Vaccine Name */}
            <div>
              <label className={labelCls}>
                اسم اللقاح / التطعيم <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('vaccine_name', {
                  required: 'اسم التطعيم مطلوب',
                  minLength: { value: 2, message: 'الاسم قصير جداً' },
                  maxLength: { value: 150, message: 'الاسم طويل جداً' },
                })}
                placeholder="مثال: لقاح الحمى القلاعية، لقاح الجدري..."
                className={inputCls(errors.vaccine_name)}
              />
              {errors.vaccine_name && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.vaccine_name.message}
                </p>
              )}
            </div>

            {/* DYNAMIC FIELDS: RECURRING */}
            {vaccineType === 'recurring' && (
              <div className="space-y-5">
                {/* First Dose Question */}
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-150">
                  <label className="block text-xs font-bold text-stone-700 mb-3">
                    هل هذا التطعيم أول مرة يأخذه الحيوان؟
                  </label>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setValue('is_first_dose', true)}
                      className={`flex-1 py-2 px-4 rounded-lg border text-xs font-bold transition-all ${
                        isFirstDose === true
                          ? 'bg-white border-[#2a5c2a] text-[#2a5c2a] shadow-xs'
                          : 'bg-stone-100/50 border-stone-200 text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      نعم، أول مرة
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setValue('is_first_dose', false)}
                      className={`flex-1 py-2 px-4 rounded-lg border text-xs font-bold transition-all ${
                        isFirstDose === false
                          ? 'bg-white border-[#2a5c2a] text-[#2a5c2a] shadow-xs'
                          : 'bg-stone-100/50 border-stone-200 text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      لا، أخذ جرعات سابقة
                    </button>
                  </div>
                </div>

                {/* Last Date Field - Show ONLY if not first dose */}
                {!isFirstDose && (
                  <div>
                    <label className={labelCls}>
                      تاريخ آخر جرعة أخذها الحيوان <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      max={getTodayString()} // Today or past only
                      {...register('last_date', {
                        required: {
                          value: vaccineType === 'recurring' && !isFirstDose,
                          message: 'تاريخ آخر جرعة مطلوب عند عدم تفعيل أول جرعة'
                        },
                        validate: (val) => {
                          if (vaccineType === 'recurring' && !isFirstDose) {
                            if (!val) return 'تاريخ آخر جرعة مطلوب';
                            if (new Date(val) > new Date()) return 'لا يمكن اختيار تاريخ مستقبلي لآخر جرعة';
                          }
                          return true;
                        }
                      })}
                      className={inputCls(errors.last_date)}
                    />
                    {errors.last_date && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {errors.last_date.message}
                      </p>
                    )}
                    <span className="text-[11px] text-stone-400 block mt-1.5 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      موعد الجرعة القادمة سيتم حسابه تلقائياً بناءً على هذا التاريخ.
                    </span>
                  </div>
                )}

                {/* Dose ML */}
                <div>
                  <label className={labelCls}>حجم الجرعة بالملليلتر (اختياري)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="مثال: 2"
                    {...register('dose_ml', {
                      min: {
                        value: 0.01,
                        message: 'يجب أن يكون حجم الجرعة أكبر من صفر'
                      }
                    })}
                    className={inputCls(errors.dose_ml)}
                  />
                  {errors.dose_ml && (
                    <p className="text-[11px] text-rose-500 mt-1">
                      {errors.dose_ml.message}
                    </p>
                  )}
                </div>

                {/* Next Due Date - Optional, shown for all recurring regardless of is_first_dose */}
                <div>
                  <label className={labelCls}>
                    موعد الجرعة القادمة
                    <span className="text-stone-400 font-normal text-[11px] mr-1">(اختياري)</span>
                  </label>
                  <input
                    type="date"
                    {...register('next_due_date', {
                      validate: (val) => {
                        if (!val || !val.trim()) return true; // اختياري، لو فاضي مفيش مشكلة
                        const selected = new Date(val);
                        selected.setHours(0, 0, 0, 0);
                        if (isFirstDose) {
                          // أول جرعة: لازم يكون بعد النهارده
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (selected <= today) {
                            return 'موعد الجرعة القادمة يجب أن يكون بعد اليوم';
                          }
                        } else {
                          // مش أول جرعة: لازم يكون بعد last_date
                          if (!lastDate) return true; // لو last_date فاضية، السيرفر هيتحقق
                          const last = new Date(lastDate);
                          last.setHours(0, 0, 0, 0);
                          if (selected <= last) {
                            return 'موعد الجرعة القادمة يجب أن يكون بعد تاريخ آخر جرعة';
                          }
                        }
                        return true;
                      }
                    })}
                    className={inputCls(errors.next_due_date)}
                  />
                  {errors.next_due_date && (
                    <p className="text-[11px] text-rose-500 mt-1">
                      {errors.next_due_date.message}
                    </p>
                  )}
                  <span className="text-[11px] text-stone-400 block mt-1.5 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    لو سبتيه فاضي، هيتحدد تلقائياً بعد 12 شهر من تاريخ آخر جرعة
                  </span>
                </div>

                {isFirstDose && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 text-xs text-[#2a5c2a] leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      بما أنها الجرعة الأولى للحيوان، سيقوم النظام تلقائياً بتحديد موعد الجرعة القادمة الموصى بها وحساب الفترة المناسبة للتطعيم التنشيطي — إلا لو اخترتِ موعداً يدوياً بالأعلى.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* DYNAMIC FIELDS: ONE_TIME */}
            {vaccineType === 'one_time' && (
              <div>
                <label className={labelCls}>
                  تاريخ التطعيم المجدول (موعد مستقبلي) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  min={getTomorrowString()} // Tomorrow or later
                  {...register('scheduled_date', {
                    required: {
                      value: vaccineType === 'one_time',
                      message: 'تاريخ التطعيم المجدول مطلوب للقاحات لمرة واحدة'
                    },
                    validate: (val) => {
                      if (vaccineType === 'one_time') {
                        if (!val) return 'تاريخ التطعيم مطلوب';
                        const selected = new Date(val);
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        selected.setHours(0,0,0,0);
                        if (selected <= today) {
                          return 'يجب أن يكون تاريخ التطعيم في المستقبل (من الغد فصاعداً)';
                        }
                      }
                      return true;
                    }
                  })}
                  className={inputCls(errors.scheduled_date)}
                />
                {errors.scheduled_date && (
                  <p className="text-[11px] text-rose-500 mt-1">
                    {errors.scheduled_date.message}
                  </p>
                )}
                <span className="text-[11px] text-stone-400 block mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  يجب أن يكون التاريخ غداً أو تاريخ مستقبلي أبعد.
                </span>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className={labelCls}>ملاحظات إضافية (اختياري)</label>
              <textarea
                rows={3}
                placeholder="أدخل أي ملاحظات حول التطعيم أو الإرشادات الخاصة..."
                {...register('notes', {
                  maxLength: { value: 500, message: 'الملاحظات طويلة جداً' },
                })}
                className={`${inputCls(errors.notes)} resize-none`}
              />
              {errors.notes && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.notes.message}
                </p>
              )}
            </div>
          </div>

          {/* ── ACTION BUTTONS ────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => navigate(`/animals/${id}`)}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <X className="w-4 h-4" />
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || !isValid}
              className={`flex items-center gap-2 px-8 py-2.5 text-white rounded-xl text-sm font-bold transition-all shadow-sm ${
                isValid && !submitting
                  ? 'bg-[#2a5c2a] hover:bg-[#1f451f] shadow-emerald-950/20'
                  : 'bg-stone-300 cursor-not-allowed text-stone-500 shadow-none'
              }`}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              حفظ سجل التطعيم
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default AddVaccinationPage;
