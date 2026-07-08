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
                 bg-[#1b4d2c] border-b border-[#154022] shadow-md"

    >
      {/* Right Section: Breadcrumbs & Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/farms')}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all shadow-sm"
          title="العودة إلى صفحة المزارع"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-2 bg-white/10 p-1.5 rounded-full border border-white/20">
          <button
            onClick={goToFarmHome}
            className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/30 shadow-sm transition-colors"
            title="الرئيسية"
          >
            <Home className="w-4 h-4 text-white" />
            <span>الرئيسية</span>
          </button>

          {farmId && (
            <>
              <ChevronLeft className="w-4 h-4 text-white/50" />
              <button
                onClick={() => navigate(`/farms/${farmId}/animals`)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors"
                title="عرض حيوانات المزرعة"
              >
                <span>الحيوانات</span>
              </button>
            </>
          )}

          {farmId && (
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

      {/* Left Section: Profile, Notifications & Logout */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
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

        {/* User Profile Info */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/20">
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-full pr-1 pl-3 py-1">
            {user?.avatar ? (
              <img
                src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover shadow-sm border-2 border-white/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-bold shadow-sm border-2 border-white/30">
                {user?.name?.charAt(0) || 'م'}
              </div>
            )}
            <div className="leading-tight hidden sm:block text-right">
              <p className="text-[11px] text-white/60 font-medium">مرحباً بك،</p>
              <p className="text-sm font-bold text-white truncate max-w-[120px]">
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