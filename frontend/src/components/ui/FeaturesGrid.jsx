import React from 'react'
import mobileAnalysis from '@/assets/images/mobile-analysis.jpg'

const CameraIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const SyringeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
)

const MicIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

const FeaturesGrid = () => {
  return (
    <section className="bg-bg-cream py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-text-dark mb-3">قدرات متقدمة</h2>
          <p className="text-text-gray text-sm">أدوات شاملة لصحة الثروة البيطرية والزراع العربي.</p>
        </div>

        {/* Asymmetric Grid */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: 'auto auto',
          }}
        >
          {/* Card 1: تحليل الصور - small, with image */}
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ gridColumn: '1', gridRow: '1' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-dark-green">
                <CameraIcon />
              </div>
            </div>
            <h3 className="font-bold text-text-dark text-base mb-1">تحليل الصور</h3>
            <p className="text-text-gray text-xs leading-relaxed mb-4">
              تحليل الصور وتحديد الأمراض من خلال تحليل حيوي الحيوان باستخدام الذكاء الاصطناعي
            </p>
            <div className="rounded-xl overflow-hidden h-28">
              <img src={mobileAnalysis} alt="تحليل الصور" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Card 2: اكتشاف الأمراض - large, spans 2 cols */}
          <div
            className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            style={{ gridColumn: '2 / 4', gridRow: '1' }}
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-dark-green">
                  <SearchIcon />
                </div>
              </div>
              <h3 className="font-bold text-text-dark text-xl mb-2">اكتشاف الأمراض</h3>
              <p className="text-text-gray text-sm leading-relaxed max-w-md">
                كشف مبكر لأكثر من 40 مرضاً خطيراً بالذكاء الاصطناعي، تشخيص تلقائي، ونمط نبض الحيوانات بدقة عالية لرصد المخاطر الصحية.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['حمى القلاع', 'السل البقري', 'التهاب الضرع', 'داء البروسيلا'].map((d) => (
                <span key={d} className="text-xs bg-green-50 text-dark-green px-3 py-1 rounded-full border border-green-100">
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3: تتبع التطعيمات */}
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ gridColumn: '1', gridRow: '2' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-dark-green">
                <SyringeIcon />
              </div>
            </div>
            <h3 className="font-bold text-text-dark text-base mb-1">تتبع التطعيمات</h3>
            <p className="text-text-gray text-xs leading-relaxed">
              حل موحد لتتبع القطعان الكبيرة مع تذكيرات تلقائية بمواعيد التطعيم
            </p>
          </div>

          {/* Card 4: مساعد صوتي - dark green bg */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center justify-center text-center"
            style={{ gridColumn: '2', gridRow: '2', backgroundColor: '#1F5C34' }}
          >
            <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white mb-3">
              <MicIcon />
            </div>
            <h3 className="font-bold text-white text-base mb-2">مساعد صوتي</h3>
            <p className="text-green-200 text-xs leading-relaxed">
              إدارة سهلة من استخدام أوامر الأصوات للأطباء البيطريين، تحليل بيانات بصوتك بينما تعمل في الميدان
            </p>
          </div>

          {/* Card 5: تقرير صحية + Card 6: التنبيهات - stacked */}
          <div className="flex flex-col gap-4" style={{ gridColumn: '3', gridRow: '2' }}>
            <div className="bg-white rounded-2xl p-5 shadow-sm flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-dark-green">
                  <ChartIcon />
                </div>
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-dark-green">
                  <SyringeIcon />
                </div>
              </div>
              <h3 className="font-bold text-text-dark text-sm mb-1">تتبع التطعيمات</h3>
              <p className="text-text-gray text-xs leading-relaxed">
                حل موحد لتتبع القطعان الكبيرة، مع تذكيرات تلقائية بمواعيد القيت
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <BellIcon />
                </div>
              </div>
              <h3 className="font-bold text-text-dark text-sm mb-1">التنبيهات الفعلي</h3>
              <p className="text-text-gray text-xs leading-relaxed">
                تنبيهات فورية بالأخطار الصحية الحيوانية، كاشف الأعراض الفعلية
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesGrid
