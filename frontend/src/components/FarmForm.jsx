import React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save, X } from 'lucide-react';

/**
 * Reusable form for adding or editing a farm.
 * Props:
 *   - defaultValues: object with initial field values (optional).
 *   - onSubmit: async function that receives the form data.
 *   - loading: boolean indicating submit in progress (optional).
 *   - error: error object from Redux slice (optional) to display.
 */
const FarmForm = ({ defaultValues = {}, onSubmit, loading = false, error, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      governorate: '',
      description: '',
      lng: 31.2357,
      lat: 30.0444,
      ...defaultValues,
    },
  });

  const inputCls = (hasError) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all font-cairo bg-white ${
      hasError
        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
        : 'border-gray-200 focus:ring-2 focus:ring-[#2a5c2a]/20 focus:border-[#2a5c2a]'
    }`;

  const labelCls = 'block text-[13px] font-bold text-gray-700 mb-2';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Error banner */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
        <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
          البيانات الأساسية للمزرعة <span className="text-red-400 text-[11px] font-medium mr-1">* مطلوب</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div className="md:col-span-2">
            <label className={labelCls}>
              اسم المزرعة <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'اسم المزرعة مطلوب',
                minLength: { value: 2, message: 'الاسم قصير جداً' },
                maxLength: { value: 150, message: 'الاسم طويل جداً' },
              })}
              placeholder="مثال: مزرعة الأمل الحديثة..."
              className={inputCls(errors.name)}
            />
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Governorate */}
          <div className="md:col-span-2">
            <label className={labelCls}>المحافظة <span className="text-red-400">*</span></label>
            <select {...register('governorate', { required: 'المحافظة مطلوبة' })} className={inputCls(errors.governorate)}>
              <option value="">اختر المحافظة...</option>
              {[
                'القاهرة',
                'الجيزة',
                'الإسكندرية',
                'الدقهلية',
                'البحر الأحمر',
                'البحيرة',
                'الفيوم',
                'الغربية',
                'الإسماعيلية',
                'المنوفية',
                'المنيا',
                'القليوبية',
                'الوادي الجديد',
                'السويس',
                'أسوان',
                'أسيوط',
                'بني سويف',
                'بورسعيد',
                'دمياط',
                'الشرقية',
                'جنوب سيناء',
                'كفر الشيخ',
                'مطروح',
                'الأقصر',
                'قنا',
                'شمال سيناء',
                'سوهاج',
              ].map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
            {errors.governorate && (
              <p className="text-[11px] text-red-500 mt-1">{errors.governorate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
        <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
          الموقع الجغرافي (GPS)
        </h2>
        <p className="text-[12px] text-gray-500 mb-4">
          هذه الإحداثيات هامة لمراقبة تفشي الأمراض في نطاق الجغرافي للمزرعة.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Longitude */}
          <div>
            <label className={labelCls}>
              خط الطول (Longitude) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="any"
              {...register('lng', {
                required: 'مطلوب',
                min: { value: -180, message: 'يجب أن يكون أكبر من -180' },
                max: { value: 180, message: 'يجب أن يكون أقل من 180' },
              })}
              placeholder="مثال: 31.2357"
              className={inputCls(errors.lng)}
            />
            {errors.lng && <p className="text-[11px] text-red-500 mt-1">{errors.lng.message}</p>}
          </div>

          {/* Latitude */}
          <div>
            <label className={labelCls}>
              خط العرض (Latitude) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="any"
              {...register('lat', {
                required: 'مطلوب',
                min: { value: -90, message: 'يجب أن يكون أكبر من -90' },
                max: { value: 90, message: 'يجب أن يكون أقل من 90' },
              })}
              placeholder="مثال: 30.0444"
              className={inputCls(errors.lat)}
            />
            {errors.lat && <p className="text-[11px] text-red-500 mt-1">{errors.lat.message}</p>}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
        <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
          وصف المزرعة (اختياري)
        </h2>
        <div>
          <textarea
            {...register('description', { maxLength: { value: 500, message: 'الوصف طويل جداً' } })}
            rows={4}
            placeholder="تفاصيل إضافية عن المزرعة، التخصص، السعة الاستيعابية..."
            className={`${inputCls(errors.description)} resize-none`}
          />
          {errors.description && (
            <p className="text-[11px] text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => {
            if (onCancel) onCancel();
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" /> إلغاء
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-2.5 bg-[#2a5c2a] text-white rounded-xl text-sm font-bold hover:bg-[#1e4520] transition-colors shadow-sm shadow-green-900/20 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ المزرعة
        </button>
      </div>
    </form>
  );
};

export default FarmForm;
