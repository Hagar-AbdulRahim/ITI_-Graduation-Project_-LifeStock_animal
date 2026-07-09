import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
        <span key={i} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md text-[10px] font-medium border border-stone-200">{t}</span>
      ))}
    </div>
  );
}

export default function AdminOutbreaksPage() {
  const [outbreaks, setOutbreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchOutbreaks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getOutbreaks({ status: status || undefined });
      setOutbreaks(res.data.data || []);
    } catch {
      toast.error('فشل تحميل تقارير الفاشيات');
    } finally {
      setLoading(false);
    }
  }, [status]);

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

  const columns = [
    { key: 'disease_name', label: 'المرض', render: (r) => <span className="font-bold text-stone-800">{r.disease_name}</span> },
    { key: 'governorate', label: 'المحافظة', render: (r) => <span className="text-stone-600">{r.governorate}</span> },
    { key: 'cases_count', label: 'الحالات', render: (r) => <span className="font-bold text-red-500">{r.cases_count}</span> },
    { key: 'status', label: 'الحالة', render: (r) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${r.status === 'active' ? 'bg-red-50 text-red-600 border border-red-200/50' : 'bg-green-50 text-[#2a5c2a] border border-green-200/50'}`}>
        {r.status === 'active' ? 'نشطة' : 'محلولة'}
      </span>
    )},
    { key: 'date', label: 'التاريخ', render: (r) => <span className="text-xs text-stone-500">{new Date(r.detected_at).toLocaleDateString('ar-EG')}</span> },
    {
      key: 'details',
      label: 'تفاصيل',
      render: (r) => (
        <button
          type="button"
          onClick={() => setExpandedRow(expandedRow === r._id ? null : r._id)}
          className="px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-200 transition-colors"
        >
          {expandedRow === r._id ? 'إخفاء ▲' : 'عرض ▼'}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => r.status === 'active' && (
        <button type="button" onClick={() => handleResolve(r._id)} className="px-3 py-1 bg-green-50 text-[#2a5c2a] rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
          اعتبارها محلولة
        </button>
      ),
    },
  ];

  return (
    <div dir="rtl">
      <AdminPageHeader
        title="إدارة الفاشيات"
        subtitle="مراقبة الفاشيات والأمراض المعدية وإصدار التحذيرات."
        action={
          <AdminPrimaryButton active={showForm} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'إلغاء' : '+ تسجيل فاشية جديدة'}
          </AdminPrimaryButton>
        }
      />

      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] p-6 mb-6">
          <h3 className="text-lg font-bold text-stone-800 mb-5">تفاصيل الفاشية الجديدة</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Row 1 */}
            <div className="space-y-2">
              <label className={labelCls}>اسم المرض *</label>
              <input required placeholder="مثال: الحمى القلاعية" value={form.disease_name}
                onChange={(e) => setForm({ ...form, disease_name: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>المحافظة *</label>
              <select value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                className={inputCls + " cursor-pointer"}>
                <option value="الكل">الكل (جميع المحافظات)</option>
                {EGYPTIAN_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Row 2 */}
            <div className="space-y-2">
              <label className={labelCls}>عدد الحالات المكتشفة *</label>
              <input type="number" min={1} value={form.cases_count}
                onChange={(e) => setForm({ ...form, cases_count: Number(e.target.value) })} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>الأعراض (افصل بين كل عَرَض بفاصلة)</label>
              <input placeholder="مثال: ارتفاع حرارة، سيلان أنف، فقدان شهية"
                value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className={inputCls} />
            </div>

            {/* Row 3 */}
            <div className="space-y-2">
              <label className={labelCls}>العلاج</label>
              <textarea rows={3} placeholder="طريقة العلاج الموصى بها..."
                value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                className={inputCls + " resize-none"} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>طرق الوقاية</label>
              <textarea rows={3} placeholder="إجراءات الوقاية والحد من انتشار المرض..."
                value={form.prevention} onChange={(e) => setForm({ ...form, prevention: e.target.value })}
                className={inputCls + " resize-none"} />
            </div>

            {/* Row 4 */}
            <div className="space-y-2">
              <label className={labelCls}>التطعيمات المتاحة (افصل بفاصلة — اختياري)</label>
              <input placeholder="مثال: لقاح FMD، لقاح PPR"
                value={form.available_vaccines} onChange={(e) => setForm({ ...form, available_vaccines: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>رسالة التحذير للمزارعين</label>
              <input placeholder="توجيهات سريعة توصل للمزارعين فوراً..."
                value={form.ai_warning_message} onChange={(e) => setForm({ ...form, ai_warning_message: e.target.value })} className={inputCls} />
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
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
            <option value="pending">قيد المراجعة ⏳</option>
            <option value="active">نشطة 🔴</option>
            <option value="resolved">محلولة ✅</option>
            <option value="rejected">مرفوضة ❌</option>
          </AdminSelect>
        </AdminFilterBar>

        <div className="space-y-3">
          {loading ? (
            <div className="h-32 flex items-center justify-center text-stone-400 text-sm">جاري التحميل...</div>
          ) : outbreaks.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-sm">لا توجد فاشيات مسجلة</div>
          ) : (
            outbreaks.map((r) => (
              <div key={r._id} className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-[#2a5c2a]/20">
                {/* Row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center px-5 py-4">
                  <div>
                    <p className="text-[10px] text-stone-400 font-medium">المرض</p>
                    <p className="font-bold text-stone-800 text-sm">{r.disease_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 font-medium">المحافظة</p>
                    <p className="text-stone-600 text-sm">{r.governorate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 font-medium">الحالات</p>
                    <p className="font-bold text-red-500">{r.cases_count}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      r.status === 'active' ? 'bg-red-50 text-red-600 border border-red-200' :
                      r.status === 'resolved' ? 'bg-green-50 text-[#2a5c2a] border border-green-200' :
                      r.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                      'bg-stone-100 text-stone-500 border border-stone-200'
                    }`}>
                      {r.status === 'active' ? 'نشطة' : r.status === 'resolved' ? 'محلولة' : r.status === 'pending' ? 'قيد المراجعة' : 'مرفوضة'}
                    </span>
                    <span className="text-xs text-stone-400">{new Date(r.detected_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setExpandedRow(expandedRow === r._id ? null : r._id)}
                      className="px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-200 transition-colors"
                    >
                      {expandedRow === r._id ? '▲ إخفاء' : '▼ تفاصيل'}
                    </button>
                    {r.status === 'active' && (
                      <button type="button" onClick={() => handleResolve(r._id)} className="px-3 py-1.5 bg-green-50 text-[#2a5c2a] rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
                        محلولة ✓
                      </button>
                    )}
                    {r.status === 'pending' && (
                      <>
                        <button type="button" onClick={() => handleApprove(r._id)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
                          تأكيد ونشر التحذير
                        </button>
                        <button type="button" onClick={() => handleReject(r._id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                          تجاهل ❌
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRow === r._id && (
                  <div className="border-t border-stone-100 bg-stone-50/50 px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-stone-500 uppercase tracking-wide">🤒 الأعراض</p>
                      <TagList items={r.symptoms} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-stone-500 uppercase tracking-wide">💉 التطعيمات المتاحة</p>
                      <TagList items={r.available_vaccines} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-stone-500 uppercase tracking-wide">💊 العلاج</p>
                      <p className="text-sm text-stone-700 leading-relaxed">{r.treatment || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-stone-500 uppercase tracking-wide">🛡️ طرق الوقاية</p>
                      <p className="text-sm text-stone-700 leading-relaxed">{r.prevention || '—'}</p>
                    </div>
                    {r.ai_warning_message && (
                      <div className="md:col-span-2 space-y-1">
                        <p className="text-xs font-black text-stone-500 uppercase tracking-wide">⚠️ رسالة التحذير</p>
                        <p className="text-sm text-red-600 leading-relaxed bg-red-50 rounded-xl px-4 py-3 border border-red-100">{r.ai_warning_message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </AdminPanel>
    </div>
  );
}
