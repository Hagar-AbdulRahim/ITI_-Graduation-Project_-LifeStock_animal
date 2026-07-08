import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Syringe, Clipboard, HelpCircle,
  CheckCircle, Loader2, Calendar, Shield, Pill, AlertTriangle,
} from 'lucide-react';
import api from '../services/api';

const VaccineAgentPage = () => {
  const navigate = useNavigate();
  const [species,          setSpecies]          = useState('cattle');
  const [ageMonths,        setAgeMonths]        = useState(6);
  const [loading,          setLoading]          = useState(false);
  const [recommendations,  setRecommendations]  = useState(null);
  const [error,            setError]            = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const res = await api.post('/api/vaccine-advisor/recommend', {
        species,
        age_months: ageMonths,
      });

      if (res.data.success) {
        setRecommendations({
          species,
          ageMonths,
          list:      res.data.data.recommendations || [],
          aiSummary: res.data.data.summary || '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء توليد التوصيات، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const speciesLabel = species === 'cattle' ? 'الأبقار' : species === 'sheep' ? 'الأغنام' : 'الماعز';

  const priorityColor = (priority) => {
    if (priority?.includes('عالية جداً')) return 'bg-red-50 text-red-700 border-red-200';
    if (priority?.includes('عالية'))      return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-cairo" dir="rtl">

      {/* Hero */}
      <div className="bg-[#1b4d2c] pt-16 pb-36 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="w-full flex justify-start mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm transition-all text-sm font-bold group border border-white/10"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              رجوع
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
            مستشار اللقاحات الذكي
          </h1>
          <p className="text-green-50/80 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed opacity-90 px-2">
            توصيات لقاحات حقيقية من قاعدة المعرفة البيطرية بواسطة الذكاء الاصطناعي.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 -mt-20 pb-16 relative z-20">
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-stone-200 overflow-hidden border border-stone-100">
          <div className="flex flex-col lg:flex-row">

            {/* Left Panel */}
            <div className="lg:w-[38%] bg-[#12361e] p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden flex flex-col gap-8">
              <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                    <Clipboard className="w-5 h-5 text-green-300" />
                  </div>
                  <h3 className="text-xl font-black text-white">مواصفات الحيوان</h3>
                </div>
                <p className="text-green-200/70 text-[14px] leading-relaxed pr-1">
                  حدد نوع وعمر الحيوان للحصول على جدول التحصينات الأمثل.
                </p>
              </div>

              {/* Species */}
              <div className="relative z-10 space-y-3">
                <label className="text-[13px] font-bold text-green-200/80 block">نوع الفصيلة</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cattle', label: '🐄 أبقار' },
                    { id: 'sheep',  label: '🐑 أغنام' },
                    { id: 'goat',   label: '🐐 ماعز'  },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setSpecies(item.id); setRecommendations(null); setError(null); }}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        species === item.id
                          ? 'border-white bg-white/20 text-white shadow-sm'
                          : 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div className="relative z-10 space-y-3">
                <label className="text-[13px] font-bold text-green-200/80 block">العمر الحالي (بالأشهر)</label>
                <input
                  type="number"
                  min="1"
                  max="240"
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(Number(e.target.value))}
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white font-bold outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all text-center"
                />
              </div>

              {/* Button */}
              <div className="relative z-10 mt-auto pt-4 border-t border-white/10">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-4 bg-white text-[#1b4d2c] hover:bg-green-50 rounded-xl text-[15px] font-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-75"
                >
                  {loading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <Sparkles className="w-5 h-5 text-amber-500" />
                  }
                  {loading ? 'جاري التحليل...' : 'استخراج التوصيات الذكية'}
                </button>
              </div>
            </div>

            {/* Right Panel */}
            <div className="lg:w-[62%] p-6 sm:p-8 md:p-10 lg:p-12 bg-white">

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-bold mb-6">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Empty state */}
              {!recommendations && !loading && !error && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 border border-stone-200">
                    <HelpCircle className="w-9 h-9 text-stone-400" />
                  </div>
                  <h3 className="text-xl font-black text-stone-900 mb-3">في انتظار إدخال البيانات</h3>
                  <p className="text-stone-500 text-[15px] max-w-sm leading-relaxed">
                    حدد نوع الحيوان وعمره في الجانب المقابل للحصول على التوصيات واللقاحات المطلوبة.
                  </p>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 border border-stone-200">
                    <Loader2 className="w-9 h-9 text-[#1b4d2c] animate-spin" />
                  </div>
                  <h3 className="text-xl font-black text-stone-900 mb-3">يحلل الذكاء الاصطناعي...</h3>
                  <p className="text-stone-500 text-[15px]">يقوم بتحليل جدول اللقاحات المناسب لحيوانك</p>
                </div>
              )}

              {/* Results */}
              {recommendations && !loading && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-stone-900 mb-1">نتائج التوصيات</h2>
                    <p className="text-stone-500 text-[15px]">
                      جدول تحصينات مخصص لـ <strong className="text-[#1b4d2c]">{speciesLabel}</strong> — عمر {ageMonths} أشهر
                    </p>
                  </div>

                  {/* AI Summary */}
                  {recommendations.aiSummary && (
                    <div className="p-5 rounded-[1.25rem] bg-[#1b4d2c] text-white relative overflow-hidden">
                      <div className="absolute left-0 top-0 opacity-10 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
                      />
                      <div className="relative z-10 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm mb-1.5">تحليل الوكيل الذكي</h4>
                          <p className="text-xs text-white/90 leading-relaxed font-medium">{recommendations.aiSummary}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vaccine Cards */}
                  <div className="space-y-3">
                    <h4 className="text-[13.5px] font-bold text-stone-700">اللقاحات المقترحة والموصى بها:</h4>
                    {recommendations.list.map((rec, index) => (
                      <div key={index} className="bg-[#f8f9fa] border border-stone-200 rounded-[1.25rem] p-5 space-y-3 hover:border-[#1b4d2c]/30 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-sm">
                              <CheckCircle className="w-4 h-4 text-[#1b4d2c]" />
                            </div>
                            <h4 className="font-extrabold text-stone-900 text-[14px] leading-snug">{rec.name}</h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${priorityColor(rec.priority)}`}>
                            {rec.priority}
                          </span>
                        </div>

                        <p className="text-[13px] text-stone-600 leading-relaxed pr-10">{rec.notes}</p>

                        <div className="flex flex-wrap items-center gap-3 pr-10 pt-1 border-t border-stone-200">
                          {rec.dose && (
                            <span className="flex items-center gap-1.5 text-[12px] font-bold text-stone-500">
                              <Pill className="w-3.5 h-3.5 text-[#1b4d2c]" />
                              الجرعة: <strong className="text-stone-800">{rec.dose}</strong>
                            </span>
                          )}
                          {rec.timing && (
                            <span className="flex items-center gap-1.5 text-[12px] font-bold text-stone-500">
                              <Calendar className="w-3.5 h-3.5 text-[#1b4d2c]" />
                              التوقيت: <strong className="text-stone-800">{rec.timing}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-[12px] text-stone-400 font-bold">
                    <Shield className="w-3.5 h-3.5 text-[#1b4d2c]" />
                    هذه التوصيات مستخرجة من قاعدة المعرفة البيطرية المصرية.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccineAgentPage;
