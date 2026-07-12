import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Loader2, Syringe, Info, Check, Settings } from 'lucide-react';
import { fetchAnimalById, fetchAnimalVaccinations, editVaccination } from '../../redux/animalSlice';
import toast from 'react-hot-toast';
import bgImage from '../../assets/images/cows-field-bg.jpg';

const EditVaccinationPage = () => {
  const { id, vacId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal, vaccinations, loading } = useSelector((state) => state.animal);
  const vaccination = vaccinations?.find((v) => v._id === vacId);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = useForm({ mode: 'onChange' });

  const completedValue = watch('completed');

  useEffect(() => {
    if (id && (!animal || animal._id !== id)) dispatch(fetchAnimalById(id));
    if (id && (!vaccinations || vaccinations.length === 0)) dispatch(fetchAnimalVaccinations(id));
  }, [dispatch, id, animal, vaccinations]);

  useEffect(() => {
    if (vaccination) {
      setValue('vaccine_name', vaccination.vaccine_name || '');
      setValue('administration_date', vaccination.administration_date
        ? new Date(vaccination.administration_date).toISOString().split('T')[0] : '');
      setValue('repeat_every_months', vaccination.repeat_every_months || '');
      setValue('next_due_date', vaccination.next_due_date
        ? new Date(vaccination.next_due_date).toISOString().split('T')[0] : '');
      setValue('scheduled_date', vaccination.scheduled_date
        ? new Date(vaccination.scheduled_date).toISOString().split('T')[0] : '');
      setValue('dose_ml', vaccination.dose_ml || '');
      setValue('notes', vaccination.notes || '');
      setValue('completed', vaccination.completed || false);
      trigger();
    }
  }, [vaccination, setValue, trigger]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    const isOneTime = vaccination.vaccine_type === 'one_time';

    const payload = {
      vaccine_name: data.vaccine_name.trim(),
      notes: data.notes ? data.notes.trim() : null,
      dose_ml: data.dose_ml ? Number(data.dose_ml) : null,
      completed: data.completed,
    };

    if (isOneTime) {
      payload.scheduled_date = data.scheduled_date;
    } else {
      if (data.administration_date) payload.administration_date = data.administration_date;
      if (data.repeat_every_months) payload.repeat_every_months = Number(data.repeat_every_months);
      // لو next_due_date اتغير يدوياً نبعته، والباك إند هيحترمه ومش هيعيد حسابه
      const originalNext = vaccination.next_due_date
        ? new Date(vaccination.next_due_date).toISOString().split('T')[0] : '';
      if (data.next_due_date && data.next_due_date !== originalNext) {
        payload.next_due_date = data.next_due_date;
      }
    }

    try {
      await dispatch(editVaccination({ vacId, data: payload })).unwrap();
      toast.success('تم تحديث سجل التطعيم بنجاح');
      navigate(`/animals/${id}/vaccinations`);
    } catch (err) {
      toast.error(err || 'حدث خطأ أثناء تعديل التطعيم');
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

  const getTomorrowString = () => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const getTodayString = () => new Date().toISOString().split('T')[0];

  if (loading.animal || (loading.vaccinations && !vaccination)) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin" />
      </div>
    );
  }

  if (!vaccination) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex flex-col items-center justify-center font-cairo">
        <p className="text-stone-500 font-bold mb-4">سجل التطعيم غير موجود أو تم حذفه</p>
        <button
          onClick={() => navigate(`/animals/${id}/vaccinations`)}
          className="px-4 py-2 bg-[#2a5c2a] text-white rounded-xl text-xs font-bold"
        >
          العودة لقائمة التطعيمات
        </button>
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
                onClick={() => navigate(`/animals/${id}/vaccinations`)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-[17px] font-bold text-white">تعديل سجل التطعيم</h1>
                <p className="text-[11px] text-white/60 font-medium">
                  الحيوان: <span className="text-white">#{animal?.tag_number || '...'}</span>
                </p>
              </div>
            </div>
            <span className="text-[12px] text-white font-bold bg-white/15 border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-cairo">
              <Syringe className="w-3.5 h-3.5 text-white" />
              تعديل التطعيم
            </span>
          </div>
        </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ── Unified Unified Card ──────────────────────────────── */}
          <div className="bg-[#f2f8f3] rounded-[32px] shadow-sm border border-[#154b23]/10 overflow-hidden">
            {/* Header Area */}
            <div className="relative bg-[#154b23] px-8 py-10 text-white">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                  <Settings className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-[28px] font-bold mb-2">تحديث السجل الطبي</h2>
                  <p className="text-white/80 text-[15px] leading-relaxed">
                    قم بتعديل بيانات سجل التطعيم للحيوان بدقة، أو سجل إتمامه.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10 space-y-10">

              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#154b23]/10">
                  <h2 className="text-[16px] font-bold text-[#1b4d2c]">بيانات التطعيم الحالية</h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    vaccination.vaccine_type === 'one_time'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-[#1b4d2c]/10 text-[#1b4d2c]'
                  }`}>
                    {vaccination.vaccine_type === 'one_time' ? 'لمرة واحدة (طارئ)' : 'متكرر (دوري)'}
                  </span>
                </div>

            {/* اسم اللقاح */}
            <div>
              <label className={labelCls}>اسم اللقاح / التطعيم <span className="text-rose-500">*</span></label>
              <input
                type="text"
                {...register('vaccine_name', { required: 'اسم التطعيم مطلوب' })}
                placeholder="مثال: الجمرة الخبيثة..."
                className={inputCls(errors.vaccine_name)}
              />
              {errors.vaccine_name && <p className="text-[11px] text-rose-500 mt-1">{errors.vaccine_name.message}</p>}
            </div>

            {/* ── Recurring fields ──────────────────────────────── */}
            {vaccination.vaccine_type === 'recurring' && (
              <div className="space-y-5">

                {/* تاريخ إعطاء الجرعة */}
                <div>
                  <label className={labelCls}>تاريخ إعطاء الجرعة</label>
                  <input
                    type="date"
                    max={getTodayString()}
                    {...register('administration_date')}
                    className={inputCls(errors.administration_date)}
                  />
                  <span className="text-[11px] text-stone-400 block mt-1.5 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    لو غيّرته، هيُعاد حساب الجرعة القادمة تلقائياً.
                  </span>
                </div>

                {/* فترة التكرار */}
                <div>
                  <label className={labelCls}>يتكرر كل (أشهر)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="مثال: 6"
                    {...register('repeat_every_months', {
                      min: { value: 1, message: 'الحد الأدنى شهر' },
                      max: { value: 120, message: 'الحد الأقصى 120 شهر' },
                    })}
                    className={inputCls(errors.repeat_every_months)}
                  />
                  {errors.repeat_every_months && <p className="text-[11px] text-rose-500 mt-1">{errors.repeat_every_months.message}</p>}
                </div>

                {/* Next Due Date — تأجيل يدوي */}
                <div>
                  <label className={labelCls}>موعد الجرعة القادمة المستحقة</label>
                  <input
                    type="date"
                    {...register('next_due_date')}
                    className={inputCls(errors.next_due_date)}
                  />
                  <span className="text-[11px] text-stone-400 block mt-1.5">
                    يمكنك تعديل هذا الموعد يدوياً لتأجيل الجرعة القادمة.
                  </span>
                </div>
              </div>
            )}

            {/* ── One-time fields ───────────────────────────────── */}
            {vaccination.vaccine_type === 'one_time' && (
              <div>
                <label className={labelCls}>تاريخ التطعيم المجدول <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  min={getTomorrowString()}
                  {...register('scheduled_date', { required: 'تاريخ التطعيم المجدول مطلوب' })}
                  className={inputCls(errors.scheduled_date)}
                />
                {errors.scheduled_date && <p className="text-[11px] text-rose-500 mt-1">{errors.scheduled_date.message}</p>}
              </div>
            )}
              </div>

              {/* ── Additional Details ───────────────────────────────── */}
              <div className="space-y-6">
                <h2 className="text-[16px] font-bold text-[#1b4d2c] pb-3 border-b border-[#154b23]/10">
                  تفاصيل إضافية وحالة الإتمام
                </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* حجم الجرعة */}
              <div>
                <label className={labelCls}>حجم الجرعة (مل)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="مثال: 1.5"
                  {...register('dose_ml', {
                    min: { value: 0.01, message: 'يجب أن تكون الجرعة أكبر من صفر' },
                  })}
                  className={inputCls(errors.dose_ml)}
                />
                {errors.dose_ml && <p className="text-[11px] text-rose-500 mt-1">{errors.dose_ml.message}</p>}
              </div>
            </div>

            {/* ملاحظات */}
            <div>
              <label className={labelCls}>ملاحظات</label>
              <textarea
                rows={3}
                placeholder="ملاحظات حول استجابة الحيوان، ردود الفعل أو الملاحظات البيطرية..."
                {...register('notes')}
                className={`${inputCls(errors.notes)} resize-none`}
              />
            </div>

                {/* completed toggle */}
                {!vaccination.completed ? (
                  <div className="bg-white rounded-[20px] p-5 border-2 border-transparent hover:border-[#154b23]/10 transition-colors flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[14px] font-bold text-gray-900 block mb-1">تأكيد إعطاء التطعيم للحيوان</span>
                      <span className="text-[12px] text-gray-500">قم بتفعيل الخيار لتسجيل إتمام الجرعة وتحديث حالتها لمكتمل.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" {...register('completed')} className="sr-only peer" />
                      <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#154b23]"></div>
                    </label>
                  </div>
                ) : (
                  <div className="bg-green-50/50 p-4 rounded-[20px] border border-green-100 flex items-center gap-2 text-[13px] text-green-700 font-bold">
                    <Check className="w-5 h-5 flex-shrink-0 text-green-600" />
                    <span>هذا التطعيم مسجل كمكتمل بالفعل ولا يمكن إلغاء إتمامه من هنا.</span>
                  </div>
                )}
              </div>

              {/* ── Action Buttons ───────────────────────────────────── */}
              <div className="flex items-center justify-end gap-4 pt-4 mt-8 border-t border-[#154b23]/10">
                <button
                  type="button"
                  onClick={() => navigate(`/animals/${id}/vaccinations`)}
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
                  
                  حفظ التغييرات
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

export default EditVaccinationPage;
