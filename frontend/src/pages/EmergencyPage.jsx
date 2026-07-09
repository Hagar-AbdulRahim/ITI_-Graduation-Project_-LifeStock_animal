// pages/EmergencyPage.jsx
// صفحة الطوارئ البيطرية — تجيب العيادات القريبة عبر GPS أو المحافظة
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  ArrowRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { emergencyChat } from '../services/clinicsService'

// قائمة المحافظات للـ fallback
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر',
  'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية',
  'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان',
  'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية',
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا',
  'شمال سيناء', 'سوهاج',
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
  const navigate = useNavigate()
  const locationState = useLocation().state
  const fromAnimalId = locationState?.fromAnimalId
  // ── الموقع ────────────────────────────────────────────────
  const [location, setLocation] = useState(null)       // { lat, lng }
  const [locStatus, setLocStatus] = useState('idle')     // idle | loading | granted | denied
  const [governorate, setGovernorate] = useState('')

  // ── الشات ─────────────────────────────────────────────────
  const [messages, setMessages] = useState([WELCOME_MSG])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

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
  console.log("requestGPS called");

  if (!navigator.geolocation) {
    console.log("Geolocation is not supported by this browser.");

    setLocStatus("denied");
    toast.error("متصفحك لا يدعم تحديد الموقع.");
    return;
  }

  setLocStatus("loading");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      console.log("Location Success:", pos.coords);

      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });

      setLocStatus("granted");
      toast.success("تم تحديد موقعك بنجاح");
    },
    (error) => {
      console.log("Location Error:", error.code, error.message);

      setLocStatus("denied");

      switch (error.code) {
        case 1:
          toast.error(
            "تم رفض إذن الموقع. يرجى الضغط على أيقونة الموقع بجوار عنوان الصفحة والسماح بالوصول للموقع."
          );
          break;

        case 2:
          toast.error(
          "تعذر تحديد موقعك. تأكد من تشغيل خدمات الموقع والاتصال بالإنترنت."
          );
          break;

        case 3:
          toast.error(
            "انتهت مهلة تحديد الموقع. تأكد من اتصال الإنترنت وحاول مرة أخرى."
          );
          break;

        default:
          toast("فعّل الموقع للحصول على نتائج أدق", {
            icon: "📍",
          });
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};

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

    if (governorate) {
      // لو المستخدم اختار محافظة يدويًا، الأولوية له دايمًا حتى لو GPS اشتغل في الخلفية
      const coords = GOVERNORATE_COORDS[governorate]
      if (!coords) {
        toast.error('المحافظة غير معروفة')
        setIsTyping(false)
        return
      }
      payload.lat = coords.lat
      payload.lng = coords.lng
      payload.governorate = governorate
    } else if (location) {
      payload.lat = location.lat
      payload.lng = location.lng
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
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-8 font-cairo space-y-8 animate-in fade-in duration-700"
    >
      {/* ─── Hero Section ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#1b4d2c] via-[#245c36] to-[#2a7543] px-5 py-3 md:py-4 text-white shadow-lg border border-white/5">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/[0.03] rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-[#4ade80]/[0.08] rounded-full blur-2xl translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-right space-y-1.5 flex-1">
            <h1 className="mb-2 text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
              مركز طوارئ الماشية
            </h1>
            <p className="text-green-100/80 text-[11px] sm:text-xs max-w-lg font-medium leading-relaxed ">
              ابحث عن أقرب عيادة بيطرية وتواصل فوراً مع المساعد الذكي للحصول على تشخيص طارئ وإرشادات سريرية دقيقة لإنقاذ الماشية.
            </p>
          </div>
          <button
            onClick={() => {
              if (fromAnimalId) {
                navigate(`/animals/${fromAnimalId}`)
              } else {
                navigate(-1)
              }
            }}
            className="px-4 py-2 rounded-xl bg-white text-[#1b4d2c] hover:bg-green-50 text-xs font-bold transition-all border border-white/20 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 self-start md:self-auto"
          >
            رجوع
          </button>
        </div>
      </div>

      {/* ─── Main Content Panels ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* ─── Right Sidebar: Location & Control Center ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-4 w-full bg-gradient-to-br from-[#1b4d2c] via-[#12361e] to-[#0a1f11] p-8 rounded-[2.5rem] text-white relative overflow-hidden flex flex-col justify-between shadow-[0_20px_50px_rgba(27,77,44,0.3)] border border-[#245c36]"
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 2px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-8">
            <div className="border-b border-white/10 pb-4">
              <div className="flex flex-col gap-2 mb-3">
                <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-[10px] sm:text-xs font-bold border border-red-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  خدمة الدعم الطبي العاجل
                </span>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  موقعك الجغرافي
                </h3>
              </div>
              <p className="text-green-100/70 text-xs leading-relaxed">
                نقوم باستخدام موقعك لتحديد أقرب الأطباء والعيادات المتخصصة المتوفرة في محيطك حالياً.
              </p>
            </div>

            {/* GPS Activation Box */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-green-200/80 block">التحديد عبر القمر الصناعي (GPS)</label>
              <div className={`p-5 rounded-2xl border transition-all duration-500 ${locStatus === 'granted'
                ? 'bg-white/10 border-emerald-400/50 shadow-inner'
                : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${locStatus === 'granted'
                    ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                    : 'bg-white/10 text-white shadow-inner border border-white/10'
                    }`}>
                    {locStatus === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                    ) : locStatus === 'granted' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Navigation className="w-5 h-5 text-emerald-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">تحديد الموقع التلقائي</p>
                    {locStatus === 'granted' ? (
                      <span className="text-[11px] text-emerald-400 font-bold mt-1 block">✓ تم الاتصال بموقعك الجغرافي</span>
                    ) : locStatus === 'loading' ? (
                      <span className="text-[11px] text-green-200/60 mt-1 block">جاري مسح الإحداثيات...</span>
                    ) : (
                      <span className="text-[11px] text-white/50 mt-1 block">انقر للتفعيل والحصول على نتائج أدق</span>
                    )}
                  </div>
                </div>

                {locStatus !== 'granted' && (
                  <button
                    onClick={requestGPS}
                    className="w-full mt-4 py-3 bg-white hover:bg-stone-100 text-[#1b4d2c] text-xs font-black rounded-xl transition-all shadow-[0_8px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_20px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    تنشيط GPS الموقع
                  </button>
                )}
              </div>
            </div>

            {/* Manual Governorate Select */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-green-200/80 block">التحديد اليدوي (المحافظات)</label>
              <div className={`p-5 rounded-2xl border transition-all duration-500 ${governorate && locStatus !== 'granted'
                ? 'bg-white/10 border-emerald-400/50 shadow-inner'
                : 'bg-white/5 border-white/10'
                }`}>
                <p className="text-xs font-bold text-white/80 mb-2.5">اختر محافظتك من القائمة:</p>
                <div className="relative">
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full appearance-none text-xs bg-[#1b4d2c] hover:bg-[#245c36] border border-white/20 rounded-xl pl-4 pr-10 py-3 text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all cursor-pointer font-bold shadow-inner"
                  >
                    <option value="" className="text-[#1b4d2c] font-bold bg-white">--- اختر المحافظة ---</option>
                    {GOVERNORATES.map((g) => (
                      <option key={g} value={g} className="text-[#1b4d2c] font-bold bg-white">
                        {g}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Left Panel: Interactive Chat & Clinic Finder (White Card) ─── */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-[2.5rem] border border-stone-200/80 shadow-2xl overflow-hidden min-h-[580px] h-[640px] w-full">

          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-white flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1b4d2c] to-[#2a7543] flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10">
                <Stethoscope className="w-5 h-5 text-white animate-pulse" />
                <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 bg-emerald-500 border-3 border-white rounded-full" />
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-stone-900 leading-tight">
                  طبيب الطوارئ الذكي
                </p>
                <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  متصل ومستعد للمساعدة
                </p>
              </div>
            </div>
          </div>

          {/* Messages Box */}
          <div className="overflow-y-auto p-6 space-y-6 bg-gradient-to-tr from-[#fcfdfc] via-[#f7faf5] to-[#f1f6ef] flex-1 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai'
              return (
                <div key={msg.id} className={`flex ${isAi ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-4 max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>

                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 self-end shadow-md transition-transform hover:scale-105 ${isAi
                      ? 'bg-[#1b4d2c] text-white border border-[#1b4d2c]/10'
                      : 'bg-stone-200 text-stone-700'
                      }`}>
                      {isAi ? <Stethoscope className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                    </div>

                    {/* Chat Bubble */}
                    <div className={`px-5 py-3.5 text-[13.5px] leading-7 shadow-sm border ${isAi
                      ? 'bg-white border-stone-200 text-stone-850 rounded-3xl rounded-tr-md'
                      : 'bg-[#1b4d2c] border-[#1b4d2c] text-white rounded-3xl rounded-tl-md font-medium'
                      }`}>
                      <p className="whitespace-pre-line break-words leading-relaxed">{renderFormattedText(msg.text)}</p>

                      {/* Clinics Cards */}
                      {isAi && msg.clinics?.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {msg.clinics.map((c) => (
                            <div
                              key={c.place_id}
                              className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden text-right"
                            >
                              <div className="absolute top-0 right-0 w-1.5 h-full bg-[#1b4d2c] group-hover:bg-emerald-500 transition-colors"></div>
                              <div className="space-y-2">
                                <div className="font-extrabold text-stone-900 flex items-start justify-between gap-2 pr-1.5">
                                  <span className="group-hover:text-[#1b4d2c] transition-colors">{c.name}</span>
                                  <span className="text-[10px] text-[#1b4d2c] font-black bg-[#1b4d2c]/5 px-2.5 py-1 rounded-full flex-shrink-0 border border-[#1b4d2c]/10">{c.distance_km} كم</span>
                                </div>

                                {c.address && (
                                  <div className="flex items-center gap-2 text-[11px] text-stone-500 pr-1">
                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-stone-400" />
                                    <span className="truncate">{c.address}</span>
                                  </div>
                                )}

                                {c.phone && (
                                  <div className="flex items-center gap-2 text-[11px] text-[#1b4d2c] pr-1">
                                    <Phone className="w-3.5 h-3.5 flex-shrink-0 text-[#1b4d2c]" />
                                    <a href={`tel:${c.phone}`} className="hover:underline font-bold">{c.phone}</a>
                                  </div>
                                )}

                                {c.opening_hours && (
                                  <div className="flex items-center gap-2 text-[11px] text-stone-500 pr-1">
                                    <Clock className="w-3.5 h-3.5 flex-shrink-0 text-stone-400" />
                                    <span>{c.opening_hours}</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                                {c.phone ? (
                                  <a
                                    href={`tel:${c.phone}`}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#1b4d2c] hover:bg-emerald-600 text-white rounded-xl text-[11px] font-black transition-colors"
                                  >
                                    <Phone className="w-3 h-3" />
                                    اتصال سريع
                                  </a>
                                ) : (
                                  <div className="flex-1 text-[11px] text-stone-400 italic text-center py-2">الهاتف غير متوفر</div>
                                )}
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name + ' ' + (c.address || ''))}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center p-2 bg-stone-100 hover:bg-[#1b4d2c]/10 text-stone-700 hover:text-[#1b4d2c] rounded-xl transition-colors"
                                  title="الاتجاهات على الخريطة"
                                >
                                  <Navigation className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-pulse">
                <div className="flex gap-4 max-w-[60%]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#1b4d2c] text-white flex-shrink-0 self-end shadow-md border border-[#1b4d2c]/10">
                    <Stethoscope className="w-4.5 h-4.5" />
                  </div>
                  <div className="px-5 py-3 rounded-2xl rounded-tr-md bg-white border border-stone-200 shadow-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Area */}
          <div className="p-5 border-t border-stone-200 bg-white flex-shrink-0 space-y-4">

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-2">
              {['أقرب عيادة بيطرية', 'ما هي مواعيد العمل؟', 'أريد عيادة على بُعد 5 كم'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs px-4 py-2 rounded-full border border-stone-200 bg-stone-50 text-stone-600 hover:bg-[#1b4d2c]/5 hover:border-[#1b4d2c]/30 hover:text-[#1b4d2c] transition-all shadow-sm font-semibold active:scale-[0.97]"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-[#f8f9fa] border border-stone-200 rounded-2xl p-1.5 focus-within:ring-4 focus-within:ring-[#1b4d2c]/5 focus-within:border-[#1b4d2c] focus-within:bg-white transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسأل عن عيادة طوارئ أو صف الحالة الطبية لحيوانك..."
                className="flex-1 px-3 py-2.5 text-xs sm:text-sm bg-transparent outline-none text-[#1b4d2c]/90 placeholder:text-stone-400 font-medium"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="p-3 bg-[#1b4d2c] hover:bg-[#143920] disabled:opacity-30 disabled:hover:bg-[#1b4d2c] text-white rounded-xl transition-all shadow-lg active:scale-95 flex-shrink-0 flex items-center justify-center"
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
  'القاهرة': { lat: 30.0444, lng: 31.2357 },
  'الجيزة': { lat: 30.0131, lng: 31.2089 },
  'الإسكندرية': { lat: 31.2001, lng: 29.9187 },
  'الدقهلية': { lat: 31.0409, lng: 31.3785 },
  'البحر الأحمر': { lat: 25.4136, lng: 34.5658 },
  'البحيرة': { lat: 30.8481, lng: 30.3436 },
  'الفيوم': { lat: 29.3084, lng: 30.8428 },
  'الغربية': { lat: 30.8754, lng: 31.0335 },
  'الإسماعيلية': { lat: 30.5965, lng: 32.2715 },
  'المنوفية': { lat: 30.5972, lng: 30.9876 },
  'المنيا': { lat: 28.0871, lng: 30.7618 },
  'القليوبية': { lat: 30.1792, lng: 31.2042 },
  'الوادي الجديد': { lat: 25.4477, lng: 30.5482 },
  'السويس': { lat: 29.9668, lng: 32.5498 },
  'أسوان': { lat: 24.0889, lng: 32.8998 },
  'أسيوط': { lat: 27.1810, lng: 31.1837 },
  'بني سويف': { lat: 29.0744, lng: 31.0978 },
  'بورسعيد': { lat: 31.2653, lng: 32.3019 },
  'دمياط': { lat: 31.4165, lng: 31.8133 },
  'الشرقية': { lat: 30.7327, lng: 31.7195 },
  'جنوب سيناء': { lat: 28.2461, lng: 33.6238 },
  'كفر الشيخ': { lat: 31.1107, lng: 30.9388 },
  'مطروح': { lat: 31.3543, lng: 27.2373 },
  'الأقصر': { lat: 25.6872, lng: 32.6396 },
  'قنا': { lat: 26.1551, lng: 32.7160 },
  'شمال سيناء': { lat: 31.1318, lng: 33.8023 },
  'سوهاج': { lat: 26.5569, lng: 31.6948 },
}