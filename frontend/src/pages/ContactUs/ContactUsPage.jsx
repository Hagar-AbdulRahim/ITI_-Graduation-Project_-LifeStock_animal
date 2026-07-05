import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Phone, MapPin, Clock, Send, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { submitContactMessage, resetContactState } from '../../redux/contactSlice';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const ContactUsPage = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.contact);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => () => { dispatch(resetContactState()); }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('تم إرسال رسالتك بنجاح، سنتواصل معك قريباً');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setValidationErrors({});
      dispatch(resetContactState());
    }
    if (error) toast.error(error);
  }, [success, error, dispatch]);

  const validate = () => {
    const e = {};
    if (!formData.name.trim())    e.name    = 'الاسم مطلوب';
    if (!formData.email.trim())   e.email   = 'البريد الإلكتروني مطلوب';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) e.email = 'بريد إلكتروني غير صحيح';
    if (!formData.subject.trim()) e.subject = 'الموضوع مطلوب';
    if (!formData.message.trim()) e.message = 'الرسالة مطلوبة';
    else if (formData.message.trim().length < 10) e.message = 'الرسالة قصيرة جداً (10 أحرف على الأقل)';
    setValidationErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (validationErrors[name]) setValidationErrors((p) => ({ ...p, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) dispatch(submitContactMessage(formData));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-cairo" dir="rtl">
      
      {/* ─── Hero Section ─── */}
      <div className="bg-[#1b4d2c] pt-20 pb-36 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"></div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
          {/* Soft Back Button */}
          <div className="w-full flex justify-start mb-6 px-2 md:px-0">
            <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm transition-all text-sm font-bold group border border-white/5">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              الرئيسية
            </Link>
          </div>

          <div className="max-w-4xl text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              تواصل معنا
            </h1>
          <p className="text-green-50 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed opacity-90 px-2 mt-4">
            فريقنا هنا لمساعدتك. تواصل معنا لأي استفسارات، اقتراحات، أو لطلب دعم فني بخصوص منصة رعاية.
          </p>
          </div>
        </div>
      </div>

      {/* ─── Main Content Container (Overlapping Unified Card) ─── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 -mt-20 pb-16 relative z-20">
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-stone-200 overflow-hidden flex flex-col lg:flex-row border border-stone-100">
          
          {/* ─── Right Panel: Contact Info (Dark Green) ─── */}
          <div className="lg:w-[40%] bg-[#12361e] p-8 md:p-10 lg:p-12 text-white relative overflow-hidden flex flex-col justify-between">
            {/* Geometric Accent Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            
            {/* Top Section */}
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-3 text-white">معلومات التواصل</h3>
              <p className="text-green-200/80 text-[15px] mb-12 leading-relaxed pr-1">
                املأ النموذج وسيقوم فريق الدعم الفني بالرد عليك في غضون 24 ساعة، أو تواصل معنا مباشرة عبر:
              </p>

              <div className="space-y-8">
                {[
                  { Icon: Phone,  title: 'اتصل بنا',        value: '01201277463' },
                  { Icon: Mail,   title: 'راسلنا',          value: 'sahmah227@gmail.com' },
                  { Icon: MapPin, title: 'قم بزيارتنا',     value: 'أسيوط، جمهورية مصر العربية' },
                ].map(({ Icon, title, value }) => (
                  <div key={title} className="flex items-center gap-5 group">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-white/20">
                      <Icon className="w-5 h-5 text-green-300" />
                    </div>
                    <div>
                      <p className="text-green-300/80 text-[13px] mb-0.5">{title}</p>
                      <p className="text-white font-bold text-[15px]">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom decorative element to fill space instead of social media */}
            <div className="relative z-10 mt-16 pt-8 border-t border-white/10">
              <p className="text-green-400 text-xs text-center font-bold tracking-widest uppercase">منصة رعاية للمواشي</p>
            </div>
          </div>

          {/* ─── Left Panel: The Form (White) ─── */}
          <div className="lg:w-[60%] p-6 sm:p-8 md:p-10 lg:p-14 bg-white relative">
            <h2 className="text-2xl lg:text-3xl font-black text-stone-900 mb-2">أرسل رسالة</h2>
            <p className="text-stone-500 text-[15px] mb-8">نحن نتطلع للاستماع إليك ومساعدتك.</p>

            {error && (
              <div className="flex items-center gap-3 p-4 mb-8 bg-red-50 border border-red-100 rounded-xl text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-[14px] font-bold">{error}</p>
              </div>
            )}

            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center py-16 text-center h-[70%]">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 border border-stone-200">
                  <Send className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-xl font-black text-stone-900 mb-3">يجب تسجيل الدخول أولاً</h3>
                <p className="text-stone-500 text-[15px] max-w-sm leading-relaxed mb-8">
                  لضمان جودة المتابعة وسرعة الرد، يرجى تسجيل الدخول إلى حسابك الخاص في منصة رعاية قبل إرسال استفسارك.
                </p>
                <Link to="/login" className="px-8 py-3.5 bg-[#1b4d2c] hover:bg-[#143920] text-white text-[15px] font-bold rounded-xl transition-all shadow-lg shadow-green-900/20">
                  تسجيل الدخول للمتابعة
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[13.5px] font-bold text-stone-700">الاسم بالكامل <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="أحمد محمد"
                      className={`w-full bg-[#f8f9fa] border ${
                        validationErrors.name ? 'border-red-400 focus:ring-red-200' : 'border-stone-200 focus:border-[#1b4d2c] hover:border-stone-300'
                      } rounded-xl px-4 py-3.5 text-[14px] text-stone-900 placeholder:text-stone-400 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-[#1b4d2c]/10`}
                    />
                    {validationErrors.name && <p className="text-red-500 text-[12px] font-bold mt-1">{validationErrors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13.5px] font-bold text-stone-700">البريد الإلكتروني <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@mail.com"
                      dir="ltr"
                      className={`w-full bg-[#f8f9fa] border text-left ${
                        validationErrors.email ? 'border-red-400 focus:ring-red-200' : 'border-stone-200 focus:border-[#1b4d2c] hover:border-stone-300'
                      } rounded-xl px-4 py-3.5 text-[14px] text-stone-900 placeholder:text-stone-400 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-[#1b4d2c]/10`}
                    />
                    {validationErrors.email && <p className="text-red-500 text-[12px] font-bold mt-1">{validationErrors.email}</p>}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-[13.5px] font-bold text-stone-700">موضوع الرسالة <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="استفسار، شكوى، اقتراح..."
                    className={`w-full bg-[#f8f9fa] border ${
                      validationErrors.subject ? 'border-red-400 focus:ring-red-200' : 'border-stone-200 focus:border-[#1b4d2c] hover:border-stone-300'
                    } rounded-xl px-4 py-3.5 text-[14px] text-stone-900 placeholder:text-stone-400 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-[#1b4d2c]/10`}
                  />
                  {validationErrors.subject && <p className="text-red-500 text-[12px] font-bold mt-1">{validationErrors.subject}</p>}
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-[13.5px] font-bold text-stone-700">تفاصيل الرسالة <span className="text-red-500">*</span></label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="اكتب تفاصيل رسالتك أو مشكلتك هنا بوضوح..."
                    rows={5}
                    className={`w-full bg-[#f8f9fa] border ${
                      validationErrors.message ? 'border-red-400 focus:ring-red-200' : 'border-stone-200 focus:border-[#1b4d2c] hover:border-stone-300'
                    } rounded-xl px-4 py-4 text-[14px] text-stone-900 placeholder:text-stone-400 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-[#1b4d2c]/10 resize-none leading-relaxed`}
                  />
                  {validationErrors.message && <p className="text-red-500 text-[12px] font-bold mt-1">{validationErrors.message}</p>}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#1b4d2c] hover:bg-[#143920] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed text-[15px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        إرسال رسالتك الآن
                        <Send className="w-4 h-4 mr-1 rtl:-scale-x-100" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
