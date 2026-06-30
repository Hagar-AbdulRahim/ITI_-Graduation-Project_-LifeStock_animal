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
  Circle,
  Eye,
  EyeOff
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const NotificationsPage = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionId, setActionId] = useState(null) // for loading state on individual actions

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
          message: 'يحتاج الحيوان رقم SH-501 إلى جرعة متابعة خلال 48 ساعة.',
          type: 'vaccination',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          _id: 'demo-2',
          title: 'تحديث طبي جديد',
          message: 'تم تسجيل مراجعة طبية جديدة في السجل الصحي لقطيع الأبقار.',
          type: 'health',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
      ]
      setNotifications(fallback)
      setError(
        err.response?.status === 401
          ? 'يرجى تسجيل الدخول مرة أخرى للمتابعة'
          : 'حدث خطأ في الاتصال، يتم عرض بيانات تجريبية.'
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

  const handleToggleReadState = async (notif, e) => {
    e.stopPropagation()
    setActionId(notif._id)
    try {
      // Toggle logic using the read endpoint (if backend toggles it or if we just force it)
      // Since backend has /:id/read, we might need a generic toggle or just rely on backend update
      // Assuming /:id/read marks as read. If it's already read, we might want an unread endpoint, 
      // but if the backend only supports marking as read, we will do it locally as a fallback.
      await api.put(`/api/notifications/${notif._id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, is_read: !notif.is_read } : n))
      )
      toast.success(notif.is_read ? 'تم تعيينه كغير مقروء' : 'تمت قراءة الإشعار')
    } catch (err) {
      // Optimistic update if backend fails or doesn't support unread
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, is_read: !notif.is_read } : n))
      )
      toast.success(notif.is_read ? 'تم تعيينه كغير مقروء محلياً' : 'تمت قراءة الإشعار محلياً')
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    setActionId(`delete-${id}`)
    try {
      await api.delete(`/api/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      toast.success('تم حذف الإشعار بنجاح')
    } catch (err) {
      if (id.startsWith('demo-')) {
        setNotifications((prev) => prev.filter((n) => n._id !== id))
        toast.success('تم حذف الإشعار التجريبي')
      } else {
        toast.error('فشل في حذف الإشعار')
      }
    } finally {
      setActionId(null)
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
      toast.success('تم تشغيل دورة التنبيهات التجريبية بنجاح')
    } catch (err) {
      toast.error('فشل في تشغيل التنبيهات التجريبية')
    }
  }

  const getNotifIcon = (type) => {
    switch (type) {
      case 'vaccination':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center border border-blue-200/50 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Syringe className="w-6 h-6" />
          </div>
        )
      case 'health':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600 flex items-center justify-center border border-rose-200/50 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <HeartPulse className="w-6 h-6" />
          </div>
        )
      case 'alert':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 flex items-center justify-center border border-amber-200/50 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
        )
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e8f3e8] to-[#d4eed4] text-[#2a5c2a] flex items-center justify-center border border-[#b8e0b8] shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Bell className="w-6 h-6" />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf8] font-cairo" dir="rtl">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-all hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-[#1a401a] to-[#2a5c2a]">
                مركز الإشعارات
              </h1>
              <p className="text-xs text-gray-500 font-bold mt-0.5 flex items-center gap-1">
                متابعة فورية للحالة الصحية والتشغيلية 
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => fetchNotifs(false)}
              className="p-2.5 text-gray-500 hover:text-[#2a5c2a] bg-white border border-gray-200/80 rounded-xl hover:bg-green-50 transition-all hover:shadow-sm hover:border-green-200"
              title="تحديث الإشعارات"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[#2a5c2a] to-[#3a7c3a] text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-green-900/20 transition-all hover:-translate-y-0.5"
            >
              <CheckCheck className="w-4 h-4" />
              تعيين الكل كمقروء
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {error ? (
          <div className="p-5 bg-rose-50/80 border border-rose-200/50 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold shadow-sm backdrop-blur-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#2a5c2a]/20 border-t-[#2a5c2a] rounded-full animate-spin"></div>
              <Bell className="w-6 h-6 text-[#2a5c2a] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />
            </div>
            <p className="text-gray-500 font-bold text-sm mt-6 animate-pulse">
              جاري مزامنة الإشعارات...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-gray-100 p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <BellOff className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="font-black text-xl text-gray-800 mb-2">
              صندوق الإشعارات فارغ
            </h3>
            <p className="text-sm text-gray-500 font-medium mb-8 max-w-sm">
              لم تصلك أي تنبيهات جديدة. كل شيء في مزارعك يعمل بكفاءة وأمان تام.
            </p>
            <button
              onClick={handleGenerateTest}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-[#2a5c2a]/40 text-[#2a5c2a] rounded-2xl text-sm font-bold hover:bg-[#2a5c2a]/5 hover:border-[#2a5c2a] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              تشغيل نظام فحص الإشعارات (Test-Run)
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={(e) => !notif.is_read && handleToggleReadState(notif, e)}
                className={`group relative bg-white border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all duration-300 cursor-pointer overflow-hidden
                  ${
                    notif.is_read
                      ? 'border-gray-100 shadow-sm hover:shadow-md opacity-80'
                      : 'border-[#b8e0b8] shadow-[0_8px_20px_rgba(42,92,42,0.06)] hover:shadow-[0_12px_25px_rgba(42,92,42,0.1)] bg-gradient-to-l from-[#f5faf5] to-white'
                  }`}
              >
                {/* Unread Indicator Bar */}
                {!notif.is_read && (
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2a5c2a] to-[#4caf50]"></div>
                )}

                <div className="flex items-start gap-4 flex-1">
                  {getNotifIcon(notif.type)}
                  <div className="flex-1 mt-1">
                    <h3
                      className={`text-base flex items-center gap-2 ${
                        !notif.is_read ? 'font-black text-gray-900' : 'font-bold text-gray-700'
                      }`}
                    >
                      {notif.title}
                      {!notif.is_read && (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider">
                          جديد
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[11px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        {new Date(notif.created_at).toLocaleString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-50 mt-2 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    type="button"
                    onClick={(e) => handleToggleReadState(notif, e)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      notif.is_read
                        ? 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                        : 'text-[#2a5c2a] hover:bg-green-50'
                    }`}
                  >
                    {actionId === notif._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : notif.is_read ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        غير مقروء
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        مقروء
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={(e) => handleDelete(notif._id, e)}
                    className="flex items-center justify-center p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all group/btn"
                    title="حذف الإشعار"
                  >
                    {actionId === `delete-${notif._id}` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    )}
                  </button>
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
