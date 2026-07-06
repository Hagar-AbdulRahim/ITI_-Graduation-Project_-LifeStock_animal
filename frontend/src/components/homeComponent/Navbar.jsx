import React, { useState, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../redux/authSlice'
import { fetchMyFarms } from '../../redux/farmSlice'
import toast from 'react-hot-toast'

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconGrid        = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const IconActivity    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconLogout      = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const IconMenu        = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const IconX           = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const IconLogin       = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>;
const IconEmergency   = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6m3-3H9m11 0a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>;
const IconBriefcase   = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconShieldCheck = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;

// ─── Nav Links definition ──────────────────────────────────────────────────
const NAV_LINKS = [
  { id: 'farms',          label: 'المزارع',          icon: <IconGrid />,        path: '' },
  { id: 'diagnosis',      label: 'التشخيص',          icon: <IconActivity />,    path: '/ai-assistant' },
  { id: 'vaccine-agent',  label: 'مستشار اللقاحات',  icon: <IconShieldCheck />, path: '/vaccine-agent' },
  { id: 'services',       label: 'كيفية الاستخدام',  icon: <IconBriefcase />,   path: '/services' },
  { id: 'emergency',      label: 'الطوارئ',          icon: <IconEmergency />,   path: '/emergencies' },
];

// روابط لازم المستخدم يكون مسجل دخول عشان يدخلها
const AUTH_PROTECTED_LINKS = ['farms', 'diagnosis', 'vaccine-agent'];

// ─── Component ────────────────────────────────────────────────────────────────
const Navbar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { farms } = useSelector((state) => state.farm || { farms: [] })
  const firstFarmId = farms && farms.length > 0 ? farms[0]._id : null

  useEffect(() => {
    if (isAuthenticated && (!farms || farms.length === 0)) {
      dispatch(fetchMyFarms())
    }
  }, [dispatch, isAuthenticated, farms])

  const getDynamicPath = (link) => {
    if (link.id === 'farms') return '/farms'
    if (link.id === 'diagnosis') return '/ai-assistant'
    if (link.id === 'vaccine-agent') return '/vaccine-agent'
    if (link.id === 'services') return '/services'
    if (link.id === 'emergency') return '/emergencies'
    return firstFarmId ? `/farms/${firstFarmId}${link.path}` : '/farms'
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    toast.success('تم تسجيل الخروج بنجاح')
    navigate('/login')
    setMenuOpen(false)
    setShowDropdown(false)
  }

  const handleNavClick = (e, link) => {
    if (AUTH_PROTECTED_LINKS.includes(link.id) && !isAuthenticated) {
      e.preventDefault()
      navigate('/login')
      setMenuOpen(false)
    }
  }

  const navbarBg =
    scrolled || menuOpen
      ? 'bg-[#f8f8f5]/95 backdrop-blur-md shadow-sm border-b border-gray-200/50'
      : 'bg-[#f8f8f5]/85 backdrop-blur-sm'

  const desktopLink = ({ isActive }) =>
    `group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-semibold tracking-wide transition-all duration-300 ${
      isActive
        ? 'border-[#2d5a1b]/20 bg-[#f4f8ef] text-[#1b4d2c] shadow-[0_10px_30px_-14px_rgba(45,90,27,0.35)]'
        : 'border-transparent text-[#4b5a44] hover:border-[#2d5a1b]/20 hover:bg-[#f7fbf2] hover:text-[#1b4d2c] hover:shadow-[0_10px_24px_-16px_rgba(45,90,27,0.35)]'
    }`

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
                  <circle cx="8" cy="6" r="1" fill="white" />
                  <circle cx="16" cy="6" r="1" fill="white" />
                  <circle
                    cx="12"
                    cy="14"
                    r="7"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <circle cx="9" cy="13" r="1.2" fill="white" />
                  <circle cx="15" cy="13" r="1.2" fill="white" />
                </svg>
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-gray-900">رعاية</p>
              </div>
            </button>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.id}
                  to={getDynamicPath(link)}
                  onClick={(e) => handleNavClick(e, link)}
                  className={desktopLink}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
                          link.id === 'emergency'
                            ? isActive
                              ? 'bg-red-100 text-red-600'
                              : 'bg-red-50 text-red-500 group-hover:bg-red-100 group-hover:text-red-600'
                            : isActive
                              ? 'bg-[#2d5a1b]/10 text-[#2d5a1b]'
                              : 'bg-[#f2f5eb] text-[#4b5a44] group-hover:bg-[#e8f3df] group-hover:text-[#2d5a1b]'
                        }`}
                      >
                        {link.icon}
                      </span>
                      <span>{link.label}</span>
                      <span
                        className={`absolute bottom-1.5 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-[#2d5a1b] transition-all duration-300 ${isActive ? 'w-3/4 opacity-100' : 'w-0 opacity-0'}`}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
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
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showDropdown && (
                    <div className="absolute left-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <button
                        onClick={() => {
                          navigate('/farms')
                          setShowDropdown(false)
                        }}
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
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#1b4d2c] border border-[#2d5a1b]/20 bg-white/80 rounded-xl shadow-sm hover:bg-[#f4f8ef] hover:border-[#2d5a1b]/40 transition-all duration-200"
                  >
                    <IconLogin />
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#2d5a1b] via-[#356b24] to-[#4a7b2d] rounded-xl shadow-[0_12px_30px_-16px_rgba(45,90,27,0.55)] hover:shadow-[0_14px_34px_-14px_rgba(45,90,27,0.65)] hover:scale-[1.02] active:scale-95 transition-all duration-200"
                  >
                    ابدأ الآن
                  </button>
                </div>
              )}

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
          <div
            className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-1"
            dir="rtl"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.id}
                to={getDynamicPath(link)}
                onClick={(e) => {
                  handleNavClick(e, link)
                  setMenuOpen(false)
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'border-[#2d5a1b]/20 bg-[#f4f8ef] text-[#1b4d2c] shadow-[0_10px_24px_-16px_rgba(45,90,27,0.35)]'
                      : 'border-transparent text-[#4b5a44] hover:border-[#2d5a1b]/20 hover:bg-[#f7fbf2] hover:text-[#1b4d2c] hover:shadow-[0_10px_24px_-16px_rgba(45,90,27,0.3)]'
                  }`
                }
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    link.id === 'emergency'
                      ? 'bg-red-50 text-red-500'
                      : 'bg-[#f2f5eb] text-[#2d5a1b]'
                  }`}
                >
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            ))}

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
                    onClick={() => {
                      navigate('/login')
                      setMenuOpen(false)
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold text-[#1b4d2c] border border-[#2d5a1b]/20 bg-white/80 hover:bg-[#f4f8ef] transition-colors"
                  >
                    <IconLogin />
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register')
                      setMenuOpen(false)
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#2d5a1b] via-[#356b24] to-[#4a7b2d] shadow-[0_12px_30px_-16px_rgba(45,90,27,0.55)] transition-all active:scale-95"
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
  )
}

export default Navbar
