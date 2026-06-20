import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Loader2 } from 'lucide-react';
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


  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImageError(null);
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('نوع الملف غير مسموح به. يرجى اختيار صورة بصيغة JPEG, JPG, PNG أو WEBP');
      setImageFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت');
      setImageFile(null);
      return;
    }

    setImageError(null);
    setImageFile(file);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { farm_id: farmId || '', health_status: 'healthy', age_unit: 'months' },
  });

  useEffect(() => {
    dispatch(fetchMyFarms());
  }, [dispatch]);

  const onSubmit = async (data) => {
    if (imageError) return;

    const formData = new FormData();
    formData.append('farm_id', data.farm_id);
    formData.append('tag_number', data.tag_number.trim());
    formData.append('species', data.species);
    formData.append('gender', data.gender);
    formData.append('age_value', data.age_value);
    formData.append('age_unit', data.age_unit);
    formData.append('health_status', data.health_status);
    
    if (data.breed) formData.append('breed', data.breed.trim());
    if (data.weight_kg) formData.append('weight_kg', data.weight_kg);
    if (data.notes) formData.append('notes', data.notes.trim());
    if (imageFile) {
      formData.append('image', imageFile);
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

              {/* Tag Number */}
              <div>
                <label className={labelCls}>رقم التعريف (الوسم) <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  {...register('tag_number', { required: 'رقم التعريف (الوسم) مطلوب' })}
                  placeholder="مثال: CV-3301"
                  className={inputCls(errors.tag_number)}
                />
                {errors.tag_number && <p className="text-[11px] text-red-500 mt-1">{errors.tag_number.message}</p>}
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

              {/* Age Value */}
              <div>
                <label className={labelCls}>العمر <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  {...register('age_value', { 
                    required: 'العمر مطلوب', 
                    min: { value: 0, message: 'العمر يجب أن يكون أكبر من أو يساوي صفر' } 
                  })}
                  placeholder="مثال: 5"
                  className={inputCls(errors.age_value)}
                />
                {errors.age_value && <p className="text-[11px] text-red-500 mt-1">{errors.age_value.message}</p>}
              </div>

              {/* Age Unit */}
              <div>
                <label className={labelCls}>وحدة العمر <span className="text-red-400">*</span></label>
                <select
                  {...register('age_unit', { required: 'وحدة العمر مطلوبة' })}
                  className={`${inputCls(errors.age_unit)} bg-white`}
                >
                  <option value="months">شهور</option>
                  <option value="years">سنوات</option>
                </select>
                {errors.age_unit && <p className="text-[11px] text-red-500 mt-1">{errors.age_unit.message}</p>}
              </div>

              {/* Health Status */}
              <div>
                <label className={labelCls}>الحالة الصحية <span className="text-red-400">*</span></label>
                <select
                  {...register('health_status', { required: 'الحالة الصحية مطلوبة' })}
                  className={`${inputCls(errors.health_status)} bg-white`}
                >
                  <option value="healthy">سليم (healthy)</option>
                  <option value="sick">مريض (sick)</option>
                  <option value="critical">حرجة (critical)</option>
                  <option value="deceased">نافق (deceased)</option>
                </select>
                {errors.health_status && <p className="text-[11px] text-red-500 mt-1">{errors.health_status.message}</p>}
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

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className={labelCls}>صورة الحيوان</label>
                <input
                  type="file"
                  accept=".jpeg,.jpg,.png,.webp"
                  onChange={handleImageChange}
                  className={inputCls(imageError)}
                />
                <p className="text-[11px] text-gray-400 mt-1.5">المحلقات المسموحة: JPEG, JPG, PNG, WEBP فقط. الحد الأقصى للحجم: 5 ميجابايت.</p>
                {imageError && <p className="text-[11px] text-red-500 mt-1">{imageError}</p>}
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
