import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { fetchMyFarms } from '../../redux/farmSlice';
import toast from 'react-hot-toast';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconGrid        = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const IconActivity    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconLogout      = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const IconMenu        = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const IconX           = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const IconLogin       = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>;
const IconEmergency   = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6m3-3H9m11 0a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>;

// ─── Nav Links definition ──────────────────────────────────────────────────
const NAV_LINKS = [
  { id: 'farms',          label: 'المزارع',      icon: <IconGrid />,      path: '' },
  { id: 'diagnosis',      label: 'التشخيص',      icon: <IconActivity />,  path: '/diagnosis' },
  { id: 'emergency',      label: 'الطوارئ',      icon: <IconEmergency />, path: '/emergencies' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Navbar = () => {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { farms } = useSelector((state) => state.farm || { farms: [] });
  const firstFarmId = farms && farms.length > 0 ? farms[0]._id : null;

  useEffect(() => {
    if (isAuthenticated && (!farms || farms.length === 0)) {
      dispatch(fetchMyFarms());
    }
  }, [dispatch, isAuthenticated, farms]);

  const getDynamicPath = (link) => {
    if (link.id === 'farms') return '/farms';
    return firstFarmId ? `/farms/${firstFarmId}${link.path}` : '/farms';
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/login');
    setMenuOpen(false);
    setShowDropdown(false);
  };

  const navbarBg = scrolled || menuOpen
    ? 'bg-gradient-to-r from-[#0f3d2e] to-[#1b4d2c] shadow-lg border-b border-black/10'
    : 'bg-gradient-to-r from-[#123f2e] to-[#1b4d2c]/95 backdrop-blur-sm';

  const desktopLink = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-white/15 text-white font-semibold'
        : 'text-green-50/85 hover:text-white hover:bg-white/10'
    }`;

  return (
    <>
      <nav
        dir="rtl"
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${navbarBg}`}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="relative flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 flex-shrink-0 group"
            >
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <circle cx="8"  cy="6"  r="1" fill="white" />
                  <circle cx="16" cy="6"  r="1" fill="white" />
                  <circle cx="12" cy="14" r="7" fill="none" stroke="white" strokeWidth="1.5" />
                  <circle cx="9"  cy="13" r="1.2" fill="white" />
                  <circle cx="15" cy="13" r="1.2" fill="white" />
                </svg>
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-white">رعاية </p>
              </div>
            </button>

            {/* ── Desktop Nav Links (centered) ── */}
            <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.id}
                  to={getDynamicPath(link)}
                  className={desktopLink}
                >
                  <span className={link.id === 'emergency' ? 'text-red-300' : 'text-green-100/80'}>
                    {link.icon}
                  </span>
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user?.name ? user.name[0] : 'م'}
                    </div>
                    <span className="text-sm font-semibold text-white hidden md:block max-w-[100px] truncate">
                      {user?.name || 'المستخدم'}
                    </span>
                    <svg className={`w-4 h-4 text-green-100 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showDropdown && (
                    <div className="absolute left-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <button
                        onClick={() => { navigate('/farms'); setShowDropdown(false); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <IconGrid />
                        مزارعي
                      </button>
                      <hr className="my-1.5 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <IconLogout />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <IconLogin />
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-[#1b4d2c] bg-white rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200"
                  >
                    ابدأ الآن
                  </button>
                </div>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {menuOpen ? <IconX /> : <IconMenu />}
              </button>
            </div>

          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 pt-2 border-t border-white/10 space-y-1" dir="rtl">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.id}
                to={getDynamicPath(link)}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-green-50/85 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span className={link.id === 'emergency' ? 'text-red-300' : 'text-green-100/80'}>
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            ))}

            <div className="pt-2 border-t border-white/10 mt-2 space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-red-100 bg-red-500/20 hover:bg-red-500/30 transition-colors"
                >
                  <IconLogout />
                  تسجيل الخروج
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { navigate('/login'); setMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors"
                  >
                    <IconLogin />
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => { navigate('/register'); setMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-[#1b4d2c] bg-white shadow-md transition-all active:scale-95"
                  >
                    ابدأ الآن
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  );
};

export default Navbar;