import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  ArrowRight, Save, X, Loader2, Info, Syringe, Calendar, CheckCircle2
} from 'lucide-react';
import bgImage from '../../assets/images/cows-field-bg.jpg';
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
    `w-full px-5 py-3.5 rounded-2xl text-[15px] bg-white border-2 outline-none transition-all font-cairo placeholder:text-gray-400 ` +
    (hasError
      ? 'border-red-300 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.15)] shadow-sm text-gray-900'
      : 'border-transparent focus:border-[#154b23] focus:shadow-[0_0_0_4px_rgba(21,75,35,0.1)] shadow-sm text-gray-900');
  const labelCls = 'text-[15px] font-bold text-[#154b23] flex items-center gap-1.5 mb-2 ml-1';

  if (loading.animal && !animal) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-cairo relative" dir="rtl">
      
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="fixed inset-0 z-0 bg-[#fbf9f6]/80 backdrop-blur-[2px]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ── Sticky Header ─────────────────────────────────────────── */}
      <div className="bg-[#1b4d2c] border-b border-[#154022] sticky top-0 z-20 shadow-md">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/animals/${id}`)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-white">تسجيل تطعيم جديد</h1>
              <p className="text-[11px] text-white/60 font-medium">
              إضافة تطعيم للحيوان:{' '}
              <span className="font-semibold text-white">
                #{animal?.tag_number || '...'}
              </span>
            </p>
            </div>
          </div>
          <span className="text-[12px] text-white font-bold bg-white/15 border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Syringe className="w-3.5 h-3.5 text-white" />
            تطعيم جديد
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div className="bg-[#f2f8f3] rounded-[32px] shadow-sm border border-[#154b23]/10 overflow-hidden">
            {/* Header Area */}
            <div className="relative bg-[#154b23] px-8 py-10 text-white">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                  <Syringe className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-[28px] font-bold mb-2">بيانات التطعيم</h2>
                  <p className="text-white/80 text-[15px] leading-relaxed">
                    أدخل تفاصيل التطعيم أو اللقاح للحفاظ على السجل الطبي لحيوانك بدقة.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10 space-y-10">
              
              {/* ── TYPE TOGGLE ──────────────────────────────────────── */}
              <div>
                <h2 className="text-[16px] font-bold text-[#1b4d2c] mb-4 pb-3 border-b border-[#154b23]/10 flex items-center gap-2">
                  <Syringe className="w-5 h-5" />
                  نوع التطعيم أو اللقاح
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setValue('vaccine_type', 'recurring')}
                    className={`py-5 px-4 rounded-2xl border-2 font-bold text-[16px] transition-all flex flex-col items-center justify-center gap-1.5 ${
                      vaccineType === 'recurring'
                        ? 'bg-[#1b4d2c] border-[#1b4d2c] text-white shadow-lg shadow-[#1b4d2c]/20'
                        : 'bg-white border-transparent text-gray-500 hover:bg-gray-50 shadow-sm'
                    }`}
                  >
                    <span>متكرر (دوري)</span>
                    <span className={`text-[12px] font-medium ${vaccineType === 'recurring' ? 'text-white/80' : 'text-gray-400'}`}>مثل لقاحات الحمى القلاعية، الجمرة الخبيثة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('vaccine_type', 'one_time')}
                    className={`py-5 px-4 rounded-2xl border-2 font-bold text-[16px] transition-all flex flex-col items-center justify-center gap-1.5 ${
                      vaccineType === 'one_time'
                        ? 'bg-[#1b4d2c] border-[#1b4d2c] text-white shadow-lg shadow-[#1b4d2c]/20'
                        : 'bg-white border-transparent text-gray-500 hover:bg-gray-50 shadow-sm'
                    }`}
                  >
                    <span>لمرة واحدة (طارئ)</span>
                    <span className={`text-[12px] font-medium ${vaccineType === 'one_time' ? 'text-white/80' : 'text-gray-400'}`}>مثل لقاحات الشراء أو الحالات الطارئة</span>
                  </button>
                </div>
              </div>

              {/* ── BASIC INFO ───────────────────────────────────────── */}
              <div className="space-y-6">
                <h2 className="text-[16px] font-bold text-[#1b4d2c] mb-2 pb-3 border-b border-[#154b23]/10 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
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
                  <span className="text-[12px] text-gray-500 block mt-1.5 flex items-center gap-1 font-medium">
                    <Info className="w-4 h-4 text-[#1b4d2c]" />
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
                    <p className="text-[12px] text-[#1b4d2c] mt-1.5 flex items-center gap-1 font-bold">
                      <Info className="w-4 h-4" />
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
                  <span className="text-[12px] text-gray-500 block mt-1.5 flex items-center gap-1 font-medium">
                    <Info className="w-4 h-4 text-[#1b4d2c]" />
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
          <div className="flex items-center justify-end gap-4 pt-4 mt-8 border-t border-[#154b23]/10">
            <button
              type="button"
              onClick={() => navigate(`/animals/${id}`)}
              className="px-8 py-3.5 rounded-2xl text-[15px] font-bold text-gray-600 hover:bg-white transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || !isValid}
              className={`flex items-center gap-2 px-10 py-3.5 text-white rounded-2xl text-[15px] font-bold transition-all shadow-sm ${
                isValid && !submitting
                  ? 'bg-[#154b23] hover:bg-[#0f3619] shadow-lg shadow-[#154b23]/30 active:scale-95'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
              }`}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              
              حفظ سجل التطعيم
            </button>
          </div>

            </div>
          </div>
        </form>
      </main>
      </div>
    </div>
  );
};

export default AddVaccinationPage;
