// layouts/MainLayout.jsx
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Navbar from '../components/homeComponent/Navbar'

// المسارات اللي فيها الـ chrome بيتغير حسب حالة تسجيل الدخول (Navbar للـ guest)
const GUEST_NAVBAR_PATHS = ['/emergencies']

// المسارات اللي السايدبار بيتخفي فيها دايمًا (بغض النظر عن حالة تسجيل الدخول)
const NO_SIDEBAR_PATHS = ['/emergencies', '/ai-assistant', '/vaccine-agent']

export default function MainLayout() {
  const location = useLocation()
  const { isAuthenticated } = useSelector((state) => state.auth)

  const isSpecialPath = GUEST_NAVBAR_PATHS.some((path) =>
    location.pathname.includes(path)
  )
  const isNoSidebarPage = NO_SIDEBAR_PATHS.some((path) =>
    location.pathname.includes(path)
  )

  // النافبار يظهر بس لو الصفحة من الصفحات الخاصة والمستخدم guest
  const showNavbarOnly = isSpecialPath && !isAuthenticated

  // السايدبار يتخفي في حالتين: guest في صفحة خاصة، أو أي حد في صفحات الطوارئ/التشخيص/اللقاحات
  const hideSidebar = showNavbarOnly || isNoSidebarPage

  return (
    <div
      dir="rtl"
      className="flex min-h-screen bg-[#f5f2eb] font-['Cairo',sans-serif]"
    >
      {/* Sidebar — مختفي في الطوارئ/التشخيص/اللقاحات دايمًا، وفي أي صفحة خاصة لو guest */}
      {!hideSidebar && <Sidebar />}

      {/* Main content */}
      <div className={`flex-1 ${hideSidebar ? '' : 'mr-56'} flex flex-col min-h-screen`}>
        {/* لو guest في صفحة خاصة → Navbar، غير كده → Topbar العادي */}
        {showNavbarOnly ? <Navbar /> : <Topbar />}

        <main className="flex-1 p-6 overflow-auto bg-[#f5f2eb]">
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