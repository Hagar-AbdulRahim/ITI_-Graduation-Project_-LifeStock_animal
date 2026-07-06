import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Bell,
  BellOff,
  Loader2,
  CheckCheck,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Search,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../redux/notificationSlice'

const TYPE_CONFIG = {
  vaccination_reminder: {
    label: 'تذكير تطعيم',
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  health_case: {
    label: 'حالة صحية',
    badge: 'bg-rose-100 text-rose-700 border border-rose-200',
  },
  outbreak_alert: {
    label: 'تنبيه وباء',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  general: {
    label: 'إشعار',
    badge: 'bg-[#2d5a1b]/10 text-[#2d5a1b] border border-[#2d5a1b]/20',
  },
}
const getCfg = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.general

const relativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'الآن'
  if (m < 60) return `منذ ${m} د`
  const h = Math.floor(m / 60)
  if (h < 24) return `منذ ${h} س`
  return `منذ ${Math.floor(h / 24)} ي`
}

const fullDateTime = (dateStr) =>
  new Date(dateStr).toLocaleString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

const stripEmoji = (str) =>
  str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim()


/* ─── main ───────────────────────────────────────────────────────────────────── */
export default function NotificationsPage() {
  const dispatch = useDispatch()
  const { items: notifications, loading, error, unread_count } = useSelector(
    (s) => s.notifications
  )
  const [actionId, setActionId] = useState(null)
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    dispatch(fetchNotifications())
    const t = setInterval(() => dispatch(fetchNotifications()), 60000)
    return () => clearInterval(t)
  }, [dispatch])

  const handleMarkRead = async (notif, e) => {
    e?.stopPropagation()
    if (notif.is_read) return
    setActionId(notif._id)
    try {
      await dispatch(markAsRead(notif._id)).unwrap()
      toast.success('تم التعليم كمقروء')
    } catch { toast.error('فشل التحديث') }
    finally { setActionId(null) }
  }

  const handleDelete = async (id, e) => {
    e?.stopPropagation()
    setActionId(`del-${id}`)
    try {
      await dispatch(deleteNotification(id)).unwrap()
      toast.success('تم الحذف')
    } catch { toast.error('فشل الحذف') }
    finally { setActionId(null) }
  }

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap()
      toast.success('تم تعيين الكل كمقروء')
    } catch { toast.error('فشل التحديث') }
  }

  const handleDeleteRead = async () => {
    const readItems = notifications.filter((n) => n.is_read)
    try {
      await Promise.all(readItems.map((n) => dispatch(deleteNotification(n._id)).unwrap()))
      toast.success('تم حذف الإشعارات المقروءة')
    } catch { toast.error('فشل في الحذف') }
  }

  const readCount  = notifications.length - unread_count

  const filtered = notifications.filter((n) => {
    const matchFilter = filter === 'all' ? true : filter === 'unread' ? !n.is_read : n.is_read
    const text = (n.title + ' ' + (n.body || n.message || '')).toLowerCase()
    const matchSearch = search ? text.includes(search.toLowerCase()) : true
    return matchFilter && matchSearch
  })

  const TABS = [
    { key: 'all',    label: 'الكل',      count: notifications.length },
    { key: 'unread', label: 'غير مقروء', count: unread_count },
    { key: 'read',   label: 'مقروء',     count: readCount },
  ]

   return (
  <div className="font-cairo" dir="rtl">
    
    

    <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8">

      {/* Toolbar */}
      <div className="bg-gradient-to-br from-[#2d5a1b] to-[#2a5c2a] rounded-[32px] px-6 py-5 mb-8 shadow-[0_12px_40px_rgba(45,90,27,0.18)] border border-white/10">

        <div className="flex items-center justify-between gap-4 flex-wrap">

          {/* Tabs */}
          <div className="flex items-center gap-3 flex-wrap">

            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  filter === tab.key
                    ? 'bg-white text-[#2d5a1b] shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {tab.label}

                <span
                  className={`text-[11px] min-w-[22px] h-5 px-1 rounded-full font-black flex items-center justify-center ${
                    filter === tab.key
                      ? 'bg-[#2d5a1b]/10 text-[#2d5a1b]'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">

            {readCount > 0 && (
              <button
                onClick={handleDeleteRead}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-all duration-300"
              >
                <Trash2 className="w-4 h-4" />
                حذف المقروء
              </button>
            )}

            {unread_count > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white text-[#2d5a1b] text-sm font-bold shadow-sm hover:bg-white/90 transition-all duration-300"
              >
                <CheckCheck className="w-4 h-4" />
                تعيين الكل مقروء
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-5">

          <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في الإشعارات..."
            className="w-full bg-white/20 border border-white/25 rounded-2xl py-4 pr-14 pl-5 text-sm text-white placeholder:text-white/65 outline-none focus:bg-white/25 focus:border-white/40 transition-all duration-300"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-bold">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && notifications.length === 0 ? (

        <div className="flex flex-col items-center justify-center py-32">

          <div className="w-12 h-12 border-2 border-[#2d5a1b]/20 border-t-[#2d5a1b] rounded-full animate-spin mb-4" />

          <p className="text-sm text-gray-500 font-bold">
            جاري التحميل…
          </p>
        </div>

      ) : filtered.length === 0 ? (

        /* Empty */
        <div className="flex flex-col items-center justify-center py-28 text-center">

          <div className="w-20 h-20 rounded-[30px] bg-[#2d5a1b]/5 border border-[#2d5a1b]/10 flex items-center justify-center mb-5">

            <BellOff className="w-8 h-8 text-[#2d5a1b]/40" />
          </div>

          <p className="text-base font-bold text-gray-600 mb-2">

            {search
              ? 'لا توجد نتائج للبحث'
              : filter === 'unread'
              ? 'لا توجد إشعارات غير مقروءة'
              : filter === 'read'
              ? 'لا توجد إشعارات مقروءة'
              : 'لا توجد إشعارات'}
          </p>

          <p className="text-sm text-gray-400">
            ستصلك الإشعارات تلقائياً عند وجود تحديثات في مزرعتك.
          </p>
        </div>

      ) : (

        /* Notifications */
        <div className="flex flex-col gap-6">

          {filtered.map((notif) => {

            const cfg = getCfg(notif.type)
            const isDeleting = actionId === `del-${notif._id}`
            const isMarking = actionId === notif._id
            const isRead = notif.is_read
            const bodyText = notif.body || notif.message || ''
            const title = stripEmoji(notif.title)

            return (
              <div
  key={notif._id}
  className={`group relative rounded-[24px] border overflow-hidden transition-all duration-300 cursor-pointer hover:scale-[0.992] ${
    isRead
      ? 'bg-white border-[#dfe8db] hover:border-[#7ea86f] hover:shadow-[0_12px_35px_rgba(45,90,27,0.10)]'
      : 'bg-[#f6fbf4] border-[#bfd4b8] hover:border-[#5d8a4b] hover:shadow-[0_14px_40px_rgba(45,90,27,0.14)]'
  }`}
>

  {/* green hover border */}
  <div className="absolute inset-0 rounded-[24px] border border-transparent group-hover:border-[#5d8a4b] transition-all duration-300 pointer-events-none" />

  <div className="px-6 py-5">

    <div className="flex items-start gap-4">

      {/* icon */}
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          isRead
            ? 'bg-[#2d5a1b]/8 text-[#2d5a1b]'
            : 'bg-[#2d5a1b]/10 text-[#2d5a1b]'
        }`}
      >
        <Bell className="w-7 h-7" />
      </div>

      {/* content */}
      <div className="flex-1 min-w-0">

        {/* top row */}
        <div className="flex items-start justify-between gap-4 mb-3">

          {/* title area */}
          <div className="flex items-center gap-3 flex-wrap">

            <h3
              className={`text-[18px] ${
                isRead
                  ? 'font-bold text-[#1f2937]'
                  : 'font-black text-[#154b23]'
              }`}
            >
              {title}
            </h3>

            {!isRead && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#2d5a1b]" />
            )}

            <span
              className={`text-[12px] font-bold px-3 py-1.5 rounded-full ${cfg.badge}`}
            >
              {cfg.label}
            </span>
          </div>

          {/* actions */}
          <div
            className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >

            {!isRead && (
              <button
                onClick={(e) => handleMarkRead(notif, e)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#2d5a1b]/10 text-[#2d5a1b] hover:bg-[#2d5a1b]/15 transition-all"
              >
                {isMarking ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>مقروء</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={(e) => handleDelete(notif._id, e)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* body */}
        <p
          className={`text-[15px] leading-relaxed ${
            isRead
              ? 'text-gray-500'
              : 'text-[#2d5a1b]/80'
          }`}
        >
          {bodyText}
        </p>

       {/* time only */}
      <div className="mt-4 flex items-center justify-between">

        <div className="relative group/time">

          <span
            className={`text-sm border-b border-dashed pb-0.5 cursor-default ${
              isRead
                ? 'text-gray-400 border-gray-300'
                : 'text-[#2d5a1b]/60 border-[#2d5a1b]/20'
            }`}
          >
            {relativeTime(notif.created_at)}
          </span>

          <div className="absolute bottom-full left-[-30px] mb-3 px-4 py-2.5 bg-gray-900 text-white text-[11px] font-medium rounded-xl whitespace-nowrap pointer-events-none opacity-0 group-hover/time:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
            {fullDateTime(notif.created_at)}
          </div>
        </div>
      </div>
            </div>
          </div>
        </div>
      </div>

            )
          })}
        </div>
      )}
    </div>
  </div>

  )
}