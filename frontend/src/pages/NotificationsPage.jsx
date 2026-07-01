import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Bell, BellOff, Loader2, CheckCheck, RotateCw,
  AlertTriangle, Syringe, HeartPulse, ChevronRight,
  Trash2, CheckCircle2, EyeOff, Filter,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../redux/notificationSlice'

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const TYPE_META = {
  vaccination_reminder: {
    label: 'تذكير تطعيم', icon: Syringe,
    bg: 'from-sky-100 to-blue-100', ring: 'border-blue-200',
    text: 'text-blue-600', bar: 'bg-blue-400',
    badge: 'bg-blue-100 text-blue-700',
  },
  health_case: {
    label: 'صحة', icon: Bell,
    bg: 'from-rose-100 to-pink-100', ring: 'border-rose-200',
    text: 'text-rose-600', bar: 'bg-rose-400',
    badge: 'bg-rose-100 text-rose-700',
  },
  outbreak_alert: {
    label: 'وباء', icon: Bell,
    bg: 'from-red-100 to-orange-100', ring: 'border-red-200',
    text: 'text-red-600', bar: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
  },
  general: {
    label: 'إشعار', icon: Bell,
    bg: 'from-emerald-50 to-green-100', ring: 'border-emerald-200',
    text: 'text-emerald-700', bar: 'bg-[#2d5a1b]',
    badge: 'bg-emerald-100 text-emerald-700',
  },
}
const getMeta = (type) => TYPE_META[type] || TYPE_META.general

const relativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'الآن'
  if (mins < 60) return `منذ ${mins} دقيقة`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `منذ ${hrs} ساعة`
  return `منذ ${Math.floor(hrs / 24)} يوم`
}

const fullDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

/* ─── component ─────────────────────────────────────────────────────────────── */
export default function NotificationsPage() {
  const navigate   = useNavigate()
  const dispatch   = useDispatch()
  const { items: notifications, loading, error, unread_count } = useSelector(
    (state) => state.notifications
  )
  const [actionId, setActionId] = useState(null)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    dispatch(fetchNotifications())
    const interval = setInterval(() => dispatch(fetchNotifications()), 30000)
    return () => clearInterval(interval)
  }, [dispatch])

  /* تعيين كمقروء */
  const handleMarkRead = async (notif, e) => {
    e?.stopPropagation()
    if (notif.is_read) return
    setActionId(notif._id)
    try {
      await dispatch(markAsRead(notif._id)).unwrap()
      toast.success('تمت القراءة', { duration: 1500 })
    } catch {
      toast.error('فشل تحديث حالة الإشعار')
    } finally {
      setActionId(null)
    }
  }

  /* حذف */
  const handleDelete = async (id, e) => {
    e?.stopPropagation()
    setActionId(`del-${id}`)
    try {
      await dispatch(deleteNotification(id)).unwrap()
      toast.success('تم حذف الإشعار', { duration: 1500 })
    } catch {
      toast.error('فشل الحذف، حاول مرة أخرى')
    } finally {
      setActionId(null)
    }
  }

  /* تعيين الكل كمقروء */
  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap()
      toast.success('تم تعيين الكل كمقروء')
    } catch {
      toast.error('فشل في التحديث')
    }
  }

  /* حذف المقروء */
  const handleDeleteRead = async () => {
    const readItems = notifications.filter((n) => n.is_read)
    try {
      await Promise.all(readItems.map((n) => dispatch(deleteNotification(n._id)).unwrap()))
      toast.success('تم حذف الإشعارات المقروءة')
    } catch {
      toast.error('فشل في الحذف')
    }
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'read')   return n.is_read
    return true
  })

  const readCount = notifications.length - unread_count

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7f0] via-[#f8faf8] to-[#eef5ff] font-cairo" dir="rtl">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-white/60 shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">

          {/* العنوان */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-gray-900">مركز الإشعارات</h1>
              {unread_count > 0 && (
                <span className="min-w-[22px] h-[22px] px-1.5 bg-[#2a5c2a] text-white text-[11px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unread_count}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping inline-block"></span>
              متابعة فورية للمزرعة والقطعان
            </p>
          </div>

          {/* الأزرار */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(fetchNotifications())}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-[#2a5c2a] hover:border-green-300 transition-all"
              title="تحديث"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {readCount > 0 && (
              <button
                onClick={handleDeleteRead}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 hover:bg-rose-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">حذف المقروء</span>
              </button>
            )}

            {unread_count > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-[#1e4520] to-[#2a5c2a] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">تعيين الكل مقروء</span>
              </button>
            )}

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-500 text-xs font-bold hover:border-green-300 hover:text-[#2a5c2a] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
              رجوع
            </button>
          </div>
        </div>

        {/* فلترة */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-3 flex items-center gap-2">
          {[
            { key: 'all',    label: 'الكل',      count: notifications.length },
            { key: 'unread', label: 'غير مقروء', count: unread_count },
            { key: 'read',   label: 'مقروء',      count: readCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab.key
                  ? 'bg-[#2a5c2a] text-white shadow-md'
                  : 'bg-white/70 text-gray-500 hover:bg-white hover:text-gray-800 border border-gray-100'
              }`}
            >
              <Filter className="w-3 h-3" />
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                filter === tab.key ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50/80 border border-amber-200/50 rounded-2xl text-amber-700 text-sm font-bold">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-36">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-[#2a5c2a]/10 border-t-[#2a5c2a] animate-spin" />
              <Bell className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 text-[#2a5c2a]/40" />
            </div>
            <p className="mt-6 text-gray-400 font-bold text-sm animate-pulse">جاري مزامنة الإشعارات…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-24 h-24 rounded-3xl bg-[#f0fdf4] border border-[#c8dfc8] flex items-center justify-center mb-6">
              <BellOff className="w-10 h-10 text-[#2a5c2a]/40" />
            </div>
            <h3 className="text-xl font-black text-gray-700 mb-2">
              {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة'
               : filter === 'read'   ? 'لا توجد إشعارات مقروءة'
               : 'لا توجد إشعارات'}
            </h3>
            <p className="text-sm text-gray-400 font-medium max-w-xs">
              ستصلك الإشعارات تلقائياً عند وجود تحديثات في مزرعتك.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((notif) => {
              const meta       = getMeta(notif.type)
              const isDeleting = actionId === `del-${notif._id}`
              const isToggling = actionId === notif._id

              return (
                <div
                  key={notif._id}
                  className={`group relative flex overflow-hidden rounded-2xl border transition-all duration-300
                    ${notif.is_read
                      ? 'bg-gray-50/80 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5'
                      : 'bg-white border-[#c8dfc8] shadow-[0_4px_24px_rgba(42,92,42,0.07)] hover:border-[#2a5c2a] hover:shadow-[0_8px_32px_rgba(42,92,42,0.15)] hover:-translate-y-0.5'
                    }`}
                >
                  {/* شريط اللون الجانبي */}
                  <div className={`w-1.5 flex-shrink-0 ${meta.bar}`} />

                  <div className="flex-1 px-6 py-5">
                    {/* الصف العلوي: جرس + عنوان + badges + أزرار */}
                    <div className="flex items-start gap-3">
                      {/* أيقونة الجرس */}
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${meta.bg} ${meta.text} border ${meta.ring} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Bell className="w-5 h-5" />
                      </div>

                      {/* العنوان والـ badges */}
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <h3 className={`text-[16px] leading-snug ${notif.is_read ? 'font-semibold text-gray-600' : 'font-black text-gray-900'}`}>
                            {notif.title}
                          </h3>
                          {!notif.is_read && (
                            <span className="px-2 py-0.5 rounded-full bg-[#2a5c2a] text-white text-[10px] font-black">جديد</span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.badge}`}>
                            {meta.label}
                          </span>
                        </div>

                        {/* أزرار تظهر على hover */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          {!notif.is_read && (
                            <button
                              onClick={(e) => handleMarkRead(notif, e)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border text-[#2a5c2a] border-green-200 bg-green-50 hover:bg-green-100 transition-all"
                            >
                              {isToggling
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <><CheckCircle2 className="w-3.5 h-3.5" /><span>مقروء</span></>
                              }
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(notif._id, e)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-500 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-all"
                          >
                            {isDeleting
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <><Trash2 className="w-3.5 h-3.5" /><span>حذف</span></>
                            }
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* نص الإشعار */}
                    <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2 mt-2 pr-12">
                      {notif.body || notif.message || ''}
                    </p>

                    {/* الوقت مع tooltip */}
                    <div className="relative inline-block mt-2 pr-12 group/time">
                      <span className="text-[11px] text-gray-400 font-bold border-b border-dashed border-gray-300 cursor-default">
                        {relativeTime(notif.created_at)}
                      </span>
                      <div className="absolute bottom-full right-0 mb-1.5 px-2.5 py-1.5 bg-gray-900 text-white text-[11px] font-medium rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover/time:opacity-100 transition-opacity duration-150 z-10">
                        {fullDateTime(notif.created_at)}
                        <div className="absolute top-full right-3 border-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
