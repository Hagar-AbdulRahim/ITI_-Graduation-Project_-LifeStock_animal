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

  const inputBase =
    'w-full px-5 py-3.5 rounded-2xl text-[15px] text-gray-900 bg-white border-2 transition-all outline-none ' +
    'placeholder:text-gray-400 focus:shadow-[0_0_0_4px_rgba(21,75,35,0.1)]';
  const inputOk  = inputBase + ' border-transparent focus:border-[#154b23] shadow-sm';
  const inputErr = inputBase + ' border-red-300 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.15)] shadow-sm';
  const labelCls = 'block text-[15px] font-bold text-[#154b23] mb-2 ml-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Error banner */}
      {error && (
        <div className="mb-2 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-sm font-medium flex items-center gap-2 shadow-sm">
          <X className="w-4 h-4 flex-shrink-0 text-red-400" />
          {error}
        </div>
      )}

      {/* Unified Card */}
      <div className="bg-[#f2f8f3] rounded-[32px] shadow-sm border border-[#154b23]/10 overflow-hidden">
        {/* Header Area */}
        <div className="relative bg-[#154b23] p-8 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
          <div className="relative z-10 flex items-center gap-4">
            <h2 className="text-[24px] font-bold">بيانات المزرعة</h2>
            <p className="text-white/80 text-[14px] mt-1">قم بتحديث معلومات المزرعة.</p>
          </div>
        </div>

        {/* Form Area */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className={labelCls}>
                اسم المزرعة <span className="text-red-500 text-sm mr-1">*</span>
              </label>
              <input
                type="text"
                {...register('name', {
                  required: 'اسم المزرعة مطلوب',
                  minLength: { value: 2, message: 'الاسم قصير جداً' },
                  maxLength: { value: 150, message: 'الاسم طويل جداً' },
                })}
                placeholder="مثال: مزرعة الأمل الحديثة..."
                className={errors.name ? inputErr : inputOk}
              />
              {errors.name && <p className="text-[13px] text-red-600 mt-1 flex items-center gap-1.5 font-bold"><X className="w-3.5 h-3.5"/>{errors.name.message}</p>}
            </div>

            {/* Governorate */}
            <div className="md:col-span-2">
              <label className={labelCls}>المحافظة <span className="text-red-500 text-sm mr-1">*</span></label>
              <div className="relative">
                <select {...register('governorate', { required: 'المحافظة مطلوبة' })} className={`${errors.governorate ? inputErr : inputOk} appearance-none pr-4 pl-12 cursor-pointer`}>
                  <option value="">اختر المحافظة...</option>
                  {[
                    'القاهرة','الجيزة','الإسكندرية','الدقهلية','البحر الأحمر','البحيرة','الفيوم','الغربية','الإسماعيلية','المنوفية',
                    'المنيا','القليوبية','الوادي الجديد','السويس','أسوان','أسيوط','بني سويف','بورسعيد','دمياط','الشرقية',
                    'جنوب سيناء','كفر الشيخ','مطروح','الأقصر','قنا','شمال سيناء','سوهاج',
                  ].map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>
              {errors.governorate && (
                <p className="text-[13px] text-red-600 mt-1 flex items-center gap-1.5 font-bold"><X className="w-3.5 h-3.5"/>{errors.governorate.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className={labelCls}>وصف المزرعة <span className="text-gray-500 text-sm font-normal mr-1">(اختياري)</span></label>
              <textarea
                {...register('description', { maxLength: { value: 500, message: 'الوصف طويل جداً' } })}
                rows={4}
                placeholder="تفاصيل إضافية عن المزرعة، التخصص، السعة الاستيعابية..."
                className={`${errors.description ? inputErr : inputOk} resize-none`}
              />
              {errors.description && (
                <p className="text-[13px] text-red-600 mt-1 flex items-center gap-1.5 font-bold"><X className="w-3.5 h-3.5"/>{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => {
            if (onCancel) onCancel();
          }}
          className="px-8 py-3.5 rounded-2xl text-[15px] font-bold text-gray-600 hover:bg-white transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-10 py-3.5 bg-[#154b23] text-white rounded-2xl text-[15px] font-bold hover:bg-[#0f3619] active:scale-95 transition-all shadow-lg shadow-[#154b23]/30 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          حفظ التعديلات
        </button>
      </div>
    </form>
  );
};

export default FarmForm;
