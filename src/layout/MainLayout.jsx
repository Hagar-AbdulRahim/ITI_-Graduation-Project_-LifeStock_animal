// layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function MainLayout() {
  return (
    <div
      dir="rtl"
      className="flex min-h-screen bg-[#f5f2eb] font-['Cairo',sans-serif]"
    >
      {/* Sidebar — fixed على اليمين */}
      <Sidebar />

      {/* Main content — يبدأ بعد عرض الـ sidebar */}
      <div className="flex-1 mr-56 flex flex-col min-h-screen">
        <Topbar />
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
