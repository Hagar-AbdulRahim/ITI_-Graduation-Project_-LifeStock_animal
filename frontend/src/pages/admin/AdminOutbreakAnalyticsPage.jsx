import { useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import adminService from '../../services/adminService';
import { EGYPTIAN_GOVERNORATES } from '../../constant/adminData';
import toast from 'react-hot-toast';

const PERIOD_OPTIONS = [
  { label: 'آخر 7 أيام', value: 7 },
  { label: 'آخر 14 يوم', value: 14 },
  { label: 'آخر 30 يوم', value: 30 },
];

function SymptomBar({ symptom, count, maxCount }) {
  const pct = Math.round((count / maxCount) * 100);
  const color = pct >= 80 ? '#dc2626' : pct >= 50 ? '#f97316' : pct >= 25 ? '#f59e0b' : '#22c55e';
  return (
    <div className="flex items-center gap-3 group hover:bg-stone-50/80 px-3 py-2 rounded-xl transition-all">
      <div className="w-40 shrink-0 text-xs font-bold text-stone-700 truncate text-right">{symptom}</div>
      <div className="flex-1 h-5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-8 text-xs font-black shrink-0" style={{ color }}>{count}</span>
    </div>
  );
}

function CandidateCard({ candidate, onConfirm, threshold }) {
  const { diagnosis, governorate, count, percentage, threshold_reached, sources, sample_symptoms } = candidate;
  const symptoms = sample_symptoms?.[0] || [];

  const dangerClass = threshold_reached
    ? 'border-red-200 bg-red-50/60 shadow-red-100'
    : percentage >= 50
    ? 'border-amber-200 bg-amber-50/40'
    : 'border-stone-200 bg-white';

  return (
    <div className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md ${dangerClass}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {threshold_reached && (
              <span className="text-[10px] font-black px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-full animate-pulse">
                ⚠️ تجاوز الحد
              </span>
            )}
          </div>
          <h3 className="font-black text-stone-800 text-base leading-tight">{diagnosis}</h3>
          <p className="text-sm text-stone-500 mt-0.5">{governorate}</p>
        </div>
        <div className="text-center shrink-0">
          <div className={`text-3xl font-black ${threshold_reached ? 'text-red-600' : 'text-amber-600'}`}>{count}</div>
          <div className="text-[10px] text-stone-400 font-medium">حالة / {threshold} حد</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-stone-400 font-medium mb-1">
          <span>نسبة الخطورة</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${percentage}%`,
              backgroundColor: threshold_reached ? '#dc2626' : percentage >= 50 ? '#f97316' : '#f59e0b',
            }}
          />
        </div>
      </div>

      {symptoms.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {symptoms.map((s, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md font-medium border border-stone-200">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {sources.map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full font-bold">
              {s === 'health_case' ? 'حيوانات' : 'استشارات'}
            </span>
          ))}
        </div>
        {threshold_reached && (
          <button
            onClick={() => onConfirm(candidate)}
            className="text-xs px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
          >
            تأكيد كوباء
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminOutbreakAnalyticsPage() {
  const [days, setDays] = useState(7);
  const [governorate, setGovernorate] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { days, governorate: governorate || undefined };
      const [candRes, symRes] = await Promise.all([
        adminService.getOutbreakCandidates(params),
        adminService.getSymptomsStats(params),
      ]);
      setCandidates(candRes.data.data || []);
      setMeta(candRes.data.meta);
      setSymptoms(symRes.data.data || []);
    } catch {
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [days, governorate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDetect = async () => {
    setDetecting(true);
    try {
      const res = await adminService.triggerOutbreakDetection();
      const active = res.data.data?.active_outbreaks ?? 0;
      toast.success(`تم الفحص ✅ — ${active} وباء نشط حالياً`);
      fetchData();
    } catch {
      toast.error('فشل تشغيل الفحص');
    } finally {
      setDetecting(false);
    }
  };

  const handleConfirmOutbreak = async (candidate) => {
    setConfirmModal(candidate);
  };

  const doConfirmOutbreak = async () => {
    if (!confirmModal) return;
    try {
      await adminService.createOutbreak({
        disease_name: confirmModal.diagnosis,
        governorate: confirmModal.governorate,
        cases_count: confirmModal.count,
        ai_warning_message: `تحذير: تم رصد ${confirmModal.count} حالة ${confirmModal.diagnosis} في محافظة ${confirmModal.governorate}. يُرجى اتخاذ الإجراءات الاحترازية.`,
      });
      toast.success('تم تسجيل الوباء وإرسال التحذيرات للمزارعين ✅');
      setConfirmModal(null);
      fetchData();
    } catch {
      toast.error('فشل تسجيل الوباء');
    }
  };

  const maxSymptomCount = symptoms[0]?.count || 1;
  const thresholdReached = candidates.filter(c => c.threshold_reached);
  const nearThreshold = candidates.filter(c => !c.threshold_reached && c.percentage >= 50);
  const low = candidates.filter(c => c.percentage < 50);

  const chartData = symptoms.slice(0, 12).map(s => ({ name: s.symptom.slice(0, 10), count: s.count }));

  return (
    <div className="space-y-8 pb-10 relative" dir="rtl">
      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" style={{ animation: 'fadeInBackdrop 0.2s ease' }}>
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl admin-modal-enter">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4 text-3xl">⚠️</div>
              <h3 className="text-xl font-black text-stone-800 mb-2">تأكيد تسجيل وباء</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                هل تريد تسجيل <strong>{confirmModal.diagnosis}</strong> في <strong>{confirmModal.governorate}</strong> كوباء رسمي؟<br />
                سيتم إرسال إشعار تحذيري لجميع مزارعي المحافظة.
              </p>
            </div>
            <div className="bg-red-50 rounded-2xl p-4 mb-6 text-center border border-red-100">
              <div className="text-3xl font-black text-red-600">{confirmModal.count} حالة</div>
              <div className="text-xs text-red-400 font-medium mt-1">خلال آخر {days} أيام</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 border border-stone-200 rounded-xl text-stone-700 font-bold hover:bg-stone-50 transition-all duration-200"
              >
                إلغاء
              </button>
              <button
                onClick={doConfirmOutbreak}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-200 shadow-md"
              >
                تأكيد وإرسال التحذير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-l from-[#1b4d2c] via-[#1e5530] to-[#2a5c2a] rounded-2xl px-8 py-9 shadow-[0_8px_32px_-4px_rgba(27,77,44,0.40)] text-white border border-[#2a5c2a]/20">
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="px-3 py-1 bg-white/15 border border-white/20 rounded-full text-[11px] font-black uppercase tracking-widest mb-3 inline-block">
              تحليل ذكي
            </span>
            <h2 className="text-3xl font-black mb-2 drop-shadow-sm">تحليل الأوبئة الذكي</h2>
            <p className="text-green-50/80 text-sm max-w-xl leading-relaxed">
              مراقبة الأعراض والأمراض المتكررة في الوقت الفعلي. الحد الحالي:{' '}
              <strong>{meta?.threshold ?? '...'} حالة</strong> خلال{' '}
              <strong>{meta?.window_hours ?? '...'} ساعة</strong>.
            </p>
          </div>
          <button
            onClick={handleDetect}
            disabled={detecting}
            className="px-6 py-3 bg-white/15 hover:bg-white/25 border border-white/25 rounded-2xl text-white font-black text-sm transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 flex items-center gap-2 backdrop-blur-sm"
          >
            {detecting ? (
              <><span className="animate-spin text-lg">⟳</span> جاري الفحص...</>
            ) : (
              <><span>🔍</span> فحص الأوبئة الآن</>
            )}
          </button>
        </div>
        <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-white/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-8 right-16 w-36 h-36 bg-red-300/15 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'وصل الحد', value: thresholdReached.length, color: 'red', emoji: '🔴', cls: 'text-red-600 border-red-200 bg-red-50' },
          { label: 'قرب الحد (≥50%)', value: nearThreshold.length, color: 'amber', emoji: '🟡', cls: 'text-amber-600 border-amber-200 bg-amber-50' },
          { label: 'منخفض', value: low.length, color: 'green', emoji: '🟢', cls: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
          { label: 'أعراض مرصودة', value: symptoms.length, color: 'blue', emoji: '🩺', cls: 'text-blue-600 border-blue-200 bg-blue-50' },
        ].map(({ label, value, emoji, cls }) => (
          <div
            key={label}
            className={`rounded-2xl p-5 border shadow-sm text-center hover:shadow-md transition-all duration-200 ${cls}`}
          >
            <div className="text-2xl mb-2">{emoji}</div>
            <div className="text-3xl font-black leading-none mb-1">{loading ? '...' : value}</div>
            <div className="text-xs font-bold opacity-70 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm">
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                days === opt.value
                  ? 'bg-[#1b4d2c] text-white shadow-md shadow-[#1b4d2c]/20'
                  : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-[180px]">
          <select
            value={governorate}
            onChange={e => setGovernorate(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 outline-none appearance-none cursor-pointer hover:border-[#1b4d2c]/30 focus:border-[#1b4d2c] focus:ring-2 focus:ring-[#1b4d2c]/10 transition-all"
          >
            <option value="">كل المحافظات</option>
            {EGYPTIAN_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symptoms Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_30px_-4px_rgba(27,77,44,0.12)] transition-all duration-300">
          <div className="mb-5">
            <h3 className="font-black text-stone-800 text-base leading-tight">
              📊 الأعراض الأكثر تكراراً
            </h3>
            <p className="text-xs text-stone-400 font-medium mt-1">آخر {days} أيام</p>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-stone-400 text-sm">
              <div className="space-y-2 w-full">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-stone-100 rounded-xl animate-pulse" />)}
              </div>
            </div>
          ) : symptoms.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-stone-400 text-sm">
              <span className="text-3xl">📊</span>
              <span>لا توجد بيانات</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#555', fontFamily: 'Cairo' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontFamily: 'Cairo' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                  {chartData.map((entry, i) => {
                    const pct = (entry.count / maxSymptomCount) * 100;
                    const color = pct >= 80 ? '#dc2626' : pct >= 50 ? '#f97316' : pct >= 25 ? '#f59e0b' : '#22c55e';
                    return <Cell key={i} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Full Symptoms List */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_30px_-4px_rgba(27,77,44,0.12)] transition-all duration-300">
          <div className="mb-5">
            <h3 className="font-black text-stone-800 text-base leading-tight">🩺 قائمة الأعراض التفصيلية</h3>
            <p className="text-xs text-stone-400 font-medium mt-1">مرتبة حسب التكرار</p>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 bg-stone-100 rounded-xl animate-pulse" />)}
            </div>
          ) : symptoms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-stone-400 text-sm">
              <span className="text-3xl">🩺</span>
              <span>لا توجد بيانات</span>
            </div>
          ) : (
            <div className="space-y-1 max-h-[320px] overflow-y-auto admin-scrollbar">
              {symptoms.map((s, i) => (
                <SymptomBar key={i} symptom={s.symptom} count={s.count} maxCount={maxSymptomCount} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Candidates */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h3 className="font-black text-stone-800 text-base leading-tight">
              🔴 مرشحو الأوبئة
            </h3>
            <p className="text-xs text-stone-400 font-medium mt-1">
              حد الكشف: {meta?.threshold ?? '...'} حالة
            </p>
          </div>
          {thresholdReached.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-black animate-pulse">
              ⚠️ {thresholdReached.length} مرض تجاوز الحد
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-stone-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-2xl">✅</div>
            <p className="text-stone-500 font-bold">لا توجد حالات مثيرة للقلق في هذه الفترة</p>
            <p className="text-xs text-stone-400 mt-1">جرب تغيير الفترة الزمنية أو المحافظة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {candidates.map((c, i) => (
              <CandidateCard
                key={i}
                candidate={c}
                threshold={meta?.threshold}
                onConfirm={handleConfirmOutbreak}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
