import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  ArrowRight, Save, X, Loader2, MapPin, Leaf,
  Building2, AlignLeft, ChevronDown, CheckCircle2,
} from 'lucide-react';
import { addNewFarm } from '../../redux/farmSlice';
import toast from 'react-hot-toast';

const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر",
  "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية",
  "المنيا", "القليوبية", "الوادي الجديد", "السويس", "أسوان",
  "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية",
  "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر", "قنا",
  "شمال سيناء", "سوهاج",
];

const AddFarmPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.farm);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: { name: '', governorate: '', description: '' } });

  const descValue = watch('description') || '';

  const onSubmit = async (data) => {
    const payload = {
      name: data.name.trim(),
      governorate: data.governorate.trim(),
      ...(data.description && { description: data.description.trim() }),
    };
    try {
      await dispatch(addNewFarm(payload)).unwrap();
      setSubmitted(true);
      toast.success('تم إضافة المزرعة بنجاح!');
      setTimeout(() => navigate('/farms'), 1200);
    } catch (err) {
      toast.error(err || 'حدث خطأ أثناء الإضافة');
    }
  };

  /* ── Shared classes ─────────────────────────────────────────── */
  const fieldWrap = 'flex flex-col gap-2';
  const label = 'text-[15px] font-bold text-[#154b23] flex items-center gap-1.5 ml-1';
  const inputBase =
    'w-full px-5 py-3.5 rounded-2xl text-[15px] text-gray-900 bg-white border-2 transition-all outline-none ' +
    'placeholder:text-gray-400 focus:shadow-[0_0_0_4px_rgba(21,75,35,0.1)]';
  const inputOk = inputBase + ' border-transparent focus:border-[#154b23] shadow-sm';
  const inputErr = inputBase + ' border-red-300 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.15)] shadow-sm';
  const errMsg = 'text-[13px] text-red-600 font-bold flex items-center gap-1.5 mt-1';

  return (
    <div className="min-h-screen bg-[#fbf9f6] font-cairo" dir="rtl">

      {/* ── Top bar ───────────────────────────────────────────────────── */}
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
              <h1 className="text-[17px] font-bold text-white">إضافة مزرعة جديدة</h1>
              <p className="text-[11px] text-white/60 font-medium">تسجيل منشأة جديدة في نظام الإدارة</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[12px] text-white font-bold bg-white/15 border border-white/20 px-3 py-1.5 rounded-full">
            <Leaf className="w-3.5 h-3.5" />
            مزرعة جديدة
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* ── Success & Error States ────────────────────────────────────── */}
        {error?.farms && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium shadow-sm">
            <X className="w-4 h-4 flex-shrink-0 text-red-400" />
            {error.farms}
          </div>
        )}

        {submitted && (
          <div className="flex items-center gap-3 p-4 bg-[#154b23]/10 border border-[#154b23]/20 rounded-2xl text-[#154b23] text-sm font-bold shadow-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#154b23]" />
            تم إضافة المزرعة بنجاح! جاري التحويل...
          </div>
        )}

        {/* ── Main Unified Card ───────────────────────────────────── */}
        <div className="bg-[#f2f8f3] rounded-[32px] shadow-sm border border-[#154b23]/10 overflow-hidden">
          {/* Header Area */}
          <div className="relative bg-[#154b23] px-8 py-10 text-white">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-[28px] font-bold mb-2">بيانات المزرعة</h2>
                <p className="text-white/80 text-[15px] leading-relaxed">
                  أدخل تفاصيل المزرعة لإضافتها لنظام المراقبة والذكاء الاصطناعي بكل سهولة.
                </p>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Farm name */}
                <div className={`${fieldWrap} md:col-span-1`}>
                  <label className={label}>
                    اسم المزرعة
                    <span className="text-red-500 text-sm">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: مزرعة الأمل الحديثة..."
                    className={errors.name ? inputErr : inputOk}
                    {...register('name', {
                      required: 'اسم المزرعة مطلوب',
                      minLength: { value: 2, message: 'الاسم قصير جداً' },
                      maxLength: { value: 150, message: 'الاسم طويل جداً' },
                    })}
                  />
                  {errors.name && (
                    <p className={errMsg}>
                      <X className="w-3.5 h-3.5" />{errors.name.message}
                    </p>
                  )}
                </div>

                {/* Governorate */}
                <div className={`${fieldWrap} md:col-span-1`}>
                  <label className={label}>
                    المحافظة
                    <span className="text-red-500 text-sm">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className={`${errors.governorate ? inputErr : inputOk} appearance-none pr-4 pl-12 cursor-pointer`}
                      {...register('governorate', { required: 'يرجى اختيار المحافظة' })}
                    >
                      <option value="">اختر المحافظة...</option>
                      {GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                  {errors.governorate && (
                    <p className={errMsg}>
                      <X className="w-3.5 h-3.5" />{errors.governorate.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className={`${fieldWrap} md:col-span-2`}>
                  <label className={label}>
                    وصف المزرعة <span className="text-gray-500 font-normal text-sm mr-1">(اختياري)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="تفاصيل إضافية عن المزرعة، التخصص، السعة الاستيعابية..."
                    className={`${errors.description ? inputErr : inputOk} resize-none`}
                    {...register('description', {
                      maxLength: { value: 500, message: 'الوصف طويل جداً' },
                    })}
                  />
                  <div className="flex items-center justify-between mt-2">
                    {errors.description ? (
                      <p className={errMsg}><X className="w-3.5 h-3.5" />{errors.description.message}</p>
                    ) : <span />}
                    <span className={`text-[13px] font-bold ${descValue.length > 450 ? 'text-orange-500' : 'text-gray-500'}`}>
                      {descValue.length} / 500
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-4 pt-8 mt-8 border-t border-[#154b23]/10">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-8 py-3.5 rounded-2xl text-[15px] font-bold text-gray-600 hover:bg-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading?.farms || submitted}
                  className="flex items-center gap-2 px-10 py-3.5 bg-[#154b23] text-white rounded-2xl text-[15px] font-bold hover:bg-[#0f3619] active:scale-95 transition-all shadow-lg shadow-[#154b23]/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading?.farms ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : submitted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      تم الحفظ
                    </>
                  ) : (
                    <>
                      <pageXOffset className="w-5 h-5" />
                      إضافة
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddFarmPage;
