import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllReviews } from '../../redux/reviewSlice'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const TestimonialSection = () => {
  const dispatch = useDispatch()
  const { reviews, loading } = useSelector((state) => state.reviews)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const CARDS_PER_VIEW = 3

  useEffect(() => {
    // Only fetch if empty to save network calls on landing, or fetch always
    dispatch(fetchAllReviews())
  }, [dispatch])

  useEffect(() => {
    const maxIndex = Math.max(0, reviews.length - CARDS_PER_VIEW)
    if (currentIndex > maxIndex) setCurrentIndex(maxIndex)
  }, [reviews.length, currentIndex])

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < reviews.length - CARDS_PER_VIEW

  const handlePrev = () => {
    if (canGoPrev) setCurrentIndex((i) => i - 1)
  }

  const handleNext = () => {
    if (canGoNext) setCurrentIndex((i) => i + 1)
  }

  const visibleReviews = reviews.slice(currentIndex, currentIndex + CARDS_PER_VIEW)

  return (
    <section className="bg-[#f8f8f5] py-20 px-6 overflow-hidden" id="testimonials">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Navigation (Heading removed as requested) */}
        <div className="flex items-center justify-end mb-12" dir="rtl" data-aos="fade-up" data-aos-duration="700" data-aos-once="true">

          {/* Navigation Arrows (Only show if more than 3) */}
          {reviews.length > CARDS_PER_VIEW && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                  canGoPrev
                    ? 'bg-white border-stone-200 text-[#1b4d2c] hover:bg-stone-50 shadow-sm hover:scale-105'
                    : 'bg-stone-100 border-stone-100 text-stone-300 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                  canGoNext
                    ? 'bg-white border-stone-200 text-[#1b4d2c] hover:bg-stone-50 shadow-sm hover:scale-105'
                    : 'bg-stone-100 border-stone-100 text-stone-300 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Testimonials Grid */}
        <div className="overflow-hidden" dir="rtl">
          {reviews.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-10 bg-white rounded-3xl border border-gray-100">
              لا توجد مراجعات حتى الآن.
            </div>
          ) : (
            <div 
              className="grid gap-6 transition-all duration-500"
              style={{ gridTemplateColumns: `repeat(${Math.min(CARDS_PER_VIEW, visibleReviews.length || 3)}, minmax(0, 1fr))` }}
            >
              {visibleReviews.map((t, index) => (
                <div
                  key={t._id || index}
                  className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-100/60 hover:shadow-[0_12px_40px_rgba(27,77,44,0.08)] hover:-translate-y-1.5 hover:border-[#1b4d2c]/20 transition-all duration-300 text-right flex flex-col justify-between min-h-[220px] cursor-pointer"
                  data-aos="fade-up"
                  data-aos-duration="600"
                  data-aos-delay={index * 120}
                  data-aos-once="true"
                >
                  {/* Header: Avatar, Name, Date */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1b4d2c] to-[#2a7543] flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0">
                      {t.userName ? t.userName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 text-[15px] leading-tight truncate max-w-[150px]">{t.userName}</p>
                      <p className="text-stone-400 text-[12px] mt-0.5">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex justify-start gap-1 mt-4 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`w-4 h-4 ${star <= (t.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-stone-600 text-sm leading-relaxed flex-1 mt-1 line-clamp-4">
                    "{t.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Review Button */}
        <div className="mt-14 flex justify-center" data-aos="fade-up" data-aos-duration="700" data-aos-delay="200" data-aos-once="true">
          <Link
            to="/reviews"
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#1b4d2c] to-[#2a7543] hover:from-[#153e23] hover:to-[#1f5c34] text-white font-bold rounded-2xl transition-all shadow-md shadow-green-900/10 hover:-translate-y-1 active:translate-y-0 text-[16px]"
          >
            أعطنا رأيك
          </Link>
        </div>
      </div>
    </section>
  )
}

export default TestimonialSection
