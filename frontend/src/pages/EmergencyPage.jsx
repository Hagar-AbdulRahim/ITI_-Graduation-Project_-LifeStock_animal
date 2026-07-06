// pages/EmergencyPage.jsx
// صفحة الطوارئ البيطرية — تجيب العيادات القريبة عبر GPS أو المحافظة
import React, { useState, useEffect, useRef } from 'react'
import {
  AlertTriangle,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Stethoscope,
  User,
  Send,
  Loader2,
  ChevronDown,
  Check,
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

// ── تحويل بسيط لـ **نص** إلى Bold من غير أي مكتبة خارجية ──
function renderFormattedText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
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
  <div
    dir="rtl"
    className="w-full px-6 py-6 font-cairo"
  >

    {/* Layout */}
    <div className="flex gap-6 items-start">

      {/* ───────────── Sidebar ───────────── */}
      <div className="w-[320px] flex-shrink-0">

        {/* Title */}
        <div className="text-right">
          <h1 className="text-4xl font-black text-[#1e4520] leading-tight">
            طوارئ بيطرية
          </h1>

          <p className="text-sm text-stone-500 mt-2 leading-7">
            ابحث عن أقرب عيادة بيطرية وتحدث مع المساعد الذكي
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-4 mt-6">

          {/* GPS */}
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
              locStatus === 'granted'
                ? 'bg-[#f0f7ee] border-[#2d5a1b]'
                : 'bg-white border-[#dfe8db]'
            }`}
          >

            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                locStatus === 'granted'
                  ? 'bg-[#2d5a1b] text-white'
                  : 'bg-[#f0f7ee] text-[#2d5a1b] border border-[#c8dfc8]'
              }`}
            >
              {locStatus === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : locStatus === 'granted' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-stone-800">
                تحديد الموقع
              </p>

              {locStatus === 'granted' && (
                <span className="text-xs text-emerald-600 font-semibold">
                  الموقع مُفعّل
                </span>
              )}

              {locStatus === 'loading' && (
                <span className="text-xs text-stone-500">
                  جاري التحديد...
                </span>
              )}

              {(locStatus === 'idle' || locStatus === 'denied') && (
                <span className="text-xs text-stone-400">
                  GPS غير مفعّل
                </span>
              )}
            </div>

            {(locStatus === 'idle' || locStatus === 'denied') && (
              <button
                onClick={requestGPS}
                className="flex items-center gap-1.5 bg-[#2d5a1b] hover:bg-[#3d6b47] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                تفعيل
              </button>
            )}
          </div>

          {/* Governorates */}
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
              governorate && locStatus !== 'granted'
                ? 'bg-[#f0f7ee] border-[#2d5a1b]'
                : 'bg-white border-[#dfe8db]'
            }`}
          >

            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                governorate && locStatus !== 'granted'
                  ? 'bg-[#2d5a1b] text-white'
                  : 'bg-[#f0f7ee] text-[#2d5a1b] border border-[#c8dfc8]'
              }`}
            >
              <MapPin className="w-4 h-4" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-stone-800 mb-1">
                اختيار يدوي
              </p>

              <div className="relative">
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full appearance-none text-xs bg-[#fbf9f6] border border-[#dfe8db] rounded-xl pl-3 pr-8 py-2 text-stone-700 outline-none focus:border-[#2d5a1b]"
                >
                  <option value="">اختر محافظتك</option>

                  {GOVERNORATES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ───────────── Chat ───────────── */}
      <div className="flex flex-col bg-white rounded-[32px] border border-[#2d5a1b] shadow-md overflow-hidden flex-1 h-[600px]">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[#cfe0c9] bg-white flex-shrink-0">

          <div className="relative w-12 h-12 rounded-2xl bg-[#2d5a1b] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Stethoscope className="w-5 h-5 text-white" />

            <span className="absolute -bottom-1 -left-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>

          <div className="text-right">
            <p className="text-lg font-black text-[#1e4520]">
              المساعد البيطري الذكي
            </p>

            <p className="text-sm text-emerald-600 font-semibold mt-1">
              متصل الآن
            </p>
          </div>
        </div>
        {/* Messages */}
        <div className="overflow-y-auto p-5 space-y-4 bg-[#f4faf2] flex-1">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai'
            return (
              <div key={msg.id} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex gap-2 max-w-[60%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>

                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 self-end ${
                    isAi
                      ? 'bg-gradient-to-br from-[#3d6b47] to-[#154b23] text-white shadow-sm'
                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {isAi ? <Stethoscope className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>

                  {/* Bubble */}
                  <div className={`px-3.5 py-2.5 text-[13px] leading-6 shadow-sm ${
                    isAi
                      ? 'bg-white border border-[#dfe8db] text-stone-800 rounded-2xl rounded-tr-md'
                      : 'bg-[#2d5a1b] text-white rounded-2xl rounded-tl-md'
                  }`}>
                    <p className="whitespace-pre-line break-words">{renderFormattedText(msg.text)}</p>

                    {/* كروت العيادات */}
                    {isAi && msg.clinics?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.clinics.map((c) => (
                          <div
                            key={c.place_id}
                            className="p-3 rounded-xl bg-[#fbf9f6] border border-[#dfe8db] border-r-4 border-r-[#2d5a1b] text-xs space-y-1.5"
                          >
                            <div className="font-bold text-stone-800 flex items-center justify-between gap-2">
                              <span>{c.name}</span>
                              <span className="text-[#2d5a1b] font-semibold bg-white border border-[#c8dfc8] px-2 py-0.5 rounded-full flex-shrink-0">{c.distance_km} كم</span>
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
                                <a href={`tel:${c.phone}`} className="text-[#2d5a1b] hover:underline font-medium">
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
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[60%]">
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-[#3d6b47] to-[#154b23] text-white flex-shrink-0 self-end shadow-sm">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tr-md bg-white border border-[#dfe8db] shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#c8dfc8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#c8dfc8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#c8dfc8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#cfe0c9] bg-[#f4faf2] flex-shrink-0">
          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {['أقرب عيادة بيطرية', 'ما هي مواعيد العمل؟', 'أريد عيادة على بُعد 5 كم'].map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-xs px-3.5 py-1.5 rounded-full border border-[#dfe8db] bg-[#fbf9f6] text-stone-600 hover:bg-white hover:border-[#2d5a1b]/40 hover:text-[#2d5a1b] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-[#fbf9f6] border border-[#dfe8db] rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-[#2d5a1b]/20 focus-within:border-[#2d5a1b] transition-all">
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
              className="p-2.5 bg-[#2d5a1b] hover:bg-[#3d6b47] disabled:opacity-40 disabled:hover:bg-[#2d5a1b] text-white rounded-xl transition-colors shadow-sm active:scale-95 flex-shrink-0"
            >
              <Send className="w-4 h-4 -scale-x-100" />
            </button>
          </div>
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