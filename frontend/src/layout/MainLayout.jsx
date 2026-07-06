// layouts/MainLayout.jsx
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Navbar from '../components/homeComponent/Navbar'

// المسارات اللي فيها الـ chrome بيتغير حسب حالة تسجيل الدخول
const GUEST_NAVBAR_PATHS = ['/emergencies']

export default function MainLayout() {
  const location = useLocation()
  const { isAuthenticated } = useSelector((state) => state.auth)

  const isSpecialPath = GUEST_NAVBAR_PATHS.some((path) =>
    location.pathname.includes(path)
  )
  const isEmergencyPage = location.pathname.includes('/emergencies')

  // النافبار يظهر بس لو الصفحة من الصفحات الخاصة والمستخدم guest
  const showNavbarOnly = isSpecialPath && !isAuthenticated

  // السايدبار يتخفي في حالتين: guest في صفحة خاصة، أو أي حد في صفحة الطوارئ
  const hideSidebar = showNavbarOnly || isEmergencyPage

  return (
    <div
      dir="rtl"
      className="flex min-h-screen bg-[#f5f2eb] font-['Cairo',sans-serif]"
    >
      {/* Sidebar — مختفي في صفحة الطوارئ دايمًا، وفي أي صفحة خاصة لو guest */}
      {!hideSidebar && <Sidebar />}

      {/* Main content */}
      <div className={`flex-1 ${hideSidebar ? '' : 'lg:mr-56'} flex flex-col min-h-screen`}>
        {/* لو guest في صفحة خاصة → Navbar، غير كده → Topbar العادي (حتى لو الطوارئ) */}
        {showNavbarOnly ? <Navbar /> : <Topbar />}

        <main className={`flex-1 p-3 sm:p-4 lg:p-6 overflow-auto bg-[#f5f2eb] ${!hideSidebar ? 'pt-16 lg:pt-6' : ''}`}>
          {/* الصفحة الحالية تتحمل هنا */}
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-stone-200 text-xs text-stone-400 text-center bg-white/50">
          © ٢٠٢٤ رعاية الماشية AI. ذكاء بيطري لزراعة مستدامة.
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-stone-600 transition-colors">
            سياسة الخصوصية
          </a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-stone-600 transition-colors">
            شروط الخدمة
          </a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-stone-600 transition-colors">
            توثيق API
          </a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-stone-600 transition-colors">
            اتصل بالدعم
          </a>
        </footer>
      </div>
    </div>
  )
}