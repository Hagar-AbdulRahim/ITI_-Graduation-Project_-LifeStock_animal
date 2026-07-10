import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, X, MapPin, Syringe, ShieldCheck, Stethoscope, ArrowRight,
  Filter, ChevronLeft,
} from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════════════
// 🔀 السويتش: غيّري القيمة دي بس عشان تبدّلي بين النسختين
//    'simple'    → كروت + موديل تفاصيل (بسيطة)
//    'dashboard' → إحصائيات + رسم بياني + جدول (متقدمة)
// لما تستقري على واحدة، امسحي الكومبوننت التاني بالكامل من الملف ده
// وسيبي بس السطر ده بيرجّع الكومبوننت اللي استقريتي عليه.
// ═══════════════════════════════════════════════════════════════════════════
const ACTIVE_VERSION = 'simple'; // أو 'dashboard'

// ─────────────────────────────────────────────────────────────────────────
// موديل التفاصيل — مشترك بين النسختين
// ─────────────────────────────────────────────────────────────────────────
const OutbreakDetailModal = ({ outbreak, onClose, formatDate }) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div
      className="bg-white rounded-[24px] shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between rounded-t-[24px]">
        <h2 className="text-lg font-black text-gray-900">{outbreak.disease_name}</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-5 space-y-5">
        <div className="flex flex-wrap gap-2">
          <span className="bg-red-50 text-red-600 text-xs font-black px-3 py-1.5 rounded-full border border-red-100 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {outbreak.governorate}
          </span>
          <span className="bg-gray-50 text-gray-700 text-xs font-black px-3 py-1.5 rounded-full border border-gray-200">
            {outbreak.cases_count} حالة
          </span>
          <span className="bg-gray-50 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200">
            {formatDate(outbreak.detected_at)}
          </span>
        </div>
        {outbreak.ai_warning_message && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-800 font-bold leading-relaxed">
            {outbreak.ai_warning_message}
          </div>
        )}
        {outbreak.symptoms?.length > 0 && (
          <div>
            <h4 className="text-sm font-black text-gray-900 flex items-center gap-2 mb-2">
              <Stethoscope className="w-4 h-4 text-[#2A5C2A]" />
              الأعراض
            </h4>
            <ul className="list-disc list-outside pr-5 space-y-1 text-sm text-gray-600 font-bold marker:text-[#2A5C2A]">
              {outbreak.symptoms.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
        {outbreak.treatment && (
          <div>
            <h4 className="text-sm font-black text-gray-900 mb-1">العلاج</h4>
            <p className="text-sm text-gray-600 font-bold leading-relaxed">{outbreak.treatment}</p>
          </div>
        )}
        {outbreak.prevention && (
          <div>
            <h4 className="text-sm font-black text-gray-900 mb-1">الوقاية</h4>
            <p className="text-sm text-gray-600 font-bold leading-relaxed">{outbreak.prevention}</p>
          </div>
        )}
        {outbreak.available_vaccines?.length > 0 && (
          <div>
            <h4 className="text-sm font-black text-gray-900 flex items-center gap-2 mb-2">
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

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

// ═══════════════════════════════════════════════════════════════════════════
// النسخة 1: بسيطة — كروت + موديل تفاصيل
// ═══════════════════════════════════════════════════════════════════════════
const OutbreaksSimpleVersion = () => {
  const navigate = useNavigate();
  const [outbreaks, setOutbreaks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchOutbreaks = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/api/outbreaks?limit=50');
        setOutbreaks(res.data?.data || []);
        setError(null);
      } catch (err) {
        console.error('fetchOutbreaks error:', err);
        setError('حصل خطأ أثناء تحميل الفاشيات، حاولي تاني');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOutbreaks();
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F0EA] font-cairo" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-600 hover:text-[#1b4d2c] font-bold text-sm transition-colors mb-4 group"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          رجوع
        </button>
        <div className="mb-8">
          <h1 className="text-2xl md:text-[28px] font-black text-gray-900">الفاشيات المسجلة</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">
            تنبيهات الأوبئة النشطة المعتمدة من فريق المنصة، حسب المحافظات.
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-200 border-t-[#2A5C2A] rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-6 text-center font-bold text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && outbreaks.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <ShieldCheck className="w-10 h-10 text-[#2A5C2A] mx-auto mb-3" />
            <p className="font-black text-gray-800">مفيش فاشيات نشطة حاليًا</p>
            <p className="text-sm text-gray-500 mt-1">هنعلمك فورًا لو ظهر أي تنبيه في محافظتك.</p>
          </div>
        )}

        {!isLoading && !error && outbreaks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {outbreaks.map((o) => (
              <button
                key={o._id}
                onClick={() => setSelected(o)}
                className="text-right bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#2A5C2A]/30 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500" />
                <div className="pr-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-red-50 text-red-600 text-[11px] font-black px-2.5 py-1 rounded-full border border-red-100 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      نشطة
                    </span>
                    <span className="text-[11px] text-gray-400 font-bold">{formatDate(o.detected_at)}</span>
                  </div>
                  <h3 className="text-base font-black text-gray-900 mb-1">{o.disease_name}</h3>
                  <p className="text-xs text-gray-500 font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {o.governorate} · {o.cases_count} حالة مسجّلة
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && <OutbreakDetailModal outbreak={selected} onClose={() => setSelected(null)} formatDate={formatDate} />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// النسخة 2: داشبورد — إحصائيات + رسم بياني + جدول
// ═══════════════════════════════════════════════════════════════════════════
const OutbreaksDashboardVersion = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [outbreaks, setOutbreaks] = useState([]);
  const [governorateFilter, setGovernorateFilter] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchOutbreaks = async () => {
      try {
        setIsLoading(true);
        const query = governorateFilter ? `?limit=100&governorate=${encodeURIComponent(governorateFilter)}` : '?limit=100';
        const res = await api.get(`/api/outbreaks${query}`);
        setOutbreaks(res.data?.data || []);
        setError(null);
      } catch (err) {
        console.error('fetchOutbreaks error:', err);
        setError('حصل خطأ أثناء تحميل بيانات الفاشيات');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOutbreaks();
  }, [governorateFilter]);

  const governorateBars = useMemo(() => {
    const map = new Map();
    outbreaks.forEach((o) => {
      map.set(o.governorate, (map.get(o.governorate) || 0) + o.cases_count);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [outbreaks]);

  const topAlerts = useMemo(
    () => [...outbreaks].sort((a, b) => b.cases_count - a.cases_count).slice(0, 4),
    [outbreaks]
  );

  const totalCases = outbreaks.reduce((sum, o) => sum + (o.cases_count || 0), 0);
  const affectedGovernorates = new Set(outbreaks.map((o) => o.governorate)).size;

  const formatDateShort = (d) =>
    d ? new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-cairo flex flex-col" dir="rtl">
      <main className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-8 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="text-right">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-stone-600 hover:text-[#1b4d2c] font-bold text-sm transition-colors mb-4 group"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              رجوع
            </button>
            <h1 className="text-[28px] font-black text-gray-900 leading-tight">استخبارات الفاشيات</h1>
            <p className="text-[14px] text-gray-500 font-bold mt-1">
              متابعة الفاشيات النشطة المعتمدة على مستوى الجمهورية.
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="فلترة بمحافظة..."
                value={governorateFilter}
                onChange={(e) => setGovernorateFilter(e.target.value)}
                className="pr-9 pl-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm focus:outline-none focus:border-[#154b23]/40 w-48"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-6 text-center font-bold text-sm">
            {error}
          </div>
        ) : outbreaks.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <ShieldCheck className="w-10 h-10 text-[#2A5C2A] mx-auto mb-3" />
            <p className="font-black text-gray-800">مفيش فاشيات نشطة مسجّلة حاليًا</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12 grid grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-5 text-center">
                <h4 className="text-2xl font-black text-gray-900 mb-1">{outbreaks.length}</h4>
                <p className="text-[11px] text-gray-500 font-bold">فاشية نشطة</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-5 text-center">
                <h4 className="text-2xl font-black text-red-600 mb-1">{totalCases}</h4>
                <p className="text-[11px] text-gray-500 font-bold">إجمالي الحالات المسجّلة</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-5 text-center">
                <h4 className="text-2xl font-black text-[#1E88E5] mb-1">{affectedGovernorates}</h4>
                <p className="text-[11px] text-gray-500 font-bold">محافظة متأثرة</p>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-[20px] shadow-sm p-6">
              <h3 className="font-black text-gray-900 text-lg mb-1">توزيع الحالات حسب المحافظة</h3>
              <p className="text-[11px] text-gray-500 font-bold mb-6">مجموع cases_count لكل فاشية نشطة</p>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={governorateBars} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={35}>
                      {governorateBars.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#dc2626' : '#e2e8f0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              {topAlerts.map((o) => (
                <button
                  key={o._id}
                  onClick={() => setSelected(o)}
                  className="text-right bg-white border border-gray-200 rounded-[20px] shadow-sm p-5 relative overflow-hidden flex justify-between hover:shadow-md transition-shadow"
                >
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-red-600" />
                  <div className="flex-1 pr-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-gray-400 font-bold">{formatDateShort(o.detected_at)}</span>
                      <span className="bg-red-50 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-red-100 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        نشطة
                      </span>
                    </div>
                    <h3 className="text-base font-black text-gray-900 mb-2">{o.disease_name}</h3>
                    <p className="text-xs text-gray-600 font-bold leading-relaxed mb-3 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {o.governorate} · {o.cases_count} حالة
                    </p>
                    <span className="text-xs font-black text-gray-800 flex items-center gap-1">
                      <ChevronLeft className="w-3 h-3" />
                      عرض التفاصيل
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-12 bg-white border border-gray-200 rounded-[20px] shadow-sm p-6">
              <h3 className="font-black text-gray-900 text-lg mb-4">كل الفاشيات النشطة</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500 font-bold text-xs">
                      <th className="py-2 pr-2">المرض</th>
                      <th className="py-2">المحافظة</th>
                      <th className="py-2">عدد الحالات</th>
                      <th className="py-2">تاريخ الرصد</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {outbreaks.map((o) => (
                      <tr key={o._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 pr-2 font-black text-gray-800">{o.disease_name}</td>
                        <td className="py-3 text-gray-600 font-bold">{o.governorate}</td>
                        <td className="py-3 text-red-600 font-black">{o.cases_count}</td>
                        <td className="py-3 text-gray-500 font-bold text-xs">{formatDateShort(o.detected_at)}</td>
                        <td className="py-3">
                          <button onClick={() => setSelected(o)} className="text-xs font-black text-[#154b23] hover:underline">
                            التفاصيل
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
      </main>

      {selected && <OutbreakDetailModal outbreak={selected} onClose={() => setSelected(null)} formatDate={formatDateShort} />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// التصدير — بيرجّع النسخة المفعّلة بس حسب ACTIVE_VERSION فوق
// ═══════════════════════════════════════════════════════════════════════════
const OutbreaksPage = () => {
  if (ACTIVE_VERSION === 'dashboard') return <OutbreaksDashboardVersion />;
  return <OutbreaksSimpleVersion />;
};

export default OutbreaksPage;
