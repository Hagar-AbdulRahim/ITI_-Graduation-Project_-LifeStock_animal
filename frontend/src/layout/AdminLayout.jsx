import { Outlet } from 'react-router-dom';
import PortalSidebar from './PortalSidebar';
import { ADMIN_SIDEBAR_LINKS } from '../constant/adminData';

export default function AdminLayout() {
  return (
    <div dir="rtl" className="flex min-h-screen bg-stone-50/50 font-['Cairo',sans-serif] relative overflow-hidden text-stone-800">
      {/* Global Background Decor for Admin Pages */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-green-300/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="fixed top-60 left-10 w-[400px] h-[400px] bg-emerald-200/15 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      <PortalSidebar
        links={ADMIN_SIDEBAR_LINKS}
        title="لوحة الإدارة"
        subtitle="رعاية الماشية AI"
      />
      <div className="flex-1 lg:mr-56 flex flex-col min-h-screen relative z-10 min-w-0 overflow-x-hidden">
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white shadow-[0_4px_30px_rgb(0,0,0,0.02)] px-6 py-4 flex items-center">
          <h1 className="text-xl font-black bg-gradient-to-l from-[#2a5c2a] to-[#4ade80] bg-clip-text text-transparent drop-shadow-sm">لوحة تحكم الإدارة</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
