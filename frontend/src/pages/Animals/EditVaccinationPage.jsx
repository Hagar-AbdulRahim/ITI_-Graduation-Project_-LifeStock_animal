import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Loader2, Syringe, Info, Check } from 'lucide-react';
import { fetchAnimalById, fetchAnimalVaccinations, editVaccination } from '../../redux/animalSlice';
import toast from 'react-hot-toast';

const EditVaccinationPage = () => {
  const { id, vacId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal, vaccinations, loading, error } = useSelector((state) => state.animal);
  
  // Find the specific vaccination
  const vaccination = vaccinations?.find(v => v._id === vacId);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger
  } = useForm({
    mode: 'onChange'
  });

  const lastDateValue = watch('last_date');
  const completedValue = watch('completed');

  // Load animal and vaccinations list if not loaded
  useEffect(() => {
    if (id && (!animal || animal._id !== id)) {
      dispatch(fetchAnimalById(id));
    }
    if (id && (!vaccinations || vaccinations.length === 0)) {
      dispatch(fetchAnimalVaccinations(id));
    }
  }, [dispatch, id, animal, vaccinations]);

  // Fill form values once vaccination data is ready
  useEffect(() => {
    if (vaccination) {
      setValue('vaccine_name', vaccination.vaccine_name || '');
      setValue('vaccine_type', vaccination.vaccine_type || 'recurring');
      setValue('is_first_dose', vaccination.is_first_dose);
      setValue('last_date', vaccination.last_date ? new Date(vaccination.last_date).toISOString().split('T')[0] : '');
      setValue('next_due_date', vaccination.next_due_date ? new Date(vaccination.next_due_date).toISOString().split('T')[0] : '');
      setValue('scheduled_date', vaccination.scheduled_date ? new Date(vaccination.scheduled_date).toISOString().split('T')[0] : '');
      setValue('dose_ml', vaccination.dose_ml || '');
      setValue('administered_by', vaccination.administered_by || '');
      setValue('batch_number', vaccination.batch_number || '');
      setValue('notes', vaccination.notes || '');
      setValue('completed', vaccination.completed || false);
      trigger();
    }
  }, [vaccination, setValue, trigger]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    const isOneTime = vaccination.vaccine_type === 'one_time';
    
    // Construct payload dynamically based on record type
    const payload = {
      vaccine_name: data.vaccine_name.trim(),
      notes: data.notes ? data.notes.trim() : null,
      dose_ml: data.dose_ml ? Number(data.dose_ml) : null,
      administered_by: data.administered_by ? data.administered_by.trim() : null,
      batch_number: data.batch_number ? data.batch_number.trim() : null,
      completed: data.completed
    };

    if (isOneTime) {
      payload.scheduled_date = data.scheduled_date;
    } else {
      payload.is_first_dose = vaccination.is_first_dose;
      if (!vaccination.is_first_dose) {
        payload.last_date = data.last_date;
      }
      // If next_due_date is modified from the original next_due_date
      const originalNext = vaccination.next_due_date ? new Date(vaccination.next_due_date).toISOString().split('T')[0] : '';
      if (data.next_due_date !== originalNext) {
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
    `w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all font-cairo bg-white
     ${
       hasError
         ? 'border-red-400 focus:ring-2 focus:ring-red-200'
         : 'border-stone-200 focus:ring-2 focus:ring-[#2a5c2a]/20 focus:border-[#2a5c2a]'
     }`;

  const labelCls = 'block text-[13px] font-bold text-stone-700 mb-2';

  // Limits
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

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
    <div className="min-h-screen bg-[#f5f7f5] font-cairo" dir="rtl">
      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/animals/${id}/vaccinations`)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-stone-50 text-stone-500 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-stone-900">تعديل سجل التطعيم</h1>
              <p className="text-[11px] text-stone-400 font-medium">
                الحيوان: <span className="font-semibold text-[#2a5c2a]">{animal?.name || animal?.tag_number || '...'}</span>
              </p>
            </div>
          </div>
          <span className="text-[12px] text-blue-700 font-bold bg-blue-50 border border-blue-100 px-3 py-1 rounded-full flex items-center gap-1.5 font-cairo">
            <Syringe className="w-3.5 h-3.5" />
            تعديل التطعيم
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Main Info */}
          <div className="bg-white rounded-[20px] border border-stone-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-[14px] font-bold text-stone-900">
                بيانات التطعيم الحالية
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                vaccination.vaccine_type === 'one_time' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-[#2a5c2a]'
              }`}>
                {vaccination.vaccine_type === 'one_time' ? 'لمرة واحدة (طارئ)' : 'متكرر (دوري)'}
              </span>
            </div>

            {/* Vaccine Name */}
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

            {/* If Recurring */}
            {vaccination.vaccine_type === 'recurring' && (
              <div className="space-y-5">
                {/* Last Date (Editable only if not first dose) */}
                {!vaccination.is_first_dose ? (
                  <div>
                    <label className={labelCls}>تاريخ آخر جرعة أخذها الحيوان <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      max={getTodayString()}
                      {...register('last_date', {
                        required: 'تاريخ آخر جرعة مطلوب'
                      })}
                      className={inputCls(errors.last_date)}
                    />
                    {errors.last_date && <p className="text-[11px] text-rose-500 mt-1">{errors.last_date.message}</p>}
                  </div>
                ) : (
                  <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100/50 text-xs text-[#2a5c2a] flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    <span>تم تسجيل هذا التطعيم كأول جرعة للحيوان (لا يوجد تاريخ جرعات سابقة).</span>
                  </div>
                )}

                {/* Next Due Date (Postpone / Edit) */}
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

            {/* If One-time */}
            {vaccination.vaccine_type === 'one_time' && (
              <div>
                <label className={labelCls}>تاريخ التطعيم المجدول <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  min={getTomorrowString()}
                  {...register('scheduled_date', {
                    required: 'تاريخ التطعيم المجدول مطلوب'
                  })}
                  className={inputCls(errors.scheduled_date)}
                />
                {errors.scheduled_date && <p className="text-[11px] text-rose-500 mt-1">{errors.scheduled_date.message}</p>}
              </div>
            )}
          </div>

          {/* Additional details */}
          <div className="bg-white rounded-[20px] border border-stone-200 shadow-sm p-6 space-y-5">
            <h2 className="text-[14px] font-bold text-stone-900 pb-3 border-b border-stone-100">
              تفاصيل إضافية وحالة الإتمام
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dose ML */}
              <div>
                <label className={labelCls}>حجم الجرعة (مل)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="مثال: 1.5"
                  {...register('dose_ml', {
                    min: { value: 0.01, message: 'يجب أن تكون الجرعة أكبر من صفر' }
                  })}
                  className={inputCls(errors.dose_ml)}
                />
                {errors.dose_ml && <p className="text-[11px] text-rose-500 mt-1">{errors.dose_ml.message}</p>}
              </div>

              {/* Batch Number */}
              <div>
                <label className={labelCls}>رقم التشغيلة (Batch Number)</label>
                <input
                  type="text"
                  placeholder="مثال: BN-2026-V8"
                  {...register('batch_number')}
                  className={inputCls(errors.batch_number)}
                />
              </div>

              {/* Administered By */}
              <div className="md:col-span-2">
                <label className={labelCls}>أعطيت بواسطة (اسم الطبيب/المشرف)</label>
                <input
                  type="text"
                  placeholder="مثال: د. أحمد خالد"
                  {...register('administered_by')}
                  className={inputCls(errors.administered_by)}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>ملاحظات</label>
              <textarea
                rows={3}
                placeholder="ملاحظات حول استجابة الحيوان، ردود الفعل أو الملاحظات البيطرية..."
                {...register('notes')}
                className={`${inputCls(errors.notes)} resize-none`}
              />
            </div>

            {/* Completed toggle */}
            {!vaccination.completed ? (
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-250 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-850 block">تأكيد إعطاء التطعيم للحيوان</span>
                  <span className="text-[11px] text-stone-400">قم بتفعيل الخيار لتسجيل إتمام الجرعة وتحديث حالتها لمكتمل.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('completed')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            ) : (
              <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 flex items-center gap-2 text-xs text-green-700 font-bold">
                <Check className="w-4 h-4 flex-shrink-0 text-green-650" />
                <span>هذا التطعيم مسجل كمكتمل بالفعل ولا يمكن إلغاء إتمامه من هنا.</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => navigate(`/animals/${id}/vaccinations`)}
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
              حفظ التغييرات
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default EditVaccinationPage;
