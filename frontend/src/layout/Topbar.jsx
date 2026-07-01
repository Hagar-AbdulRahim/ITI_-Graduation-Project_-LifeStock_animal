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
      className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3
                 bg-white/70 backdrop-blur-md border-b border-stone-200 shadow-sm"
    >
      {/* User Info */}
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification Bell */}
      <button
        type="button"
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

        {/* Badge — بيظهر بس لو فيه إشعارات غير مقروءة */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Help */}
      <button className="p-2 rounded-lg hover:bg-stone-100 transition-colors">
        <svg
          className="w-5 h-5 text-stone-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
      </button>
    </header >
  )
}
