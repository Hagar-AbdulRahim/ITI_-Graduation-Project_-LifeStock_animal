// pages/AiAssistantPage.jsx
// ────────────────────────────────────────────────────────────
// صفحة مساعد الذكاء الاصطناعي — LivestockCare AI
// ────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { diagnoseWithAI, diagnoseWithImage, diagnoseWithMixed, diagnoseWithVoice } from '../services/AiServices/ChatAi';
import { animalService } from '../features/animals/services/animalService';
import healthCaseService from '../services/healthCaseService';
import AiDiagnosisCard from '../components/AiDiagnosisCard';
import { 
  Bot, 
  User, 
  Mic, 
  Paperclip, 
  Send, 
  Share2, 
  History, 
  X, 
  FileText, 
  Calendar, 
  AlertCircle,
  FileSpreadsheet,
  Play,
  Image as ImageIcon,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
// ── Mock Sessions Data ──────────────────────────────────────
const MOCK_SESSIONS = [];

const isWelcomeMessage = (msg) => msg.id === 'msg-1';

const toChatRole = (sender) => (sender === 'ai' ? 'assistant' : 'user');

const getDiagnosisConversationPayload = (messages, currentUserMsg) => {
  const conversation = [...messages, currentUserMsg]
    .filter((msg) => !isWelcomeMessage(msg))
    .filter((msg) => msg.sender === 'ai' || msg.sender === 'user')
    .filter((msg) => typeof msg.text === 'string' && msg.text.trim().length > 0);

  const firstUserIndex = conversation.findIndex((msg) => msg.sender === 'user');
  if (firstUserIndex === -1) {
    return { symptoms: currentUserMsg.text, chatHistory: [] };
  }

  const initialSymptoms = conversation[firstUserIndex].text;
  const chatHistory = conversation.slice(firstUserIndex + 1).map((msg) => ({
    role: toChatRole(msg.sender),
    content: msg.text,
  }));

  return { symptoms: initialSymptoms, chatHistory };
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');

const resolveMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
};

const getSessionImageUrls = (session) => {
  const urls = Array.isArray(session.image_urls) && session.image_urls.length
    ? session.image_urls
    : session.image_url
    ? [session.image_url]
    : [];
  return urls.map(resolveMediaUrl).filter(Boolean);
};

const getSessionSymptomsText = (session) => {
  if (Array.isArray(session.symptoms)) return session.symptoms.join('، ');
  return session.symptoms || 'جلسة سابقة';
};

const buildDiagnosisDataFromSession = (session) => ({
  success: true,
  status: 'diagnosed',
  record_id: session._id,
  data: {
    diagnosis: session.ai_diagnosis,
    confidence: session.confidence,
    severity: session.severity,
    matched_symptoms: session.matched_symptoms || [],
    immediate_actions: session.suggested_actions || [],
    vet_required: session.vet_required,
    vet_urgency: session.vet_urgency,
    reasoning: session.image_findings || null,
  },
});

const getBackendOnlyMessage = (response) => {
  const data = response?.data;
  if (response?.status === 'needs_clarification') {
    return response.question || response.message || null;
  }

  const diagnosis = typeof data?.diagnosis === 'string' ? data.diagnosis.trim() : '';
  const hasDetailedDiagnosis = Boolean(
    data?.status === 'diagnosed' ||
    diagnosis &&
    !['غير محدد', 'غير معروف', 'غير متوفر'].includes(diagnosis) &&
    (
      data?.severity_explanation ||
      data?.reasoning ||
      data?.treatment?.summary ||
      data?.treatment?.medicines?.length > 0 ||
      data?.treatment?.general_instructions?.length > 0 ||
      data?.prevention ||
      data?.prevention_tips?.length > 0 ||
      data?.disease_info ||
      data?.matched_symptoms?.length > 0 ||
      data?.immediate_actions?.length > 0 ||
      data?.suggested_vaccines?.length > 0
    )
  );

  if (hasDetailedDiagnosis) return null;

  return data?.message || response?.message || diagnosis || null;
};

export default function AiAssistantPage() {
  const [searchParams] = useSearchParams();
  const { farmId } = useParams();
  const animalId = searchParams.get('animalId');
  const navigate = useNavigate();
  const defaultSession = {
    id: 'session-current',
    title: 'جلسة تشخيص جديدة',
    date: 'اليوم',
    messages: [
      {
        id: 'msg-1',
        sender: 'ai',
        text: 'مرحباً بك في المساعد الذكي لتقييم الحالات الصحية للماشية. يرجى وصف الأعراض التي تلاحظها بدقة، وسأقوم بتحليلها.',
        hasSuggestions: false
      }
    ]
  };

  const [activeSession, setActiveSession] = useState(defaultSession);
  const [messages, setMessages] = useState(defaultSession.messages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]); // image files
  const [attachedAudio, setAttachedAudio] = useState(null); // audio blob
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [animalSpecies, setAnimalSpecies] = useState(null);

  useEffect(() => {
    if (animalId) {
      animalService.getAnimalById(animalId)
        .then((res) => setAnimalSpecies(res.data?.species || null))
        .catch((err) => console.error("Error fetching animal species:", err));
    }
  }, [animalId]);

  // Modals / Panels States
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const [historySessions, setHistorySessions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [expandedMsgId, setExpandedMsgId] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (showHistoryPanel) {
      setIsLoadingHistory(true);
      const fetchHistory = animalId 
        ? healthCaseService.getAnimalHealthCases(animalId)
        : healthCaseService.getMyConsultations();

      fetchHistory.then(res => {
        setHistorySessions(res.data || []);
      }).catch(err => {
        console.error("Error fetching history:", err);
      }).finally(() => {
        setIsLoadingHistory(false);
      });
    }
  }, [showHistoryPanel, animalId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleMsgMedia = (msgId) => {
    setExpandedMsgId((prev) => (prev === msgId ? null : msgId));
  };

  // Handle Loading Session from History — append to current chat
  const loadSession = (session) => {
    const symptomsText = getSessionSymptomsText(session);
    const imageUrls = getSessionImageUrls(session);
    const inputType = session.input_type || 'text';
    const hasVoice = inputType.includes('voice');
    const hasImage = inputType.includes('image') || imageUrls.length > 0;

    const userMsg = {
      id: `msg-user-${session._id}-${Date.now()}`,
      sender: 'user',
      text: hasVoice && hasImage
        ? `🎤🖼️ ${symptomsText}`
        : hasVoice
        ? `🎤 ${symptomsText}`
        : hasImage
        ? `🖼️ ${symptomsText}`
        : symptomsText,
      attachment: hasVoice && hasImage
        ? `تسجيل صوتي و${imageUrls.length} صورة`
        : hasImage
        ? `${imageUrls.length} صورة`
        : hasVoice
        ? 'تسجيل صوتي'
        : null,
      imageUrls,
      inputType,
      recordId: session._id,
    };

    const aiMsg = {
      id: `msg-ai-${session._id}-${Date.now()}`,
      sender: 'ai',
      text: 'بناءً على الأعراض المدخلة في هذه الجلسة السابقة:',
      hasActionSteps: false,
      diagnosisData: buildDiagnosisDataFromSession(session),
      recordId: session._id,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setExpandedMsgId(userMsg.id);
    setShowHistoryPanel(false);
    toast.success('تم عرض السجل في المحادثة');
  };



  // Send Message Logic
  const handleSendMessage = async (textToSend = inputValue) => {
    const hasText = textToSend.trim();
    const hasImage = attachedFiles.length > 0;
    const hasAudio = !!attachedAudio;

    if (!hasText && !hasImage && !hasAudio) return;

    const audioBlob = attachedAudio;
    const imageFiles = [...attachedFiles];
    const audioUrl = hasAudio ? URL.createObjectURL(audioBlob) : null;
    const imageUrls = hasImage ? imageFiles.map((file) => URL.createObjectURL(file)) : [];

    // ── Add user message ──────────────────────────────────────────────────────
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: hasAudio && hasImage
        ? `🎤🎞️ تم إرفاق تسجيل صوتي و${imageFiles.length} صورة${imageFiles.length > 1 ? 'ً' : ''}${hasText ? ` — ${textToSend}` : ''}`
        : hasAudio
        ? '🎤 تم إرسال تسجيل صوتي...'
        : hasImage
        ? `🖼️ تم إرفاق ${imageFiles.length} صورة${imageFiles.length > 1 ? 'ً' : ''}${hasText ? ` — ${textToSend}` : ''}`
        : textToSend,
      attachment: hasAudio && hasImage ? `تسجيل صوتي و${imageFiles.length} صورة` : hasImage ? `${imageFiles.length} صورة` : hasAudio ? 'تسجيل صوتي' : null,
      audioUrl,
      imageUrls,
      inputType: hasAudio && hasImage ? 'voice+image' : hasAudio ? 'voice' : hasImage ? 'image' : 'text',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setAttachedFiles([]);
    setAttachedAudio(null);
    setExpandedMsgId(userMsg.id);
    setIsTyping(true);

    try {
      let res;

      if (hasAudio && hasImage) {
        // 🎙️🖼️ Mixed voice + images diagnosis
        res = await diagnoseWithMixed(audioBlob, imageFiles, animalId, animalSpecies, hasText ? textToSend : undefined);
        // Show transcribed text as user message update
        if (res?.transcribed_text) {
          setMessages(prev => prev.map(m =>
            m.id === userMsg.id
              ? { ...m, text: `🎤 ما تم تفريغه من التسجيل: "${res.transcribed_text}"` }
              : m
          ));
        }
      } else if (hasAudio) {
        // 🎤 Voice diagnosis
        res = await diagnoseWithVoice(audioBlob, animalId, animalSpecies);
        if (res?.transcribed_text) {
          setMessages(prev => prev.map(m =>
            m.id === userMsg.id
              ? { ...m, text: `🎤 ما تم تفريغه من التسجيل: "${res.transcribed_text}"` }
              : m
          ));
        }
      } else if (hasImage) {
        // 🖼️ Image diagnosis
        res = await diagnoseWithImage(imageFiles, animalId, animalSpecies, hasText ? textToSend : undefined);
      } else {
        // 📝 Text diagnosis
        const { symptoms, chatHistory } = getDiagnosisConversationPayload(messages, userMsg);
        res = await diagnoseWithAI(animalId, symptoms, animalSpecies, chatHistory);
      }

      const backendOnlyMessage = getBackendOnlyMessage(res);
      const serverImageUrls = res?.image_urls?.length
        ? res.image_urls.map(resolveMediaUrl).filter(Boolean)
        : res?.image_url
        ? [resolveMediaUrl(res.image_url)]
        : [];

      if (serverImageUrls.length > 0) {
        setMessages((prev) => prev.map((m) =>
          m.id === userMsg.id ? { ...m, imageUrls: serverImageUrls } : m
        ));
      }

      const aiMsg = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: backendOnlyMessage || (hasAudio
          ? 'بناءً على التسجيل الصوتي المدخل، هذا هو التشخيص المقترح:'
          : hasImage
          ? 'بناءً على تحليل الصورة المرفقة، هذا هو التشخيص المقترح:'
          : animalId ? 'بناءً على الأعراض والبيانات الحيوية، هذا هو التشخيص المقترح:' : 'بناءً على الأعراض المدخلة، هذا هو التشخيص المقترح (استشارة عامة):'),
        hasActionSteps: false,
        isClarificationQuestion: res?.status === 'needs_clarification',
        clarificationCount: res?.clarification_count,
        maxClarificationQuestions: res?.max_clarification_questions,
        diagnosisData: backendOnlyMessage ? null : res,
        recordId: res?.record_id || null,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      const errMsg = error?.response?.data?.message || 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقًا.';
      toast.error(errMsg);
      setMessages(prev => [...prev, {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ ${errMsg}`,
        hasActionSteps: false
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Suggestion chip trigger
  const handleChipClick = (chipText) => {
    handleSendMessage(chipText);
  };

  // 🎙️ Real Voice Recording via MediaRecorder API
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      toast('🎤 جاري معالجة التسجيل...', { icon: '⌛' });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAttachedAudio(audioBlob);

          stream.getTracks().forEach(t => t.stop());
          toast.success('تم التسجيل! اضغط إرسال لإرساله للتحليل');
        };

        mediaRecorder.start();
        setIsRecording(true);
        toast('🎤 جاري التسجيل... اضغط مرة أخرى للإيقاف', { icon: '🎤', duration: 4000 });
      } catch (err) {
        toast.error('لا يمكن الوصول للميكروفون. تأكد من الأذونات.');
        console.error('Mic error:', err);
      }
    }
  };

  // 📎 Image File Attachment
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const addedFiles = files.slice(0, 4 - attachedFiles.length);
    const newFiles = addedFiles.filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type));

    if (newFiles.length > 0) {
      setAttachedFiles((prev) => [...prev, ...newFiles].slice(0, 4));
      toast.success(`تم إرفاق ${newFiles.length} صورة${newFiles.length > 1 ? 'ً' : ''}`);
    }
    e.target.value = '';
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f9fa] font-cairo flex flex-col">
      
      {/* ─── Hero Section (Contact Us Style) ─── */}
      <div className="bg-[#1b4d2c] pt-8 pb-32 px-4 md:px-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-transparent"></span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                المساعد البيطري الذكي
              </h1>
              <p className="text-green-50/80 text-xs sm:text-sm font-medium mt-0.5">رعاية</p>
            </div>
          </div>

          <div className="flex gap-2 text-sm shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm transition-all font-bold border border-white/5 shadow-sm"
              title="رجوع"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">رجوع</span>
            </button>
            <button
              onClick={() => setShowHistoryPanel(true)}
              className="flex items-center gap-1.5 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm transition-all font-bold border border-white/5 shadow-sm"
              title="سجل التشخيصات"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">السجل</span>
            </button>
            <button 
              onClick={() => navigate(farmId && animalId ? `/farms/${farmId}/animals/${animalId}` : farmId ? `/farms/${farmId}` : '/farms')}
              className="flex items-center justify-center p-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              title="رجوع"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline sm:mr-1.5">إغلاق</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Chat Container (Overlapping Card) ─── */}
      <div className="max-w-5xl w-full mx-auto px-3 sm:px-4 md:px-6 -mt-24 pb-8 relative z-20 flex-1 flex flex-col min-h-[500px]">
        <div className="flex-1 flex flex-col bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-stone-200 overflow-hidden border border-stone-100">

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 bg-white">
          <AnimatePresence>
          {messages.map((msg, index) => {
            const isAi = msg.sender === 'ai';
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                key={msg.id} 
                className="flex flex-col"
              >
                <div className={`flex gap-3 sm:gap-4 w-full max-w-[92%] md:max-w-[80%] lg:max-w-[75%] ${isAi ? 'self-start' : 'self-end flex-row-reverse'}`}>
                  
                  {/* Icon Block */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm mt-1 ${
                    isAi ? 'bg-white border border-stone-200 text-[#1b4d2c]' : 'bg-[#1b4d2c] text-white'
                  }`}>
                    {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-4 sm:p-5 rounded-[24px] shadow-sm leading-relaxed text-sm min-w-0 ${
                    isAi 
                      ? 'bg-[#f8f9fa] border border-stone-200 text-stone-900 rounded-tr-md shadow-sm' 
                      : 'bg-[#1b4d2c] text-white rounded-tl-md font-medium shadow-md'
                  }`}>
                    <p className="whitespace-pre-line leading-loose text-[15px]">{msg.text}</p>

                    {isAi && msg.isClarificationQuestion && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>
                          يحتاج توضيح
                          {msg.clarificationCount && msg.maxClarificationQuestions
                            ? ` ${msg.clarificationCount}/${msg.maxClarificationQuestions}`
                            : ''}
                        </span>
                      </div>
                    )}
                    
                    {/* Media attachment — click to play audio / show images */}
                    {(msg.audioUrl || msg.imageUrls?.length > 0) && (
                      <div className="mt-2 space-y-2">
                        <button
                          type="button"
                          onClick={() => toggleMsgMedia(msg.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                            isAi
                              ? 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                              : 'bg-[#12361e] hover:bg-[#143920] text-white border border-[#1b4d2c]'
                          }`}
                        >
                          {msg.audioUrl ? <Play className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                          <span>
                            {expandedMsgId === msg.id
                              ? 'إخفاء المرفقات'
                              : msg.audioUrl && msg.imageUrls?.length
                              ? 'تشغيل التسجيل وعرض الصور'
                              : msg.audioUrl
                              ? 'تشغيل التسجيل الصوتي'
                              : `عرض ${msg.imageUrls.length} صورة`}
                          </span>
                        </button>

                        {expandedMsgId === msg.id && (
                          <div className={`space-y-3 p-3 rounded-2xl border ${isAi ? 'bg-white border-stone-200' : 'bg-[#12361e] border-[#1b4d2c]'}`}>
                            {msg.audioUrl && (
                              <audio controls src={msg.audioUrl} className="w-full h-9 rounded-lg" />
                            )}
                            {msg.imageUrls?.length > 0 && (
                              <div className={`grid gap-1.5 ${msg.imageUrls.length > 1 ? 'grid-cols-3' : 'grid-cols-1'}`}>
                                {msg.imageUrls.map((url, idx) => (
                                  <a key={idx} href={url} target="_blank" rel="noreferrer" className="block w-fit">
                                    <img
                                      src={url}
                                      alt={`صورة ${idx + 1}`}
                                      className="rounded-xl w-20 h-20 sm:w-24 sm:h-24 object-cover border border-stone-200 shadow-sm transition-transform hover:scale-105"
                                    />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* File attachment label */}
                    {msg.attachment && !msg.audioUrl && !msg.imageUrls?.length && (
                      <div className={`mt-2 flex items-center gap-2 p-2 rounded-lg text-xs ${isAi ? 'bg-white border border-stone-200 text-stone-700' : 'bg-[#12361e] text-green-100'}`}>
                        <FileSpreadsheet className="w-4 h-4" />
                        <span className="truncate">{msg.attachment}</span>
                      </div>
                    )}

                    {/* AI Diagnosis Card */}
                    {isAi && msg.diagnosisData && (
                      <AiDiagnosisCard diagnosisData={msg.diagnosisData} />
                    )}

                  </div>
                </div>

                {/* Suggestions display after welcome or appropriate messages */}
                {isAi && msg.hasSuggestions && index === 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 mr-8 sm:mr-12">
                    <button
                      onClick={() => handleChipClick('كيف يجب أن أعالج بقرة تعاني من الانتفاخ؟')}
                      className="text-xs px-4 py-2.5 rounded-full border border-stone-200 bg-white text-stone-700 hover:bg-[#f8f9fa] hover:border-[#1b4d2c]/50 hover:text-[#1b4d2c] transition-all shadow-sm font-bold"
                    >
                      "كيف يجب أن أعالج بقرة تعاني من الانتفاخ؟"
                    </button>
                    <button
                      onClick={() => handleChipClick('تحديث جدول التطعيمات للقطيع (ب).')}
                      className="text-xs px-4 py-2.5 rounded-full border border-stone-200 bg-white text-stone-700 hover:bg-[#f8f9fa] hover:border-[#1b4d2c]/50 hover:text-[#1b4d2c] transition-all shadow-sm font-bold"
                    >
                      "تحديث جدول التطعيمات للقطيع (ب)."
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 sm:gap-4 max-w-[92%] md:max-w-[80%] self-start">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center bg-white border border-stone-200 text-[#1b4d2c] shadow-sm flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 sm:p-5 rounded-[20px] bg-[#f8f9fa] border border-stone-200 rounded-tr-md shadow-sm flex items-center gap-1.5 h-[52px]">
                <span className="w-2 h-2 bg-[#1b4d2c]/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-[#1b4d2c]/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-[#1b4d2c]/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-6 bg-white shrink-0 border-t border-stone-100 relative z-10">
          
          {/* Image attachment badge */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f8f9fa] text-stone-700 text-sm border border-stone-200 shadow-sm">
              <Paperclip className="w-4 h-4 text-[#1b4d2c] shrink-0" />
              <span className="font-bold shrink-0">{attachedFiles.length} صورة{attachedFiles.length > 1 ? 'ً' : ''} مرفقة</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {attachedFiles.map((file, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-stone-700 border border-stone-200 shadow-sm max-w-[140px] sm:max-w-none">
                    <span className="truncate text-xs font-bold">{file.name}</span>
                    <button onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))} className="text-stone-400 hover:text-red-500 shrink-0 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Audio recording badge */}
          {attachedAudio && !isRecording && (
            <div className="mb-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 text-rose-700 text-sm border border-rose-200 shadow-sm font-medium">
              <Mic className="w-4 h-4" />
              <span>التسجيل الصوتي جاهز للإرسال</span>
              <button onClick={() => setAttachedAudio(null)} className="text-rose-400 hover:text-rose-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="relative flex items-center bg-[#f8f9fa] border border-stone-200 rounded-2xl p-1.5 sm:p-2 focus-within:ring-4 focus-within:ring-[#1b4d2c]/10 focus-within:border-[#1b4d2c] transition-all min-h-[60px]">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اكتب رسالتك للمساعد الذكي..."
              className="flex-1 pr-4 sm:pr-6 pl-[110px] sm:pl-32 py-3 text-sm sm:text-base font-bold bg-transparent outline-none text-stone-900 placeholder:text-stone-400 min-w-0"
            />
            
            {/* Action Bar (Left Side) */}
            <div className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
              <button 
                onClick={toggleRecording}
                className={`p-2 min-w-[44px] min-h-[44px] rounded-xl transition-all flex items-center justify-center ${
                  isRecording 
                    ? 'bg-red-50 text-red-500 animate-pulse border border-red-200' 
                    : 'bg-white text-stone-400 hover:bg-stone-100 hover:text-[#1b4d2c] border border-stone-200 shadow-sm'
                }`}
                title="تسجيل صوتي"
              >
                <Mic className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 min-w-[44px] min-h-[44px] rounded-xl bg-white text-stone-400 hover:bg-stone-100 hover:text-[#1b4d2c] border border-stone-200 shadow-sm transition-all flex items-center justify-center"
                title="إرفاق ملف"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden" 
              />

              <button 
                onClick={() => handleSendMessage()}
                className="p-2 min-w-[48px] min-h-[48px] bg-[#1b4d2c] hover:bg-[#143920] text-white rounded-xl transition-all flex items-center justify-center shadow-md active:scale-95 ml-1"
                title="إرسال"
              >
                <Send className="w-5 h-5 transform rotate-180" />
              </button>
            </div>
          </div>

          <p className="mt-4 text-[11px] sm:text-xs text-stone-500 font-bold text-center px-2">
            يمكن لـ رعاية ارتكاب أخطاء، تحقق دائماً من القرارات الطبية من خلال الملاحظة السريرية.
          </p>
        </div>
        </div>
      </div>

      {/* ── MODAL 1: Full Report Modal ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2d5a1b]" />
                <h3 className="font-bold text-stone-800 text-base">تقرير الحالة الصحية والتشخيص بالذكاء الاصطناعي</h3>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-6 space-y-6 overflow-y-auto text-sm text-stone-700">
              
              {/* Metadata Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <div>
                  <span className="text-stone-400 block mb-1">المعرف</span>
                  <span className="font-bold text-stone-800">البقرة #402</span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-1">تاريخ التقرير</span>
                  <span className="font-bold text-stone-800">١٦ يونيو ٢٠٢٦</span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-1">الفئة / الفصيلة</span>
                  <span className="font-bold text-stone-800">أبقار حلوب (هولشتاين)</span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-1">الطبيبة المعالجة</span>
                  <span className="font-bold text-stone-800">د. سارة مِيلر</span>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#2d5a1b] text-sm border-r-4 border-[#2d5a1b] pr-2">ملخص الحالة السريرية</h4>
                <p className="leading-relaxed text-stone-600 text-xs">
                  تم رصد تغير مفاجئ في المقاييس السلوكية والفسيولوجية للبقرة #402 بواسطة أجهزة الاستشعار الذكية والمتابعة الحيوية المباشرة. يظهر الحيوان انخفاضاً ملحوظاً في فترات الاجترار بنسبة ٢٥٪ بالتزامن مع هبوط في إنتاج الحليب بمعدل ٤ لترات يومياً.
                </p>
              </div>

              {/* Vitals */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#2d5a1b] text-sm border-r-4 border-[#2d5a1b] pr-2">المؤشرات الحيوية المستشعرة</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                    <span className="text-[11px] text-red-600 block mb-1">درجة حرارة الكرش</span>
                    <span className="text-lg font-black text-red-700">٤٠.٢ °م</span>
                    <span className="text-[9px] text-red-500 block font-medium">(مرتفعة بـ +١.٢ °م)</span>
                  </div>
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                    <span className="text-[11px] text-stone-500 block mb-1">الحركة اليومية</span>
                    <span className="text-lg font-black text-stone-700">-١٥٪</span>
                    <span className="text-[9px] text-stone-400 block font-medium">(خمول وقصور نشاط)</span>
                  </div>
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                    <span className="text-[11px] text-stone-500 block mb-1">معدل الاجترار</span>
                    <span className="text-lg font-black text-stone-700">٣٢٠ د/يوم</span>
                    <span className="text-[9px] text-stone-400 block font-medium">(منخفض عن النطاق)</span>
                  </div>
                </div>
              </div>

              {/* Analysis & AI Recommendations */}
              <div className="space-y-2 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-1.5 font-bold text-[#2d5a1b] text-sm mb-2">
                  <Bot className="w-4.5 h-4.5" />
                  <span>توصية التشخيص التنبؤي (AI)</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  تطابق هذه القياسات بنسبة <strong>٩٢٪</strong> مع <strong>مرض الجهاز التنفسي البقري (BRD)</strong> في مراحله الأولى. يُعزى الاحتمال الكبير لتداخل عامل الإجهاد الحراري وتغيرات الطقس الأخيرة. يوصى بإعطاء أولوية قصوى للفحص الميداني اليدوي.
                </p>
              </div>

              {/* Plan Action steps */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-800 text-sm">خطة العلاج والاحتواء الموصى بها</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#2d5a1b] flex items-center justify-center font-bold text-[10px] flex-shrink-0">١</span>
                    <p className="pt-0.5 text-stone-600"><strong>العزل الميكانيكي:</strong> نقل الحيوان فوراً إلى حظيرة العزل الفردي لضمان الهدوء وتقليل انتشار مسببات الأمراض عبر الرذاذ.</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#2d5a1b] flex items-center justify-center font-bold text-[10px] flex-shrink-0">٢</span>
                    <p className="pt-0.5 text-stone-600"><strong>المراقبة الرئوية:</strong> استخدام السماعة البيطرية للاستماع إلى أزيز الصدر أو أي أصوات تنفسية شاذة لتحديد مدى إصابة النسيج الرئوي.</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#2d5a1b] flex items-center justify-center font-bold text-[10px] flex-shrink-0">٣</span>
                    <p className="pt-0.5 text-stone-600"><strong>التدخل الدوائي:</strong> في حال تأكيد الأصوات الرئوية، يتم إعطاء ٢٠ مل من المضاد الحيوي طويل المفعول (مثل فلورفينيكول) مضاداً للالتهابات خافضاً للحرارة وفقاً لتعليمات الصيدلية البيطرية.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-stone-200 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 bg-stone-50">
              <button 
                onClick={() => {
                  toast.success('تم تصدير التقرير كـ PDF بنجاح');
                  setShowReportModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2d5a1b] hover:bg-[#3d6b47] text-white transition-colors shadow-sm"
              >
                تصدير PDF
              </button>
              <button 
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 hover:bg-stone-100 text-stone-600 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Share Modal ── */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-stone-100 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#2d5a1b]" />
                <span>مشاركة جلسة الذكاء الاصطناعي</span>
              </h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              يمكنك مشاركة هذا الرابط مع الأطباء المساعدين أو الفريق الفني بالمزرعة للاطلاع على تحليل وتشخيص البقرة #402.
            </p>

            <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200 mb-4">
              <input 
                type="text" 
                readOnly 
                value="https://livestockcare.ai/share/session-7f3b8" 
                className="flex-1 bg-transparent text-xs text-stone-600 outline-none select-all font-mono"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText('https://livestockcare.ai/share/session-7f3b8');
                  toast.success('تم نسخ رابط المشاركة بنجاح!');
                  setShowShareModal(false);
                }}
                className="px-3.5 py-1.5 bg-[#2d5a1b] text-white hover:bg-[#3d6b47] text-xs font-bold rounded-lg transition-colors"
              >
                نسخ الرابط
              </button>
            </div>
            
            <div className="flex justify-end gap-2 text-xs">
              <button 
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 text-stone-600"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DRAWER: History Sidebar Panel ── */}
      {showHistoryPanel && (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/50 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white w-full sm:w-80 max-w-full h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-left duration-300">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2 font-bold text-stone-800 text-sm">
                <History className="w-4 h-4 text-[#2d5a1b]" />
                <span>سجل الاستشارات السابقة</span>
              </div>
              <button 
                onClick={() => setShowHistoryPanel(false)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-200"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingHistory ? (
                <div className="text-center text-stone-500 text-sm py-4">جاري تحميل السجلات...</div>
              ) : historySessions.length === 0 ? (
                <div className="text-center text-stone-500 text-sm py-4">لا توجد جلسات سابقة.</div>
              ) : (
                historySessions.map((session) => {
                  const isLoadedInChat = messages.some((m) => m.recordId === session._id);
                  const formattedDate = new Date(session.created_at).toLocaleDateString('ar-EG');
                  return (
                    <button
                      key={session._id}
                      onClick={() => loadSession(session)}
                      className={`w-full text-right p-3.5 rounded-xl border transition-all duration-200 block ${
                        isLoadedInChat
                          ? 'bg-[#2d5a1b]/5 border-[#2d5a1b] shadow-sm font-semibold'
                          : 'border-stone-100 bg-stone-50 hover:bg-white hover:border-stone-200'
                      }`}
                    >
                      <span className={`text-xs block mb-1 font-bold ${isLoadedInChat ? 'text-[#2d5a1b]' : 'text-stone-700'}`}>
                        جلسة {formattedDate}
                      </span>
                      <span className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                      </span>
                      {session.ai_diagnosis && (
                        <span className="text-[10px] text-stone-500 block mt-1 truncate">
                          التشخيص: {session.ai_diagnosis}
                        </span>
                      )}
                      {(session.input_type?.includes('image') || session.image_url) && (
                        <span className="text-[10px] text-stone-400 block mt-0.5">🖼️ يحتوي على صور</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-stone-200 text-center bg-stone-50">
              <span className="text-[10px] text-stone-400 block">جميع الجلسات مسجلة وموثقة طبياً</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
