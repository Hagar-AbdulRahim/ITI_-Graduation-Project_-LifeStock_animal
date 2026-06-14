import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { addNewAnimal } from '../../redux/animalSlice';
import { fetchMyFarms } from '../../redux/farmSlice';

// ─── Backend Animal Model (for reference) ─────────────────────────────────────
// Required: farm_id, name, species (cattle|sheep|goat), gender (male|female), birth_date
// Optional: tag_number, breed, weight_kg, notes
// Auto: health_status (default: healthy), is_active (default: true)
// ─────────────────────────────────────────────────────────────────────────────

const AddAnimalPage = () => {
  const { farmId } = useParams(); // optional: pre-fill farm if coming from farm page
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { farms } = useSelector((state) => state.farm);
  const { loading, error } = useSelector((state) => state.animal);

  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { farm_id: farmId || '' },
  });

  useEffect(() => {
    dispatch(fetchMyFarms());
  }, [dispatch]);

  const onSubmit = async (data) => {
    const payload = {
      farm_id:    data.farm_id,
      name:       data.name.trim(),
      species:    data.species,        // cattle | sheep | goat (backend enum)
      gender:     data.gender,         // male | female (backend enum)
      birth_date: data.birth_date,
      ...(data.tag_number && { tag_number:  data.tag_number.trim() }),
      ...(data.breed      && { breed:       data.breed.trim() }),
      ...(data.weight_kg  && { weight_kg:   Number(data.weight_kg) }),
      ...(data.notes      && { notes:       data.notes.trim() }),
    };

    try {
      await dispatch(addNewAnimal(payload)).unwrap();
      navigate(farmId ? `/farms/${farmId}/animals` : '/farms');
    } catch (err) {
      // Error shown via Redux state
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const inputCls = (hasError) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all font-cairo
     ${hasError
      ? 'border-red-400 focus:ring-2 focus:ring-red-200'
      : 'border-gray-200 focus:ring-2 focus:ring-[#2a5c2a]/20 focus:border-[#2a5c2a]'}`;

  const labelCls = 'block text-[13px] font-bold text-gray-700 mb-2';

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
              <h1 className="text-[17px] font-bold text-gray-900">إضافة حيوان جديد</h1>
              <p className="text-[11px] text-gray-400 font-medium">أدخل بيانات الحيوان المطلوبة</p>
            </div>
          </div>
          {/* Step indicator */}
          <span className="text-[12px] text-gray-400 font-medium bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
            إضافة حيوان
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Error Banner */}
        {error?.saving && (
          <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
            {error.saving}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* ── Section 1: Image ───────────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">صورة الحيوان</h2>
            <div className="flex items-center gap-5">
              <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 hover:border-[#2a5c2a] transition-colors cursor-pointer">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImageIcon className="w-7 h-7 text-gray-300" />
                    <span className="text-[10px] text-gray-400 font-medium">رفع صورة</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-700 mb-1">اختر صورة للحيوان</p>
                <p className="text-[12px] text-gray-400">JPG, PNG — حجم أقصى 5MB</p>
                <p className="text-[11px] text-gray-400 mt-1">اختياري — يمكن إضافتها لاحقاً</p>
              </div>
            </div>
          </div>

          {/* ── Section 2: Basic Info ──────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              المعلومات الأساسية <span className="text-red-400 text-[11px] font-medium mr-1">* مطلوب</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Name */}
              <div>
                <label className={labelCls}>اسم الحيوان <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  {...register('name', { required: 'الاسم مطلوب', maxLength: { value: 100, message: 'الاسم طويل جداً' } })}
                  placeholder="مثال: بيسي، مبروكة..."
                  className={inputCls(errors.name)}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              {/* Tag Number */}
              <div>
                <label className={labelCls}>رقم التعريف (الوسم)</label>
                <input
                  type="text"
                  {...register('tag_number')}
                  placeholder="مثال: CV-3301"
                  className={inputCls(false)}
                />
              </div>

              {/* Species — MUST match backend enum: cattle | sheep | goat */}
              <div>
                <label className={labelCls}>نوع الحيوان <span className="text-red-400">*</span></label>
                <select
                  {...register('species', { required: 'النوع مطلوب' })}
                  className={`${inputCls(errors.species)} bg-white`}
                >
                  <option value="">اختر النوع...</option>
                  <option value="cattle">أبقار (Cattle)</option>
                  <option value="sheep">أغنام (Sheep)</option>
                  <option value="goat">ماعز (Goat)</option>
                </select>
                {errors.species && <p className="text-[11px] text-red-500 mt-1">{errors.species.message}</p>}
              </div>

              {/* Gender — MUST match backend enum: male | female */}
              <div>
                <label className={labelCls}>الجنس <span className="text-red-400">*</span></label>
                <select
                  {...register('gender', { required: 'الجنس مطلوب' })}
                  className={`${inputCls(errors.gender)} bg-white`}
                >
                  <option value="">اختر الجنس...</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
                {errors.gender && <p className="text-[11px] text-red-500 mt-1">{errors.gender.message}</p>}
              </div>

              {/* Birth Date — required, must be in the past */}
              <div>
                <label className={labelCls}>تاريخ الميلاد <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  {...register('birth_date', { required: 'تاريخ الميلاد مطلوب' })}
                  className={inputCls(errors.birth_date)}
                />
                {errors.birth_date && <p className="text-[11px] text-red-500 mt-1">{errors.birth_date.message}</p>}
              </div>

              {/* Breed */}
              <div>
                <label className={labelCls}>السلالة</label>
                <input
                  type="text"
                  {...register('breed', { maxLength: { value: 100, message: 'السلالة طويلة جداً' } })}
                  placeholder="مثال: هولشتاين، بلدي..."
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
                  placeholder="مثال: 450"
                  className={inputCls(errors.weight_kg)}
                />
                {errors.weight_kg && <p className="text-[11px] text-red-500 mt-1">{errors.weight_kg.message}</p>}
              </div>

              {/* Farm Selection */}
              <div>
                <label className={labelCls}>المزرعة <span className="text-red-400">*</span></label>
                <select
                  {...register('farm_id', { required: 'المزرعة مطلوبة' })}
                  className={`${inputCls(errors.farm_id)} bg-white`}
                >
                  <option value="">اختر المزرعة...</option>
                  {farms?.map((farm) => (
                    <option key={farm._id} value={farm._id}>{farm.name}</option>
                  ))}
                </select>
                {errors.farm_id && <p className="text-[11px] text-red-500 mt-1">{errors.farm_id.message}</p>}
              </div>
            </div>
          </div>

          {/* ── Section 3: Notes ──────────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">ملاحظات إضافية</h2>
            <textarea
              {...register('notes', { maxLength: { value: 1000, message: 'الملاحظات طويلة جداً (حد أقصى 1000 حرف)' } })}
              rows={4}
              placeholder="أي ملاحظات إضافية عن الحيوان..."
              className={`${inputCls(errors.notes)} resize-none`}
            />
            {errors.notes && <p className="text-[11px] text-red-500 mt-1">{errors.notes.message}</p>}
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
              className="flex items-center gap-2 px-8 py-2.5 bg-[#2a5c2a] text-white rounded-xl text-sm font-bold hover:bg-[#1e4520] transition-colors shadow-sm shadow-green-900/20 disabled:opacity-70"
            >
              {loading.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ بيانات الحيوان
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default AddAnimalPage;
