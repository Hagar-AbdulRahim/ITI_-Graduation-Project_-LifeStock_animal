import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Loader2, Edit3, Settings } from 'lucide-react';
import { fetchAnimalById, updateExistingAnimal } from '../../redux/animalSlice';
import bgImage from '../../assets/images/cows-field-bg.jpg';

// ─── Backend Animal Model ─────────────────────────────────────────────────────
// ["weight_kg", "health_status", "notes", "breed", "tag_number", "gender", "age_value", "age_unit", "image"]
// species and farm_id are not in allowedFields for update in the backend!
// ─────────────────────────────────────────────────────────────────────────────

const EditAnimalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal, loading, error } = useSelector((state) => state.animal);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  useEffect(() => {
    if (id) {
      dispatch(fetchAnimalById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (animal) {
      reset({
        gender: animal.gender || 'female',
        age_value: animal.age_value || '',
        age_unit: animal.age_unit || 'months',
        tag_number: animal.tag_number || '',
        breed: animal.breed || '',
        weight_kg: animal.weight_kg || '',
        health_status: animal.health_status || 'healthy',
        notes: animal.notes || '',
      });
    }
  }, [animal, reset]);

  const onSubmit = async (data) => {
    const payload = {
      gender: data.gender,
      age_value: Number(data.age_value),
      age_unit: data.age_unit,
      health_status: data.health_status,
    };

    if (data.tag_number) payload.tag_number = data.tag_number.trim();
    if (data.breed) payload.breed = data.breed.trim();
    if (data.weight_kg) payload.weight_kg = Number(data.weight_kg);
    if (data.notes) payload.notes = data.notes.trim();

    try {
      await dispatch(updateExistingAnimal({ id, data: payload })).unwrap();
      navigate(`/animals/${id}`);
    } catch {
      // Error shown via Redux state
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
                onClick={() => navigate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-[17px] font-bold text-white">تعديل بيانات الحيوان</h1>
                <p className="text-[11px] text-white/60 font-medium">تحديث معلومات: <span className="text-white">#{animal?.tag_number || '---'}</span></p>
              </div>
            </div>
            <span className="text-[12px] text-white font-bold bg-white/15 border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-white" />
              تعديل بيانات
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
                  <h2 className="text-[28px] font-bold mb-2">تحديث السجل</h2>
                  <p className="text-white/80 text-[15px] leading-relaxed">
                    قم بتعديل المعلومات الأساسية للحيوان لضمان دقة سجلات القطيع.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10 space-y-10">

              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#154b23]/10">
                  <h2 className="text-[16px] font-bold text-[#1b4d2c] flex items-center gap-2">المعلومات الأساسية</h2>
                  {/* Species and Farm are not editable, show them as info */}
                  <div className="text-[12px] text-gray-600 font-bold bg-[#1b4d2c]/5 px-3 py-1.5 rounded-full border border-[#1b4d2c]/10">
                    النوع: {animal?.species} • المزرعة: {animal?.farm_id?.name || '---'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Age */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className={labelCls}>العمر <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min="0"
                    {...register('age_value', { required: 'العمر مطلوب', min: { value: 0, message: 'لا يمكن أن يكون أقل من صفر' } })}
                    className={inputCls(errors.age_value)}
                  />
                  {errors.age_value && <p className="text-[11px] text-red-500 mt-1">{errors.age_value.message}</p>}
                </div>
                <div className="w-1/3">
                  <label className={labelCls}>الوحدة <span className="text-red-400">*</span></label>
                  <select
                    {...register('age_unit', { required: 'الوحدة مطلوبة' })}
                    className={`${inputCls(errors.age_unit)} bg-white`}
                  >
                    <option value="months">أشهر</option>
                    <option value="years">سنوات</option>
                  </select>
                  {errors.age_unit && <p className="text-[11px] text-red-500 mt-1">{errors.age_unit.message}</p>}
                </div>
              </div>

              {/* Tag Number */}
              <div>
                <label className={labelCls}>رقم التعريف (الوسم)</label>
                <input
                  type="text"
                  {...register('tag_number')}
                  className={inputCls(false)}
                />
              </div>

              {/* Gender */}
              <div>
                <label className={labelCls}>الجنس <span className="text-red-400">*</span></label>
                <select
                  {...register('gender', { required: 'الجنس مطلوب' })}
                  className={`${inputCls(errors.gender)} bg-white`}
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
                {errors.gender && <p className="text-[11px] text-red-500 mt-1">{errors.gender.message}</p>}
              </div>



              {/* Breed */}
              <div>
                <label className={labelCls}>السلالة</label>
                <input
                  type="text"
                  {...register('breed', { maxLength: { value: 100, message: 'السلالة طويلة جداً' } })}
                  className={inputCls(errors.breed)}
                />
                {errors.breed && <p className="text-[11px] text-red-500 mt-1">{errors.breed.message}</p>}
              </div>

              {/* Weight */}
              <div>
                <label className={labelCls}>الوزن (كجم)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  {...register('weight_kg', {
                    min: { value: 0.1, message: 'الوزن يجب أن يكون أكبر من صفر' }
                  })}
                  className={inputCls(errors.weight_kg)}
                />
                {errors.weight_kg && <p className="text-[11px] text-red-500 mt-1">{errors.weight_kg.message}</p>}
              </div>

              {/* Health Status */}
              <div>
                <label className={labelCls}>الحالة الصحية <span className="text-red-400">*</span></label>
                <select
                  {...register('health_status', { required: 'الحالة الصحية مطلوبة' })}
                  className={`${inputCls(errors.health_status)} bg-white`}
                >
                  <option value="healthy">سليم</option>
                  <option value="sick">مراقبة / مريض</option>
                  <option value="critical">حالة حرجة</option>
                </select>
                {errors.health_status && <p className="text-[11px] text-red-500 mt-1">{errors.health_status.message}</p>}
              </div>
            </div>
          </div>

          {/* ── Section 3: Notes ──────────────────────────────────── */}
          <div className="space-y-4">
                <h2 className="text-[16px] font-bold text-[#1b4d2c] mb-4 pb-3 border-b border-[#154b23]/10">ملاحظات إضافية</h2>
                <textarea
                  {...register('notes', { maxLength: { value: 1000, message: 'الملاحظات طويلة جداً' } })}
                  rows={4}
                  className={`${inputCls(errors.notes)} resize-none`}
                />
                {errors.notes && <p className="text-[11px] text-red-500 mt-1">{errors.notes.message}</p>}
              </div>

              {/* ── Action Buttons ────────────────────────────────────── */}
              <div className="flex items-center justify-end gap-4 pt-4 mt-8 border-t border-[#154b23]/10">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-8 py-3.5 rounded-2xl text-[15px] font-bold text-gray-600 hover:bg-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading.saving || !isDirty}
                  className={`flex items-center gap-2 px-10 py-3.5 text-white rounded-2xl text-[15px] font-bold transition-all shadow-sm ${
                    isDirty && !loading.saving
                      ? 'bg-[#154b23] hover:bg-[#0f3619] shadow-lg shadow-[#154b23]/30 active:scale-95'
                      : 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                  }`}
                >
                  {loading.saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  تحديث البيانات
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

export default EditAnimalPage;
