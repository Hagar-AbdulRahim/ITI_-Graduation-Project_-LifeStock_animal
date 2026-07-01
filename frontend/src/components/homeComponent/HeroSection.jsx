import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import hero from '../../assets/images/hero.jpg'

const HeroSection = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { farms } = useSelector((state) => state.farm || { farms: [] })
  const firstFarmId = farms && farms.length > 0 ? farms[0]._id : null;

  return (
    <section className="relative w-full bg-[#f8f8f5] pt-12 pb-24 px-6 overflow-visible flex items-center min-h-[90vh]">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">

        {/* Left Column (RTL: Text content) — now visually on the RIGHT side */}
        <div
          className="w-full text-right order-1 lg:order-1 flex flex-col items-end"
          data-aos="fade-left"
          data-aos-duration="800"
          data-aos-once="true"
        >
          {/* Green badge */}
<div className="inline-flex self-start items-center gap-2 bg-[#e8f3ec] text-[#1b4d2c] text-xs font-bold px-4 py-2 rounded-full mb-6">            <span className="w-1.5 h-1.5 rounded-full bg-[#1b4d2c] inline-block animate-pulse"></span>
            <span>مراعاة مستمرة لقطيعك، على مدار الساعة</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a1a] leading-[1.15] mb-6 max-w-xl">
            ذكاء اصطناعي يراقب صحة <span className="text-[#1b4d2c]">قطيعك</span> قبل أن تراها أنت
          </h1>

          {/* Description */}
          <p className="text-[#555555] text-sm md:text-base leading-relaxed mb-8 max-w-lg">
            منصة واحدة تجمع التشخيص الذكي، تحليل الصور، ومساعد صوتي يفهم لهجتك، لتطلع على حالة كل حيوان في قطيعك لحظة بلحظة، وتتصرف قبل أن تتحول الملاحظة الصغيرة إلى خسارة كبيرة.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 justify-end w-full">
            {/* Play Button Option */}
            <button
              onClick={() => {
                if (isAuthenticated) {
                  navigate(firstFarmId ? `/farms/${firstFarmId}/ai-assistant` : '/farms');
                } else {
                  navigate('/login');
                }
              }}
              className="flex items-center gap-2.5 font-bold text-sm px-7 py-3.5 rounded-full transition-all duration-300 shadow-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[#1a1a1a] bg-white cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[#1a1a1a]">
                <svg className="w-2.5 h-2.5 fill-current mr-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span>شاهد كيف نعمل</span>
            </button>

            {/* Main Green Start Button */}
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-[#1b4d2c] hover:bg-[#153b22] text-white font-bold text-sm px-7 py-3.5 rounded-full transition-all duration-300 shadow-lg shadow-green-900/10 hover:shadow-xl hover:shadow-green-900/20 cursor-pointer group"
            >
              <span>ابدأ تجربتك المجانية</span>
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Column (RTL: visual illustration) — now visually on the LEFT side */}
        <div
          className="relative w-full flex justify-center order-2 lg:order-2 overflow-visible"
          data-aos="fade-right"
          data-aos-duration="800"
          data-aos-once="true"
        >
          {/* Main Card - background image instead of solid green */}
          <div
            className="relative w-full max-w-[480px] h-[360px] md:h-[400px] rounded-[32px] shadow-2xl shadow-green-950/20 overflow-visible flex items-center justify-center p-8 bg-cover bg-center"
            style={{ backgroundImage: `url(${hero})` }}
          >

            {/* Abstract Floating Dashboard Cards inside the container */}
            <div className="absolute top-[15%] right-[10%] w-[35%] h-[20%] bg-white/5 rounded-2xl border border-white/10" />
            <div className="absolute top-[40%] left-[10%] w-[40%] h-[20%] bg-white/5 rounded-2xl border border-white/10" />
            <div className="absolute bottom-[25%] right-[15%] w-[45%] h-[20%] bg-white/5 rounded-2xl border border-white/10" />
            <div className="absolute bottom-[45%] left-[25%] w-[25%] h-[15%] bg-white/5 rounded-2xl border border-white/10" />

            {/* Bottom floating status widget */}
            <div className="absolute -bottom-8 left-[10%] w-[80%] bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col justify-between text-right z-20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span className="text-gray-400 text-xs font-semibold">حالة القطيع الآن</span>
              </div>
              <h4 className="text-2xl font-black text-[#1b4d2c] leading-none mb-1.5">
                97.4% سليمة
              </h4>
              <p className="text-gray-400 text-[10px]">
                تحديث تلقائي كل دقيقتين
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Heartbeat SVG Line at the bottom */}
      <div className="absolute bottom-4 left-0 right-0 h-14 flex items-center justify-center opacity-15 overflow-hidden pointer-events-none">
        <svg className="w-full h-full text-[#1b4d2c]" viewBox="0 0 1000 100" fill="none" preserveAspectRatio="none">
          <path d="M0,50 L200,50 L220,50 L230,25 L240,75 L250,15 L260,85 L270,40 L285,60 L295,50 L305,50 L1000,50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  )
}

export default HeroSection