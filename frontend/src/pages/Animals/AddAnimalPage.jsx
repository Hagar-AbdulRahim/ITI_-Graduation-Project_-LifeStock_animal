import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { addNewAnimal } from '../../redux/animalSlice';

// ─── Backend Animal Model (for reference) ─────────────────────────────────────
// Required: farm_id, name, species (cattle|sheep|goat), gender (male|female), birth_date
// Optional: tag_number, breed, weight_kg, notes
// Auto: health_status (default: healthy), is_active (default: true)
// ─────────────────────────────────────────────────────────────────────────────

const AddAnimalPage = () => {
  const { farmId } = useParams(); // farm_id comes from the URL — no need to select it
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.animal);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { age_unit: 'months' },
  });

  const onSubmit = async (data) => {
    const payload = {
      farm_id: farmId,                    // always taken from URL
      species: data.species,              // cattle | sheep | goat
      gender: data.gender,              // male | female
      age_value: Number(data.age_value),   // numeric age
      age_unit: data.age_unit,            // months | years
      ...(data.name && { name: data.name.trim() }),
      ...(data.tag_number && { tag_number: data.tag_number.trim() }),
      ...(data.breed && { breed: data.breed.trim() }),
      ...(data.weight_kg && { weight_kg: Number(data.weight_kg) }),
      ...(data.notes && { notes: data.notes.trim() }),
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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
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
              {/* Image preview area */}
              <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 hover:border-[#2a5c2a] transition-colors cursor-pointer">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 left-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
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

              {/* Age value + unit — two inputs side by side */}
              <div className="md:col-span-2">
                <label className={labelCls}>العمر <span className="text-red-400">*</span></label>
                <div className="flex gap-3">
                  {/* Number input */}
                  <input
                    type="number"
                    min="1"
                    max="999"
                    {...register('age_value', {
                      required: 'العمر مطلوب',
                      min: { value: 1, message: 'يجب أن يكون العمر أكبر من صفر' },
                      max: { value: 999, message: 'رقم كبير جداً' },
                    })}
                    placeholder="مثال: 10"
                    className={`${inputCls(errors.age_value)} flex-1`}
                  />
                  {/* Unit selector */}
                  <select
                    {...register('age_unit', { required: true })}
                    className={`${inputCls(false)} bg-white w-36 flex-shrink-0`}
                  >
                    <option value="months">شهر</option>
                    <option value="years">سنة</option>
                  </select>
                </div>
                {errors.age_value && <p className="text-[11px] text-red-500 mt-1">{errors.age_value.message}</p>}
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
