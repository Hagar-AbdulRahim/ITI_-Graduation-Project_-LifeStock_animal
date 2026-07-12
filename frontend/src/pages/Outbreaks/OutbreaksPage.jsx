import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, X, MapPin, Syringe, ShieldCheck, Stethoscope,
  ArrowRight, ChevronLeft, Activity, Users, Search, Pill, Shield,
  Filter, TrendingUp, Building2
} from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import api from '../../services/api';



const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

const formatDateShort = (d) =>
  d ? new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }) : '';

// ─────────────────────────────────────────────────────────────────────────────
// موديل التفاصيل — مشترك بين النسختين
// ─────────────────────────────────────────────────────────────────────────────
const OutbreakDetailModal = ({ outbreak, onClose }) => (
  <div
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[88vh] overflow-y-auto"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-l from-[#1b4d2c] to-[#2d5a1b] p-5 flex items-center justify-between rounded-t-3xl">
        <div>
          <h2 className="text-lg font-black text-white">{outbreak.disease_name}</h2>
          <p className="text-white/70 text-xs mt-0.5 font-medium">{formatDate(outbreak.detected_at)}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="bg-red-50 text-red-600 text-xs font-black px-3 py-1.5 rounded-full border border-red-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            نشطة
          </span>
          <span className="bg-[#f0f8f2] text-[#1b4d2c] text-xs font-black px-3 py-1.5 rounded-full border border-[#2a5c2a]/20 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {outbreak.governorate}
          </span>
          <span className="bg-stone-50 text-stone-700 text-xs font-bold px-3 py-1.5 rounded-full border border-stone-200 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {outbreak.cases_count} حالة مسجّلة
          </span>
        </div>

        {/* AI Warning */}
        {outbreak.ai_warning_message && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 font-bold leading-relaxed flex gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>{outbreak.ai_warning_message}</p>
          </div>
        )}

        {/* Symptoms */}
        {outbreak.symptoms?.length > 0 && (
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
            <h4 className="text-sm font-black text-stone-800 flex items-center gap-2 mb-3">
              <Stethoscope className="w-4 h-4 text-[#2A5C2A]" />
              الأعراض
            </h4>
            <ul className="space-y-1.5">
              {outbreak.symptoms.map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-stone-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A5C2A] flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Treatment */}
        {outbreak.treatment && (
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <h4 className="text-sm font-black text-blue-800 mb-2 flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-500" />
              العلاج
            </h4>
            <p className="text-sm text-blue-700 font-bold leading-relaxed">{outbreak.treatment}</p>
          </div>
        )}

        {/* Prevention */}
        {outbreak.prevention && (
          <div className="bg-[#f0f8f2] rounded-2xl p-4 border border-[#2a5c2a]/15">
            <h4 className="text-sm font-black text-[#1b4d2c] mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#2A5C2A]" />
              الوقاية
            </h4>
            <p className="text-sm text-[#2a5c2a] font-bold leading-relaxed">{outbreak.prevention}</p>
          </div>
        )}

        {/* Vaccines */}
        {outbreak.available_vaccines?.length > 0 && (
          <div>
            <h4 className="text-sm font-black text-stone-800 flex items-center gap-2 mb-3">
              <Syringe className="w-4 h-4 text-[#2A5C2A]" />
              اللقاحات المتاحة
            </h4>
            <div className="flex flex-wrap gap-2">
              {outbreak.available_vaccines.map((v, i) => (
                <span key={i} className="bg-[#f4f8ef] text-[#1b4d2c] text-xs font-bold px-3 py-1.5 rounded-full border border-[#2d5a1b]/20">
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const OutbreaksPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [outbreaks, setOutbreaks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/api/outbreaks?limit=100')
      .then(res => setOutbreaks(res.data?.data || []))
      .catch(() => setError('حصل خطأ أثناء تحميل بيانات الفاشيات'))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredOutbreaks = useMemo(() => {
    if (!searchQuery) return outbreaks;
    // دالة لتوحيد النصوص العربية عشان السيرش يشتغل حتى لو اتكتب (ا) بدل (أ) أو (ه) بدل (ة)
    const normalize = (str) => {
      if (!str) return '';
      return str.toString().toLowerCase()
        .replace(/[أإآا]/g, 'ا')
        .replace(/[ةه]/g, 'ه');
    };

    const query = normalize(searchQuery.trim());

    return outbreaks.filter(o =>
      normalize(o.governorate).includes(query) ||
      normalize(o.disease_name).includes(query)
    );
  }, [outbreaks, searchQuery]);


  const chartData = useMemo(() => {
    const map = new Map();
    filteredOutbreaks.forEach(o => map.set(o.governorate, (map.get(o.governorate) || 0) + o.cases_count));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredOutbreaks]);

  const totalCases = filteredOutbreaks.reduce((sum, o) => sum + (o.cases_count || 0), 0);
  const affectedGov = new Set(filteredOutbreaks.map(o => o.governorate)).size;

  return (
    <div className="min-h-screen bg-[#f1f0ea]" dir="rtl">
      {/* Hero Header */}
      <div className="bg-gradient-to-l from-[#1b4d2c] to-[#2d5a1b]">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white font-bold text-sm transition-colors mb-5 group"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            رجوع
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-black text-white">استخبارات الفاشيات</h1>
              </div>
              <p className="text-white/65 text-sm font-medium mt-1">
                متابعة الفاشيات النشطة المعتمدة على مستوى الجمهورية
              </p>
            </div>

            {!isLoading && !error && filteredOutbreaks.length > 0 && (
              <div className="flex gap-3">
                <div className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl px-5 py-3 text-center hover:-translate-y-1 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-xl cursor-default">
                  <p className="text-2xl font-black text-white">{filteredOutbreaks.length}</p>
                  <p className="text-white/70 text-xs font-bold mt-0.5">فاشية نشطة</p>
                </div>
                <div className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl px-5 py-3 text-center hover:-translate-y-1 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-xl cursor-default">
                  <p className="text-2xl font-black text-red-300">{totalCases}</p>
                  <p className="text-white/70 text-xs font-bold mt-0.5">إجمالي الحالات</p>
                </div>
                <div className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl px-5 py-3 text-center hover:-translate-y-1 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-xl cursor-default">
                  <p className="text-2xl font-black text-blue-300">{affectedGov}</p>
                  <p className="text-white/70 text-xs font-bold mt-0.5">محافظة متأثرة</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-8">
        {/* Filter */}
        <div className="mb-6 flex justify-end">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="بحث بالمرض أو المحافظة..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pr-9 pl-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-700 shadow-sm focus:outline-none focus:border-[#2a5c2a]/40 w-64 transition-all"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-[#2A5C2A]/20 border-t-[#2A5C2A] rounded-full animate-spin" />
            <p className="text-stone-500 font-bold text-sm">جاري تحميل البيانات...</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center font-bold">
            {error}
          </div>
        )}

        {/* Empty Search */}
        {!isLoading && !error && filteredOutbreaks.length === 0 && outbreaks.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#f0f8f2] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#2A5C2A]" />
            </div>
            <p className="font-black text-stone-800 text-lg">لا توجد نتائج مطابقة لبحثك</p>
          </div>
        )}

        {/* Empty Total */}
        {!isLoading && !error && outbreaks.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#f0f8f2] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-[#2A5C2A]" />
            </div>
            <p className="font-black text-stone-800 text-lg">لا توجد فاشيات نشطة مسجّلة حالياً</p>
          </div>
        )}

        {!isLoading && !error && filteredOutbreaks.length > 0 && (
          <div className="space-y-6">
            {/* Full-width Chart */}
            <div className="bg-white border border-stone-200 rounded-3xl shadow-sm p-6 lg:p-8">
              <h3 className="font-black text-stone-800 text-lg mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2A5C2A]" />
                توزيع الحالات حسب المحافظة
              </h3>
              <p className="text-xs text-stone-400 font-medium mb-8">إجمالي الحالات المسجّلة والمؤكدة في كل محافظة</p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#78716c' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e7e5e4', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f6fbf4' }}
                    />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={48}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#dc2626' : index === 1 ? '#ea580c' : '#2A5C2A'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Full Table */}
            <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-stone-100 bg-stone-50/30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f0f8f2] border border-[#2a5c2a]/10 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-[#2A5C2A]" />
                </div>
                <div>
                  <h3 className="font-black text-stone-800 text-lg flex items-center gap-2">
                    جميع الفاشيات النشطة
                    <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-100">
                      {filteredOutbreaks.length} فاشية
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 font-bold mt-1">
                    قائمة مفصلة بكل الحالات الوبائية المسجلة والمؤكدة على مستوى الجمهورية
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50/80 border-b border-stone-100 text-stone-500 font-bold text-xs">
                      <th className="py-4 px-6 text-right font-black w-1/3">المرض</th>
                      <th className="py-4 px-4 text-right font-black">المحافظة</th>
                      <th className="py-4 px-4 text-center font-black">عدد الحالات</th>
                      <th className="py-4 px-4 text-center font-black">تاريخ الرصد</th>
                      <th className="py-4 px-6 text-left font-black">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOutbreaks.map((o) => (
                      <tr key={o._id} className="border-b last:border-0 border-stone-100 hover:bg-[#f6fbf4] transition-colors group">
                        <td className="py-4 px-6 font-black text-stone-800 text-right">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            {o.disease_name}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center gap-1.5 text-stone-600 font-bold w-fit bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm group-hover:border-[#2A5C2A]/30 transition-all">
                            <MapPin className="w-4 h-4 text-[#2A5C2A]" />
                            {o.governorate}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block bg-red-50 text-red-600 text-xs font-black px-3 py-1.5 rounded-full border border-red-100 shadow-sm">
                            {o.cases_count} حالة
                          </span>
                        </td>
                        <td className="py-4 px-4 text-stone-400 font-bold text-xs text-center">
                          {formatDateShort(o.detected_at)}
                        </td>
                        <td className="py-4 px-6 text-left">
                          <button
                            onClick={() => setSelected(o)}
                            className="inline-flex items-center gap-1.5 text-xs font-black text-[#1b4d2c] bg-[#f0f8f2] hover:bg-[#e2f1e6] hover:-translate-x-1 px-4 py-2 rounded-xl transition-all shadow-sm"
                          >
                            التفاصيل <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {selected && <OutbreakDetailModal outbreak={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

<<<<<<< HEAD

=======
>>>>>>> 9e25ee91f566664f86fd637cbf5709776d15aeda


export default OutbreaksPage;