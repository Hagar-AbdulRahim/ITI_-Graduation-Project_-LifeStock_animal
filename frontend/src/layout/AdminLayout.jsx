import { Outlet } from 'react-router-dom';
import PortalSidebar from './PortalSidebar';
import { ADMIN_SIDEBAR_LINKS } from '../constant/adminData';

export default function AdminLayout() {
  return (
    <div dir="rtl" className="flex min-h-screen bg-[#f5f2eb] font-['Cairo',sans-serif]">
      <PortalSidebar
        links={ADMIN_SIDEBAR_LINKS}
        title="لوحة الإدارة"
        subtitle="رعاية الماشية AI"
      />
      <div className="flex-1 lg:mr-56 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-stone-200 px-6 py-4">
          <h1 className="text-lg font-bold text-[#2d5a1b]">لوحة تحكم المدير</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
