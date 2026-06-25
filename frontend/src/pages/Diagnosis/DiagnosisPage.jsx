import React, { useState, useEffect } from 'react';
import { 
  Zap, AlertTriangle, BarChart3, ShieldAlert, Pill, FileText, PhoneCall, Network,
  ChevronDown, Search, Check, Loader2, Target
} from 'lucide-react';
import api from '../../services/api';

const DiagnosisPage = () => {
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [symptoms, setSymptoms] = useState([
    { id: 'appetite', label: 'نقص شهية', checked: false },
    { id: 'lethargy', label: 'خمول', checked: false },
    { id: 'nasal', label: 'إفرازات أنفية', checked: true },
    { id: 'fever', label: 'حرارة مرتفعة', checked: true },
    { id: 'lameness', label: 'عرج', checked: false },
    { id: 'cough', label: 'سعال', checked: false },
  ]);
  const [duration, setDuration] = useState('1-3'); // '24h', '1-3', '4+'
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null); // Initially null, will populate after analysis

  // Mock fetching animals (in real app, this comes from API)
  useEffect(() => {
    // Simulate API call
    setAnimals([
      { id: '1', name: 'البقرة #442', type: 'Cow' },
      { id: '2', name: 'البقرة #105', type: 'Cow' },
      { id: '3', name: 'العجل #33', type: 'Calf' },
    ]);
  }, []);

  const toggleSymptom = (id) => {
    setSymptoms(symptoms.map(s => 
      s.id === id ? { ...s, checked: !s.checked } : s
    ));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      // Simulate API call to /api/diagnosis/analyze
      // const payload = {
      //   animalId: selectedAnimal,
      //   symptoms: symptoms.filter(s => s.checked).map(s => s.id),
      //   duration
      // };
      // const response = await api.post('/api/diagnosis/analyze', payload);
      
      // Using mock timeout for demonstration to match the requested design exactly
      setTimeout(() => {
        setResult({
          primaryMatch: 'مرض الجهاز التنفسي البقري (BRD)',
          confidence: 89,
          alternative: {
            name: 'مانهيميا هيموليتيكا',
            confidence: 12,
            reason: 'بناءً على ارتفاع الحرارة'
          },
          severity: {
            infectionRisk: 'حرج',
            index: '78',
            maxIndex: '100'
          },
          actions: [
            {
              title: 'عزل الحيوان فوراً',
              desc: 'انقل البقرة #442 إلى قطاع الحجر الصحي (البوابة الجنوبية) لمنع انتشار المرض في القطيع.',
              icon: 'shield',
              color: 'text-green-700',
              bg: 'bg-green-100',
              circleBg: 'bg-[#154b23]',
              circleText: 'text-white'
            },
            {
              title: 'إعطاء المضادات الحيوية',
              desc: 'العلاج المعتمد: جرعة طوالتروميسين بناءً على الوزن (تقريباً 25 مل).',
              icon: 'pill',
              color: 'text-blue-700',
              bg: 'bg-blue-50',
              circleBg: 'bg-[#1E88E5]',
              circleText: 'text-white'
            }
          ],
          herdAnalysis: {
            risk: 12,
            target: 'للحظيرة رقم 3'
          }
        });
        setIsAnalyzing(false);
      }, 2500);
    } catch (error) {
      console.error("Diagnosis error:", error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-cairo" dir="rtl">
      {/* Top Navbar Placeholder spacing - assuming layout wrapper exists, but providing header just in case */}
      <div className="bg-white h-20 border-b border-gray-100 flex items-center px-8">
        <h1 className="text-xl font-bold text-[#2E7D32]">نظام رعاية الماشية AI</h1>
      </div>

      <main className="max-w-[1400px] w-full mx-auto px-8 py-8 flex-1 flex flex-col">
        {/* Page Header */}
        <div className="mb-8 text-right">
          <h1 className="text-[28px] font-bold text-gray-900 leading-tight">محرك تحليل التشخيص</h1>
          <p className="text-[14px] text-gray-500 font-medium mt-2">
            إجراء تقييمات سريرية متقدمة مدعومة بالذكاء الاصطناعي لعلامات صحة الماشية.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Input Form (Right Side in RTL, taking 5 columns) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-6">
              
              <div className="flex justify-between items-center mb-6">
                <span className="bg-[#eaf5eb] text-[#2E7D32] text-xs font-bold px-3 py-1 rounded-full">حالة جديدة</span>
                <h3 className="text-lg font-bold text-gray-900">اختيار الأعراض</h3>
              </div>

              {/* Animal Selection */}
              <div className="mb-6 text-right">
                <label className="block text-sm font-medium text-gray-700 mb-2">الحيوان المعني</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-white border border-gray-300 rounded-xl py-3 px-4 pr-4 pl-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-colors cursor-pointer"
                    value={selectedAnimal}
                    onChange={(e) => setSelectedAnimal(e.target.value)}
                  >
                    <option value="" disabled>اختر من القطيع...</option>
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="h-px w-full bg-gray-100 my-6"></div>

              {/* Symptoms Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3 text-right">الأعراض الظاهرة</label>
                <div className="grid grid-cols-2 gap-3">
                  {symptoms.map(symptom => (
                    <div 
                      key={symptom.id}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        symptom.checked 
                          ? 'border-[#2E7D32] bg-white' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        symptom.checked ? 'bg-[#2E7D32] border-[#2E7D32]' : 'border-gray-300'
                      }`}>
                        {symptom.checked && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className={`text-sm font-bold ${symptom.checked ? 'text-gray-900' : 'text-gray-600'}`}>
                        {symptom.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3 text-right">مدة الأعراض</label>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setDuration('24h')}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                      duration === '24h' ? 'bg-[#A5D6A7] border-[#A5D6A7] text-[#1e4520]' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    أقل من 24 س
                  </button>
                  <button 
                    onClick={() => setDuration('1-3')}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                      duration === '1-3' ? 'bg-[#A5D6A7] border-[#A5D6A7] text-[#1e4520]' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    1-3 أيام
                  </button>
                  <button 
                    onClick={() => setDuration('4+')}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                      duration === '4+' ? 'bg-[#A5D6A7] border-[#A5D6A7] text-[#1e4520]' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    4+ أيام
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-[#1e5822] disabled:bg-[#2E7D32]/70 text-white py-4 rounded-xl font-bold transition-colors shadow-sm"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                {isAnalyzing ? 'جاري التحليل...' : 'بدء التشخيص بالذكاء الاصطناعي'}
              </button>

            </div>
          </div>

          {/* Results Area (Left Side in RTL, taking 7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* If not analyzed, show a placeholder. If analyzing, show loading state. If result, show result. */}
            {!result && !isAnalyzing && (
              <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-12 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                <ShieldAlert className="w-16 h-16 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">في انتظار إدخال البيانات</h3>
                <p className="text-gray-400 text-sm max-w-sm">قم بتحديد الحيوان والأعراض الظاهرة، ثم اضغط على زر بدء التشخيص للحصول على التقييم السريري.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-12 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                <Loader2 className="w-12 h-12 text-[#2E7D32] animate-spin mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">جاري المعالجة...</h3>
                <p className="text-gray-500 text-sm">يقوم محرك الذكاء الاصطناعي بتحليل الأعراض لتحديد الأمراض المحتملة.</p>
              </div>
            )}

            {result && !isAnalyzing && (
              <>
                {/* Result Card */}
                <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-8 relative overflow-hidden">
                  
                  {/* Top Header section inside Card */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2 text-red-700 font-bold text-lg mb-1 relative">
                        {/* Background subtle cross icon (simulated via absolute positioning if needed, or just normal icon) */}
                        <span className="relative z-10">تنبيه عالي</span>
                      </div>
                      <div className="h-1 w-16 bg-red-700 rounded-full"></div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 text-right">نتيجة التشخيص</h2>
                  </div>

                  {/* Primary & Alternative Matches */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-start">
                    
                    {/* Severity Metrics (Left in RTL, so second column visually, but let's follow the image layout strictly) */}
                    <div className="order-2 md:order-1 flex flex-col gap-4">
                      <div className="text-right">
                        <span className="text-xs text-gray-500 font-bold">مقاييس الخطورة</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white shadow-sm">
                          <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
                          <span className="text-xs text-gray-500 mb-1">خطر العدوى</span>
                          <span className="font-bold text-gray-900 text-sm">حرج</span>
                        </div>
                        <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white shadow-sm">
                          <BarChart3 className="w-6 h-6 text-[#1E88E5] mb-2" />
                          <span className="text-xs text-gray-500 mb-1">مؤشر الشدة</span>
                          <span className="font-bold text-gray-900 text-sm">{result.severity.index}/{result.severity.maxIndex}</span>
                        </div>
                      </div>
                    </div>

                    {/* Matches (Right in RTL, so first column visually) */}
                    <div className="order-1 md:order-2 flex flex-col gap-4">
                      <div className="text-right">
                        <span className="text-xs text-gray-500 font-bold">التطابق الأساسي</span>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
                        <h3 className="font-bold text-red-700 text-lg mb-3 leading-tight">{result.primaryMatch}</h3>
                        <div className="flex items-center justify-center gap-1.5 text-red-600 text-xs font-bold">
                          <Target className="w-4 h-4" />
                          {result.confidence}% درجة ثقة الذكاء الاصطناعي
                        </div>
                      </div>

                      <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 text-center mt-2">
                        <h4 className="font-bold text-gray-800 text-sm mb-1">بديل: {result.alternative.name}</h4>
                        <p className="text-xs text-gray-600">تطابق بنسبة {result.alternative.confidence}% {result.alternative.reason}</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-gray-100 mb-6"></div>

                  {/* Recommended Actions */}
                  <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-4 text-right">الإجراءات الموصى بها</h3>
                    <div className="space-y-3">
                      {result.actions.map((action, idx) => (
                        <div key={idx} className={`${action.bg} rounded-xl p-4 flex items-start gap-4 border border-black/5`}>
                          <div className="flex-1 text-right">
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{action.title}</h4>
                            <p className="text-xs text-gray-700 leading-relaxed">{action.desc}</p>
                          </div>
                          <div className={`w-10 h-10 rounded-full ${action.circleBg} ${action.circleText} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            {action.icon === 'shield' && <ShieldAlert className="w-5 h-5" />}
                            {action.icon === 'pill' && <Pill className="w-5 h-5" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 flex-row-reverse">
                    <button className="flex-1 bg-[#1E88E5] hover:bg-[#1565C0] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                      <FileText className="w-5 h-5" />
                      إنشاء تقرير مفصل
                    </button>
                    <button className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-3.5 rounded-xl font-bold flex items-center justify-center transition-colors">
                      الاتصال بالطبيب البيطري
                    </button>
                  </div>

                </div>

                {/* Predictive Herd Analysis Card */}
                <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Network className="w-6 h-6 text-[#2E7D32]" />
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-gray-900 text-lg">تحليل القطيع التنبؤي</h3>
                      <p className="text-xs text-gray-500">نمذجة الذكاء الاصطناعي للانتشار المحتمل خلال الـ 48 ساعة القادمة.</p>
                    </div>
                  </div>
                  
                  <div className="relative w-full h-[200px] rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center">
                    {/* Simulated Radar Image */}
                    <img 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop" 
                      alt="Radar map" 
                      className="w-full h-full object-cover opacity-60"
                    />
                    
                    {/* Center highlight / heatmap simulation */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/40 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-5 py-2 rounded-full shadow-lg font-bold text-gray-900 text-sm whitespace-nowrap">
                      خطر تعرض يقدر بـ {result.herdAnalysis.risk}% {result.herdAnalysis.target}
                    </div>
                  </div>
                </div>

              </>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-5 bg-white border-t border-gray-200 flex items-center justify-between text-[12px] font-semibold text-gray-500 mt-auto">
        <div className="flex items-center gap-6">
          <button className="hover:text-gray-800 transition-colors">دعم تواصل</button>
          <button className="hover:text-gray-800 transition-colors">توثيق API</button>
          <button className="hover:text-gray-800 transition-colors">شروط الخدمة</button>
          <button className="hover:text-gray-800 transition-colors">سياسة الخصوصية</button>
        </div>
        <div className="flex flex-col items-end gap-0.5 text-right">
          <span className="text-gray-900 font-bold">LivestockCare AI</span>
          <span>© 2024 LivestockCare AI، ذكاء بيطري لزراعة مستدامة.</span>
        </div>
      </footer>
    </div>
  );
};

export default DiagnosisPage;
