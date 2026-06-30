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
  Sparkles,
  Trash2,
  CheckCircle2,
  EyeOff,
  Filter,
  X,
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
  health: {
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
  const [testLoading, setTestLoading] = useState(false)

  /* fetch */
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
    const interval = setInterval(() => fetchNotifs(true), 30000)
    return () => clearInterval(interval)
  }, [])

  /* toggle read */
  const handleToggleRead = async (notif, e) => {
    e?.stopPropagation()
    setActionId(notif._id)
    const newState = !notif.is_read
    try {
      await api.put(`/api/notifications/${notif._id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, is_read: newState } : n))
      )
      toast.success(newState ? '✓ تمت القراءة' : '↩ تعيين كغير مقروء', { duration: 1500 })
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, is_read: newState } : n))
      )
      toast.success(newState ? '✓ تمت القراءة محلياً' : '↩ غير مقروء', { duration: 1500 })
    } finally {
      setActionId(null)
    }
  }

  /* delete */
  const handleDelete = async (id, e) => {
    e?.stopPropagation()
    setActionId(`del-${id}`)
    try {
      if (!id.startsWith('demo-')) await api.delete(`/api/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      toast.success('🗑 تم حذف الإشعار', { duration: 1500 })
    } catch {
      toast.error('فشل الحذف، حاول مرة أخرى')
    } finally {
      setActionId(null)
    }
  }

  /* mark all read */
  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success('✓ تم تعيين الكل كمقروء')
    } catch {
      toast.error('فشل في التحديث')
    }
  }

  /* test run */
  const handleTestRun = async () => {
    setTestLoading(true)
    try {
      await api.post('/api/notifications/test-run')
      await fetchNotifs()
      toast.success('⚡ تم تشغيل نظام فحص الإشعارات')
    } catch {
      toast.error('فشل تشغيل النظام')
    } finally {
      setTestLoading(false)
    }
  }

  /* filtered list */
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

          {/* back + title */}
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

          {/* actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNotifs(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-[#2a5c2a] hover:border-green-300 transition-all hover:shadow-sm"
              title="تحديث"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleMarkAllRead}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-[#1e4520] to-[#2a5c2a] text-white text-xs font-bold shadow-md hover:shadow-lg hover:shadow-green-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <CheckCheck className="w-4 h-4" />
              تعيين الكل مقروء
            </button>
          </div>
        </div>

        {/* ── FILTER TABS ── */}
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

        {/* error banner */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50/80 border border-amber-200/50 rounded-2xl text-amber-700 text-sm font-bold backdrop-blur-sm shadow-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-36">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-[#2a5c2a]/10 border-t-[#2a5c2a] animate-spin" />
              <Bell className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 text-[#2a5c2a]/40" />
            </div>
            <p className="mt-6 text-gray-400 font-bold text-sm animate-pulse">جاري مزامنة الإشعارات…</p>
          </div>

        /* empty */
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 shadow-inner flex items-center justify-center mb-6">
              <BellOff className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-700 mb-2">
              {filter === 'all' ? 'لا توجد إشعارات' : filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات مقروءة'}
            </h3>
            <p className="text-sm text-gray-400 font-medium mb-8 max-w-xs">
              كل شيء في مزارعك يعمل بكفاءة وأمان تام.
            </p>
            <button
              onClick={handleTestRun}
              disabled={testLoading}
              className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-[#2a5c2a]/30 text-[#2a5c2a] rounded-2xl text-sm font-bold hover:border-[#2a5c2a] hover:bg-green-50 transition-all disabled:opacity-60"
            >
              {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              تشغيل نظام فحص الإشعارات
            </button>
          </div>

        /* list */
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((notif) => {
              const meta = getMeta(notif.type)
              const Icon = meta.icon
              const isDeleting = actionId === `del-${notif._id}`
              const isToggling = actionId === notif._id

              return (
                <div
                  key={notif._id}
                  className={`group relative flex flex-col sm:flex-row gap-4 p-5 rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer
                    ${notif.is_read
                      ? 'bg-white/60 border-gray-100 shadow-sm hover:shadow-md hover:bg-white/80 opacity-75 hover:opacity-100'
                      : 'bg-white border-gray-100 shadow-[0_4px_24px_rgba(42,92,42,0.07)] hover:shadow-[0_8px_32px_rgba(42,92,42,0.12)]'
                    }`}
                  onClick={(e) => handleToggleRead(notif, e)}
                >
                  {/* unread side bar */}
                  {!notif.is_read && (
                    <div className={`absolute right-0 top-4 bottom-4 w-1 rounded-l-full bg-gradient-to-b ${meta.bar}`} />
                  )}

                  {/* icon */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.bg} ${meta.text} border ${meta.ring} flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`text-[15px] leading-snug ${notif.is_read ? 'font-semibold text-gray-700' : 'font-black text-gray-900'}`}>
                        {notif.title}
                      </h3>
                      {!notif.is_read && (
                        <span className="px-2 py-0.5 rounded-full bg-[#2a5c2a] text-white text-[10px] font-black uppercase tracking-wide">
                          جديد
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.badge}`}>
                        {meta.label}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    <span className="inline-block mt-2 text-[11px] text-gray-400 font-bold bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">
                      🕐 {relativeTime(notif.created_at)}
                    </span>
                  </div>

                  {/* action buttons */}
                  <div
                    className="flex sm:flex-col items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 self-start mt-1 border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* read toggle */}
                    <button
                      onClick={(e) => handleToggleRead(notif, e)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                        ${notif.is_read
                          ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                          : 'text-[#2a5c2a] hover:bg-green-50'
                        }`}
                      title={notif.is_read ? 'تعيين كغير مقروء' : 'تعيين كمقروء'}
                    >
                      {isToggling
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : notif.is_read
                          ? <><EyeOff className="w-4 h-4" /><span className="hidden sm:inline">غير مقروء</span></>
                          : <><CheckCircle2 className="w-4 h-4" /><span className="hidden sm:inline">مقروء</span></>
                      }
                    </button>

                    {/* delete */}
                    <button
                      onClick={(e) => handleDelete(notif._id, e)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                      title="حذف الإشعار"
                    >
                      {isDeleting
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <><Trash2 className="w-4 h-4" /><span className="hidden sm:inline">حذف</span></>
                      }
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* footer test run button when list exists */}
        {!loading && notifications.length > 0 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handleTestRun}
              disabled={testLoading}
              className="flex items-center gap-2 px-5 py-2.5 border border-dashed border-gray-300 text-gray-400 rounded-2xl text-xs font-bold hover:border-[#2a5c2a] hover:text-[#2a5c2a] hover:bg-green-50 transition-all disabled:opacity-50"
            >
              {testLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              تشغيل نظام فحص الإشعارات
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default NotificationsPage
