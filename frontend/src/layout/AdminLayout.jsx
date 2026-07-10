import { Outlet } from 'react-router-dom';
import PortalSidebar from './PortalSidebar';
import { ADMIN_SIDEBAR_LINKS } from '../constant/adminData';

export default function AdminLayout() {
  return (
    <div dir="rtl" className="flex min-h-screen bg-[#f0f2f1] font-['Cairo',sans-serif] text-stone-800">
      <PortalSidebar
        links={ADMIN_SIDEBAR_LINKS}
        title="لوحة الإدارة"
        subtitle="رعاية الماشية AI"
      />
      <div className="flex-1 lg:mr-56 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        <header className="sticky top-0 z-30 bg-white border-b border-stone-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] pl-6 pr-16 lg:px-6 py-4 flex items-center">
          <h1 className="text-lg font-black text-[#1b4d2c]">لوحة تحكم الإدارة</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto smooth-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
