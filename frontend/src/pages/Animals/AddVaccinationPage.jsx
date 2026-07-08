import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Loader2, Syringe, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchAnimalById, addVaccination } from '../../redux/animalSlice';

// ── auto-fill فترة التكرار من اسم اللقاح ────────────────────────────────────
const VACCINE_INTERVALS = {
  'قلاعية': 6, 'fmd': 6, 'aphthovac': 6, 'servac': 6, 'aftovax': 6,
  'طاعون المجترات': 36, 'ppr': 36,
  'جدري': 12, 'pox': 12,
  'كلوستريديا': 12, 'clostridial': 12, 'cd&t': 12,
  'جمرة': 12, 'anthrax': 12,
  'جلد عقدي': 12, 'lumpy': 12, 'lsd': 12,
  'تسمم دموي': 12, 'septicemia': 12,
  'ليبتوسبيرا': 6, 'leptospira': 6, 'lepto': 6,
  'تنفسية': 12, 'brd': 12, 'ibr': 12,
};

const getIntervalFromName = (name) => {
  if (!name) return null;
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(VACCINE_INTERVALS)) {
    if (lower.includes(key)) return val;
  }
  return null;
};

const AddVaccinationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal, loading } = useSelector((state) => state.animal);
  const [submitting, setSubmitting] = useState(false);
  const [intervalHint, setIntervalHint] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      vaccine_type: 'recurring',
      vaccine_name: '',
      administration_date: '',
      repeat_every_months: '',
      scheduled_date: '',
      dose_ml: '',
      notes: '',
    },
  });

  const vaccineType = watch('vaccine_type');
  const vaccineName = watch('vaccine_name');

  useEffect(() => {
    if (id && (!animal || animal._id !== id)) dispatch(fetchAnimalById(id));
  }, [dispatch, id, animal]);

  useEffect(() => { trigger(); }, [vaccineType, trigger]);

  // auto-fill من اسم اللقاح
  useEffect(() => {
    if (vaccineType !== 'recurring' || !vaccineName) { setIntervalHint(null); return; }
    const interval = getIntervalFromName(vaccineName);
    if (interval) {
      setValue('repeat_every_months', interval);
      setIntervalHint(`تم تحديد الفترة تلقائياً: كل ${interval} شهر`);
    } else {
      setIntervalHint(null);
    }
  }, [vaccineName, vaccineType, setValue]);

  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getTomorrowString = () => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    const payload = {
      vaccine_name: data.vaccine_name.trim(),
      vaccine_type: data.vaccine_type,
    };
    if (data.vaccine_type === 'recurring') {
    payload.administration_date = data.administration_date;
    payload.repeat_every_months = Number(data.repeat_every_months);
    if (data.dose_ml) payload.dose_ml = Number(data.dose_ml);

    // ── تحديد الحالة تلقائيًا حسب التاريخ ────────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const enteredDate = new Date(data.administration_date);
    enteredDate.setHours(0, 0, 0, 0);

    payload.completed = enteredDate <= today; // ماضي/النهاردة → مكتمل، مستقبل → مجدول
  } else {
      payload.scheduled_date = data.scheduled_date;
      if (data.dose_ml) payload.dose_ml = Number(data.dose_ml);
    }
    if (data.notes?.trim()) payload.notes = data.notes.trim();

    try {
      const response = await dispatch(addVaccination({ id, data: payload })).unwrap();
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
     ${hasError
       ? 'border-red-400 focus:ring-2 focus:ring-red-200'
       : 'border-stone-200 focus:ring-2 focus:ring-[#2a5c2a]/20 focus:border-[#2a5c2a]'}`;
  const labelCls = 'block text-[13px] font-bold text-stone-700 mb-2';

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
              <h1 className="text-[17px] font-bold text-stone-900">تسجيل تطعيم جديد</h1>
              <p className="text-[11px] text-stone-400 font-medium">
              إضافة تطعيم للحيوان:{' '}
              <span className="font-semibold text-[#2a5c2a]">
                #{animal?.tag_number || '...'}
              </span>
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

          {/* ── TYPE TOGGLE ──────────────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-stone-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
              <Syringe className="w-4 h-4 text-[#2a5c2a]" />
              نوع التطعيم أو اللقاح
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('vaccine_type', 'recurring')}
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
                onClick={() => setValue('vaccine_type', 'one_time')}
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

          {/* ── BASIC INFO ───────────────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-stone-200 shadow-sm p-6 space-y-5">
            <h2 className="text-[14px] font-bold text-stone-900 mb-2 pb-3 border-b border-stone-100">
              تفاصيل التطعيم الأساسية
            </h2>

            {/* اسم اللقاح */}
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
                <p className="text-[11px] text-rose-500 mt-1">{errors.vaccine_name.message}</p>
              )}
            </div>

            {/* ── RECURRING FIELDS ─────────────────────────────── */}
            {vaccineType === 'recurring' && (
              <div className="space-y-5">

                {/* تاريخ إعطاء الجرعة */}
                <div>
                  <label className={labelCls}>
                    تاريخ إعطاء الجرعة <span className="text-rose-500">*</span>
                  </label>
                  <input
                  type="date"
                  {...register('administration_date', {
                    required: 'تاريخ إعطاء الجرعة مطلوب',
                  })}
                  className={inputCls(errors.administration_date)}
                />
                  {errors.administration_date && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.administration_date.message}</p>
                  )}
                  <span className="text-[11px] text-stone-400 block mt-1.5 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    موعد الجرعة القادمة سيُحسب تلقائياً من هذا التاريخ.
                  </span>
                </div>

                {/* فترة التكرار */}
                <div>
                  <label className={labelCls}>
                    يتكرر كل (أشهر) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="مثال: 6"
                    {...register('repeat_every_months', {
                      required: 'فترة التكرار مطلوبة',
                      min: { value: 1, message: 'الحد الأدنى شهر واحد' },
                      max: { value: 120, message: 'الحد الأقصى 120 شهر' },
                    })}
                    className={inputCls(errors.repeat_every_months)}
                  />
                  {errors.repeat_every_months && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.repeat_every_months.message}</p>
                  )}
                  {intervalHint && (
                    <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      {intervalHint}
                    </p>
                  )}
                </div>

                {/* حجم الجرعة */}
                <div>
                  <label className={labelCls}>حجم الجرعة بالملليلتر (اختياري)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="مثال: 2"
                    {...register('dose_ml', {
                      min: { value: 0.01, message: 'يجب أن يكون حجم الجرعة أكبر من صفر' },
                    })}
                    className={inputCls(errors.dose_ml)}
                  />
                  {errors.dose_ml && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.dose_ml.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── ONE TIME FIELDS ──────────────────────────────── */}
            {vaccineType === 'one_time' && (
              <div className="space-y-5">
                <div>
                  <label className={labelCls}>
                    تاريخ التطعيم المجدول (موعد مستقبلي) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={getTomorrowString()}
                    {...register('scheduled_date', {
                      required: 'تاريخ التطعيم المجدول مطلوب للقاحات لمرة واحدة',
                      validate: (val) => {
                        const selected = new Date(val);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        selected.setHours(0, 0, 0, 0);
                        return selected > today || 'يجب أن يكون تاريخ التطعيم في المستقبل (من الغد فصاعداً)';
                      },
                    })}
                    className={inputCls(errors.scheduled_date)}
                  />
                  {errors.scheduled_date && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.scheduled_date.message}</p>
                  )}
                  <span className="text-[11px] text-stone-400 block mt-1.5 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    يجب أن يكون التاريخ غداً أو تاريخ مستقبلي أبعد.
                  </span>
                </div>

                {/* حجم الجرعة */}
                <div>
                  <label className={labelCls}>حجم الجرعة بالملليلتر (اختياري)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="مثال: 2"
                    {...register('dose_ml', {
                      min: { value: 0.01, message: 'يجب أن يكون حجم الجرعة أكبر من صفر' },
                    })}
                    className={inputCls(errors.dose_ml)}
                  />
                  {errors.dose_ml && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.dose_ml.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* ملاحظات */}
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
                <p className="text-[11px] text-rose-500 mt-1">{errors.notes.message}</p>
              )}
            </div>
          </div>

          {/* ── ACTION BUTTONS ───────────────────────────────────── */}
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
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ سجل التطعيم
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default AddVaccinationPage;
