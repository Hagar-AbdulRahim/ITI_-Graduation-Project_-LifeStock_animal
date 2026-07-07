// layouts/MainLayout.jsx
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Topbar from './Topbar'
import Navbar from '../components/homeComponent/Navbar'

// المسارات اللي فيها الـ chrome بيتغير حسب حالة تسجيل الدخول (Navbar للـ guest)
const GUEST_NAVBAR_PATHS = ['/emergencies']

export default function MainLayout() {
  const location = useLocation()
  const { isAuthenticated } = useSelector((state) => state.auth)

  const isSpecialPath = GUEST_NAVBAR_PATHS.some((path) =>
    location.pathname.includes(path)
  )

  // النافبار يظهر بس لو الصفحة من الصفحات الخاصة والمستخدم guest
  const showNavbarOnly = isSpecialPath && !isAuthenticated

  return (
    <div
      dir="rtl"
      className="flex min-h-screen bg-[#f5f2eb] font-['Cairo',sans-serif]"
    >
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* لو guest في صفحة خاصة → Navbar، غير كده → Topbar العادي */}
        {showNavbarOnly ? <Navbar /> : <Topbar />}

        <main className="flex-1 p-4 sm:p-6 overflow-auto bg-[#f5f2eb]">
          <div className="bg-white rounded-[32px] border border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden min-h-[calc(100vh-140px)]">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-stone-200 text-xs text-stone-400 text-center bg-white/50">
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