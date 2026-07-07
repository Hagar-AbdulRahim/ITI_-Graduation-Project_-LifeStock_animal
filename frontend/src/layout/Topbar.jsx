import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchNotifications } from '../redux/notificationSlice'

export default function Topbar() {
  const user = useSelector((state) => state.auth.user)
  const unreadCount = useSelector((state) => state.notifications.unread_count)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // جلب عدد الإشعارات غير المقروءة عند تحميل الـ Topbar
  useEffect(() => {
    dispatch(fetchNotifications())
    // تحديث كل دقيقة
    const interval = setInterval(() => dispatch(fetchNotifications()), 60000)
    return () => clearInterval(interval)
  }, [dispatch])

  return (
    <header
      dir="rtl"
      className="hidden lg:flex sticky top-0 z-30 items-center gap-4 px-6 py-3
                 bg-[#1b4d2c] border-b border-[#154022] shadow-md"
    >
      {/* User Info */}
      <div className="flex items-center gap-3">
        {user?.avatar ? (
          <img
            src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
            alt={user.name}
            className="w-9 h-9 rounded-lg object-cover shadow-sm border-2 border-white/20"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center text-sm font-bold shadow-sm">
            {user?.name?.charAt(0) || 'م'}
          </div>
        )}
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">
            {user?.name || 'المستخدم'}
          </p>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification Bell */}
      <button
        onClick={() => navigate('/notifications')}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        title="الإشعارات"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>

        {/* Badge — بيظهر بس لو فيه إشعارات غير مقروءة */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Home */}
      <button
        onClick={() => navigate('/')}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        title="الصفحة الرئيسية"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
    </header >
  )
}