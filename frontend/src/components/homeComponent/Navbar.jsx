import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { fetchMyFarms } from '../../redux/farmSlice';
import toast from 'react-hot-toast';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconGrid        = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const IconPaw         = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19c-4 0-7-3-7-7 0-2.5 1-4.5 2.5-6M12 19c4 0 7-3 7-7 0-2.5-1-4.5-2.5-6M9 5a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zM7 8a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" /></svg>;
const IconBot         = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>;
const IconActivity    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconCamera      = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconSyringe     = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const IconBook        = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const IconBarChart    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconLogout      = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const IconMenu        = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const IconX           = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const IconLogin       = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>;

// ─── Nav Links definition (matches Sidebar routes) ────────────────────────────
const NAV_LINKS = [
  { id: 'farms',         label: 'المزارع',               icon: <IconGrid />,     path: '/farms' },
  { id: 'animals',       label: 'الحيوانات',              icon: <IconPaw />,      path: '/animals' },
  { id: 'diagnosis',     label: 'التشخيص',               icon: <IconActivity />, path: '/diagnosis' },
  { id: 'image-analysis',label: 'تحليل الصور',            icon: <IconCamera />,   path: '/image-analysis' },
  { id: 'vaccinations',  label: 'التطعيمات',              icon: <IconSyringe />,  path: '/vaccinations' },
  { id: 'library',       label: 'المكتبة',                icon: <IconBook />,     path: '/library' },
  { id: 'reports',       label: 'التقارير',               icon: <IconBarChart />, path: '/reports' },
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

  // Close mobile menu on resize to desktop
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
    ? 'bg-[#f8f8f5]/95 backdrop-blur-md shadow-sm border-b border-gray-200/50'
    : 'bg-[#f8f8f5]/85 backdrop-blur-sm';

  // ── Desktop link style
  const desktopLink = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-[#1b4d2c]/10 text-[#1b4d2c] font-semibold'
        : 'text-gray-600 hover:text-[#1b4d2c] hover:bg-[#1b4d2c]/5'
    }`;

  return (
    <>
      <nav
        dir="rtl"
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${navbarBg}`}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 flex-shrink-0 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1b4d2c] to-[#1b4d2c] flex items-center justify-center shadow-md shadow-green-900/20 group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <circle cx="8"  cy="6"  r="1" fill="white" />
                  <circle cx="16" cy="6"  r="1" fill="white" />
                  <circle cx="12" cy="14" r="7" fill="none" stroke="white" strokeWidth="1.5" />
                  <circle cx="9"  cy="13" r="1.2" fill="white" />
                  <circle cx="15" cy="13" r="1.2" fill="white" />
                </svg>
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-gray-900">رعاية الماشية</p>
                <p className="text-[10px] text-[#1b4d2c] font-semibold">LivestockCare AI</p>
              </div>
            </button>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.id}
                  to={getDynamicPath(link)}
                  className={desktopLink}
                >
                  <span className="text-[#1b4d2c] opacity-70">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                /* ── User dropdown ── */
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1b4d2c]/8 hover:bg-[#1b4d2c]/15 border border-[#1b4d2c]/20 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1b4d2c] to-[#1b4d2c] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user?.name ? user.name[0] : 'م'}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 hidden md:block max-w-[100px] truncate">
                      {user?.name || 'المستخدم'}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
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
                /* ── Login / Register buttons ── */
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#1b4d2c] hover:bg-[#1b4d2c]/5 rounded-lg transition-all duration-200"
                  >
                    <IconLogin />
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#1b4d2c] to-[#1b4d2c] rounded-lg shadow-md shadow-green-800/20 hover:shadow-lg hover:shadow-green-800/25 hover:scale-[1.02] active:scale-95 transition-all duration-200"
                  >
                    ابدأ الآن
                  </button>
                </div>
              )}

              {/* ── Hamburger (mobile) ── */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
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
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-1" dir="rtl">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.id}
                to={getDynamicPath(link)}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#1b4d2c]/10 text-[#1b4d2c] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#1b4d2c]'
                  }`
                }
              >
                <span className="text-[#1b4d2c] opacity-80">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}

            {/* Mobile Auth buttons */}
            <div className="pt-2 border-t border-gray-100 mt-2 space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <IconLogout />
                  تسجيل الخروج
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { navigate('/login'); setMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-[#1b4d2c] border border-[#1b4d2c]/30 hover:bg-[#1b4d2c]/5 transition-colors"
                  >
                    <IconLogin />
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => { navigate('/register'); setMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#1b4d2c] to-[#1b4d2c] shadow-md transition-all active:scale-95"
                  >
                    ابدأ الآن
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop to close dropdown */}
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
