import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ChevronLeft, ChevronRight, MessageSquare, Loader2, AlertCircle, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchAllReviews, createReview, deleteReview, clearReviewErrors } from '../../redux/reviewSlice';

// ─── Star Rating Display ──────────────────────────────────────────────────────
const StarDisplay = ({ rating, size = 'sm' }) => {
  const starSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} transition-colors ${
            star <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300 fill-stone-200'
          }`}
        />
      ))}
    </div>
  );
};

// ─── Star Rating Input ────────────────────────────────────────────────────────
const StarInput = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-stone-300 fill-stone-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// ─── User Avatar ──────────────────────────────────────────────────────────────
const UserAvatar = ({ name }) => {
  const colors = [
    'from-emerald-400 to-emerald-600',
    'from-blue-400 to-blue-600',
    'from-violet-400 to-violet-600',
    'from-rose-400 to-rose-600',
    'from-amber-400 to-amber-600',
    'from-teal-400 to-teal-600',
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div
      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white font-black text-lg shadow-md flex-shrink-0`}
    >
      {initial}
    </div>
  );
};

// ─── Review Card ──────────────────────────────────────────────────────────────
const ReviewCard = ({ review, currentUserId, onDelete }) => {
  const isOwner = currentUserId && review.userId === currentUserId;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-[24px] border border-stone-100 shadow-sm p-6 flex flex-col gap-4 h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar name={review.userName} />
          <div>
            <p className="font-bold text-stone-900 text-[15px] leading-tight">{review.userName}</p>
            <p className="text-stone-400 text-[12px] mt-0.5">{formatDate(review.created_at)}</p>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete(review._id)}
            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors flex-shrink-0"
            title="حذف مراجعتك"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Rating */}
      <StarDisplay rating={review.rating} />

      {/* Comment */}
      <p className="text-stone-600 text-sm leading-relaxed flex-1">
        "{review.comment}"
      </p>
    </div>
  );
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-[24px] border border-stone-100 shadow-sm p-6 flex flex-col gap-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-stone-200 rounded-2xl" />
      <div className="flex-1">
        <div className="h-4 bg-stone-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-stone-100 rounded w-1/3" />
      </div>
    </div>
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => <div key={i} className="w-5 h-5 bg-stone-200 rounded" />)}
    </div>
    <div className="space-y-2 flex-1">
      <div className="h-3 bg-stone-100 rounded w-full" />
      <div className="h-3 bg-stone-100 rounded w-5/6" />
      <div className="h-3 bg-stone-100 rounded w-4/6" />
    </div>
  </div>
);

// ─── Main Reviews Page ────────────────────────────────────────────────────────
const ReviewsPage = () => {
  const dispatch = useDispatch();
  const { reviews, loading, error, createLoading, createError, deleteLoading } =
    useSelector((state) => state.reviews);
  const { user } = useSelector((state) => state.auth);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingError, setRatingError] = useState('');

  const CARDS_PER_VIEW = 2;

  useEffect(() => {
    dispatch(fetchAllReviews());
    return () => dispatch(clearReviewErrors());
  }, [dispatch]);

  // Reset slider if reviews shrink
  useEffect(() => {
    const maxIndex = Math.max(0, reviews.length - CARDS_PER_VIEW);
    if (currentIndex > maxIndex) setCurrentIndex(maxIndex);
  }, [reviews.length, currentIndex]);

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < reviews.length - CARDS_PER_VIEW;

  const handlePrev = () => {
    if (canGoPrev) setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (canGoNext) setCurrentIndex((i) => i + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setRatingError('يرجى اختيار تقييم');
      return;
    }
    setRatingError('');

    const result = await dispatch(createReview({ rating, comment }));
    if (createReview.fulfilled.match(result)) {
      toast.success('تم إضافة مراجعتك بنجاح! 🎉');
      setRating(0);
      setComment('');
    } else {
      toast.error(result.payload || 'فشل في إضافة المراجعة');
    }
  };

  const handleDelete = async (id) => {
    const result = await dispatch(deleteReview(id));
    if (deleteReview.fulfilled.match(result)) {
      toast.success('تم حذف المراجعة');
    } else {
      toast.error('فشل في حذف المراجعة');
    }
  };

  const visibleReviews = reviews.slice(currentIndex, currentIndex + CARDS_PER_VIEW);

  return (
    <div className="min-h-screen bg-[#f5f2eb] font-cairo" dir="rtl">
      {/* ── Page Banner ── */}
      <div className="bg-white border-b border-stone-200/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#1b4d2c]/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#1b4d2c]" />
            </div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">
              تقييمات المستخدمين
            </h1>
          </div>
          <p className="text-stone-500 text-[15px] font-medium mt-1 mr-13">
            اقرأ ما يقوله مستخدمونا عن LivestockCare AI
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">

        {/* ── Reviews Slider ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-stone-800">آراء المستخدمين</h2>
            {reviews.length > CARDS_PER_VIEW && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                    canGoPrev
                      ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 shadow-sm'
                      : 'bg-stone-100 border-stone-100 text-stone-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="text-sm text-stone-400 font-medium">
                  {currentIndex + 1} / {Math.max(1, reviews.length - CARDS_PER_VIEW + 1)}
                </span>
                <button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                    canGoNext
                      ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 shadow-sm'
                      : 'bg-stone-100 border-stone-100 text-stone-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && reviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[28px] border border-dashed border-stone-200 text-center">
              <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mb-5">
                <MessageSquare className="w-10 h-10 text-stone-300" />
              </div>
              <p className="text-stone-500 font-bold text-lg mb-1">لا توجد مراجعات بعد</p>
              <p className="text-stone-400 text-sm">كن أول من يشارك رأيه!</p>
            </div>
          )}

          {/* Reviews Cards */}
          {!loading && !error && reviews.length > 0 && (
            <div className="overflow-hidden">
              <div
                className="grid gap-6 transition-all duration-500"
                style={{ gridTemplateColumns: `repeat(${Math.min(CARDS_PER_VIEW, visibleReviews.length)}, 1fr)` }}
              >
                {visibleReviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    currentUserId={user?._id}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Dot indicators */}
          {reviews.length > CARDS_PER_VIEW && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: reviews.length - CARDS_PER_VIEW + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'bg-[#1b4d2c] w-6'
                      : 'bg-stone-300 w-2 hover:bg-stone-400'
                  }`}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Add Review Form ── */}
        {user && (
          <section className="bg-white rounded-[28px] border border-stone-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl bg-[#1b4d2c]/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#1b4d2c]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-900">أضف مراجعتك</h2>
                <p className="text-stone-400 text-sm">
                  مرحباً <span className="font-bold text-stone-600">{user.name}</span> — شاركنا رأيك
                </p>
              </div>
            </div>

            {createError && (
              <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-100 rounded-2xl text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium">{createError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3">
                  التقييم <span className="text-red-500">*</span>
                </label>
                <StarInput value={rating} onChange={setRating} />
                {ratingError && (
                  <p className="text-red-500 text-xs mt-2 font-medium">{ratingError}</p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  التعليق <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="شارك تجربتك مع LivestockCare AI..."
                  rows={4}
                  maxLength={500}
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:ring-4 focus:ring-[#1b4d2c]/10 focus:border-[#1b4d2c] transition-all resize-none leading-relaxed"
                />
                <p className="text-stone-400 text-xs mt-1.5 text-left">
                  {comment.length}/500
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={createLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#1b4d2c] to-[#2a7543] hover:from-[#153e23] hover:to-[#1f5c34] text-white font-bold rounded-2xl transition-all shadow-md shadow-green-900/10 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-[15px]"
              >
                {createLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5" />
                    إرسال المراجعة
                  </>
                )}
              </button>
            </form>
          </section>
        )}

        {/* Not logged in */}
        {!user && (
          <div className="bg-white rounded-[28px] border border-stone-100 shadow-sm p-8 text-center">
            <p className="text-stone-500 font-medium">
              يرجى{' '}
              <a href="/login" className="text-[#1b4d2c] font-bold hover:underline">
                تسجيل الدخول
              </a>{' '}
              لإضافة مراجعتك.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
