// ─── Onboarding Chat Page ─────────────────────────────────────────────────────
// Conversational interface that collects the animal's medical history
// and vaccinations via the Onboarding Agent after adding a new animal.
// Route: /animals/:animalId/onboarding
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  User,
  Send,
  ArrowRight,
  SkipForward,
  CheckCircle2,
  X,
  AlertTriangle,
  Stethoscope,
  Syringe,
  Loader2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import onboardingService from '../../../services/onboardingService';
// Tailwind CSS is imported globally via main entry point


// ─── Helpers ──────────────────────────────────────────────────────────────────

let msgCounter = 0;
const nextMsgId = () => `onb-msg-${++msgCounter}-${Date.now()}`;

// ─── Component ────────────────────────────────────────────────────────────────

const OnboardingChatPage = () => {
  const { animalId } = useParams();
  const navigate = useNavigate();

  // Chat state
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]); // backend conversation history
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  // Completion state
  const [isComplete, setIsComplete] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Start the conversation on mount ─────────────────────────────────────────
  const initChat = useCallback(async () => {
    setIsInitializing(true);
    setInitError(null);
    try {
      const res = await onboardingService.startChat(animalId);
      const aiMsg = {
        id: nextMsgId(),
        sender: 'ai',
        text: res.reply,
      };
      setMessages([aiMsg]);
      setHistory(res.history || []);
      setIsComplete(res.is_complete || false);
      if (res.extracted_data) setExtractedData(res.extracted_data);
    } catch (err) {
      console.error('Onboarding init error:', err);
      setInitError(err?.response?.data?.message || 'حصل خطأ أثناء بدء المحادثة');
    } finally {
      setIsInitializing(false);
    }
  }, [animalId]);

  useEffect(() => {
    initChat();
  }, [initChat]);

  // ── Retry handler ────────────────────────────────────────────────
  const handleRetry = async () => {
    // Reset error state and re‑run the init chat
    setInitError(null);
    await initChat();
  };


  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isTyping || isComplete) return;

    // Add user message
    const userMsg = { id: nextMsgId(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await onboardingService.sendMessage(animalId, text, history);

      const aiMsg = {
        id: nextMsgId(),
        sender: 'ai',
        text: res.reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setHistory(res.history || []);

      if (res.is_complete) {
        setIsComplete(true);
        setExtractedData(res.extracted_data);
      }
    } catch (err) {
      console.error('Onboarding chat error:', err);
      const errText = err?.response?.data?.message || 'حصل خطأ، حاول تاني';
      setMessages((prev) => [
        ...prev,
        { id: nextMsgId(), sender: 'ai', text: `⚠️ ${errText}` },
      ]);
      toast.error(errText);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const autoConfirmStarted = useRef(false);

  // ── Auto Confirm and Redirect ─────────────────────────────────────────────────
  useEffect(() => {
    if (isComplete && extractedData && !autoConfirmStarted.current) {
      autoConfirmStarted.current = true;
      setIsConfirming(true);

      const autoConfirm = async () => {
        try {
          await onboardingService.confirmData(
            animalId,
            extractedData.medical_history || [],
            extractedData.vaccinations || []
          );
          setIsConfirming(false);
          toast.success('تم حفظ التاريخ المرضي واللقاحات بنجاح ✅');

          // Delay to let the user read the AI's final message
          setTimeout(() => {
            navigate(`/animals/${animalId}`);
          }, 3500);
        } catch (err) {
          console.error('Onboarding auto-confirm error:', err);
          toast.error(err?.response?.data?.message || 'حصل خطأ أثناء الحفظ التلقائي');
          setIsConfirming(false);
          autoConfirmStarted.current = false;
        }
      };

      autoConfirm();
    }
  }, [isComplete, extractedData, animalId, navigate]);

  // ── Skip onboarding ────────────────────────────────────────────────────────
  const handleSkip = () => {
    navigate(`/animals/${animalId}`);
  };

  // ── Key handler ─────────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render: Error State ─────────────────────────────────────────────────────
  if (initError) {
    return (
      <div className="flex flex-col h-screen min-h-[480px] font-cairo bg-gray-50" dir="rtl">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors" onClick={() => navigate(-1)}>
              <ArrowRight size={16} />
            </button>
            <div>
              <p className="font-bold text-[15px] text-gray-900 m-0">المساعد البيطري</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3.5 p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>
          <p className="font-semibold text-sm text-gray-800">{initError}</p>
          <button type="button" className="px-6 py-2.5 rounded-xl bg-green-800 hover:bg-green-900 text-white text-[13px] font-bold transition-colors" onClick={handleRetry}>
            إعادة المحاولة
          </button>
          <button
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 font-semibold text-[13px] hover:bg-gray-50 mt-2 transition-colors"
            onClick={handleSkip}
          >
            <SkipForward size={14} />
            تخطي وانتقل لصفحة الحيوان
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Main Chat ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen min-h-[480px] font-cairo bg-gray-50" dir="rtl">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-200 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button className="flex items-center justify-center w-[34px] h-[34px] rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" onClick={() => navigate(-1)}>
            <ArrowRight size={16} />
          </button>
          <div className="relative w-2.5 h-2.5 shrink-0">
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
            <span className="relative block w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-900 m-0 leading-tight">تسجيل التاريخ المرضي</p>
            <p className="text-[11px] font-medium text-gray-400 mt-2 leading-tight">المساعد البيطري الذكي</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-gray-500 font-bold hover:bg-gray-100 transition-colors text-xs"
            onClick={handleSkip}
            title="تخطي"
          >
            <SkipForward size={14} />
            <span className="hidden sm:inline">تخطي</span>
          </button>
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col gap-4 bg-gradient-to-b from-[#fafaf9] to-[#f5f5f4] scrollbar-thin scrollbar-thumb-gray-300">
        {/* Welcome hint */}
        {messages.length > 0 && (
          <div className="text-center px-4 py-2 text-[11px] text-gray-400 font-medium">
            <Sparkles size={14} className="inline align-middle ml-1 " />
            المساعد البيطري هيسألك عن التاريخ المرضي للحيوان عشان يسجّله في النظام
          </div>
        )}

        {/* Loading skeleton on init */}
        {isInitializing && (
          <div className="flex gap-2.5 max-w-[85%] self-start animate__animated animate__fadeInUp animate__faster">
            <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0 shadow-sm bg-green-50 text-green-800 border border-green-200">
              <Bot size={16} />
            </div>
            <div className="w-48 h-12 rounded-2xl rounded-tr-sm bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[pulse_1.5s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] animate__animated animate__fadeInUp animate__faster ${isAi ? 'self-start' : 'self-end flex-row-reverse'}`}
            >
              <div className={`w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0 shadow-sm ${isAi ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-blue-100 text-blue-700'}`}>
                {isAi ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm min-w-0 break-words ${isAi ? 'bg-white border border-gray-200 text-gray-800 rounded-tr-sm' : 'bg-[#2a5c2a] text-white font-medium rounded-tl-sm'}`}>
                <p className="m-0 whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2.5 max-w-[85%] self-start animate__animated animate__fadeInUp animate__faster">
            <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0 shadow-sm bg-green-50 text-green-800 border border-green-200">
              <Bot size={16} />
            </div>
            <div className="px-5 py-3.5 rounded-2xl rounded-tr-sm bg-white border border-gray-200 shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* ── Summary Card (when conversation is complete) ───────────────── */}
        {isComplete && extractedData && (
          <div className="animate__animated animate__fadeInUp mt-2">
            <div className="bg-white border border-green-200 rounded-[20px] p-5 shadow-[0_4px_12px_rgba(34,197,94,0.08)]">
              {/* Summary Header */}
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-green-50">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-green-800 m-0">تم جمع البيانات بنجاح</p>
                  <p className="text-[11px] text-green-400 m-0">راجع البيانات وأكّد الحفظ</p>
                </div>
              </div>

              {/* Medical History */}
              <div className="mb-3.5">
                <p className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                  <Stethoscope size={14} />
                  التاريخ المرضي
                </p>
                {extractedData.medical_history?.length > 0 ? (
                  extractedData.medical_history.map((entry, idx) => (
                    <div key={idx} className="bg-[#fafaf9] border border-[#f5f5f4] rounded-xl px-3.5 py-2.5 mb-1.5 text-[12.5px] text-gray-700 leading-relaxed">
                      <strong className="text-gray-900">{entry.disease_or_symptom}</strong>
                      {entry.approximate_date && (
                        <span className="text-gray-500 mr-2">
                          — {entry.approximate_date}
                        </span>
                      )}
                      {entry.treatment && (
                        <div className="mt-1 text-xs text-gray-600">
                          💊 العلاج: {entry.treatment}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">لا يوجد تاريخ مرضي مُسجَّل</p>
                )}
              </div>

              {/* Vaccinations */}
              <div className="mb-3.5">
                <p className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                  <Syringe size={14} />
                  اللقاحات
                </p>
                {extractedData.vaccinations?.length > 0 ? (
                  extractedData.vaccinations.map((entry, idx) => (
                    <div key={idx} className="bg-[#fafaf9] border border-[#f5f5f4] rounded-xl px-3.5 py-2.5 mb-1.5 text-[12.5px] text-gray-700 leading-relaxed">
                      <strong className="text-gray-900">{entry.vaccine_name}</strong>
                      <span
                        className={`mr-2 text-[11px] font-semibold ${entry.vaccine_type === 'periodic' ? 'text-blue-600' : 'text-amber-600'}`}
                      >
                        ({entry.vaccine_type === 'periodic' ? 'دوري' : 'طارئ'})
                      </span>
                      {entry.is_first_dose && (
                        <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-[1px] rounded-full mr-1.5 font-semibold">
                          أول جرعة
                        </span>
                      )}
                      {entry.scheduled_date && (
                        <div className="mt-1 text-xs text-gray-600">
                          📅 موعد مجدول: {entry.scheduled_date}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">لا توجد لقاحات مُسجَّلة</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-center text-green-800 font-bold mt-4 pt-3.5 border-t border-green-50">
                {isConfirming ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    جاري حفظ البيانات...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={18} />
                    تم الحفظ! جاري الانتقال لصفحة الحيوان...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar ─────────────────────────────────────────────────────── */}
      {!isComplete && !isInitializing && (
        <div className="p-3 sm:p-4 bg-white border-t border-gray-200 shrink-0">
          <div className="flex items-center bg-[#fafaf9] border border-gray-200 rounded-[14px] p-1 gap-1 focus-within:border-[#2a5c2a] focus-within:ring-4 focus-within:ring-[#2a5c2a]/10 transition-all">
            {(() => {
              return (
                <>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب ردك هنا..."
                    className="flex-1 border-none outline-none bg-transparent font-cairo text-[13.5px] text-gray-800 px-3 py-2 min-w-0 placeholder-gray-400"
                    disabled={isTyping}
                    autoFocus
                  />
                  <button
                    className="flex items-center justify-center w-10 h-10 rounded-xl border-none bg-[#2a5c2a] text-white shrink-0 transition-colors hover:bg-[#1e4520] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    title="إرسال"
                  >
                    <Send size={16} className="rotate-180" />
                  </button>
                </>
              );
            })()}
          </div>
          <p className="text-center text-[10.5px] text-gray-400 mt-2 px-2">
            المساعد الذكي بيسألك عن الأمراض السابقة واللقاحات عشان يسجّلها لك في النظام
          </p>
        </div>
      )}
    </div>
  );
};

export default OnboardingChatPage;
