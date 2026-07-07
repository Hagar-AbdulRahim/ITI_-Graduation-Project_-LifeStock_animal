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
import onboardingService from '../../services/onboardingService';
import './OnboardingChat.css';

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
      <div className="onb-chat-container">
        <div className="onb-header">
          <div className="onb-header-right">
            <button className="onb-header-btn" onClick={() => navigate(-1)}>
              <ArrowRight size={16} />
            </button>
            <div>
              <p className="onb-header-title">المساعد البيطري</p>
            </div>
          </div>
        </div>
        <div className="onb-messages" style={{ justifyContent: 'center' }}>
          <div className="onb-error">
            <div className="onb-error-icon">
              <AlertTriangle size={28} />
            </div>
            <p className="onb-error-text">{initError}</p>
            <button className="onb-error-btn" onClick={initChat}>
              إعادة المحاولة
            </button>
            <button
              className="onb-btn-skip"
              style={{ marginTop: 8 }}
              onClick={handleSkip}
            >
              <SkipForward size={14} />
              تخطي وانتقل لصفحة الحيوان
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Main Chat ───────────────────────────────────────────────────────
  return (
    <div className="onb-chat-container">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="onb-header">
        <div className="onb-header-right">
          <button className="onb-header-btn" onClick={() => navigate(-1)}>
            <ArrowRight size={16} />
          </button>
          <div className="onb-header-indicator">
            <span className="onb-pulse-ring" />
            <span className="onb-header-indicator-dot" />
          </div>
          <div>
            <p className="onb-header-title">تسجيل التاريخ المرضي</p>
            <p className="onb-header-subtitle">المساعد البيطري الذكي</p>
          </div>
        </div>
        <div className="onb-header-actions">
          <button
            className="onb-header-btn onb-header-btn-skip"
            onClick={handleSkip}
            title="تخطي"
          >
            <SkipForward size={14} />
            <span>تخطي</span>
          </button>
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────────────────────────── */}
      <div className="onb-messages">
        {/* Welcome hint */}
        {messages.length > 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '8px 16px',
              fontSize: '11px',
              color: '#a8a29e',
              fontWeight: 500,
            }}
          >
            <Sparkles
              size={14}
              style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }}
            />
            المساعد البيطري هيسألك عن التاريخ المرضي للحيوان عشان يسجّله في النظام
          </div>
        )}

        {/* Loading skeleton on init */}
        {isInitializing && (
          <div className="onb-msg-row onb-msg-row--ai onb-msg-enter">
            <div className="onb-avatar onb-avatar--ai">
              <Bot size={16} />
            </div>
            <div className="onb-skeleton" />
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`onb-msg-row ${isAi ? 'onb-msg-row--ai' : 'onb-msg-row--user'} onb-msg-enter`}
            >
              <div className={`onb-avatar ${isAi ? 'onb-avatar--ai' : 'onb-avatar--user'}`}>
                {isAi ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`onb-bubble ${isAi ? 'onb-bubble--ai' : 'onb-bubble--user'}`}>
                <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{msg.text}</p>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="onb-typing-row onb-msg-enter">
            <div className="onb-avatar onb-avatar--ai">
              <Bot size={16} />
            </div>
            <div className="onb-typing-bubble">
              <span className="onb-typing-dot" />
              <span className="onb-typing-dot" />
              <span className="onb-typing-dot" />
            </div>
          </div>
        )}

        {/* ── Summary Card (when conversation is complete) ───────────────── */}
        {isComplete && extractedData && (
          <div className="onb-summary-enter" style={{ marginTop: 8 }}>
            <div className="onb-summary-card">
              {/* Summary Header */}
              <div className="onb-summary-header">
                <div className="onb-summary-icon">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="onb-summary-title">تم جمع البيانات بنجاح</p>
                  <p className="onb-summary-subtitle">راجع البيانات وأكّد الحفظ</p>
                </div>
              </div>

              {/* Medical History */}
              <div className="onb-summary-section">
                <p className="onb-summary-section-title">
                  <Stethoscope size={14} />
                  التاريخ المرضي
                </p>
                {extractedData.medical_history?.length > 0 ? (
                  extractedData.medical_history.map((entry, idx) => (
                    <div key={idx} className="onb-summary-item">
                      <strong>{entry.disease_or_symptom}</strong>
                      {entry.approximate_date && (
                        <span style={{ color: '#78716c', marginRight: 8 }}>
                          — {entry.approximate_date}
                        </span>
                      )}
                      {entry.treatment && (
                        <div style={{ marginTop: 4, fontSize: '12px', color: '#57534e' }}>
                          💊 العلاج: {entry.treatment}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="onb-summary-empty">لا يوجد تاريخ مرضي مُسجَّل</p>
                )}
              </div>

              {/* Vaccinations */}
              <div className="onb-summary-section">
                <p className="onb-summary-section-title">
                  <Syringe size={14} />
                  اللقاحات
                </p>
                {extractedData.vaccinations?.length > 0 ? (
                  extractedData.vaccinations.map((entry, idx) => (
                    <div key={idx} className="onb-summary-item">
                      <strong>{entry.vaccine_name}</strong>
                      <span
                        style={{
                          marginRight: 8,
                          fontSize: '11px',
                          color: entry.vaccine_type === 'periodic' ? '#2563eb' : '#d97706',
                          fontWeight: 600,
                        }}
                      >
                        ({entry.vaccine_type === 'periodic' ? 'دوري' : 'طارئ'})
                      </span>
                      {entry.is_first_dose && (
                        <span
                          style={{
                            fontSize: '11px',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            padding: '1px 8px',
                            borderRadius: '20px',
                            marginRight: 6,
                            fontWeight: 600,
                          }}
                        >
                          أول جرعة
                        </span>
                      )}
                      {entry.scheduled_date && (
                        <div style={{ marginTop: 4, fontSize: '12px', color: '#57534e' }}>
                          📅 موعد مجدول: {entry.scheduled_date}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="onb-summary-empty">لا توجد لقاحات مُسجَّلة</p>
                )}
              </div>

              {/* Actions */}
              <div className="onb-summary-actions" style={{ justifyContent: 'center', color: '#166534', fontWeight: 'bold' }}>
                {isConfirming ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={18} className="animate-spin" />
                    جاري حفظ البيانات...
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
        <div className="onb-input-bar">
          <div className="onb-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب ردك هنا..."
              className="onb-input"
              disabled={isTyping}
              autoFocus
            />
            <button
              className="onb-send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              title="إرسال"
            >
              <Send size={16} style={{ transform: 'scaleX(-1)' }} />
            </button>
          </div>
          <p className="onb-input-hint">
            المساعد الذكي بيسألك عن الأمراض السابقة واللقاحات عشان يسجّلها لك في النظام
          </p>
        </div>
      )}
    </div>
  );
};

export default OnboardingChatPage;
