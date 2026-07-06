import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Loader2, AlertCircle, CheckCircle2, ArrowRight, MessageSquareHeart, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchAllReviews, createReview, clearReviewErrors } from '../../redux/reviewSlice';
import { Link, useNavigate } from 'react-router-dom';

const LABELS = ['اضغط للتقييم', 'سيء جداً', 'سيء', 'جيد', 'جيد جداً', 'ممتاز!'];

const ReviewsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reviews, createLoading, createError } = useSelector((s) => s.reviews);
  const { user } = useSelector((s) => s.auth);

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    dispatch(fetchAllReviews());
    return () => dispatch(clearReviewErrors());
  }, [dispatch]);

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setRatingError('يرجى اختيار تقييم بالنجوم'); return; }
    if (!comment.trim() || comment.trim().length < 10) {
      toast.error('يرجى كتابة تعليق لا يقل عن 10 أحرف');
      return;
    }
    setRatingError('');
    const result = await dispatch(createReview({ rating, comment }));
    if (createReview.fulfilled.match(result)) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-cairo" dir="rtl">
      
      {/* ─── Hero Section ─── */}
      <div className="bg-[#1b4d2c] pt-20 pb-36 px-4 md:px-6 relative overflow-hidden">
        {/* Abstract Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
          {/* Back Button */}
          <div className="w-full flex justify-start mb-6 px-2 md:px-0">
            <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm transition-all text-sm font-bold group border border-white/5">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              الرئيسية
            </Link>
          </div>

          <div className="max-w-4xl text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              أعطنا رأيك
            </h1>
            <p className="text-green-50 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed opacity-90 px-2 mt-2">
              نسعى دائماً لتقديم الأفضل. شاركنا تجربتك وساعدنا في تطوير منصة رعاية لتلبي تطلعاتك.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Main Content Container (Overlapping Split Card) ─── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 -mt-20 pb-16 relative z-20">
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-stone-200 overflow-hidden flex flex-col lg:flex-row border border-stone-100 min-h-[500px]">
          
          {/* ─── Right Panel: Info & Stats (Dark Green) ─── */}
          <div className="lg:w-[40%] bg-[#12361e] p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden flex flex-col justify-center">
            {/* Geometric Accent Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            
            <div className="relative z-10 text-center lg:text-right">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 backdrop-blur-sm border border-white/10 shadow-lg">
                <MessageSquareHeart className="w-8 h-8 text-green-300" />
              </div>
              
              <h3 className="text-2xl lg:text-3xl font-black mb-4 text-white leading-tight">رأيك يصنع <br className="hidden lg:block"/> الفرق الحقيقي</h3>
              <p className="text-green-200/90 text-[15px] mb-12 leading-relaxed max-w-sm mx-auto lg:mx-0">
                كل تقييم تكتبه يتم دراسته بعناية من قبل فريقنا لتحسين جودة الخدمات وتطوير ميزات جديدة تخدم المربين بشكل أفضل.
              </p>

              {/* Stats Box */}
              <div className="bg-[#184226] border border-white/10 rounded-2xl p-6 flex items-center justify-center lg:justify-start gap-6 shadow-inner">
                <div className="text-center">
                  <p className="text-3xl font-black text-amber-400">{avgRating}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(Number(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-white/20 fill-white/10'}`} />)}
                  </div>
                </div>
                <div className="w-px h-12 bg-white/10"></div>
                <div>
                  <p className="text-2xl font-black text-white">{reviews.length}</p>
                  <p className="text-green-300/80 text-[13px] mt-0.5 font-bold">تقييم حتى الآن</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Left Panel: Form / States (White) ─── */}
          <div className="lg:w-[60%] p-6 sm:p-8 md:p-10 lg:p-14 bg-white relative flex flex-col justify-center">
            
            {!user ? (
              /* Not Logged In State */
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-100 shadow-sm">
                  <Lock className="w-8 h-8 text-stone-400" />
                </div>
                <h2 className="text-2xl font-black text-stone-900 mb-3">سجّل دخولك للمشاركة</h2>
                <p className="text-stone-500 text-[15px] leading-relaxed max-w-sm mx-auto mb-8">
                  لضمان شفافية التقييمات، يرجى تسجيل الدخول إلى حسابك أولاً لتتمكن من مشاركة رأيك معنا.
                </p>
                <Link to="/login" className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1b4d2c] hover:bg-[#143920] text-white text-[15px] font-bold rounded-xl transition-all shadow-lg shadow-[#1b4d2c]/20 hover:-translate-y-0.5 w-full sm:w-auto">
                  تسجيل الدخول الآن
                </Link>
                <div className="mt-5 text-sm text-stone-400 font-medium">
                  مستخدم جديد؟ <Link to="/register" className="text-[#1b4d2c] font-black hover:underline">إنشاء حساب</Link>
                </div>
              </div>

            ) : submitted ? (
              /* Success State */
              <div className="text-center py-10">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="w-24 h-24 bg-[#f5fbf7] rounded-full flex items-center justify-center relative z-10 border border-[#1b4d2c]/10">
                    <CheckCircle2 className="w-12 h-12 text-[#1b4d2c]" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-[#1b4d2c]/20 animate-ping"></div>
                </div>
                <h2 className="text-2xl font-black text-stone-900 mb-3">شكراً لك، {user.name}!</h2>
                <p className="text-stone-500 text-[15px] leading-relaxed max-w-sm mx-auto mb-10">
                  تم حفظ تقييمك بنجاح. رأيك يعني لنا الكثير ويساعدنا في الاستمرار بتقديم الأفضل.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button onClick={() => { setSubmitted(false); setRating(0); setComment(''); }} className="w-full sm:w-auto px-6 py-3.5 bg-white border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700 font-bold rounded-xl transition-all text-[14px]">
                    تقييم آخر
                  </button>
                  <Link to="/" className="w-full sm:w-auto px-8 py-3.5 bg-[#1b4d2c] hover:bg-[#143920] text-white font-bold rounded-xl transition-all shadow-md text-[14px] hover:-translate-y-0.5">
                    الرئيسية
                  </Link>
                </div>
              </div>

            ) : (
              /* The Form */
              <form onSubmit={handleSubmit} className="flex flex-col h-full justify-center">
                <div className="mb-8">
                  <h2 className="text-2xl lg:text-3xl font-black text-stone-900 mb-2">شاركنا تجربتك</h2>
                  <p className="text-stone-500 text-[15px]">
                    أهلاً بك <span className="font-bold text-[#1b4d2c]">{user.name}</span>، كيف تقيم منصة رعاية؟
                  </p>
                </div>

                {/* Star Rating */}
                <div className="mb-8">
                  <label className="block text-[13.5px] font-bold text-stone-700 mb-3">التقييم العام <span className="text-red-500">*</span></label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex flex-row-reverse justify-end gap-1 sm:gap-1.5" dir="ltr">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (hovered || rating);
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => { setRating(star); setRatingError(''); }}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            className="focus:outline-none transition-transform hover:scale-110 active:scale-95 p-1"
                          >
                            <Star
                              className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-200 ${
                                isFilled ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-stone-200 fill-stone-100'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    {/* Dynamic Label */}
                    <span className={`text-[14px] font-bold px-4 py-1.5 rounded-full transition-all ${
                      (hovered || rating) ? 'bg-amber-50 text-amber-700 opacity-100' : 'bg-stone-50 text-stone-400 opacity-0'
                    }`}>
                      {LABELS[hovered || rating]}
                    </span>
                  </div>
                  {ratingError && <p className="text-red-500 text-[12px] font-bold mt-2">{ratingError}</p>}
                </div>

                {/* Comment Textarea */}
                <div className="mb-8 space-y-1.5">
                  <div className="flex justify-between items-end">
                    <label className="text-[13.5px] font-bold text-stone-700">تفاصيل التقييم <span className="text-red-500">*</span></label>
                    <span className={`text-[12px] font-bold ${comment.length >= 10 ? 'text-green-600' : 'text-stone-400'}`}>
                      {comment.length}/500
                    </span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="ما الذي أعجبك؟ وما الذي تقترح علينا تحسينه؟ (10 أحرف على الأقل)"
                    rows={4}
                    maxLength={500}
                    className="w-full bg-[#f8f9fa] border border-stone-200 hover:border-stone-300 focus:border-[#1b4d2c] focus:bg-white focus:ring-4 focus:ring-[#1b4d2c]/10 rounded-xl px-5 py-4 text-[14px] text-stone-900 placeholder:text-stone-400 outline-none transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Error Banner */}
                {createError && (
                  <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-100 rounded-xl text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-[13.5px] font-bold">{createError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={createLoading}
                  className={`w-full flex items-center justify-center gap-2 py-4 font-bold rounded-xl transition-all text-[15px] mt-auto ${
                    createLoading
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : 'bg-[#1b4d2c] hover:bg-[#143920] text-white shadow-lg shadow-[#1b4d2c]/20 hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  {createLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> جاري الإرسال...</>
                  ) : (
                    'إرسال التقييم'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
