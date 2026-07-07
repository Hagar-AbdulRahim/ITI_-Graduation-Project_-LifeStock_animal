import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, Camera, X, Zap, AlertTriangle, ShieldAlert, Pill, FileText, 
  ChevronDown, Search, Check, Loader2, Target, History, Calendar, Activity, Info, ArrowRight
} from 'lucide-react';
import api from '../../services/api';

const ImageAnalysisPage = () => {
  const navigate = useNavigate();
  // State for form and data
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [notes, setNotes] = useState('');
  
  // State for process
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  // Fetch animals on mount
  useEffect(() => {
    // Simulated API call for animals
    setAnimals([
      { id: '1', name: 'البقرة #442', type: 'Cow' },
      { id: '2', name: 'البقرة #105', type: 'Cow' },
      { id: '3', name: 'العجل #33', type: 'Calf' },
      { id: '4', name: 'الحصان #12', type: 'Horse' },
    ]);
  }, []);

  // Fetch history when animal changes
  useEffect(() => {
    if (selectedAnimal) {
      setIsLoadingHistory(true);
      // Simulated API call for history
      setTimeout(() => {
        setHistory([
          { id: 'h1', date: '2024-10-12', result: 'التهاب الجلد العقدي', confidence: 85, severity: 'متوسط' },
          { id: 'h2', date: '2024-08-05', result: 'طبيعي', confidence: 98, severity: 'منخفض' },
        ]);
        setIsLoadingHistory(false);
      }, 1000);
    } else {
      setHistory([]);
    }
  }, [selectedAnimal]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('يرجى اختيار صورة بصيغة JPG أو PNG');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setResult(null); // Clear previous result
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setResult(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('يرجى اختيار صورة بصيغة JPG أو PNG');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate API call to /api/image-analysis/analyze
      setTimeout(() => {
        setResult({
          symptoms: ['آفات بارزة على الجلد', 'تساقط شعر موضعي', 'احمرار'],
          primaryDisease: 'الساركويد الخيلي',
          confidence: 94,
          severity: 'عالي', // منخفض، متوسط، عالي
          insight: 'تظهر الصورة بوضوح علامات لآفات جلدية بارزة تتوافق بنسبة كبيرة مع الساركويد الخيلي. يوصى بالتدخل الطبي السريع لمنع تفاقم الحالة.',
          recommendations: [
            { title: 'عزل الحيوان', desc: 'يجب عزل الحيوان لتجنب احتكاك الآفة بحيوانات أخرى.', icon: 'shield' },
            { title: 'استشارة الطبيب البيطري', desc: 'يرجى تحديد موعد لفحص نسيجي لتأكيد التشخيص.', icon: 'phone' },
            { title: 'المراقبة المستمرة', desc: 'مراقبة تطور حجم الآفة خلال الـ 48 ساعة القادمة.', icon: 'activity' }
          ]
        });
        setIsAnalyzing(false);
      }, 3000);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('حدث خطأ أثناء تحليل الصورة. يرجى المحاولة مرة أخرى.');
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'عالي': return 'text-red-700 bg-red-100 border-red-200';
      case 'متوسط': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'منخفض': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-cairo" dir="rtl">
      
      {/* Top Navbar Placeholder spacing */}
      <div className="bg-white h-20 border-b border-gray-100 flex items-center px-8 sticky top-0 z-20">
        <h1 className="text-xl font-bold text-[#2E7D32]">نظام رعاية الماشية AI</h1>
      </div>

      <main className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-8 flex-1 flex flex-col">
        
        {/* Page Header */}
        <div className="mb-8 text-right">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-600 hover:text-[#1b4d2c] font-bold text-sm transition-colors mb-4 group"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            رجوع
          </button>
          <h1 className="text-[28px] font-bold text-gray-900 leading-tight">تحليل الصور البيطرية بالذكاء الاصطناعي</h1>
          <p className="text-[14px] text-gray-500 font-medium mt-2">
            قم برفع صورة للعلامات السريرية أو الإصابات للحيوان ليقوم محرك الذكاء الاصطناعي بتحليلها وتقديم التوصيات.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Input Area (Right Side, 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Input Card */}
            <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">إعداد التحليل</h3>
              
              {/* Animal Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">ربط بحيوان (اختياري)</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pr-4 pl-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-colors cursor-pointer"
                    value={selectedAnimal}
                    onChange={(e) => setSelectedAnimal(e.target.value)}
                  >
                    <option value="">-- اختر حيوان من القطيع --</option>
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">صورة الحالة</label>
                
                {!previewUrl ? (
                  <div 
                    className="border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8 text-[#2E7D32]" />
                    </div>
                    <p className="font-bold text-gray-900 mb-1">اسحب الصورة أو اضغط للرفع</p>
                    <p className="text-xs text-gray-500 mb-4">يدعم JPG, PNG (حد أقصى 10MB)</p>
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
                        <UploadCloud className="w-4 h-4" />
                        رفع ملف
                      </button>
                      <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors md:hidden">
                        <Camera className="w-4 h-4" />
                        التقاط صورة
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-black h-[250px]">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                        className="w-8 h-8 bg-white/90 hover:bg-red-50 text-red-600 rounded-full flex items-center justify-center shadow backdrop-blur transition-colors"
                        title="إزالة الصورة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect}
                  accept="image/jpeg, image/png, image/jpg"
                />
                
                {error && (
                  <div className="mt-3 flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Optional Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية (اختياري)</label>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-colors resize-none h-24"
                  placeholder="أضف أي تفاصيل أخرى تلاحظها على الحيوان..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Action Button */}
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !selectedImage}
                className="w-full flex items-center justify-center gap-2 bg-[#1E88E5] hover:bg-[#1565C0] disabled:bg-[#1E88E5]/60 text-white py-4 rounded-xl font-bold transition-colors shadow-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحليل بواسطة الذكاء الاصطناعي...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    تحليل الصورة
                  </>
                )}
              </button>

            </div>

            {/* Analysis History Section */}
            {selectedAnimal && (
              <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-[#2E7D32]" />
                  <h3 className="text-lg font-bold text-gray-900">سجل التحليلات السابقة</h3>
                </div>
                
                {isLoadingHistory ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 text-[#2E7D32] animate-spin" />
                  </div>
                ) : history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{item.result}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{item.date}</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getSeverityColor(item.severity)}`}>
                            {item.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">لا يوجد سجل تحليلات سابق لهذا الحيوان.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Area (Left Side, 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {!result && !isAnalyzing && (
              <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-12 flex flex-col items-center justify-center text-center h-full min-h-[600px]">
                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                  <Target className="w-12 h-12 text-[#1E88E5] opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">منطقة عرض النتائج</h3>
                <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                  قم برفع صورة للحيوان المصاب واضغط على زر "تحليل الصورة". سيعرض محرك الذكاء الاصطناعي الأمراض المحتملة، نسبة الثقة، والتوصيات الطبية هنا.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-12 flex flex-col items-center justify-center text-center h-full min-h-[600px]">
                <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-gray-100 rounded-full"></div>
                  <div className="w-24 h-24 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  <Zap className="w-8 h-8 text-[#1E88E5] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">جاري فحص الصورة...</h3>
                <p className="text-gray-500 text-sm">يقوم النظام باستخراج الميزات البصرية ومقارنتها بقاعدة بيانات الأمراض البيطرية.</p>
                
                {/* Skeleton mockups */}
                <div className="w-full max-w-md mt-12 space-y-4">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2 mx-auto"></div>
                  <div className="h-20 bg-gray-100 rounded-xl animate-pulse w-full mt-6"></div>
                </div>
              </div>
            )}

            {result && !isAnalyzing && (
              <div className="space-y-6">
                
                {/* Emergency Alert Banner */}
                {result.severity === 'عالي' && (
                  <div className="bg-red-50 border-l-4 border-r-4 border-red-600 rounded-xl p-4 flex items-center gap-4 shadow-sm animate-fade-in">
                    <ShieldAlert className="w-8 h-8 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-red-800 text-lg">تنبيه عاجل: حالة حرجة</h4>
                      <p className="text-red-700 text-sm">تتطلب هذه الحالة تدخلاً بيطرياً فورياً. يرجى عزل الحيوان والاتصال بالطبيب البيطري بأسرع وقت.</p>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-6">نتائج التحليل</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Primary Diagnosis */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 mb-3">التشخيص المحتمل (التطابق الأساسي)</h3>
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                        <h4 className="text-xl font-black text-[#1E88E5] mb-4">{result.primaryDisease}</h4>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-gray-700">نسبة الثقة</span>
                            <span className="font-bold text-[#1E88E5]">{result.confidence}%</span>
                          </div>
                          <div className="w-full bg-blue-100 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-[#1E88E5] h-2.5 rounded-full" style={{ width: `${result.confidence}%` }}></div>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between text-sm">
                          <span className="font-bold text-gray-700">مؤشر الخطورة:</span>
                          <span className={`px-3 py-1 rounded-md font-bold text-xs border ${getSeverityColor(result.severity)}`}>
                            {result.severity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detected Symptoms */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 mb-3">الأعراض البصرية المكتشفة</h3>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 h-full">
                        <ul className="space-y-3">
                          {result.symptoms.map((symptom, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm font-medium text-gray-800">
                              <Check className="w-4 h-4 text-[#2E7D32]" />
                              {symptom}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights Card */}
                  <div className="mb-8">
                    <div className="bg-[#F1F8E9] border border-[#C5E1A5] rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-2 h-full bg-[#2E7D32]"></div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Info className="w-5 h-5 text-[#2E7D32]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#2E7D32] text-sm mb-1">رؤية الذكاء الاصطناعي</h4>
                          <p className="text-sm text-gray-800 leading-relaxed">{result.insight}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-4">الإجراءات الموصى بها</h3>
                    <div className="space-y-3">
                      {result.recommendations.map((rec, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-xl p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {rec.icon === 'shield' && <ShieldAlert className="w-5 h-5 text-gray-600" />}
                            {rec.icon === 'phone' && <PhoneCall className="w-5 h-5 text-gray-600" />}
                            {rec.icon === 'activity' && <Activity className="w-5 h-5 text-gray-600" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{rec.title}</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">{rec.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4 flex-row-reverse">
                    <button className="flex-1 bg-[#2E7D32] hover:bg-[#1b4e1f] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                      <FileText className="w-5 h-5" />
                      حفظ التقرير في السجل
                    </button>
                    <button className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-3.5 rounded-xl font-bold flex items-center justify-center transition-colors">
                      تحميل بصيغة PDF
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-6 bg-white border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-[12px] font-semibold text-gray-500 mt-auto gap-4">
        <div className="flex flex-wrap justify-center items-center gap-6">
          <button className="hover:text-gray-800 transition-colors">دعم تواصل</button>
          <button className="hover:text-gray-800 transition-colors">توثيق API</button>
          <button className="hover:text-gray-800 transition-colors">شروط الخدمة</button>
          <button className="hover:text-gray-800 transition-colors">سياسة الخصوصية</button>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-right">
          <span className="text-gray-900 font-bold">LivestockCare AI</span>
          <span>© 2026 LivestockCare AI، ذكاء بيطري لزراعة مستدامة.</span>
        </div>
      </footer>
    </div>
  );
};

export default ImageAnalysisPage;
