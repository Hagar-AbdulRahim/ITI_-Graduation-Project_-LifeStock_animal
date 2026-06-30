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
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const NotificationsPage = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const fetchNotifs = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await api.get('/api/notifications')
      setNotifications(res.data.data || [])
      setError(null)
    } catch (err) {
      const fallback = [
        {
          _id: 'demo-1',
          title: 'تنبيه تطعيم قريب',
          message: 'يحتاج الحيوان إلى جرعة متابعة خلال 48 ساعة.',
          type: 'vaccination',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          _id: 'demo-2',
          title: 'تحديث طبي جديد',
          message: 'تم تسجيل مراجعة طبية جديدة في السجل الصحي.',
          type: 'health',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
      ]
      setNotifications(fallback)
      setError(
        err.response?.status === 401
          ? 'يرجى تسجيل الدخول مرة أخرى للمتابعة'
          : 'تم عرض بيانات تجريبية مؤقتة بسبب عدم توفر الخادم',
      )
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifs()

    // Periodic refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifs(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: true } : n)),
      )
    } catch (err) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: true } : n)),
      )
      toast.error('تم تحديث الحالة محلياً بسبب تعذر الاتصال بالخادم')
    }
  }

  const handleToggleReadState = async (notif) => {
    if (notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, is_read: false } : n)),
      )
      toast.success('تم إعادة الإشعار إلى الحالة غير المقروءة')
      return
    }

    try {
      setTogglingId(notif._id)
      await api.put(`/api/notifications/${notif._id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, is_read: true } : n)),
      )
      toast.success('تمت قراءة الإشعار')
    } catch (err) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, is_read: true } : n)),
      )
      toast.error('تم تحديث الحالة محلياً')
    } finally {
      setTogglingId(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success('تم تحديد الكل كمقروء')
    } catch (err) {
      toast.error('فشل في تعديل حالة الإشعارات')
    }
  }

  const handleGenerateTest = async () => {
    try {
      await api.post('/api/notifications/test-run')
      fetchNotifs()
      toast.success('تم إنشاء إشعارات تجريبية بنجاح')
    } catch (err) {
      toast.error('فشل في إنشاء إشعارات تجريبية')
    }
  }

  const getNotifIcon = (type) => {
    switch (type) {
      case 'vaccination':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
            <Syringe className="w-5 h-5" />
          </div>
        )
      case 'health':
        return (
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 flex-shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
        )
      case 'alert':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 flex-shrink-0 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center border border-gray-100 flex-shrink-0">
            <Bell className="w-5 h-5" />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5] font-cairo" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-gray-900">
                مركز الإشعارات والتنبيهات
              </h1>
              <p className="text-[11px] text-gray-400 font-medium">
                متابعة فورية ومباشرة لحالة المزرعة والقطعان
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNotifs(false)}
              className="p-2.5 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              title="تحديث"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2a5c2a] text-white rounded-xl text-xs font-bold hover:bg-[#1e4520] transition-colors shadow-sm"
            >
              <CheckCheck className="w-4 h-4" />
              تحديد الكل كمقروء
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error ? (
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#2a5c2a] animate-spin mb-4" />
            <p className="text-gray-400 font-medium text-sm">
              جاري تحميل الإشعارات...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-semibold text-gray-600">
              لا توجد إشعارات حالياً
            </p>
            <p className="text-xs text-gray-400 mt-1">
              كل شيء يسير على ما يرام في مزارعك.
            </p>
            <button
              onClick={handleGenerateTest}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 border border-dashed border-[#2a5c2a] text-[#2a5c2a] rounded-xl text-xs font-bold hover:bg-green-50/50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              توليد إشعارات تجريبية (Test Data)
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => !notif.is_read && handleMarkAsRead(notif._id)}
                className={`bg-white border rounded-2xl p-4 flex items-start justify-between gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  notif.is_read
                    ? 'border-gray-200 opacity-80'
                    : 'border-green-200 bg-green-50/10'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  {getNotifIcon(notif.type)}
                  <div className="flex-1">
                    <h3
                      className={`text-sm font-bold text-gray-900 ${!notif.is_read ? 'font-black text-green-900' : ''}`}
                    >
                      {notif.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-2 block">
                      {new Date(notif.created_at).toLocaleString('ar-EG')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleReadState(notif)
                    }}
                    className="text-[11px] font-bold text-[#2a5c2a] hover:text-[#1e4520] transition-colors"
                  >
                    {togglingId === notif._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : notif.is_read ? (
                      'تعيين كغير مقروء'
                    ) : (
                      'تعيين كمقروء'
                    )}
                  </button>
                  {!notif.is_read && (
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-green-600 flex-shrink-0"
                      title="غير مقروء"
                    ></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default NotificationsPage
