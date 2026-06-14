import React from 'react'
import { useNavigate } from 'react-router-dom'
import StatsBar from './StatsBar'
import heroBg from '@/assets/images/heroBg.jpg'

const HeroSection = () => {
  const navigate = useNavigate()

  return (
    <section
      className="relative w-full min-h-screen flex items-center"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Light overlay — reduced opacity so the image is more vivid */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(246,246,241,0.45)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-24 pb-16">
        {/* Right-aligned content */}
        <div className="max-w-xl mr-0 ml-auto md:mr-0 md:ml-auto text-right">
          {/* Green badge */}
          <div
            className="inline-flex items-center gap-2 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
            style={{ backgroundColor: '#1F5C34' }}
          >
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#4CAF50' }}></span>
            <span>ذكاء اصطناعي لرعاية الأثروة الحيوانية</span>
          </div>

          {/* Main title */}
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4" style={{ color: '#1a1a1a' }}>
            مساعد ذكي لصحة الثروة الحيوانية
          </h1>

          {/* Subtitle */}
          <p className="text-sm leading-relaxed mb-8 max-w-md mr-0 ml-auto" style={{ color: '#444' }}>
            يجمع النظام بين العقل البشري والذكاء الاصطناعي، يوفر بيانات موثوقة بالذكاء الاصطناعي لتشخيص وتحسين صحة حيوانك بدقة لا مثيل لها.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
              style={{ backgroundColor: '#1F5C34' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#174a29')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1F5C34')}
            >
              <span>ابدأ الآن</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/farms')}
              className="flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              style={{ backgroundColor: '#ffffff', color: '#1F5C34', border: '2px solid #1F5C34' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1F5C34'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.color = '#1F5C34'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>جرب المساعد الذكي</span>
            </button>
          </div>

          {/* Stats */}
          <StatsBar />
        </div>
      </div>
    </section>
  )
}

export default HeroSection
