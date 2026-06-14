import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Loader2, Syringe } from 'lucide-react';
import { fetchAnimalById, addVaccination } from '../../redux/animalSlice';

// ─── Backend Vaccination Model ───────────────────────────────────────────────
// Required: vaccine_name, last_date (<= today), next_due_date (> last_date)
// Optional: dose_ml (> 0), administered_by, batch_number, notes
// ─────────────────────────────────────────────────────────────────────────────

const AddVaccinationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal, loading, error } = useSelector((state) => state.animal);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const lastDateValue = watch('last_date');

  useEffect(() => {
    if (id && (!animal || animal._id !== id)) {
      dispatch(fetchAnimalById(id));
    }
  }, [dispatch, id, animal]);

  const onSubmit = async (data) => {
    const payload = {
      vaccine_name:    data.vaccine_name.trim(),
      last_date:       data.last_date,
      next_due_date:   data.next_due_date,
      ...(data.dose_ml         && { dose_ml: Number(data.dose_ml) }),
      ...(data.administered_by && { administered_by: data.administered_by.trim() }),
      ...(data.batch_number    && { batch_number: data.batch_number.trim() }),
      ...(data.notes           && { notes: data.notes.trim() }),
    };

    try {
      await dispatch(addVaccination({ id, data: payload })).unwrap();
      navigate(`/animals/${id}`);
    } catch (err) {
      // Error handled via redux state
    }
  };

  const inputCls = (hasError) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all font-cairo bg-white
     ${hasError
      ? 'border-red-400 focus:ring-2 focus:ring-red-200'
      : 'border-gray-200 focus:ring-2 focus:ring-[#2a5c2a]/20 focus:border-[#2a5c2a]'}`;

  const labelCls = 'block text-[13px] font-bold text-gray-700 mb-2';

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
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-gray-900">إضافة سجل تطعيم</h1>
              <p className="text-[11px] text-gray-400 font-medium">إضافة تطعيم للحيوان: {animal?.name}</p>
            </div>
          </div>
          <span className="text-[12px] text-blue-600 font-medium bg-blue-50 border border-blue-100 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Syringe className="w-3.5 h-3.5" />
            تطعيم جديد
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {error?.saving && (
          <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
            {error.saving}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ── Section 1: Basic Info ──────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              بيانات التطعيم الأساسية <span className="text-red-400 text-[11px] font-medium mr-1">* مطلوب</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Vaccine Name */}
              <div className="md:col-span-2">
                <label className={labelCls}>اسم اللقاح / التطعيم <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  {...register('vaccine_name', { required: 'اسم التطعيم مطلوب', minLength: { value: 2, message: 'الاسم قصير جداً' }, maxLength: { value: 150, message: 'الاسم طويل جداً' } })}
                  placeholder="مثال: الجمرة الخبيثة، الحمى القلاعية..."
                  className={inputCls(errors.vaccine_name)}
                />
                {errors.vaccine_name && <p className="text-[11px] text-red-500 mt-1">{errors.vaccine_name.message}</p>}
              </div>

              {/* Last Date */}
              <div>
                <label className={labelCls}>تاريخ إعطاء الجرعة <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  {...register('last_date', { required: 'تاريخ إعطاء الجرعة مطلوب' })}
                  className={inputCls(errors.last_date)}
                />
                {errors.last_date && <p className="text-[11px] text-red-500 mt-1">{errors.last_date.message}</p>}
              </div>

              {/* Next Due Date */}
              <div>
                <label className={labelCls}>موعد الجرعة القادمة <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  min={lastDateValue ? new Date(new Date(lastDateValue).getTime() + 86400000).toISOString().split('T')[0] : undefined}
                  {...register('next_due_date', { required: 'تاريخ الجرعة القادمة مطلوب' })}
                  className={inputCls(errors.next_due_date)}
                />
                {errors.next_due_date && <p className="text-[11px] text-red-500 mt-1">{errors.next_due_date.message}</p>}
              </div>

            </div>
          </div>

          {/* ── Section 2: Details ─────────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">تفاصيل إضافية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              {/* Dose ML */}
              <div>
                <label className={labelCls}>حجم الجرعة (مل)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('dose_ml', { min: { value: 0.1, message: 'الجرعة يجب أن تكون أكبر من صفر' } })}
                  placeholder="مثال: 5"
                  className={inputCls(errors.dose_ml)}
                />
                {errors.dose_ml && <p className="text-[11px] text-red-500 mt-1">{errors.dose_ml.message}</p>}
              </div>

              {/* Batch Number */}
              <div>
                <label className={labelCls}>رقم التشغيلة (Batch Number)</label>
                <input
                  type="text"
                  {...register('batch_number')}
                  placeholder="مثال: BN-2024-X1"
                  className={inputCls(errors.batch_number)}
                />
              </div>

              {/* Administered By */}
              <div className="md:col-span-2">
                <label className={labelCls}>أُعطيت بواسطة (اسم الطبيب/المشرف)</label>
                <input
                  type="text"
                  {...register('administered_by', { maxLength: { value: 150, message: 'الاسم طويل جداً' } })}
                  placeholder="مثال: د. سارة جينكيز"
                  className={inputCls(errors.administered_by)}
                />
                {errors.administered_by && <p className="text-[11px] text-red-500 mt-1">{errors.administered_by.message}</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>ملاحظات</label>
              <textarea
                {...register('notes', { maxLength: { value: 500, message: 'الملاحظات طويلة جداً' } })}
                rows={3}
                placeholder="أي ملاحظات حول رد فعل الحيوان أو تعليمات خاصة..."
                className={`${inputCls(errors.notes)} resize-none`}
              />
              {errors.notes && <p className="text-[11px] text-red-500 mt-1">{errors.notes.message}</p>}
            </div>
          </div>

          {/* ── Action Buttons ────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading.saving}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-900/20 disabled:opacity-70"
            >
              {loading.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ السجل
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default AddVaccinationPage;
