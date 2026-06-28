import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Syringe, Clipboard, HelpCircle, 
  CheckCircle, ArrowLeft, Loader2 
} from 'lucide-react';

const VaccineAgentPage = () => {
  const navigate = useNavigate();
  const [species, setSpecies] = useState('cattle');
  const [ageMonths, setAgeMonths] = useState(6);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      // Logic mapping based on real Egyptian veterinary calendar guidelines
      let list = [];
      if (species === 'cattle') {
        list = [
          {
            name: 'لقاح الحمى القلاعية والوادي المتصدع (FMD & RVF)',
            timing: 'كل 6 أشهر',
            priority: 'عالية جداً (إجباري)',
            notes: 'أهم تحصين للأبقار والجاموس في مصر للوقاية من تفشي الأوبئة الموسمية.',
            dose: '2 مل تحت الجلد'
          },
          {
            name: 'لقاح الجلد العقدي (Lumpy Skin Disease)',
            timing: 'سنوياً (قبل الصيف)',
            priority: 'عالية',
            notes: 'تحصين وقائي رئيسي ضد مرض الجلد العقدي الفيروسي الذي ينقله الناموس والحشرات.',
            dose: '1 مل في الجلد'
          },
          {
            name: 'لقاح التسمم الدموي البكتيري (Haemorrhagic Septicaemia)',
            timing: 'كل 6 أشهر',
            priority: 'متوسطة',
            notes: 'يُعطى في فترات تغيير الفصول للوقاية من الموت المفاجئ الناتج عن البكتيريا.',
            dose: '2 مل تحت الجلد'
          }
        ];
      } else if (species === 'sheep') {
        list = [
          {
            name: 'لقاح طاعون المجترات الصغيرة (PPR)',
            timing: 'سنوياً',
            priority: 'عالية جداً',
            notes: 'يحمي الأغنام والماعز من النزلة المعوية والجهاز التنفسي الحاد.',
            dose: '1 مل تحت الجلد'
          },
          {
            name: 'لقاح الجدري المائي للأغنام (Sheep Pox)',
            timing: 'سنوياً',
            priority: 'عالية',
            notes: 'يوصى بتحصين القطعان خاصة في بداية فترات الشتاء والبرد.',
            dose: '0.5 مل في أدمة الجلد'
          },
          {
            name: 'لقاح التسمم المعوي / الكلوة الرخوة (Enterotoxaemia)',
            timing: 'كل 6 أشهر',
            priority: 'عالية',
            notes: 'أهمية قصوى عند تغيير العليقة وتغذية الحيوان على الحبوب المركزة.',
            dose: '2 مل تحت الجلد'
          }
        ];
      } else { // goat
        list = [
          {
            name: 'لقاح طاعون المجترات الصغيرة (PPR)',
            timing: 'سنوياً',
            priority: 'عالية جداً',
            notes: 'وقاية تامة ضد فيروس طاعون المجترات الصغيرة المعدي.',
            dose: '1 مل تحت الجلد'
          },
          {
            name: 'لقاح حمى الوادي المتصدع (RVF)',
            timing: 'كل 6 أشهر',
            priority: 'عالية',
            notes: 'تحصين وقائي لتجنب حالات الإجهاض المرتفعة في الماعز العشار.',
            dose: '1 مل تحت الجلد'
          },
          {
            name: 'لقاح التسمم المعوي الرباعي',
            timing: 'كل 6 أشهر',
            priority: 'متوسطة',
            notes: 'للوقاية من التسمم البكتيري المعوي الناجم عن الكلوستريديا.',
            dose: '2 مل تحت الجلد'
          }
        ];
      }

      setRecommendations({
        species,
        ageMonths,
        list,
        aiSummary: `بناءً على المعايير المدخلة للنوع (${species === 'cattle' ? 'الأبقار' : species === 'sheep' ? 'الأغنام' : 'الماعز'}) وعمر ${ageMonths} أشهر، يوصي المساعد الذكي بالتركيز على تحصينات الشتاء ومكافحة الحشرات لضمان المناعة القصوى للقطيع.`
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f5] font-cairo" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-gray-900">مستشار اللقاحات الذكي (Vaccine Agent)</h1>
              <p className="text-[11px] text-gray-400 font-medium">اقتراحات وجداول اللقاحات المخصصة بواسطة الذكاء الاصطناعي</p>
            </div>
          </div>
          <span className="text-[12px] text-green-700 font-medium bg-green-50 border border-green-100 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            مساعد اللقاحات
          </span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Inputs (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Clipboard className="w-5 h-5 text-[#2a5c2a]" />
              <h2 className="font-bold text-gray-900 text-sm">تحديد مواصفات الحيوان</h2>
            </div>

            {/* Species Selector */}
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-2">نوع الفصيلة</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cattle', label: '🐄 أبقار' },
                  { id: 'sheep', label: '🐑 أغنام' },
                  { id: 'goat', label: '🐐 ماعز' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSpecies(item.id)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      species === item.id 
                        ? 'border-[#2a5c2a] bg-[#2a5c2a]/5 text-[#2a5c2a]' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Input */}
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-2">العمر الحالي (بالأشهر)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={ageMonths}
                onChange={(e) => setAgeMonths(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2a5c2a]/20 focus:border-[#2a5c2a] transition-all text-center font-bold"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 bg-[#2a5c2a] text-white hover:bg-[#1e4520] rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-75"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-yellow-400" />
              )}
              استخراج التوصيات الذكية
            </button>
          </div>

          {/* Right Output (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {!recommendations && !loading ? (
              <div className="bg-white rounded-[24px] border border-gray-200 p-12 text-center text-gray-400 h-full flex flex-col items-center justify-center">
                <HelpCircle className="w-12 h-12 text-gray-300 mb-3" />
                <h3 className="font-bold text-gray-700 text-sm">في انتظار إدخال البيانات</h3>
                <p className="text-xs text-gray-400 mt-1">حدد نوع الحيوان وعمره في الجانب المقابل للحصول على التوصيات واللقاحات المطلوبة.</p>
              </div>
            ) : loading ? (
              <div className="bg-white rounded-[24px] border border-gray-200 p-12 text-center text-gray-400 h-full flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#2a5c2a] animate-spin mb-3" />
                <h3 className="font-bold text-gray-700 text-sm">يقوم الوكيل (Agent) بتحليل جدول اللقاحات...</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {/* AI Summary */}
                <div className="bg-gradient-to-br from-[#2a5c2a] to-[#3d6b47] rounded-[24px] p-6 text-white shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 opacity-10">
                    <Sparkles className="w-32 h-32 text-white" />
                  </div>
                  <h3 className="font-extrabold text-base mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    تحليل الوكيل الذكي
                  </h3>
                  <p className="text-xs text-white/95 leading-relaxed font-medium">
                    {recommendations.aiSummary}
                  </p>
                </div>

                {/* Recommendations list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 mr-1">اللقاحات المقترحة والموصى بها:</h4>
                  {recommendations.list.map((rec, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <h4 className="font-extrabold text-gray-900 text-sm">{rec.name}</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {rec.timing}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{rec.notes}</p>
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 pt-1">
                        <span>الجرعة الموصى بها: <strong className="text-gray-800">{rec.dose}</strong></span>
                        <span>أولوية التطعيم: <strong className="text-green-700">{rec.priority}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VaccineAgentPage;
