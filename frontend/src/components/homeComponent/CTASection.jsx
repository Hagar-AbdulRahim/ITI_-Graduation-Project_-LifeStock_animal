import React from 'react'
import { useNavigate } from 'react-router-dom'

const CTASection = () => {
  const navigate = useNavigate()

  return (
    <section style={{ backgroundColor: '#f6f6f1' }} className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-3xl px-12 py-16 text-center"
          style={{ backgroundColor: '#1F5C34' }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            جاهز لتحديث صحة قطيعك؟
          </h2>
          <p className="text-sm mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: '#a5d6a7' }}>
            انضم إلى آلاف الأطباء البيطريين والمزارعين الذين يستخدمون النظام للحفاظ على قطعانهم بصحة متميزة.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-white font-semibold text-sm px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
              style={{ backgroundColor: '#4CAF50' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#43A047')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
            >
              ابدأ التجربة المجانية
            </button>
            <a
              href="mailto:LivestockSupport2026@gmail.com"
              className="font-semibold text-sm px-8 py-3 rounded-xl transition-all duration-200 cursor-pointer inline-block"
              style={{ border: '2px solid #ffffff', color: '#ffffff', backgroundColor: 'transparent', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              تواصل معنا
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
