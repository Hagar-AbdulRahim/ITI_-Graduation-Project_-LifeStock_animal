import React from 'react'
import StatsBar from './StatsBar'
import heroBg from '@/assets/images/heroBg.jpg'

const HeroSection = () => {
  return (
    <section
      className="relative w-full min-h-screen flex items-center"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Light overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(246,246,241,0.72)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-24 pb-16">
        {/* Right-aligned content */}
        <div className="max-w-xl mr-0 ml-auto md:mr-0 md:ml-auto text-right">
          {/* Green badge */}
          <div className="inline-flex items-center gap-2 bg-dark-green text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-2 h-2 bg-primary-green rounded-full inline-block"></span>
            <span>ذكاء اصطناعي لرعاية الأثروة الحيوانية</span>
          </div>

          {/* Main title */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-dark leading-tight mb-4">
            مساعد ذكي لصحة الثروة الحيوانية
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-text-gray leading-relaxed mb-8 max-w-md mr-0 ml-auto">
            يجمع النظام بين العقل البشري والذكاء الاصطناعي، يوفر بيانات موثوقة بالذكاء الاصطناعي لتشخيص وتحسين صحة حيوانك بدقة لا مثيل لها.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 justify-end">
            <button className="flex items-center gap-2 bg-dark-green text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all">
              <span>ابدأ الآن</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </button>
            <button className="flex items-center gap-2 border border-dark-green text-dark-green font-semibold text-sm px-6 py-3 rounded-lg hover:bg-dark-green hover:text-white transition-all bg-white bg-opacity-60">
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
