import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Loader2 } from 'lucide-react';
import { addNewAnimal } from '../../redux/animalSlice';
import { fetchMyFarms } from '../../redux/farmSlice';

// ─── Backend Animal Model (for reference) ─────────────────────────────────────
// Required: farm_id, species (cattle|sheep|goat), gender (male|female), age_value, age_unit
// Optional: tag_number, breed, weight_kg, notes
// Auto: health_status (default: healthy), is_active (default: true)
// ─────────────────────────────────────────────────────────────────────────────

const AddAnimalPage = () => {
  const [searchParams] = useSearchParams();
  const farmId = searchParams.get('farmId'); // farm_id can come as a query parameter from dashboard links
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.animal);
  const farms = useSelector((state) => state.farm?.farms || []);

  const selectedFarm = farmId ? farms.find((farm) => farm._id === farmId) : null;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { age_unit: 'months', health_status: 'healthy', farm_id: farmId || '' },
  });

  const selectedFarmId = farmId || watch('farm_id');

  useEffect(() => {
    dispatch(fetchMyFarms());
  }, [dispatch]);

  const onSubmit = async (data) => {
    const actualFarmId = selectedFarmId || (farms && farms.length > 0 ? farms[0]._id : null);
    if (!actualFarmId) {
      return;
    }

    const payload = {
      farm_id: actualFarmId,
      species: data.species,
      gender: data.gender,
      age_value: Number(data.age_value),
      age_unit: data.age_unit,
      health_status: data.health_status || 'healthy',
      tag_number: data.tag_number ? data.tag_number.trim() : `TAG-${Math.floor(Math.random() * 1000000)}`,
    };

    if (data.breed) payload.breed = data.breed.trim();
    if (data.weight_kg) payload.weight_kg = Number(data.weight_kg);
    if (data.notes) payload.notes = data.notes.trim();

    try {
      await dispatch(addNewAnimal(payload)).unwrap();
      navigate(actualFarmId ? `/farms/${actualFarmId}/animals` : '/farms');
    } catch (err) {
      // Error shown via Redux state
    }
  };

  const inputCls = (hasError) =>
    `w-full px-5 py-3.5 bg-white border text-gray-900 rounded-xl outline-none transition-all shadow-sm font-cairo
     ${hasError
      ? 'border-red-400 focus:ring-2 focus:ring-red-200'
      : 'border-[#1b4d2c]/30 focus:ring-2 focus:ring-[#1b4d2c]/20 focus:border-[#1b4d2c] hover:border-[#1b4d2c]/50'}`;

  const labelCls = 'block text-[14px] font-bold text-gray-700 mb-2.5';

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-cairo relative" dir="rtl">
      
      {/* ─── Hero Section ─── */}
      <div className="bg-[#1b4d2c] pt-12 md:pt-16 pb-32 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors text-sm font-bold backdrop-blur-sm border border-white/10 group"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>رجوع</span>
            </button>
            <span className="text-[12px] text-emerald-100 font-bold bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-1.5 rounded-full">
              إضافة حيوان
            </span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
            إضافة حيوان جديد
          </h1>
          <p className="text-green-50/80 text-sm md:text-base font-medium max-w-xl">
            أدخل بيانات الحيوان بعناية لإضافته بنجاح إلى قطيع المزرعة الخاص بك.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 md:px-6 relative z-20 -mt-20 mb-20">
        {/* Error Banner */}
        {error?.saving && (
          <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-bold flex items-center gap-2 shadow-sm">
            <X className="w-5 h-5 flex-shrink-0" />
            {error.saving}
          </div>
        )}

        {farmId && (
          <div className="mb-5 rounded-[20px] border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-800 shadow-sm">
            <p className="font-semibold mb-1">المزرعة المختارة</p>
            <p>{selectedFarm ? selectedFarm.name : 'المزرعة المحددة غير موجودة في القائمة'}</p>
            {selectedFarm?.governorate && <p className="text-xs text-emerald-700 mt-1">المحافظة: {selectedFarm.governorate}</p>}
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-xl shadow-green-900/10 border border-[#1b4d2c]/10 p-6 sm:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
            
            {/* ── Section 1: Basic Info ──────────────────────────────── */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-green-50">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-[#1b4d2c]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#1b4d2c]">المعلومات الأساسية</h2>
                  <p className="text-sm font-bold text-stone-500 mt-0.5">أدخل بيانات الحيوان بدقة</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {!farmId && (
                  <div className="md:col-span-2">
                    <label className={labelCls}>المزرعة <span className="text-red-500">*</span></label>
                    <select
                      {...register('farm_id', { required: 'المزرعة مطلوبة' })}
                      className={`${inputCls(errors.farm_id)}`}
                    >
                      <option value="">اختر المزرعة...</option>
                      {farms.map((farm) => (
                        <option key={farm._id} value={farm._id}>{farm.name}</option>
                      ))}
                    </select>
                    {errors.farm_id && <p className="text-[12px] text-red-500 font-bold mt-1.5">{errors.farm_id.message}</p>}
                  </div>
                )}

              {/* Age */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelCls}>العمر <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    {...register('age_value', { required: 'العمر مطلوب', min: { value: 0, message: 'لا يمكن أن يكون أقل من صفر' } })}
                    placeholder="مثال: 8"
                    className={inputCls(errors.age_value)}
                  />
                  {errors.age_value && <p className="text-[12px] text-red-500 font-bold mt-1.5">{errors.age_value.message}</p>}
                </div>
                <div className="w-1/3">
                  <label className={labelCls}>الوحدة <span className="text-red-500">*</span></label>
                  <select
                    {...register('age_unit', { required: 'الوحدة مطلوبة' })}
                    className={`${inputCls(errors.age_unit)}`}
                  >
                    <option value="months">أشهر</option>
                    <option value="years">سنوات</option>
                  </select>
                  {errors.age_unit && <p className="text-[12px] text-red-500 font-bold mt-1.5">{errors.age_unit.message}</p>}
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

              {/* Species */}
              <div>
                <label className={labelCls}>نوع الحيوان <span className="text-red-500">*</span></label>
                <select
                  {...register('species', { required: 'النوع مطلوب' })}
                  className={`${inputCls(errors.species)}`}
                >
                  <option value="">اختر النوع...</option>
                  <option value="cattle">أبقار (Cattle)</option>
                  <option value="sheep">أغنام (Sheep)</option>
                  <option value="goat">ماعز (Goat)</option>
                </select>
                {errors.species && <p className="text-[12px] text-red-500 font-bold mt-1.5">{errors.species.message}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className={labelCls}>الجنس <span className="text-red-500">*</span></label>
                <select
                  {...register('gender', { required: 'الجنس مطلوب' })}
                  className={`${inputCls(errors.gender)}`}
                >
                  <option value="">اختر الجنس...</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
                {errors.gender && <p className="text-[12px] text-red-500 font-bold mt-1.5">{errors.gender.message}</p>}
              </div>

              {/* Health Status */}
              <div>
                <label className={labelCls}>الحالة الصحية</label>
                <select
                  {...register('health_status')}
                  className={`${inputCls(errors.health_status)}`}
                  defaultValue="healthy"
                >
                  <option value="healthy">سليم</option>
                  <option value="sick">مريض / مراقبة</option>
                  <option value="critical">حالة حرجة</option>
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
                {errors.breed && <p className="text-[12px] text-red-500 font-bold mt-1.5">{errors.breed.message}</p>}
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
                {errors.weight_kg && <p className="text-[12px] text-red-500 font-bold mt-1.5">{errors.weight_kg.message}</p>}
              </div>
            </div>
          </div>
            
          {/* ── Section 2: Notes ──────────────────────────────────── */}
            <div className="mt-8 pt-8 border-t border-green-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-[#1b4d2c]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#1b4d2c]">ملاحظات إضافية</h2>
                  <p className="text-sm font-bold text-stone-500 mt-0.5">تفاصيل أخرى تخص الحيوان</p>
                </div>
              </div>
              <textarea
                {...register('notes', { maxLength: { value: 1000, message: 'الملاحظات طويلة جداً (حد أقصى 1000 حرف)' } })}
                rows={4}
                placeholder="أي ملاحظات إضافية عن الحيوان، مثل الأمراض السابقة أو تطعيمات خاصة..."
                className={`${inputCls(errors.notes)} resize-none`}
              />
              {errors.notes && <p className="text-[12px] text-red-500 font-bold mt-1.5">{errors.notes.message}</p>}
            </div>

            {/* ── Action Buttons ────────────────────────────────────── */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-green-50 mt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-stone-200 rounded-xl text-[15px] font-bold text-stone-600 hover:bg-stone-50 transition-all shadow-sm w-full sm:w-auto"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading.saving}
                className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#1b4d2c] hover:bg-[#143920] text-white rounded-xl text-[15px] font-bold transition-all shadow-lg shadow-[#1b4d2c]/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 w-full sm:w-auto"
              >
                {loading.saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                حفظ بيانات الحيوان
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddAnimalPage;
