import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SidebarIcon from '../components/SidebarIcon';
import { logout } from '../redux/authSlice';
import toast from 'react-hot-toast';

export default function PortalSidebar({ links, title, subtitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('تم تسجيل الخروج');
    navigate('/login');
  };

  const sidebarContent = (
    <>
      <div className="px-4 pt-6 pb-6 bg-gradient-to-br from-[#2d5a1b] to-[#3d6b47] rounded-b-2xl shadow-md">
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-[10px] text-green-100">{subtitle}</p>
        {user && (
          <p className="text-xs text-green-50 mt-2 truncate">{user.name}</p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.id}
            to={link.path}
            end={link.id === 'dashboard'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#2d5a1b] to-[#3d6b47] text-white font-semibold shadow-lg'
                  : 'text-[#2d5a1b] hover:bg-white/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-stone-100'}`}>
                  <SidebarIcon name={link.icon} className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#2d5a1b]'}`} />
                </span>
                <span>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 space-y-2">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50 font-medium"
        >
          تسجيل الخروج
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 right-4 z-50 bg-[#2d5a1b] text-white px-3 py-2 rounded-lg text-sm"
        onClick={() => setMobileOpen(true)}
      >
        القائمة
      </button>

      <aside className="hidden lg:flex fixed right-0 top-0 h-screen w-56 flex-col bg-gradient-to-b from-[#f0f4f0] via-[#f8f9f7] to-[#f0f4f0] text-[#2d5a1b] z-40 shadow-lg border-l-4 border-[#2d5a1b]/30">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-64 flex flex-col bg-[#f0f4f0] shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
