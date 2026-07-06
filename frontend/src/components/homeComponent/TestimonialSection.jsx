import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllReviews } from '../../redux/reviewSlice'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const TestimonialCard = ({ t, index }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div 
      className="w-full max-w-[260px] aspect-square mx-auto cursor-pointer py-4"
      style={{ perspective: '1000px' }}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        whileHover={{ 
          scale: 1.05, 
          y: -8,
        }}
      >
        {/* FRONT SIDE */}
        <div
          className="w-full h-full absolute inset-0 rounded-full p-6 flex flex-col items-center justify-center text-center bg-white hover:bg-[#1b4d2c] group border border-gray-100/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(27,77,44,0.16)] transition-all duration-300"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1b4d2c] to-[#2a7543] group-hover:from-white group-hover:to-stone-100 group-hover:text-[#1b4d2c] flex items-center justify-center text-white font-black text-lg shadow-sm mb-3 transition-all duration-300 flex-shrink-0">
            {t.userName ? t.userName.charAt(0).toUpperCase() : '?'}
          </div>

          {/* Name & Date */}
          <div className="space-y-1 mb-2 max-w-full">
            <p className="font-bold text-stone-900 group-hover:text-white text-[15px] leading-tight truncate px-2 transition-colors duration-300">
              {t.userName}
            </p>
            <p className="text-stone-400 group-hover:text-stone-300 text-[11px] transition-colors duration-300">
              {t.created_at ? new Date(t.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </p>
          </div>

          {/* Rating */}
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg 
                key={star} 
                className={`w-3.5 h-3.5 transition-all duration-300 ${
                  star <= (t.rating || 5) 
                    ? 'text-amber-400 fill-amber-400 group-hover:text-amber-300 group-hover:fill-amber-300' 
                    : 'text-stone-200 fill-stone-200 group-hover:text-white/20 group-hover:fill-white/20'
                }`} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>

          {/* Styled Button to Flip */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(true);
            }}
            className="px-4 py-1.5 bg-[#1b4d2c] group-hover:bg-white text-white group-hover:text-[#1b4d2c] text-[11px] font-black rounded-full border border-[#1b4d2c] group-hover:border-white shadow-sm hover:scale-105 active:scale-95 transition-all duration-300"
          >
            انقر لقراءة الرأي
          </button>
        </div>

        {/* BACK SIDE */}
        <div
          className="w-full h-full absolute inset-0 rounded-full p-8 flex flex-col items-center justify-center text-center bg-white hover:bg-[#1b4d2c] group border border-gray-100/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(27,77,44,0.16)] transition-all duration-300"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Quote mark */}
          <span className="text-3xl font-serif text-[#1b4d2c] group-hover:text-white/30 h-6 block leading-none mb-1">
            ”
          </span>
          
          <p className="text-stone-600 group-hover:text-white/90 text-[12px] leading-relaxed flex-1 flex items-center justify-center px-1 line-clamp-6 transition-colors duration-300">
            "{t.comment}"
          </p>
        </div>
      </motion.div>
    </div>
  )
}

const TestimonialSection = () => {
  const dispatch = useDispatch()
  const { reviews, loading } = useSelector((state) => state.reviews)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(4)

  useEffect(() => {
    dispatch(fetchAllReviews())
  }, [dispatch])

  // Handle responsiveness dynamically for the carousel view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1)
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2)
      } else if (window.innerWidth < 1280) {
        setCardsPerView(3)
      } else {
        setCardsPerView(4)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const maxIndex = Math.max(0, reviews.length - cardsPerView)
    if (currentIndex > maxIndex) setCurrentIndex(maxIndex)
  }, [reviews.length, currentIndex, cardsPerView])

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < reviews.length - cardsPerView

  const handlePrev = () => {
    if (canGoPrev) setCurrentIndex((i) => i - 1)
  }

  const handleNext = () => {
    if (canGoNext) setCurrentIndex((i) => i + 1)
  }

  const visibleReviews = reviews.slice(currentIndex, currentIndex + cardsPerView)

  return (
    <section className="bg-[#f8f8f5] py-20 px-6 overflow-hidden" id="testimonials">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Navigation */}
        <div className="flex items-center justify-end mb-8" dir="rtl">
          {/* Navigation Arrows (Only show if reviews length exceeds current view limit) */}
          {reviews.length > cardsPerView && (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border ${
                  canGoPrev
                    ? 'bg-white border-stone-200 text-[#1b4d2c] hover:bg-stone-50 shadow-sm hover:scale-105 active:scale-95'
                    : 'bg-stone-100 border-stone-100 text-stone-300 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border ${
                  canGoNext
                    ? 'bg-white border-stone-200 text-[#1b4d2c] hover:bg-stone-50 shadow-sm hover:scale-105 active:scale-95'
                    : 'bg-stone-100 border-stone-100 text-stone-300 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Testimonials Grid */}
        <div className="overflow-visible py-8" dir="rtl">
          {reviews.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-3xl border border-gray-100">
              لا توجد مراجعات حتى الآن.
            </div>
          ) : (
            <div 
              className="grid gap-6 transition-all duration-500"
              style={{ gridTemplateColumns: `repeat(${Math.min(cardsPerView, visibleReviews.length || 1)}, minmax(0, 1fr))` }}
            >
              {visibleReviews.map((t, index) => (
                <TestimonialCard key={t._id || index} t={t} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Add Review Button */}
        <div className="mt-14 flex justify-center">
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
