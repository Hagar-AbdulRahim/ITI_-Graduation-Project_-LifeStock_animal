import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Loader2, ImagePlus } from 'lucide-react';
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


  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { farm_id: farmId || '' },
  });

  const selectedImage = watch('image');

  useEffect(() => {
    dispatch(fetchMyFarms());
  }, [dispatch]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('farm_id', data.farm_id);
    formData.append('species', data.species);
    formData.append('gender', data.gender);
    formData.append('age_value', Number(data.age_value));
    formData.append('age_unit', data.age_unit);
    formData.append('health_status', data.health_status || 'healthy');
    
    if (data.tag_number) formData.append('tag_number', data.tag_number.trim());
    if (data.breed) formData.append('breed', data.breed.trim());
    if (data.weight_kg) formData.append('weight_kg', Number(data.weight_kg));
    if (data.notes) formData.append('notes', data.notes.trim());
    
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    try {
      await dispatch(addNewAnimal(formData)).unwrap();
      navigate(farmId ? `/farms/${farmId}/animals` : '/farms');
    } catch (err) {
      // Error shown via Redux state
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

          {/* ── Section 2: Basic Info ──────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              المعلومات الأساسية <span className="text-red-400 text-[11px] font-medium mr-1">* مطلوب</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Image Upload Big Box */}
              <div className="md:col-span-2 mb-2">
                <label className={labelCls}>صورة الحيوان (اختياري)</label>
                <div className={`relative w-full h-40 bg-gray-50 hover:bg-gray-100 transition-all border-2 border-dashed ${errors.image ? 'border-red-400' : 'border-gray-300'} rounded-2xl flex flex-col items-center justify-center cursor-pointer group overflow-hidden`}>
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/jpg, image/webp"
                    {...register('image', {
                      validate: {
                        lessThan5MB: files => !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024 || 'حجم الصورة يجب أن لا يتجاوز 5 ميجابايت'
                      }
                    })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <ImagePlus className={`w-10 h-10 mb-3 transition-colors ${selectedImage && selectedImage.length > 0 ? 'text-[#2a5c2a]' : 'text-gray-400 group-hover:text-[#2a5c2a]'}`} />
                  {selectedImage && selectedImage.length > 0 ? (
                    <p className="text-[14px] font-bold text-[#2a5c2a]">{selectedImage[0].name}</p>
                  ) : (
                    <>
                      <p className="text-[14px] font-bold text-gray-600 group-hover:text-[#2a5c2a] transition-colors">اضغط هنا لرفع صورة الحيوان</p>
                      <p className="text-[12px] text-gray-400 mt-1">يُسمح بـ: JPEG, JPG, PNG, WEBP (الحد الأقصى: 5MB)</p>
                    </>
                  )}
                </div>
                {errors.image && <p className="text-[12px] text-red-500 mt-2 font-medium">{errors.image.message}</p>}
              </div>

              {/* Age */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className={labelCls}>العمر <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min="0"
                    {...register('age_value', { required: 'العمر مطلوب', min: { value: 0, message: 'لا يمكن أن يكون أقل من صفر' } })}
                    placeholder="مثال: 8"
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

              {/* Health Status */}
              <div>
                <label className={labelCls}>الحالة الصحية</label>
                <select
                  {...register('health_status')}
                  className={`${inputCls(errors.health_status)} bg-white`}
                  defaultValue="healthy"
                >
                  <option value="healthy">سليم</option>
                  <option value="sick">مريض / مراقبة</option>
                  <option value="critical">حالة حرجة</option>
                  <option value="deceased">متوفى</option>
                </select>
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
