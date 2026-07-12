import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchNotifications } from '../redux/notificationSlice'
import { logoutUser } from '../redux/authSlice'
import { playNotificationSound } from '../utils/audio'
import { LogOut, Home, ArrowRight, Bell, MapPin, ChevronLeft, Menu, X } from 'lucide-react'

export default function Topbar({ farmIdProp, farmNameProp }) {
  const params = useParams()
  const activeFarmId = farmIdProp || params.farmId

  const user = useSelector((state) => state.auth.user)
  const unreadCount = useSelector((state) => state.notifications.unread_count)
  const currentFarm = useSelector((state) => state.farm?.currentFarm)
  const farms = useSelector((state) => state.farm?.farms || [])
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const displayFarmName =
    farmNameProp ||
    currentFarm?.name ||
    farms.find((farm) => farm._id === activeFarmId)?.name ||
    'المزرعة'

  const goToFarmHome = () => {
    navigate('/')
    setMobileMenuOpen(false)
  }

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/login')
    })
    setMobileMenuOpen(false)
  }

  // Play sound when unread count increases
  const prevUnreadRef = useRef(unreadCount)
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      playNotificationSound()
    }
    prevUnreadRef.current = unreadCount
  }, [unreadCount])

  useEffect(() => {
    dispatch(fetchNotifications())
    const interval = setInterval(() => dispatch(fetchNotifications()), 60000)
    return () => clearInterval(interval)
  }, [dispatch])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileMenuOpen])

  return (
    <header dir="rtl" className="sticky top-0 z-30" ref={menuRef}>
      {/* ── Main Topbar Row ── */}
      <div
        className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3
                   bg-[#1b4d2c] text-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.15)]"
      >
        {/* Right Section: Hamburger (mobile) + Back + Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger button — visible only on mobile */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all shadow-sm"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Back button — replaces the old standalone "المزارع" pill */}
          <button
            onClick={() => navigate(-1)}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-[#2d5a1b] transition-all shadow-sm"
            title="رجوع"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="hidden md:flex items-center gap-2 bg-[#143a21] p-1.5 rounded-full border border-[#2a5c2a]">
            <button
              onClick={goToFarmHome}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/10 shadow-sm transition-colors"
              title="الرئيسية"
            >
              <Home className="w-4 h-4 text-white/90" />
              <span>الرئيسية</span>
            </button>

            <ChevronLeft className="w-4 h-4 text-white/50" />
            <button
              onClick={() => navigate('/farms')}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              title="المزارع"
            >
              <span>المزارع</span>
            </button>

            {activeFarmId && (
              <>
                <ChevronLeft className="w-4 h-4 text-white/50" />
                <button
                  onClick={() => navigate(`/farms/${activeFarmId}/animals`)}
                  className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors"
                  title="عرض حيوانات المزرعة"
                >
                  <span>الحيوانات</span>
                </button>
              </>
            )}

            {activeFarmId && (
              <>
                <ChevronLeft className="w-4 h-4 text-white/50" />
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-white">
                  <MapPin className="w-4 h-4" />
                  <span>{displayFarmName}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Left Section: Profile, Notifications & Logout — hidden on mobile (moved to drawer) */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Notifications */}
              <button
                onClick={() => { navigate('/notifications'); setMobileMenuOpen(false) }}
                className="relative p-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-all shadow-sm"
                title="الإشعارات"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-sm border-2 border-[#1b4d2c]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile Info — hidden on mobile */}
              <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/20">
                <div className="flex items-center gap-3 bg-[#143a21] border border-[#2a5c2a] rounded-full pr-1 pl-3 py-1">
                  {user?.avatar ? (
                    <img
                      src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover shadow-sm border border-[#1b4d2c]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-bold shadow-sm border border-[#1b4d2c]">
                      {user?.name?.charAt(0) || 'م'}
                    </div>
                  )}
                  <div className="leading-tight hidden sm:block text-right">
                    <p className="text-[11px] text-white/70 font-medium">مرحباً بك،</p>
                    <p className="text-sm font-bold text-white truncate max-w-[120px]">
                      {user?.name?.split(' ')[0] || 'المستخدم'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Logout Button — hidden on mobile */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white transition-all border border-red-500/30 shadow-sm"
                title="تسجيل الخروج"
              >
                <span className="text-sm font-bold hidden md:block">خروج</span>
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-xl bg-white text-[#1b4d2c] hover:bg-stone-100 transition-all shadow-sm font-black text-sm"
            >
              تسجيل الدخول
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile Dropdown Menu ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-xl border-b border-stone-200/60 shadow-lg ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-4 py-4 space-y-3">
          {/* User info row */}
          {user ? (
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100">
              {user?.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2d5a1b] to-[#3d7a25] text-white flex items-center justify-center text-base font-bold shadow-sm border-2 border-white">
                  {user?.name?.charAt(0) || 'م'}
                </div>
              )}
              <div className="text-right flex-1">
                <p className="text-[11px] text-stone-400 font-medium">مرحباً بك،</p>
                <p className="text-sm font-bold text-stone-800 truncate">
                  {user?.name || 'المستخدم'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-2 text-center border-b border-stone-100 pb-4 mb-2">
              <p className="text-xs font-bold text-stone-500 mb-3">يرجى تسجيل الدخول للوصول لكافة الميزات</p>
              <button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-[#1b4d2c] text-white text-sm font-black shadow-sm"
              >
                تسجيل الدخول
              </button>
            </div>
          )}

          {/* Navigation links */}
          <div className="space-y-1">
            <button
              onClick={() => { navigate('/farms'); setMobileMenuOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <ArrowRight className="w-4 h-4 text-[#2d5a1b]" />
              <span>العودة للمزارع</span>
            </button>

            <button
              onClick={goToFarmHome}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <Home className="w-4 h-4 text-[#2d5a1b]" />
              <span>الرئيسية</span>
            </button>

            {activeFarmId && (
              <button
                onClick={() => { navigate(`/farms/${activeFarmId}/animals`); setMobileMenuOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#2d5a1b]" />
                <span>{displayFarmName} — الحيوانات</span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-stone-200 mx-2" />

          {/* Logout */}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all border border-red-100 text-sm font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}