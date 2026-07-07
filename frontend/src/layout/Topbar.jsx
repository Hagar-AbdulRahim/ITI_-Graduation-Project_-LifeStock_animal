import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchNotifications } from '../redux/notificationSlice'
import { logoutUser } from '../redux/authSlice'
import { LogOut, Home, ArrowRight, Bell, MapPin, ChevronLeft } from 'lucide-react'

export default function Topbar() {
  const { farmId } = useParams()
  const user = useSelector((state) => state.auth.user)
  const unreadCount = useSelector((state) => state.notifications.unread_count)
  const currentFarm = useSelector((state) => state.farm?.currentFarm)
  const farms = useSelector((state) => state.farm?.farms || [])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const displayFarmName =
    currentFarm?.name ||
    farms.find((farm) => farm._id === farmId)?.name ||
    'المزرعة'

  const goToFarmHome = () => {
    navigate('/')
  }

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/login')
    })
  }

  useEffect(() => {
    dispatch(fetchNotifications())
    const interval = setInterval(() => dispatch(fetchNotifications()), 60000)
    return () => clearInterval(interval)
  }, [dispatch])

  return (
    <header
      dir="rtl"

      className="flex sticky top-0 z-30 items-center justify-between gap-4 px-6 py-3
                 bg-white/80 backdrop-blur-xl border-b border-stone-200/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]"

    >
      {/* Right Section: Breadcrumbs & Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/farms')}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-[#2d5a1b] transition-all shadow-sm"
          title="العودة إلى صفحة المزارع"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-2 bg-stone-100/70 p-1.5 rounded-full border border-stone-200/50">
          <button
            onClick={goToFarmHome}
            className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-stone-700 hover:text-[#2d5a1b] shadow-sm transition-colors"
            title="الرئيسية"
          >
            <Home className="w-4 h-4 text-[#2d5a1b]" />
            <span>الرئيسية</span>
          </button>

          {farmId && (
            <>
              <ChevronLeft className="w-4 h-4 text-stone-400" />
              <button
                onClick={() => navigate(`/farms/${farmId}/animals`)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-stone-600 hover:text-[#2d5a1b] transition-colors"
                title="عرض حيوانات المزرعة"
              >
                <span>الحيوانات</span>
              </button>
            </>
          )}

          {farmId && (
            <>
              <ChevronLeft className="w-4 h-4 text-stone-400" />
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-[#2d5a1b]">
                <MapPin className="w-4 h-4" />
                <span>{displayFarmName}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Left Section: Profile, Notifications & Logout */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-all shadow-sm"
          title="الإشعارات"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-sm border-2 border-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-full pr-1 pl-3 py-1">
            {user?.avatar ? (
              <img
                src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover shadow-sm border border-white"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2d5a1b] to-[#3d7a25] text-white flex items-center justify-center text-sm font-bold shadow-sm border border-white">
                {user?.name?.charAt(0) || 'م'}
              </div>
            )}
            <div className="leading-tight hidden sm:block text-right">
              <p className="text-[11px] text-stone-500 font-medium">مرحباً بك،</p>
              <p className="text-sm font-bold text-stone-800 truncate max-w-[120px]">
                {user?.name?.split(' ')[0] || 'المستخدم'}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
          title="تسجيل الخروج"
        >
          <span className="text-sm font-bold hidden md:block">خروج</span>
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}