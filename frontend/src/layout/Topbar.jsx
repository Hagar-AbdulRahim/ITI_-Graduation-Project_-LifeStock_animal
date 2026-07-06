import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchNotifications } from '../redux/notificationSlice'

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

  useEffect(() => {
    dispatch(fetchNotifications())
    const interval = setInterval(() => dispatch(fetchNotifications()), 60000)
    return () => clearInterval(interval)
  }, [dispatch])

  return (
    <header
      dir="rtl"
      className="hidden lg:flex sticky top-0 z-30 items-center gap-4 px-6 py-3
                 bg-white/70 backdrop-blur-md border-b border-stone-200 shadow-sm"
    >
      <button
        onClick={() => navigate('/farms')}
        className="flex items-center justify-center w-9 h-9 rounded-full border border-[#2d5a1b]/10 bg-[#f5f8f3] text-[#2d5a1b] hover:bg-[#edf4e8] transition-colors"
        title="العودة إلى صفحة المزارع"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        onClick={goToFarmHome}
        className="flex items-center gap-2 rounded-full border border-[#2d5a1b]/10 bg-[#f5f8f3] px-3 py-2 text-sm font-semibold text-[#2d5a1b] hover:bg-[#edf4e8] transition-colors"
        title="العودة إلى صفحة المزرعة"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>الرئيسية</span>
      </button>

      <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-2 shadow-sm">
        <div className="h-2.5 w-2.5 rounded-full bg-[#2d5a1b]" />
        <div className="leading-tight">
          <p className="text-[11px] text-stone-500">أنت الآن في</p>
          <p className="text-sm font-semibold text-stone-800">{displayFarmName}</p>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors"
          title="الإشعارات"
        >
          <svg
            className="w-5 h-5 text-stone-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
              alt={user.name}
              className="w-9 h-9 rounded-lg object-cover shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-[#2d5a1b] text-white flex items-center justify-center text-sm font-bold shadow-sm">
              {user?.name?.charAt(0) || 'م'}
            </div>
          )}
          <div className="leading-tight">
            <p className="text-sm font-semibold text-stone-800">
              {user?.name || 'المستخدم'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}