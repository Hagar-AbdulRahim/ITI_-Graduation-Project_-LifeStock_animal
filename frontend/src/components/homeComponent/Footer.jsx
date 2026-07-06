import React from 'react'
import { useNavigate } from 'react-router-dom'

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
  </svg>
)

const TwitterIcon = () => (
  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
  </svg>
)

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const LinkedinIcon = () => (
  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
)

const Footer = () => {
  const navigate = useNavigate()

  const socialIcons = [
    { name: 'facebook', icon: <FacebookIcon />, href: '#' },
    { name: 'twitter', icon: <TwitterIcon />, href: '#' },
    { name: 'instagram', icon: <InstagramIcon />, href: '#' },
    { name: 'linkedin', icon: <LinkedinIcon />, href: '#' },
  ]

  return (
    <footer className="pt-8 pb-4 px-6 bg-[#11331d]" dir="rtl" id="contact">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

          {/* Column 1: Logo and Description */}
          <div
            className="md:col-span-1 flex flex-col items-start text-right"
            data-aos="fade-up"
            data-aos-duration="700"
            data-aos-delay="0"
            data-aos-once="true"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className="font-extrabold text-white text-xl tracking-wide">رعاية</span>

            </div>
            <p className="text-sm leading-relaxed mb-4 text-emerald-200/70">
              منصة متخصصة في تقديم حلول الذكاء الاصطناعي لإدارة الثروة الحيوانية وتشخيص الأمراض بشكل مبكر ودقيق لضمان صحة قطعانك.
            </p>
          </div>

          {/* Column 2: Important Links */}
          <div
            className="md:col-span-1 text-right"
            data-aos="fade-up"
            data-aos-duration="700"
            data-aos-delay="100"
            data-aos-once="true"
          >
            <h3 className="font-bold text-white text-base mb-3">روابط هامة</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="text-sm transition-colors text-emerald-200/60 hover:text-white cursor-pointer"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm transition-colors text-emerald-200/60 hover:text-white cursor-pointer"
                >
                  المساعد الذكي
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm transition-colors text-emerald-200/60 hover:text-white cursor-pointer"
                >
                  اكتشاف الأمراض
                </button>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-sm transition-colors text-emerald-200/60 hover:text-white"
                >
                  المميزات
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-sm transition-colors text-emerald-200/60 hover:text-white cursor-pointer"
                >
                  تواصل معنا
                </button>
              </li>
              <li>
                <a
                  href="#emergency"
                  className="text-sm transition-colors text-emerald-200/60 hover:text-white"
                >
                  طوارئ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div
            className="md:col-span-1 text-right"
            data-aos="fade-up"
            data-aos-duration="700"
            data-aos-delay="200"
            data-aos-once="true"
          >
            <h3 className="font-bold text-white text-base mb-3">وسائل التواصل</h3>
            <ul className="space-y-2.5 text-sm text-emerald-200/60">
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+201234567890" className="hover:text-white transition-colors" dir="ltr">+20 123 456 7890</a>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@lifestock.com" className="hover:text-white transition-colors">info@lifestock.com</a>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span> ITI , جامعة أسيوط </span>
              </li>
            </ul>
          </div>

          {/* Column 4: تواصل معنا */}
          <div
            className="md:col-span-1 text-right"
            data-aos="fade-up"
            data-aos-duration="700"
            data-aos-delay="300"
            data-aos-once="true"
          >
            <h3 className="font-bold text-white text-base mb-3">تواصل معنا</h3>
            <p className="text-sm text-emerald-200/60 leading-relaxed mb-3">
              هل لديك سؤال أو تريد معرفة المزيد؟ فريقنا جاهز لمساعدتك في أي وقت.
            </p>

            <a
              href="#contact"
              className="inline-block text-sm font-semibold text-white bg-[#1b4d2c] hover:bg-[#1b4d2c]/80 transition-colors px-4 py-2 rounded-lg mb-6"
            >
              تواصل معنا الآن
            </a>

            {/* Social icons in a horizontal row, icons only */}
            <div className="flex items-center gap-3">
              {socialIcons.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-[#1b4d2c] hover:border-[#1b4d2c] transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t flex flex-col md:flex-row items-center justify-between gap-3 border-white/5">
          <p className="text-xs text-center text-emerald-200/40">
            تصميم وتطوير فريق <span className="text-emerald-200/80 font-bold">رعاية</span>
          </p>
          <p className="text-xs text-center text-emerald-200/40">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} رعاية
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer