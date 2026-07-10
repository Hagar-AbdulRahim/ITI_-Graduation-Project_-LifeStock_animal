import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import { EGYPTIAN_GOVERNORATES } from '../../constant/adminData';
import {
  AdminPageHeader,
  AdminPanel,
  AdminFilterBar,
  AdminSelect,
  AdminPrimaryButton,
  adminInputClass,
  adminLabelClass,
} from '../../components/admin/AdminUI';

const EMPTY_FORM = {
  disease_name: '',
  governorate: 'الكل',
  cases_count: 1,
  ai_warning_message: '',
  symptoms: '',
  treatment: '',
  prevention: '',
  available_vaccines: '',
};

// Helper: comma-separated string ↔ array
const toArr = (val) => val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];

// Tag input display
function TagList({ items }) {
  if (!items?.length) return <span className="text-stone-400 text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((t, i) => (
        <span key={i} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md text-[10px] font-medium border border-stone-200">
          {t}
        </span>
      ))}
    </div>
  );
}

export default function AdminOutbreaksPage() {
  const [outbreaks, setOutbreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchOutbreaks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getOutbreaks({
        status: status || undefined,
        governorate: governorate || undefined,
      });
      setOutbreaks(res.data.data || []);
    } catch {
      toast.error('فشل تحميل تقارير الفاشيات');
    } finally {
      setLoading(false);
    }
  }, [status, governorate]);

  useEffect(() => { fetchOutbreaks(); }, [fetchOutbreaks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminService.createOutbreak({
        ...form,
        symptoms: toArr(form.symptoms),
        available_vaccines: toArr(form.available_vaccines),
      });
      toast.success('تم إنشاء تقرير الفاشية');
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchOutbreaks();
    } catch {
      toast.error('فشل إنشاء التقرير');
    }
  };

  const handleResolve = async (id) => {
    try {
      await adminService.resolveOutbreak(id);
      toast.success('تم حل الفاشية');
      fetchOutbreaks();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveOutbreak(id);
      toast.success('تم تأكيد الفاشية ونشر التحذير للمزارعين');
      fetchOutbreaks();
    } catch {
      toast.error('فشل تأكيد الفاشية');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectOutbreak(id);
      toast.success('تم رفض وتجاهل الفاشية');
      fetchOutbreaks();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const inputCls = `${adminInputClass} hover:shadow-sm`;
  const labelCls = adminLabelClass;

  const statusConfig = {
    active:   { label: 'نشطة',          cls: 'bg-red-50 text-red-600 border-red-200',       dot: 'bg-red-400 animate-pulse' },
    resolved: { label: 'محلولة',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
    pending:  { label: 'قيد المراجعة', cls: 'bg-amber-50 text-amber-600 border-amber-200',   dot: 'bg-amber-400' },
    rejected: { label: 'مرفوضة',        cls: 'bg-stone-100 text-stone-500 border-stone-200', dot: 'bg-stone-400' },
  };

  return (
    <div dir="rtl">
      <AdminPageHeader
        title="إدارة الفاشيات"
        subtitle="مراقبة الفاشيات والأمراض المعدية وإصدار التحذيرات."
        action={
          <AdminPrimaryButton active={showForm} onClick={() => setShowForm(!showForm)}>
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {showForm ? 'إلغاء' : 'تسجيل فاشية جديدة'}
            </span>
          </AdminPrimaryButton>
        }
      />

      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_4px_28px_-4px_rgba(0,0,0,0.1)] p-6 mb-6 admin-slide-up">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-800">تفاصيل الفاشية الجديدة</h3>
              <p className="text-[11px] text-stone-400 font-medium">سيتم نشر التحذيرات للمزارعين المعنيين</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Row 1 */}
            <div className="space-y-1.5">
              <label className={labelCls}>اسم المرض *</label>
              <input
                required
                placeholder="مثال: الحمى القلاعية"
                value={form.disease_name}
                onChange={(e) => setForm({ ...form, disease_name: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>المحافظة *</label>
              <div className="relative">
                <select
                  value={form.governorate}
                  onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                  className={inputCls + ' cursor-pointer appearance-none'}
                >
                  <option value="الكل">الكل (جميع المحافظات)</option>
                  {EGYPTIAN_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Row 2 */}
            <div className="space-y-1.5">
              <label className={labelCls}>عدد الحالات المكتشفة *</label>
              <input
                type="number"
                min={1}
                value={form.cases_count}
                onChange={(e) => setForm({ ...form, cases_count: Number(e.target.value) })}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>الأعراض (افصل بفاصلة)</label>
              <input
                placeholder="مثال: ارتفاع حرارة، سيلان أنف"
                value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                className={inputCls}
              />
            </div>

            {/* Row 3 */}
            <div className="space-y-1.5">
              <label className={labelCls}>العلاج</label>
              <textarea
                rows={3}
                placeholder="طريقة العلاج الموصى بها..."
                value={form.treatment}
                onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                className={inputCls + ' resize-none'}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>طرق الوقاية</label>
              <textarea
                rows={3}
                placeholder="إجراءات الوقاية والحد من انتشار المرض..."
                value={form.prevention}
                onChange={(e) => setForm({ ...form, prevention: e.target.value })}
                className={inputCls + ' resize-none'}
              />
            </div>

            {/* Row 4 */}
            <div className="space-y-1.5">
              <label className={labelCls}>التطعيمات المتاحة (اختياري — افصل بفاصلة)</label>
              <input
                placeholder="مثال: لقاح FMD، لقاح PPR"
                value={form.available_vaccines}
                onChange={(e) => setForm({ ...form, available_vaccines: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>رسالة التحذير للمزارعين</label>
              <input
                placeholder="توجيهات سريعة توصل للمزارعين فوراً..."
                value={form.ai_warning_message}
                onChange={(e) => setForm({ ...form, ai_warning_message: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <AlertTriangle className="w-4 h-4" />
                تأكيد ونشر التحذير
              </button>
            </div>
          </form>
        </div>
      )}

      <AdminPanel>
        <AdminFilterBar>
          <AdminSelect
            label="تصفية حسب الحالة"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">الكل</option>
            <option value="pending">قيد المراجعة</option>
            <option value="active">نشطة</option>
            <option value="resolved">محلولة</option>
            <option value="rejected">مرفوضة</option>
          </AdminSelect>

          <AdminSelect
            label="تصفية حسب المحافظة"
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
          >
            <option value="">الكل (جميع المحافظات)</option>
            {EGYPTIAN_GOVERNORATES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </AdminSelect>
        </AdminFilterBar>

        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : outbreaks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl">
                ✅
              </div>
              <p className="text-stone-400 font-medium text-sm">لا توجد فاشيات مسجلة</p>
            </div>
          ) : (
            outbreaks.map((r) => {
              const sc = statusConfig[r.status] || statusConfig.rejected;
              return (
                <div
                  key={r._id}
                  className="rounded-2xl border border-stone-200/80 bg-white overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#2a5c2a]/20"
                >
                  {/* Row */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center px-5 py-4">
                    <div>
                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-wide mb-1">المرض</p>
                      <p className="font-bold text-stone-800 text-sm">{r.disease_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-wide mb-1">المحافظة</p>
                      <p className="text-stone-600 text-sm font-medium">{r.governorate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-wide mb-1">الحالات</p>
                      <p className="font-black text-red-500 text-lg">{r.cases_count}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      <span className="text-[11px] text-stone-400 font-medium">
                        {new Date(r.detected_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                    <div className="flex gap-2 justify-end flex-wrap">
                      <button
                        type="button"
                        onClick={() => setExpandedRow(expandedRow === r._id ? null : r._id)}
                        className="px-3 py-1.5 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors border border-stone-200"
                      >
                        {expandedRow === r._id ? '▲ إخفاء' : '▼ تفاصيل'}
                      </button>
                      {r.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => handleResolve(r._id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200"
                        >
                          محلولة ✓
                        </button>
                      )}
                      {r.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(r._id)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-200"
                          >
                            تأكيد ونشر
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(r._id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors border border-red-200"
                          >
                            تجاهل ✕
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedRow === r._id && (
                    <div className="border-t border-[#1b4d2c]/20 border-r-4 border-r-[#1b4d2c] bg-gradient-to-l from-[#f6fbf4] via-[#fbfdfa] to-white px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 detail-slide-down">
                      <div className="space-y-2">
                        <p className="text-[11px] font-black text-stone-400 uppercase tracking-wider">🤒 الأعراض</p>
                        <TagList items={r.symptoms} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[11px] font-black text-stone-400 uppercase tracking-wider">💉 التطعيمات المتاحة</p>
                        <TagList items={r.available_vaccines} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[11px] font-black text-stone-400 uppercase tracking-wider">💊 العلاج</p>
                        <p className="text-sm text-stone-700 leading-relaxed font-semibold">{r.treatment || '—'}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[11px] font-black text-stone-400 uppercase tracking-wider">🛡️ طرق الوقاية</p>
                        <p className="text-sm text-stone-700 leading-relaxed font-semibold">{r.prevention || '—'}</p>
                      </div>
                      {r.ai_warning_message && (
                        <div className="md:col-span-2 space-y-2">
                          <p className="text-[11px] font-black text-stone-400 uppercase tracking-wider">⚠️ رسالة التحذير</p>
                          <p className="text-sm text-red-600 leading-relaxed bg-red-50 rounded-xl px-4 py-3 border border-red-100 font-semibold">
                            {r.ai_warning_message}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </AdminPanel>
    </div>
  );
}
