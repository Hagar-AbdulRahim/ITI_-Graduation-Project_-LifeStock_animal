// pages/DiagnosisPage.jsx
// ────────────────────────────────────────────────────────────
// صفحة التشخيص البيطري بالذكاء الاصطناعي — LivestockCare AI
// ────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  FileText, 
  PhoneCall, 
  Check, 
  RefreshCw, 
  Plus, 
  Info,
  Calendar,
  Layers,
  ChevronDown,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import diagnosisAgent from '../services/AiServices/diagnosisِAgent';

export default function DiagnosisPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const animalId = searchParams.get('animalId');
  
  const [species, setSpecies] = useState('cattle');
  
  const [symptoms, setSymptoms] = useState({
    lethargy: true,
    fever: true,
    cough: false,
    noFeed: false,
    nasalDischarge: true,
    lameness: false
  });
  const [duration, setDuration] = useState('1-3');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [apiResult, setApiResult] = useState(null);

  // Toggle symptom checkboxes
  const handleSymptomToggle = (key) => {
    setSymptoms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Run AI Diagnosis
  const runAiDiagnosis = async () => {
    setIsLoading(true);
    setShowResults(false);
    setApiResult(null);
    toast('جاري معالجة المؤشرات ومقارنة البيانات البيولوجية...', {
      icon: '🧠',
      duration: 1200
    });
    
    try {
      const sympsMap = {
        lethargy: 'خمول',
        fever: 'حرارة مرتفعة',
        cough: 'كحة',
        noFeed: 'نقص العلف',
        nasalDischarge: 'إفرازات أنفية',
        lameness: 'عرج'
      };
      
      const activeSymptoms = Object.keys(symptoms)
        .filter(k => symptoms[k])
        .map(k => sympsMap[k]);

      // Call the diagnosis agent endpoint with animal_id and symptoms
      const res = await diagnosisAgent.diagnoseByText(animalId, activeSymptoms);

      if (res?.data || res) {
        setApiResult(res.data || res);
        setShowResults(true);
        toast.success('تم الانتهاء من تحليل التشخيص الذكي!');
      } else {
        toast.error('لم يتم العثور على بيانات التشخيص');
      }
    } catch (error) {
      console.error('Diagnosis Error:', error);
      toast.error('حدث خطأ أثناء الاتصال بمحرك التشخيص');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="max-w-7xl mx-auto font-cairo space-y-6 pb-12">
      
      {/* ── BACK BUTTON ── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-600 hover:text-[#1b4d2c] font-bold text-sm transition-colors mb-2 group"
      >
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        رجوع
      </button>

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-black text-stone-800">
            محرك تحليل التشخيص
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            إجراء تقييمات سريرية متقدمة مدعومة بالذكاء الاصطناعي لعلامات صحة الماشية.
          </p>
        </div>
      </div>

      {/* ── TWO-COLUMN MAIN AREA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT COLUMN: Symptom Selection Card (w-5/12 approx) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6 relative overflow-hidden">
          
          {/* New Status Tag */}
          <div className="absolute left-6 top-6">
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
              حالة جديدة
            </span>
          </div>

          <h2 className="text-base font-bold text-stone-800">اختيار الأعراض</h2>

          {/* Animal Dropdown selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 block">
              {animalId ? 'الحيوان المعني' : 'الفصيلة المستهدفة'}
            </label>
            <div className="relative">
              {animalId ? (
                <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-bold flex items-center justify-between">
                  <span>تم ربط الحيوان بنجاح</span>
                  <span className="text-xs bg-emerald-100 px-2 py-0.5 rounded-full">ID: {animalId}</span>
                </div>
              ) : (
                <>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#2d5a1b]/20 focus:border-[#2d5a1b] appearance-none cursor-pointer"
                  >
                    <option value="cattle">أبقار (Cattle)</option>
                    <option value="sheep">أغنام (Sheep)</option>
                    <option value="goat">ماعز (Goat)</option>
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Symptoms Checkboxes */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-stone-500 block">الأعراض الظاهرة</label>
            
            <div className="grid grid-cols-2 gap-3">
              
              {/* Checkbox 1: خمول */}
              <button 
                type="button"
                onClick={() => handleSymptomToggle('lethargy')}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-right transition-all ${
                  symptoms.lethargy 
                    ? 'border-[#2d5a1b] bg-emerald-50/20 text-[#2d5a1b] font-semibold' 
                    : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                }`}
              >
                <span className="text-xs">خمول</span>
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  symptoms.lethargy ? 'bg-[#2d5a1b] border-[#2d5a1b] text-white' : 'border-stone-300 bg-white'
                }`}>
                  {symptoms.lethargy && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
              </button>

              {/* Checkbox 2: نقص العلف */}
              <button 
                type="button"
                onClick={() => handleSymptomToggle('noFeed')}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-right transition-all ${
                  symptoms.noFeed 
                    ? 'border-[#2d5a1b] bg-emerald-50/20 text-[#2d5a1b] font-semibold' 
                    : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                }`}
              >
                <span className="text-xs">نقص العلف</span>
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  symptoms.noFeed ? 'bg-[#2d5a1b] border-[#2d5a1b] text-white' : 'border-stone-300 bg-white'
                }`}>
                  {symptoms.noFeed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
              </button>

              {/* Checkbox 3: حرارة مرتفعة */}
              <button 
                type="button"
                onClick={() => handleSymptomToggle('fever')}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-right transition-all ${
                  symptoms.fever 
                    ? 'border-[#2d5a1b] bg-emerald-50/20 text-[#2d5a1b] font-semibold' 
                    : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                }`}
              >
                <span className="text-xs">حرارة مرتفعة</span>
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  symptoms.fever ? 'bg-[#2d5a1b] border-[#2d5a1b] text-white' : 'border-stone-300 bg-white'
                }`}>
                  {symptoms.fever && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
              </button>

              {/* Checkbox 4: إفرازات أنفية */}
              <button 
                type="button"
                onClick={() => handleSymptomToggle('nasalDischarge')}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-right transition-all ${
                  symptoms.nasalDischarge 
                    ? 'border-[#2d5a1b] bg-emerald-50/20 text-[#2d5a1b] font-semibold' 
                    : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                }`}
              >
                <span className="text-xs">إفرازات أنفية</span>
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  symptoms.nasalDischarge ? 'bg-[#2d5a1b] border-[#2d5a1b] text-white' : 'border-stone-300 bg-white'
                }`}>
                  {symptoms.nasalDischarge && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
              </button>

              {/* Checkbox 5: سعال */}
              <button 
                type="button"
                onClick={() => handleSymptomToggle('cough')}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-right transition-all ${
                  symptoms.cough 
                    ? 'border-[#2d5a1b] bg-emerald-50/20 text-[#2d5a1b] font-semibold' 
                    : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                }`}
              >
                <span className="text-xs">سعال</span>
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  symptoms.cough ? 'bg-[#2d5a1b] border-[#2d5a1b] text-white' : 'border-stone-300 bg-white'
                }`}>
                  {symptoms.cough && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
              </button>

              {/* Checkbox 6: عرج */}
              <button 
                type="button"
                onClick={() => handleSymptomToggle('lameness')}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-right transition-all ${
                  symptoms.lameness 
                    ? 'border-[#2d5a1b] bg-emerald-50/20 text-[#2d5a1b] font-semibold' 
                    : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                }`}
              >
                <span className="text-xs">عرج</span>
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  symptoms.lameness ? 'bg-[#2d5a1b] border-[#2d5a1b] text-white' : 'border-stone-300 bg-white'
                }`}>
                  {symptoms.lameness && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
              </button>

            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 block">مدة الأعراض</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDuration('24h')}
                className={`py-2 px-3 border rounded-xl text-center text-xs font-bold transition-all ${
                  duration === '24h' 
                    ? 'bg-emerald-50 text-[#2d5a1b] border-2 border-[#2d5a1b]' 
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-white'
                }`}
              >
                أقل من 24 س
              </button>
              <button
                type="button"
                onClick={() => setDuration('1-3')}
                className={`py-2 px-3 border rounded-xl text-center text-xs font-bold transition-all ${
                  duration === '1-3' 
                    ? 'bg-emerald-50 text-[#2d5a1b] border-2 border-[#2d5a1b]' 
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-white'
                }`}
              >
                1-3 أيام
              </button>
              <button
                type="button"
                onClick={() => setDuration('4+')}
                className={`py-2 px-3 border rounded-xl text-center text-xs font-bold transition-all ${
                  duration === '4+' 
                    ? 'bg-emerald-50 text-[#2d5a1b] border-2 border-[#2d5a1b]' 
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-white'
                }`}
              >
                4+ أيام
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            onClick={runAiDiagnosis}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#2d5a1b] hover:bg-[#3d6b47] disabled:bg-[#2d5a1b]/60 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-98 text-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                <span>جاري إجراء التحليل...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>بدء التشخيص بالذكاء الاصطناعي</span>
              </>
            )}
          </button>
        </div>

        {/* LEFT COLUMN: Diagnosis Results & Actions (w-7/12 approx) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main results box */}
          {showResults && apiResult ? (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 relative">
              
              {/* Alert Ribbon/Badge */}
              <div className="absolute left-6 top-6 flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>تحليل مكتمل</span>
              </div>

              <h2 className="text-base font-bold text-stone-800 mb-6 pb-2 border-b border-stone-100">نتيجة التشخيص</h2>

              {/* Diagnosis block */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left Side: Vitals Metrics */}
                <div className="md:col-span-4 flex flex-col gap-3">
                  <span className="text-[10px] text-stone-400 block mb-1">مقاييس الطوارئ</span>
                  
                  {/* Severity card */}
                  <div className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">مؤشر الخطورة</span>
                      <span className="text-xs font-black text-red-600">
                        {apiResult.severity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Prediction cards */}
                <div className="md:col-span-8 space-y-3">
                  <span className="text-[10px] text-stone-400 block mb-1">التطابق الأساسي</span>

                  {/* Primary Diagnosis */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl">
                    <h3 className="text-sm font-black text-emerald-800 mb-1.5">
                      {apiResult.diagnosis || 'لم يتم تحديد المرض بدقة'}
                    </h3>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <span>🧠</span>
                      <span>تم التشخيص بواسطة الذكاء الاصطناعي</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* Recommended Actions */}
              {apiResult.prevention_tips && apiResult.prevention_tips.length > 0 && (
                <div className="mt-8 pt-6 border-t border-stone-100 space-y-4">
                  <h3 className="text-xs font-bold text-stone-500">الإجراءات الموصى بها</h3>

                  <div className="space-y-3">
                    {apiResult.prevention_tips.map((tip, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-xl border border-stone-100 bg-stone-50/50">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-stone-800 leading-relaxed pt-2">
                            {tip}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Knowledge Sources */}
              {apiResult.knowledge_sources && apiResult.knowledge_sources.length > 0 && (
                <div className="mt-8 pt-6 border-t border-stone-100 space-y-4">
                  <h3 className="text-xs font-bold text-stone-500">مصادر المعرفة</h3>
                  <div className="flex flex-col gap-2">
                    {apiResult.knowledge_sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        {source}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setShowReport(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#2d5a1b] hover:bg-[#3d6b47] text-white py-3 px-4 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-98"
                >
                  <FileText className="w-4 h-4" />
                  <span>إنشاء تقرير مفصل</span>
                </button>
                
                <button
                  onClick={() => {
                    toast.success('جاري الاتصال بالطبيب البيطري المناوب...');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 border border-stone-300 hover:bg-stone-50 text-stone-600 py-3 px-4 rounded-xl text-xs font-bold transition-all active:scale-98"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>الاتصال بالطبيب البيطري</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-12 text-center text-stone-400">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm font-bold">يرجى اختيار الأعراض والضغط على زر التحليل بالذكاء الاصطناعي</p>
            </div>
          )}

        </div>

      </div>

      {/* ── BOTTOM ROW: Predictive propagation map ── */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 text-stone-800 font-bold">
          <span className="w-5 h-5 rounded-lg bg-emerald-50 text-[#2d5a1b] flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </span>
          <h2 className="text-base font-bold">تحليل القطيع التنبؤي</h2>
        </div>
        <p className="text-xs text-stone-500">
          نمذجة الذكاء الاصطناعي للانتشار المحتمل خلال الـ 48 ساعة القادمة.
        </p>

        {/* Map Visualization placeholder (Premium CSS simulation) */}
        <div className="relative rounded-2xl h-60 w-full bg-[#1b221d] border border-stone-800 overflow-hidden flex items-center justify-center shadow-inner">
          
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          {/* Pulsing infection node center */}
          <div className="absolute w-40 h-40 bg-red-500/20 rounded-full animate-ping duration-3000" />
          <div className="absolute w-28 h-28 bg-red-500/35 rounded-full animate-pulse" />
          
          {/* Node connections representation */}
          <svg className="absolute inset-0 w-full h-full opacity-30">
            {/* Barn 1 */}
            <circle cx="20%" cy="30%" r="6" fill="#10b981" />
            <text x="20%" y="24%" fill="#a7f3d0" fontSize="9" textAnchor="middle">الحظيرة ١</text>
            
            {/* Barn 2 */}
            <circle cx="50%" cy="50%" r="8" fill="#ef4444" className="animate-pulse" />
            <text x="50%" y="42%" fill="#fca5a5" fontSize="10" textAnchor="middle" fontWeight="bold">بؤرة الإصابة (#442)</text>
            
            {/* Barn 3 (Hangs 12% risk) */}
            <circle cx="80%" cy="40%" r="6" fill="#f59e0b" />
            <text x="80%" y="34%" fill="#fde68a" fontSize="9" textAnchor="middle">الحظيرة ٣ (معرضة لخطر)</text>

            {/* Line connections */}
            <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#10b981" strokeWidth="1" strokeDasharray="4" />
            <line x1="80%" y1="40%" x2="50%" y2="50%" stroke="#ef4444" strokeWidth="1.5" />
          </svg>

          {/* Radar Sweep Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2d5a1b]/10 to-transparent w-[300%] h-full animate-[sweep_8s_infinite_linear]" style={{
            backgroundImage: 'conic-gradient(from 180deg at 50% 50%, transparent 60%, rgba(16, 185, 129, 0.08) 80%, transparent)'
          }} />

          {/* Information badge overlay */}
          <div className="absolute bottom-6 bg-white/95 backdrop-blur-xs text-stone-800 text-xs px-4 py-2 rounded-full font-bold border border-stone-200 shadow-md">
            خطر تعرض يقدر بـ <span className="text-amber-600 font-extrabold">12%</span> للحظيرة رقم 3
          </div>
        </div>
      </div>

      {/* MODAL: Detailed Report - Only show if animalId (not general) and report open */}
      {showReport && animalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-100 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2d5a1b]" />
                <h3 className="font-bold text-stone-800 text-base">تقرير فحص تشخيصي مفصل</h3>
              </div>
              <button 
                onClick={() => setShowReport(false)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-200"
              >
                <span>❌</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto text-sm text-stone-700">
              
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <div>
                  <span className="text-stone-400 block mb-1">معرف الحيوان</span>
                  <span className="font-bold text-stone-800">{animalId}</span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-1">الفصيلة / نوع</span>
                  <span className="font-bold text-stone-800">{species}</span>
                </div>
              </div>

              {/* Symptoms breakdown */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#2d5a1b] text-xs">الأعراض السريرية المسجلة</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(symptoms).map(([key, val]) => {
                    if (!val) return null;
                    const arabicNames = {
                      lethargy: 'خمول',
                      fever: 'حرارة مرتفعة',
                      cough: 'سعال',
                      noFeed: 'نقص العلف',
                      nasalDischarge: 'إفرازات أنفية',
                      lameness: 'عرج'
                    };
                    return (
                      <span key={key} className="text-xs font-semibold px-2.5 py-1 bg-[#2d5a1b]/5 text-[#2d5a1b] rounded-lg border border-[#2d5a1b]/10">
                        {arabicNames[key]}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Diagnosis Details */}
              <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl space-y-2">
                <h4 className="font-bold text-red-800 text-xs flex items-center gap-1">
                  <span>🚨</span>
                  <span>النتيجة السريرية الأولية (الذكاء الاصطناعي)</span>
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  مؤشرات شدة تطابق مع <strong>{apiResult?.diagnosis || 'مرض غير محدد'}</strong>.
                  مؤشر الخطورة: {apiResult?.severity}
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-200 flex justify-end gap-3 bg-stone-50">
              <button 
                onClick={() => {
                  toast.success('تم حفظ التقرير بالملف الطبي');
                  setShowReport(false);
                }}
                className="px-4 py-2 bg-[#2d5a1b] hover:bg-[#3d6b47] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                حفظ التقرير
              </button>
              <button 
                onClick={() => setShowReport(false)}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-600 text-xs font-bold rounded-xl transition-colors"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
