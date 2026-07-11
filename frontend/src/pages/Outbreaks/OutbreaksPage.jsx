import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, X, MapPin, Syringe, ShieldCheck, Stethoscope,
  ArrowRight, ChevronLeft, Activity, Users, Search, Pill, Shield,
  Filter, TrendingUp, Building2
} from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import api from '../../services/api';
import { AdminGovernorateDropdown } from '../../components/admin/AdminUI';

// ═══════════════════════════════════════════════════════════════════════════
// 🔀 السويتش: غيّري القيمة دي بس عشان تبدّلي بين النسختين
//    'simple'    → كروت + موديل تفاصيل (بسيطة)
//    'dashboard' → إحصائيات + رسم بياني + جدول (متقدمة)
// ═══════════════════════════════════════════════════════════════════════════
const ACTIVE_VERSION = 'dashboard'; // أو 'simple'

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

// ═══════════════════════════════════════════════════════════════════════════
// النسخة 1: Simple — كروت + موديل تفاصيل
// ═══════════════════════════════════════════════════════════════════════════
const OutbreaksSimpleVersion = () => {
  const navigate = useNavigate();
  const [outbreaks, setOutbreaks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/outbreaks?limit=50')
      .then(res => setOutbreaks(res.data?.data || []))
      .catch(() => setError('حصل خطأ أثناء تحميل الفاشيات، حاولي تاني'))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() =>
    outbreaks.filter(o =>
      !search ||
      o.disease_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.governorate?.includes(search)
    ), [outbreaks, search]);

  return (
    <div className="min-h-screen bg-[#f1f0ea]" dir="rtl">
      {/* Page Header */}
      <div className="bg-gradient-to-l from-[#1b4d2c] to-[#2d5a1b]">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white font-bold text-sm transition-colors mb-5 group"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            رجوع
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">الفاشيات المسجّلة</h1>
          </div>
          <p className="text-white/65 text-sm font-medium mt-1">
            تنبيهات الأوبئة النشطة المعتمدة من فريق المنصة، حسب المحافظات
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Search */}
        {!isLoading && !error && outbreaks.length > 0 && (
          <div className="relative mb-6">
            <Search className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحثي بالمرض أو المحافظة..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pr-11 pl-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm font-bold text-stone-700 shadow-sm focus:outline-none focus:border-[#2a5c2a]/40 transition-all"
            />
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-[#2A5C2A]/20 border-t-[#2A5C2A] rounded-full animate-spin" />
            <p className="text-stone-500 font-bold text-sm">جاري تحميل البيانات...</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center font-bold text-sm">
            {error}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && outbreaks.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#f0f8f2] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-[#2A5C2A]" />
            </div>
            <p className="font-black text-stone-800 text-lg">لا توجد فاشيات نشطة حالياً</p>
            <p className="text-sm text-stone-400 mt-2 font-medium">سيتم إعلامك فوراً عند ظهور أي تنبيه في منطقتك</p>
          </div>
        )}

        {/* Cards Grid */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filtered.map((o) => (
              <button
                key={o._id}
                onClick={() => setSelected(o)}
                className="text-right bg-white border border-stone-200 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col h-full w-full"
              >
                {/* Card Top — gradient banner */}
                <div className="bg-gradient-to-l from-[#1b4d2c]/90 to-[#2d5a1b]/80 px-5 pt-5 pb-8 relative w-full">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-red-500/20 text-red-200 text-[11px] font-black px-3 py-1 rounded-full border border-red-400/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      نشطة
                    </span>
                    <span className="text-white/50 text-[11px] font-bold">{formatDate(o.detected_at)}</span>
                  </div>
                  {/* Disease name */}
                  <h3 className="text-xl font-black text-white leading-snug group-hover:text-white/90 transition-colors">
                    {o.disease_name}
                  </h3>
                  {/* Decorative circle */}
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
                  <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-white/5" />
                </div>

                {/* Card Body */}
                <div className="px-5 pt-5 pb-4 -mt-4 relative flex-1 flex flex-col w-full">
                  {/* Location + Cases row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5 text-sm text-stone-600 font-bold">
                      <div className="w-6 h-6 rounded-lg bg-[#f0f8f2] border border-[#2a5c2a]/15 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-[#2A5C2A]" />
                      </div>
                      {o.governorate}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-red-50 border border-red-100 text-red-600 font-black text-sm px-3 py-1 rounded-full">
                        {o.cases_count}
                      </span>
                      <span className="text-xs text-stone-400 font-bold">حالة</span>
                    </div>
                  </div>

                  {/* Symptoms preview */}
                  <div className="flex-1">
                    {o.symptoms?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {o.symptoms.slice(0, 3).map((s, i) => (
                          <span key={i} className="bg-stone-50 border border-stone-200 text-stone-500 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                        {o.symptoms.length > 3 && (
                          <span className="text-[11px] text-stone-400 font-bold flex items-center">+{o.symptoms.length - 3} أعراض</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-auto w-full">
                    <span className="text-xs text-stone-400 font-bold">اضغط لعرض التفاصيل</span>
                    <div className="flex items-center gap-1 text-[#1b4d2c] font-black text-xs group-hover:gap-2 transition-all">
                      التفاصيل
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && outbreaks.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center">
            <p className="text-stone-400 font-bold">لا توجد نتائج مطابقة للبحث</p>
          </div>
        )}
      </div>

      {selected && <OutbreakDetailModal outbreak={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// النسخة 2: Dashboard — إحصائيات + رسم بياني + جدول
// ═══════════════════════════════════════════════════════════════════════════
const OutbreaksDashboardVersion = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [outbreaks, setOutbreaks] = useState([]);
  const [governorateFilter, setGovernorateFilter] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const query = governorateFilter
      ? `?limit=100&governorate=${encodeURIComponent(governorateFilter)}`
      : '?limit=100';
    api.get(`/api/outbreaks${query}`)
      .then(res => setOutbreaks(res.data?.data || []))
      .catch(() => setError('حصل خطأ أثناء تحميل بيانات الفاشيات'))
      .finally(() => setIsLoading(false));
  }, [governorateFilter]);

  const chartData = useMemo(() => {
    const map = new Map();
    outbreaks.forEach(o => map.set(o.governorate, (map.get(o.governorate) || 0) + o.cases_count));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [outbreaks]);

  const topAlerts = useMemo(() =>
    [...outbreaks].sort((a, b) => b.cases_count - a.cases_count).slice(0, 4),
    [outbreaks]);

  const totalCases = outbreaks.reduce((sum, o) => sum + (o.cases_count || 0), 0);
  const affectedGov = new Set(outbreaks.map(o => o.governorate)).size;

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

            {!isLoading && !error && outbreaks.length > 0 && (
              <div className="flex gap-3">
                <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center">
                  <p className="text-2xl font-black text-white">{outbreaks.length}</p>
                  <p className="text-white/65 text-xs font-bold mt-0.5">فاشية نشطة</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center">
                  <p className="text-2xl font-black text-red-300">{totalCases}</p>
                  <p className="text-white/65 text-xs font-bold mt-0.5">إجمالي الحالات</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center">
                  <p className="text-2xl font-black text-blue-300">{affectedGov}</p>
                  <p className="text-white/65 text-xs font-bold mt-0.5">محافظة متأثرة</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-8">
        {/* Filter */}
        <div className="mb-6 flex justify-end">
          <AdminGovernorateDropdown
            label="تصفية حسب المحافظة"
            value={governorateFilter}
            onChange={(e) => setGovernorateFilter(e.target.value)}
            allLabel="كل المحافظات"
          />
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

        {/* Empty */}
        {!isLoading && !error && outbreaks.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#f0f8f2] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-[#2A5C2A]" />
            </div>
            <p className="font-black text-stone-800 text-lg">لا توجد فاشيات نشطة مسجّلة حالياً</p>
          </div>
        )}

        {!isLoading && !error && outbreaks.length > 0 && (
          <div className="space-y-6">
            {/* Chart + Top Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chart */}
              <div className="lg:col-span-7 bg-white border border-stone-200 rounded-3xl shadow-sm p-6">
                <h3 className="font-black text-stone-800 text-base mb-1">توزيع الحالات حسب المحافظة</h3>
                <p className="text-xs text-stone-400 font-medium mb-5">مجموع الحالات المسجّلة لكل فاشية نشطة</p>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#78716c' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '12px', fontWeight: 700 }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#dc2626' : index === 1 ? '#ea580c' : '#2d5a1b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Alerts */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <h3 className="font-black text-stone-800 text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  أعلى الفاشيات خطورة
                </h3>
                {topAlerts.map((o) => (
                  <button
                    key={o._id}
                    onClick={() => setSelected(o)}
                    className="text-right bg-white border border-stone-200 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col w-full"
                  >
                    {/* Card Top — gradient banner */}
                    <div className="bg-gradient-to-l from-[#1b4d2c]/90 to-[#2d5a1b]/80 px-5 pt-4 pb-6 relative w-full">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-red-500/20 text-red-200 text-[10px] font-black px-2.5 py-1 rounded-full border border-red-400/30 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                          نشطة
                        </span>
                        <span className="text-white/50 text-[10px] font-bold">{formatDateShort(o.detected_at)}</span>
                      </div>
                      {/* Disease name */}
                      <h3 className="text-lg font-black text-white leading-snug group-hover:text-white/90 transition-colors">
                        {o.disease_name}
                      </h3>
                      {/* Decorative circle */}
                      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
                      <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-white/5" />
                    </div>

                    {/* Card Body */}
                    <div className="px-5 pt-4 pb-3 -mt-3 relative flex-1 flex flex-col w-full bg-white rounded-t-2xl">
                      {/* Location + Cases row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 font-bold">
                          <div className="w-6 h-6 rounded-lg bg-[#f0f8f2] border border-[#2a5c2a]/15 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-[#2A5C2A]" />
                          </div>
                          {o.governorate}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-red-50 border border-red-100 text-red-600 font-black text-xs px-2.5 py-0.5 rounded-full">
                            {o.cases_count}
                          </span>
                          <span className="text-[10px] text-stone-400 font-bold">حالة</span>
                        </div>
                      </div>

                      {/* Footer CTA */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-auto w-full">
                        <span className="text-[10px] text-stone-400 font-bold">عرض التفاصيل</span>
                        <div className="flex items-center gap-1 text-[#1b4d2c] font-black text-[11px] group-hover:gap-2 transition-all">
                          التفاصيل
                          <ChevronLeft className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
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
                      {outbreaks.length} فاشية
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
                      <th className="py-3.5 px-5 text-right font-black w-1/3">المرض</th>
                      <th className="py-3.5 px-4 text-right font-black">المحافظة</th>
                      <th className="py-3.5 px-4 text-center font-black">عدد الحالات</th>
                      <th className="py-3.5 px-4 text-center font-black">تاريخ الرصد</th>
                      <th className="py-3.5 px-5 text-left font-black">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outbreaks.map((o) => (
                      <tr key={o._id} className="border-b last:border-0 border-stone-100 hover:bg-[#f6fbf4] transition-colors group">
                        <td className="py-4 px-5 font-black text-stone-800 text-right">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {o.disease_name}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center gap-1.5 text-stone-600 font-bold w-fit bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm group-hover:border-[#2A5C2A]/20 transition-all">
                            <MapPin className="w-3.5 h-3.5 text-[#2A5C2A]" />
                            {o.governorate}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block bg-red-50 text-red-600 text-xs font-black px-3 py-1.5 rounded-full border border-red-100">
                            {o.cases_count} حالة
                          </span>
                        </td>
                        <td className="py-4 px-4 text-stone-400 font-bold text-xs text-center">
                          {formatDateShort(o.detected_at)}
                        </td>
                        <td className="py-4 px-5 text-left">
                          <button
                            onClick={() => setSelected(o)}
                            className="inline-flex items-center gap-1 text-xs font-black text-stone-400 group-hover:text-[#1b4d2c] bg-stone-50 group-hover:bg-[#f0f8f2] px-3 py-1.5 rounded-xl transition-all"
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

// ═══════════════════════════════════════════════════════════════════════════
// التصدير — بيرجّع النسخة المفعّلة بس حسب ACTIVE_VERSION فوق
// ═══════════════════════════════════════════════════════════════════════════
const OutbreaksPage = () => {
  if (ACTIVE_VERSION === 'dashboard') return <OutbreaksDashboardVersion />;
  return <OutbreaksSimpleVersion />;
};

export default OutbreaksPage;
