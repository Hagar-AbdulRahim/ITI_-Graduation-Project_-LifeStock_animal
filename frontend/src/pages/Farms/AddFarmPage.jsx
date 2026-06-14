import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Loader2, MapPin } from 'lucide-react';
import { addNewFarm } from '../../redux/farmSlice';

// ─── Backend Farm Model (Mapping) ────────────────────────────────────────────
// Required: name (string), governorate (string), location (GeoJSON Point: [lng, lat])
// Optional: description (string, max 500)
// ─────────────────────────────────────────────────────────────────────────────

const AddFarmPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.farm);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      lng: 31.2357, // Default to Cairo
      lat: 30.0444,
    }
  });

  const onSubmit = async (data) => {
    const payload = {
      name: data.name.trim(),
      governorate: data.governorate.trim(),
      location: {
        type: 'Point',
        coordinates: [Number(data.lng), Number(data.lat)],
      },
      ...(data.description && { description: data.description.trim() }),
    };

    try {
      await dispatch(addNewFarm(payload)).unwrap();
      navigate('/farms');
    } catch (err) {
      // Error handled by Redux state
    }
  };

  const inputCls = (hasError) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all font-cairo bg-white
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
              <h1 className="text-[17px] font-bold text-gray-900">إضافة مزرعة جديدة</h1>
              <p className="text-[11px] text-gray-400 font-medium">تسجيل مزرعة في النظام</p>
            </div>
          </div>
          <span className="text-[12px] text-[#2a5c2a] font-medium bg-[#f5f7f5] border border-[#2a5c2a]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            مزرعة جديدة
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {error?.farms && (
          <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
            {error.farms}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ── Section 1: Basic Info ──────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              البيانات الأساسية للمزرعة <span className="text-red-400 text-[11px] font-medium mr-1">* مطلوب</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Name */}
              <div className="md:col-span-2">
                <label className={labelCls}>اسم المزرعة <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  {...register('name', { required: 'اسم المزرعة مطلوب', minLength: { value: 2, message: 'الاسم قصير جداً' }, maxLength: { value: 150, message: 'الاسم طويل جداً' } })}
                  placeholder="مثال: مزرعة الأمل الحديثة..."
                  className={inputCls(errors.name)}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              {/* Governorate */}
              <div className="md:col-span-2">
                <label className={labelCls}>المحافظة <span className="text-red-400">*</span></label>
                <select
                  {...register('governorate', { required: 'المحافظة مطلوبة' })}
                  className={inputCls(errors.governorate)}
                >
                  <option value="">اختر المحافظة...</option>
                  {[
                    "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر",
                    "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية",
                    "المنيا", "القليوبية", "الوادي الجديد", "السويس", "أسوان",
                    "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية",
                    "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر", "قنا",
                    "شمال سيناء", "سوهاج"
                  ].map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
                {errors.governorate && <p className="text-[11px] text-red-500 mt-1">{errors.governorate.message}</p>}
              </div>

            </div>
          </div>

          {/* ── Section 2: Location ────────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">الموقع الجغرافي (GPS)</h2>
            <p className="text-[12px] text-gray-500 mb-4">هذه الإحداثيات هامة لمراقبة تفشي الأمراض (Outbreak Detection) في النطاق الجغرافي للمزرعة.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              
              {/* Longitude */}
              <div>
                <label className={labelCls}>خط الطول (Longitude) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  step="any"
                  {...register('lng', { 
                    required: 'مطلوب',
                    min: { value: -180, message: 'يجب أن يكون أكبر من -180' },
                    max: { value: 180, message: 'يجب أن يكون أقل من 180' }
                  })}
                  placeholder="مثال: 31.2357"
                  className={inputCls(errors.lng)}
                />
                {errors.lng && <p className="text-[11px] text-red-500 mt-1">{errors.lng.message}</p>}
              </div>

              {/* Latitude */}
              <div>
                <label className={labelCls}>خط العرض (Latitude) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  step="any"
                  {...register('lat', { 
                    required: 'مطلوب',
                    min: { value: -90, message: 'يجب أن يكون أكبر من -90' },
                    max: { value: 90, message: 'يجب أن يكون أقل من 90' }
                  })}
                  placeholder="مثال: 30.0444"
                  className={inputCls(errors.lat)}
                />
                {errors.lat && <p className="text-[11px] text-red-500 mt-1">{errors.lat.message}</p>}
              </div>

            </div>
          </div>

          {/* ── Section 3: Notes ───────────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">وصف المزرعة (اختياري)</h2>
            <div>
              <textarea
                {...register('description', { maxLength: { value: 500, message: 'الوصف طويل جداً' } })}
                rows={4}
                placeholder="تفاصيل إضافية عن المزرعة، التخصص، السعة الاستيعابية..."
                className={`${inputCls(errors.description)} resize-none`}
              />
              {errors.description && <p className="text-[11px] text-red-500 mt-1">{errors.description.message}</p>}
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
              disabled={loading.farms}
              className="flex items-center gap-2 px-8 py-2.5 bg-[#2a5c2a] text-white rounded-xl text-sm font-bold hover:bg-[#1e4520] transition-colors shadow-sm shadow-green-900/20 disabled:opacity-70"
            >
              {loading.farms ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ المزرعة
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default AddFarmPage;
