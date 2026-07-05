import React from 'react'
import { useNavigate } from 'react-router-dom'
import ctaBg from '../../assets/images/cta-bg.jpg'

const CTASection = () => {
  const navigate = useNavigate()

  const handleContactClick = () => {
    navigate('/contact')
  }

  return (
    <section className="bg-[#f8f8f5] py-16 px-6" id="cta">
      <div className="max-w-5xl mx-auto" data-aos="zoom-in" data-aos-duration="700" data-aos-once="true">
        <div
          className="rounded-[32px] px-8 py-16 md:py-20 text-center shadow-xl shadow-green-950/10 flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(27, 77, 44, 0.85), rgba(27, 77, 44, 0.85)), url(${ctaBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-snug">
            هل لديك أي استفسارات أو تحتاج إلى مساعدة؟
          </h2>

          {/* Description */}
          <p className="text-green-100 text-sm md:text-base mb-10 max-w-xl mx-auto leading-relaxed opacity-90">
            فريق الدعم الفني لدينا متاح دائماً للرد على أسئلتك، تقديم الدعم، أو الاستماع إلى اقتراحاتك لتطوير مزرعتك بذكاء.
          </p>

          {/* Single CTA Button */}
          <button
            onClick={handleContactClick}
            className="text-[#1b4d2c] bg-white hover:bg-gray-100 font-extrabold text-sm px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:scale-[1.01] cursor-pointer"
          >
            تواصل معنا
          </button>
        </div>
      </div>
    </section>
  )
}

export default CTASection
