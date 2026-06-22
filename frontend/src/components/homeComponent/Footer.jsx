import React from 'react'

const Footer = () => {
  return (
    <footer className="pt-12 pb-6 px-6" style={{ backgroundColor: '#11331d' }} dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Column 1: Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-extrabold text-white text-2xl" style={{ fontFamily: 'Cairo, sans-serif' }}>LifeStock</span>
              <span className="text-2xl">🐾</span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#a5d6a7' }}>
              منصة متخصصة في تقديم حلول الذكاء الاصطناعي لإدارة الثروة الحيوانية وتشخيص الأمراض بشكل مبكر ودقيق لضمان صحة قطعانك.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                <a key={social} href="#" className="w-8 h-8 rounded-md flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}>
                  <div className="w-4 h-4 bg-white" style={{ maskImage: 'linear-gradient(white, white)', WebkitMaskImage: 'linear-gradient(white, white)', borderRadius: '2px' }}></div>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Important Links */}
          <div className="md:col-span-1">
            <h3 className="font-bold text-white text-lg mb-4">روابط هامة</h3>
            <ul className="space-y-3">
              {['الرئيسية', 'المساعد الذكي', 'اكتشاف الأمراض', 'المدونة', 'تواصل معنا'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm transition-colors hover:text-white inline-block" style={{ color: '#a5d6a7' }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="md:col-span-1">
            <h3 className="font-bold text-white text-lg mb-4">وسائل التواصل</h3>
            <ul className="space-y-4 text-sm" style={{ color: '#a5d6a7' }}>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span dir="ltr">+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>info@lifestock.com</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>القرية الذكية، مبنى ITI<br/>القاهرة، مصر</span>
              </li>
            </ul>
          </div>

          {/* Column 4: App / CTA */}
          <div className="md:col-span-1 flex flex-col items-start md:items-end">
             <div className="bg-white p-2 rounded-xl mb-3 inline-block">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">QR Code</div>
             </div>
             <p className="text-white text-sm font-bold mb-3">حمل التطبيق الآن</p>
             <button className="px-6 py-2 rounded-lg text-white font-bold text-sm transition-colors" style={{ backgroundColor: '#4CAF50' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#43A047'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}>
               تواصل معنا
             </button>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-xs text-center" style={{ color: '#a5d6a7' }}>
            تصميم وتطوير فريق <span className="text-white font-bold">LifeStock</span>
          </p>
          <p className="text-xs text-center" style={{ color: '#a5d6a7' }}>
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} LifeStock
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
