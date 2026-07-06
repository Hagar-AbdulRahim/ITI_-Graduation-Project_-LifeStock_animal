import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import heroVideo from '../../assets/videos/hero-bg.mp4'
const HeroSection = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { farms } = useSelector((state) => state.farm || { farms: [] })
  const firstFarmId = farms && farms.length > 0 ? farms[0]._id : null;
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{ zIndex: 0 }}
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      {/* Dark Overlay (45%) */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)', zIndex: 1 }}
      />
      {/* Subtle green gradient overlay for brand feel */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(27,77,44,0.25) 0%, transparent 50%, rgba(27,77,44,0.15) 100%)',
          zIndex: 2,
        }}
      />
      {/* Hero Content — centered on top of video */}
      <div
        className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center flex flex-col items-center justify-center"
        data-aos="fade-up"
        data-aos-duration="900"
        data-aos-once="true"
      >
    {/* Heading */}
<h1 
  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 max-w-3xl drop-shadow-lg"
  style={{ 
    letterSpacing: '0.01em',
    wordSpacing: '0.2em',
    lineHeight: '1.35',
    fontFamily: "'Tajawal', 'Cairo', sans-serif"
  }}
>
  <span className="block sm:inline">ذكاء اصطناعي يراقب صحة</span>{' '}
  <span
    className="relative inline-block"
    style={{
      background: 'linear-gradient(135deg, #4ade80, #22c55e, #16a34a)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      paddingBottom: '0.15em',
      paddingTop: '0.05em',
      lineHeight: '1.35',
      display: 'inline-block',
    }}
  >
    ماشيتك
  </span>{' '}
  <span className="block sm:inline">قبل أن تراها أنت</span>
</h1>
        {/* Description */}
        <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed mb-10 max-w-2xl drop-shadow-sm">
          منصة واحدة تجمع التشخيص الذكي، تحليل الصور، ومساعد صوتي يفهم لهجتك، لتطلع على حالة كل حيوان في قطيعك لحظة بلحظة، وتتصرف قبل أن تتحول الملاحظة الصغيرة إلى خسارة كبيرة.
        </p>
        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-4 justify-center w-full">
          {/* Main Green Start Button */}
        <button
  onClick={() => navigate('/login')}
  className="flex items-center gap-2.5 bg-[#1b4d2c] hover:bg-[#16a34a] text-white font-bold text-sm sm:text-base px-8 py-4 rounded-full transition-all duration-300 shadow-lg shadow-green-900/30 hover:shadow-xl hover:shadow-green-500/25 border border-white/10 hover:border-white/20 backdrop-blur-sm active:scale-95"
>
  <span>ابدأ التجربة المجانية</span>
</button>
          {/* Play / Watch Button */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                navigate(firstFarmId ? `/farms/${firstFarmId}/ai-assistant` : '/farms');
              } else {
                navigate('/login');
              }
            }}
            className="flex items-center gap-2.5 font-bold text-sm sm:text-base px-8 py-4 rounded-full transition-all duration-300 text-white bg-white/10 backdrop-blur-md border border-white/25 hover:bg-white/20 hover:border-white/40 cursor-pointer shadow-lg shadow-black/10"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
              <svg className="w-3 h-3 fill-current mr-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span>شاهد كيف تعمل</span>
          </button>
        </div>
        </div>
     
    </section>
  )
}
export default HeroSection;