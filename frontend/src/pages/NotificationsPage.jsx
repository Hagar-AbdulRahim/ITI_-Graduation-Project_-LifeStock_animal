import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  BellOff,
  Loader2,
  CheckCheck,
  RotateCw,
  AlertTriangle,
  Syringe,
  HeartPulse,
  ChevronRight,
  Trash2,
  CheckCircle2,
  EyeOff,
  Filter,
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const TYPE_META = {
  vaccination: {
    label: 'تطعيم',
    icon: Syringe,
    bg: 'from-sky-100 to-blue-100',
    ring: 'border-blue-200',
    text: 'text-blue-600',
    bar: 'from-blue-400 to-cyan-400',
    badge: 'bg-blue-100 text-blue-700',
  },
  vaccination_reminder: {
    label: 'تذكير تطعيم',
    icon: Syringe,
    bg: 'from-sky-100 to-blue-100',
    ring: 'border-blue-200',
    text: 'text-blue-600',
    bar: 'from-blue-400 to-cyan-400',
    badge: 'bg-blue-100 text-blue-700',
  },
  health: {
    label: 'صحة',
    icon: HeartPulse,
    bg: 'from-rose-100 to-pink-100',
    ring: 'border-rose-200',
    text: 'text-rose-600',
    bar: 'from-rose-400 to-pink-400',
    badge: 'bg-rose-100 text-rose-700',
  },
  health_case: {
    label: 'صحة',
    icon: HeartPulse,
    bg: 'from-rose-100 to-pink-100',
    ring: 'border-rose-200',
    text: 'text-rose-600',
    bar: 'from-rose-400 to-pink-400',
    badge: 'bg-rose-100 text-rose-700',
  },
  alert: {
    label: 'تنبيه',
    icon: AlertTriangle,
    bg: 'from-amber-100 to-yellow-100',
    ring: 'border-amber-200',
    text: 'text-amber-600',
    bar: 'from-amber-400 to-yellow-400',
    badge: 'bg-amber-100 text-amber-700',
  },
  outbreak_alert: {
    label: 'وباء',
    icon: AlertTriangle,
    bg: 'from-red-100 to-orange-100',
    ring: 'border-red-200',
    text: 'text-red-600',
    bar: 'from-red-500 to-orange-400',
    badge: 'bg-red-100 text-red-700',
  },
  default: {
    label: 'إشعار',
    icon: Bell,
    bg: 'from-emerald-50 to-green-100',
    ring: 'border-emerald-200',
    text: 'text-emerald-700',
    bar: 'from-emerald-400 to-green-400',
    badge: 'bg-emerald-100 text-emerald-700',
  },
}

const getMeta = (type) => TYPE_META[type] || TYPE_META.default

const relativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `منذ ${mins} دقيقة`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `منذ ${hrs} ساعة`
  const days = Math.floor(hrs / 24)
  return `منذ ${days} يوم`
}

/* ─── component ─────────────────────────────────────────────────────────────── */
const NotificationsPage = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionId, setActionId] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'unread' | 'read'

  /* جلب الإشعارات من الباك إند */
  const fetchNotifs = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await api.get('/api/notifications')
      setNotifications(res.data.data || [])
      setError(null)
    } catch (err) {
      setNotifications([])
      setError(
        err.response?.status === 401
          ? 'يرجى تسجيل الدخول مرة أخرى'
          : 'لا يمكن الاتصال بالخادم لجلب الإشعارات'
      )
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifs()
    // تحديث تلقائي كل 30 ثانية
    const interval = setInterval(() => fetchNotifs(true), 30000)
    return () => clearInterval(interval)
  }, [])

  /* تعيين كمقروء / غير مقروء */
  const handleToggleRead = async (notif, e) => {
    e?.stopPropagation()
    setActionId(notif._id)
    try {
      await api.put(`/api/notifications/${notif._id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, is_read: !notif.is_read } : n))
      )
      toast.success(!notif.is_read ? '✓ تمت القراءة' : '↩ تعيين كغير مقروء', { duration: 1500 })
    } catch {
      toast.error('فشل تحديث حالة الإشعار')
    } finally {
      setActionId(null)
    }
  }

  /* حذف إشعار */
  const handleDelete = async (id, e) => {
    e?.stopPropagation()
    setActionId(`del-${id}`)
    try {
      await api.delete(`/api/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      toast.success('🗑 تم حذف الإشعار', { duration: 1500 })
    } catch {
      toast.error('فشل الحذف، حاول مرة أخرى')
    } finally {
      setActionId(null)
    }
  }

  /* تعيين الكل كمقروء */
  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success('✓ تم تعيين الكل كمقروء')
    } catch {
      toast.error('فشل في التحديث')
    }
  }

  /* الفلترة */
  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'read') return n.is_read
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7f0] via-[#f8faf8] to-[#eef5ff] font-cairo" dir="rtl">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-white/60 shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">

          {/* زر الرجوع + العنوان */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm text-gray-500 hover:text-[#2a5c2a] hover:border-green-200 transition-all hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-gray-900">مركز الإشعارات</h1>
                {unreadCount > 0 && (
                  <span className="min-w-[22px] h-[22px] px-1.5 bg-[#2a5c2a] text-white text-[11px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping inline-block"></span>
                متابعة فورية للمزرعة والقطعان
              </p>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNotifs(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-[#2a5c2a] hover:border-green-300 transition-all hover:shadow-sm"
              title="تحديث"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-[#1e4520] to-[#2a5c2a] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">تعيين الكل مقروء</span>
              </button>
            )}
          </div>
        </div>

        {/* ── تاب الفلترة ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-3 flex items-center gap-2">
          {[
            { key: 'all', label: 'الكل', count: notifications.length },
            { key: 'unread', label: 'غير مقروء', count: unreadCount },
            { key: 'read', label: 'مقروء', count: notifications.length - unreadCount },
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

      {/* ── MAIN ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

        {/* بنر الخطأ */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50/80 border border-amber-200/50 rounded-2xl text-amber-700 text-sm font-bold">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* تحميل */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-36">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-[#2a5c2a]/10 border-t-[#2a5c2a] animate-spin" />
              <Bell className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 text-[#2a5c2a]/40" />
            </div>
            <p className="mt-6 text-gray-400 font-bold text-sm animate-pulse">جاري مزامنة الإشعارات…</p>
          </div>

        /* لا توجد إشعارات */
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 shadow-inner flex items-center justify-center mb-6">
              <BellOff className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-700 mb-2">
              {filter === 'all'
                ? 'لا توجد إشعارات'
                : filter === 'unread'
                ? 'لا توجد إشعارات غير مقروءة'
                : 'لا توجد إشعارات مقروءة'}
            </h3>
            <p className="text-sm text-gray-400 font-medium max-w-xs">
              ستصلك الإشعارات تلقائياً عند وجود تحديثات في مزرعتك.
            </p>
          </div>

        /* قائمة الإشعارات */
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((notif) => {
              const meta = getMeta(notif.type)
              const Icon = meta.icon
              const isDeleting = actionId === `del-${notif._id}`
              const isToggling = actionId === notif._id
              const displayText = notif.message || notif.body || ''

              return (
                <div
                  key={notif._id}
                  className={`relative flex flex-col gap-3 p-5 rounded-3xl border transition-all duration-300 overflow-hidden
                    ${notif.is_read
                      ? 'bg-white/60 border-gray-100 shadow-sm opacity-80'
                      : 'bg-white border-gray-100 shadow-[0_4px_24px_rgba(42,92,42,0.07)]'
                    }`}
                >
                  {/* شريط غير مقروء */}
                  {!notif.is_read && (
                    <div className={`absolute right-0 top-4 bottom-4 w-1 rounded-l-full bg-gradient-to-b ${meta.bar}`} />
                  )}

                  {/* الصف العلوي: الأيقونة + المحتوى */}
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.bg} ${meta.text} border ${meta.ring} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className={`text-[15px] leading-snug ${notif.is_read ? 'font-semibold text-gray-700' : 'font-black text-gray-900'}`}>
                          {notif.title}
                        </h3>
                        {!notif.is_read && (
                          <span className="px-2 py-0.5 rounded-full bg-[#2a5c2a] text-white text-[10px] font-black">
                            جديد
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">
                        {displayText}
                      </p>

                      <span className="inline-block mt-2 text-[11px] text-gray-400 font-bold bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">
                        🕐 {relativeTime(notif.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* أزرار الإجراءات — دايماً ظاهرة */}
                  <div
                    className="flex items-center gap-2 pt-3 border-t border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* تعيين كمقروء / غير مقروء */}
                    <button
                      id={`read-btn-${notif._id}`}
                      onClick={(e) => handleToggleRead(notif, e)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border
                        ${notif.is_read
                          ? 'text-gray-500 border-gray-200 hover:bg-gray-50'
                          : 'text-[#2a5c2a] border-green-200 bg-green-50 hover:bg-green-100'
                        }`}
                    >
                      {isToggling
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : notif.is_read
                          ? <><EyeOff className="w-4 h-4" /><span>غير مقروء</span></>
                          : <><CheckCircle2 className="w-4 h-4" /><span>تعيين كمقروء</span></>
                      }
                    </button>

                    {/* حذف */}
                    <button
                      id={`delete-btn-${notif._id}`}
                      onClick={(e) => handleDelete(notif._id, e)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-500 border border-rose-200 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 transition-all"
                    >
                      {isDeleting
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <><Trash2 className="w-4 h-4" /><span>حذف</span></>
                      }
                    </button>
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

export default NotificationsPage
