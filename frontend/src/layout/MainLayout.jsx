// layouts/MainLayout.jsx
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'


// المسارات اللي تتغير فيها الـ chrome (Sidebar + Topbar → Navbar)
const EMERGENCY_PATHS = ['/emergencies']

export default function MainLayout() {
  const location = useLocation()
  const isEmergencyPage = EMERGENCY_PATHS.some((path) =>
    location.pathname.includes(path)
  )

  return (
    <div
      dir="rtl"
      className="flex min-h-screen bg-[#f5f2eb] font-['Cairo',sans-serif]"
    >
      {/* Sidebar — يختفي في صفحة الطوارئ */}
      {!isEmergencyPage && <Sidebar />}

      {/* Main content */}
      <div className={`flex-1 ${isEmergencyPage ? '' : 'mr-56'} flex flex-col min-h-screen`}>
        {/* Topbar */}
        {!isEmergencyPage && <Topbar />}

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