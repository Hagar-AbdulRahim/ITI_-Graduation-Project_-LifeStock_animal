// pages/EmergencyPage.jsx
// صفحة الطوارئ البيطرية — تجيب العيادات القريبة عبر GPS أو المحافظة
import React, { useState, useEffect, useRef } from 'react'
import {
  AlertTriangle,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Bot,
  User,
  Send,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { emergencyChat } from '../services/clinicsService'

// قائمة المحافظات للـ fallback
const GOVERNORATES = [
  'القاهرة','الجيزة','الإسكندرية','الدقهلية','البحر الأحمر',
  'البحيرة','الفيوم','الغربية','الإسماعيلية','المنوفية',
  'المنيا','القليوبية','الوادي الجديد','السويس','أسوان',
  'أسيوط','بني سويف','بورسعيد','دمياط','الشرقية',
  'جنوب سيناء','كفر الشيخ','مطروح','الأقصر','قنا',
  'شمال سيناء','سوهاج',
]

// ── رسالة ترحيب أولية ─────────────────────────────────────
const WELCOME_MSG = {
  id: 'welcome',
  sender: 'ai',
  text: 'مرحباً! أنا هنا لمساعدتك في إيجاد أقرب عيادة بيطرية لموقعك.\n\nيمكنك أن تسألني مثلاً:\n• "أقرب عيادة بيطرية"\n• "ما هي مواعيد العمل؟"\n• "أريد عيادة على بُعد 5 كم"',
}

export default function EmergencyPage() {
  // ── الموقع ────────────────────────────────────────────────
  const [location, setLocation]         = useState(null)       // { lat, lng }
  const [locStatus, setLocStatus]       = useState('idle')     // idle | loading | granted | denied
  const [governorate, setGovernorate]   = useState('')

  // ── الشات ─────────────────────────────────────────────────
  const [messages, setMessages]         = useState([WELCOME_MSG])
  const [input, setInput]               = useState('')
  const [isTyping, setIsTyping]         = useState(false)

  const messagesEndRef = useRef(null)

  // auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // ── طلب GPS تلقائياً عند فتح الصفحة ─────────────────────
  useEffect(() => {
    requestGPS()
  }, [])

  const requestGPS = () => {
    if (!navigator.geolocation) {
      setLocStatus('denied')
      return
    }
    setLocStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocStatus('granted')
        toast.success('تم تحديد موقعك بنجاح')
      },
      () => {
        setLocStatus('denied')
        toast('فعّل الموقع للحصول على نتائج أدق', { icon: '📍' })
      },
      { timeout: 10000 }
    )
  }

  // ── إرسال رسالة ──────────────────────────────────────────
  const handleSend = async (text = input) => {
    if (!text.trim()) return

    // تحقق من وجود موقع (GPS أو محافظة)
    if (!location && !governorate) {
      toast.error('حدد موقعك أو اختر محافظتك أولاً')
      return
    }

    // أضف رسالة المستخدم
    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const payload = { message: text }

      if (location) {
        payload.lat = location.lat
        payload.lng = location.lng
      } else {
        // fallback: نبعت المحافظة كـ lat/lng وهيتعامل معها الباك إند
        // لكن endpoint /emergency بيتطلب lat/lng، فنحتاج نوفرهم
        // نستخدم الإحداثيات الـ hardcoded بتاعة المحافظة على الفرونت
        const coords = GOVERNORATE_COORDS[governorate]
        if (!coords) {
          toast.error('المحافظة غير معروفة')
          setIsTyping(false)
          return
        }
        payload.lat = coords.lat
        payload.lng = coords.lng
      }

      const res = await emergencyChat(payload)

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        clinics: res.clinics,
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch {
      toast.error('حدث خطأ، حاول مرة أخرى')
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'عذراً، حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div dir="rtl" className="flex flex-col h-[calc(100vh-145px)] max-w-4xl mx-auto font-cairo">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-base font-bold text-stone-800">طوارئ بيطرية</h1>
          <p className="text-xs text-stone-500">ابحث عن أقرب عيادة بيطرية وتحدث مع المساعد الذكي</p>
        </div>
      </div>

      {/* ── شريط الموقع ────────────────────────────────────── */}
      <div className="mb-4 p-3 rounded-xl border border-stone-200 bg-white flex flex-wrap items-center gap-3">

        {/* حالة GPS */}
        <div className="flex items-center gap-2">
          {locStatus === 'loading' && (
            <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />
          )}
          {locStatus === 'granted' && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <Navigation className="w-3.5 h-3.5" />
              تم تحديد موقعك
            </span>
          )}
          {(locStatus === 'denied' || locStatus === 'idle') && (
            <button
              onClick={requestGPS}
              className="flex items-center gap-1.5 text-xs text-[#2d5a1b] font-medium hover:underline"
            >
              <Navigation className="w-3.5 h-3.5" />
              تفعيل الموقع
            </button>
          )}
        </div>

        {/* Divider */}
        {locStatus === 'denied' && (
          <>
            <span className="text-stone-300 text-xs">أو</span>

            {/* Dropdown المحافظة */}
            <div className="relative flex-1 min-w-[160px]">
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full appearance-none text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 pr-8 text-stone-700 outline-none focus:border-[#2d5a1b] transition-colors"
              >
                <option value="">اختر محافظتك</option>
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
            </div>

            <p className="text-[10px] text-amber-600 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              للدقة الأعلى فعّل الموقع
            </p>
          </>
        )}
      </div>

      {/* ── الشات ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-stone-50/50">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai'
            return (
              <div key={msg.id} className="flex flex-col">
                <div className={`flex gap-3 max-w-[85%] ${isAi ? 'self-start' : 'self-end flex-row-reverse'}`}>

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isAi
                      ? 'bg-emerald-50 text-[#2d5a1b] border border-emerald-100'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isAi
                      ? 'bg-white border border-stone-200 text-stone-800 rounded-tr-none'
                      : 'bg-[#2d5a1b] text-white rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* كروت العيادات */}
                    {isAi && msg.clinics?.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {msg.clinics.map((c) => (
                          <div
                            key={c.place_id}
                            className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1.5"
                          >
                            <div className="font-bold text-stone-800 flex items-center justify-between">
                              <span>{c.name}</span>
                              <span className="text-[#2d5a1b] font-medium">{c.distance_km} كم</span>
                            </div>
                            {c.address && (
                              <div className="flex items-center gap-1.5 text-stone-500">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span>{c.address}</span>
                              </div>
                            )}
                            {c.phone && (
                              <div className="flex items-center gap-1.5 text-stone-500">
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                <a href={`tel:${c.phone}`} className="text-[#2d5a1b] hover:underline">
                                  {c.phone}
                                </a>
                              </div>
                            )}
                            {c.opening_hours && (
                              <div className="flex items-center gap-1.5 text-stone-500">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span>{c.opening_hours}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] self-start">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 text-[#2d5a1b] border border-emerald-100 flex-shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-stone-200 rounded-tr-none shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-stone-200 bg-white">
          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {['أقرب عيادة بيطرية', 'ما هي مواعيد العمل؟', 'أريد عيادة على بُعد 5 كم'].map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:border-[#2d5a1b]/40 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-[#2d5a1b]/20 focus-within:border-[#2d5a1b] transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اسأل عن أقرب عيادة أو مواعيد العمل..."
              className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-stone-800 placeholder:text-stone-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-2 bg-[#2d5a1b] hover:bg-[#3d6b47] disabled:opacity-40 text-white rounded-lg transition-colors shadow-sm active:scale-95"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// إحداثيات المحافظات للـ fallback (لما GPS مرفوض)
const GOVERNORATE_COORDS = {
  'القاهرة':       { lat: 30.0444, lng: 31.2357 },
  'الجيزة':        { lat: 30.0131, lng: 31.2089 },
  'الإسكندرية':    { lat: 31.2001, lng: 29.9187 },
  'الدقهلية':      { lat: 31.0409, lng: 31.3785 },
  'البحر الأحمر':  { lat: 25.4136, lng: 34.5658 },
  'البحيرة':       { lat: 30.8481, lng: 30.3436 },
  'الفيوم':        { lat: 29.3084, lng: 30.8428 },
  'الغربية':       { lat: 30.8754, lng: 31.0335 },
  'الإسماعيلية':   { lat: 30.5965, lng: 32.2715 },
  'المنوفية':      { lat: 30.5972, lng: 30.9876 },
  'المنيا':        { lat: 28.0871, lng: 30.7618 },
  'القليوبية':     { lat: 30.1792, lng: 31.2042 },
  'الوادي الجديد': { lat: 25.4477, lng: 30.5482 },
  'السويس':        { lat: 29.9668, lng: 32.5498 },
  'أسوان':         { lat: 24.0889, lng: 32.8998 },
  'أسيوط':         { lat: 27.1810, lng: 31.1837 },
  'بني سويف':      { lat: 29.0744, lng: 31.0978 },
  'بورسعيد':       { lat: 31.2653, lng: 32.3019 },
  'دمياط':         { lat: 31.4165, lng: 31.8133 },
  'الشرقية':       { lat: 30.7327, lng: 31.7195 },
  'جنوب سيناء':    { lat: 28.2461, lng: 33.6238 },
  'كفر الشيخ':     { lat: 31.1107, lng: 30.9388 },
  'مطروح':         { lat: 31.3543, lng: 27.2373 },
  'الأقصر':        { lat: 25.6872, lng: 32.6396 },
  'قنا':           { lat: 26.1551, lng: 32.7160 },
  'شمال سيناء':    { lat: 31.1318, lng: 33.8023 },
  'سوهاج':         { lat: 26.5569, lng: 31.6948 },
}
