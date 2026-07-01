import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const SparkleIcon = () => (
  <svg className="w-5 h-5 text-[#1b4d2c]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.188-.904L9 9l.813 5.096L15 15l-5.187.904z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.071 4.929l-1.071 1.071m0 8.486l1.071 1.071M4.929 4.929l1.071 1.071m8.486 0l1.071-1.071" />
  </svg>
)

const MicIcon = () => (
  <svg className="w-5 h-5 text-[#1b4d2c]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
)

const CameraIcon = () => (
  <svg className="w-5 h-5 text-[#1b4d2c]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const BellIcon = () => (
  <svg className="w-5 h-5 text-[#1b4d2c]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

// New icon: Syringe / Vaccination
const SyringeIcon = () => (
  <svg className="w-5 h-5 text-[#1b4d2c]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
)

// New icon: Medical Record / Clipboard
const ClipboardIcon = () => (
  <svg className="w-5 h-5 text-[#1b4d2c]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
)

const FeaturesGrid = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { farms } = useSelector((state) => state.farm || { farms: [] })
  const firstFarmId = farms && farms.length > 0 ? farms[0]._id : null

  // Returns the route to navigate to for each feature card.
  // Farm-nested features require a farmId; fallback to /farms if not available.
  const getRoute = (subPath) => {
    if (!isAuthenticated) return '/login'
    if (subPath === 'animals') return firstFarmId ? `/farms/${firstFarmId}/animals` : '/farms'
    if (subPath === 'farms') return '/farms'
    return firstFarmId ? `/farms/${firstFarmId}/${subPath}` : '/farms'
  }

  const cards = [
    {
      icon: <SparkleIcon />,
      title: 'تشخيص ذكي للأعراض',
      description: 'أدخل الأعراض، ويقترح النظام أقرب الحالات المحتملة وخطوات المتابعة الموصى بها.',
      route: 'diagnosis',
    },
    {
      icon: <MicIcon />,
      title: 'مساعد صوتي ذكي',
      description: 'إدارة سهلة باستخدام الأوامر الصوتية للأطباء البيطريين، وتحليل البيانات بصوتك في الميدان.',
      route: 'ai-assistant',
    },
    {
      icon: <CameraIcon />,
      title: 'تحليل الصور بالذكاء الاصطناعي',
      description: 'التقط صورة للحيوان أو الأعراض الخارجية، ودع الذكاء الاصطناعي يحللها للتعرف على الإصابات المحتملة.',
      route: 'image-analysis',
    },
    {
      icon: <BellIcon />,
      title: 'تنبيهات فورية ذكية',
      description: 'رصد أي تغير غير طبيعي لحيوان أو قطيع وإرسال إشعارات فورية لتفادي تفشي الأوبئة.',
      route: 'animals',
    },
    {
      icon: <SyringeIcon />,
      title: 'التطعيمات',
      description: 'متابعة مواعيد التطعيمات الخاصة بالحيوانات مع تنبيهات لضمان عدم تفويت أي جرعة.',
      route: 'vaccinations',
    },
    {
      icon: <ClipboardIcon />,
      title: 'السجل الطبي للحيوان',
      description: 'عرض التاريخ الطبي الكامل للحيوان بما يشمل الأمراض والعلاجات والتطعيمات السابقة.',
      route: 'animals',
    },
  ]

  return (
    <section className="bg-[#f8f8f5] py-16 px-6" id="features">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12" data-aos="fade-up" data-aos-duration="700" data-aos-once="true">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a] mb-2 leading-snug">
            كل ما يحتاجه قطيعك في مكان واحد
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(getRoute(card.route))}
              className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 transition-all duration-300 flex flex-col justify-between text-right group hover:-translate-y-1.5 hover:shadow-xl hover:border-[#1b4d2c]/20 cursor-pointer"
              dir="rtl"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay={index * 80}
              data-aos-once="true"
            >
              <div>
                {/* Icon Container */}
                <div className="flex justify-start mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-[#e8f3ec] flex items-center justify-center text-[#1b4d2c] transition-colors duration-300 group-hover:bg-[#1b4d2c] group-hover:[&>svg]:text-white">
                    {card.icon}
                  </div>
                </div>
                {/* Title */}
                <h3 className="font-extrabold text-[#1a1a1a] text-lg mb-3 leading-snug">
                  {card.title}
                </h3>
                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesGrid
