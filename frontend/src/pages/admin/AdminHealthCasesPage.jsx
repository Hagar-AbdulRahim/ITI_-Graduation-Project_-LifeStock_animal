import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import { SEVERITY_LABELS } from '../../constant/adminData';

export default function AdminHealthCasesPage() {
  const [cases, setCases] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('open');

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getHealthCases({ page, limit: 15, status: status || undefined });
      setCases(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('فشل تحميل الحالات');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  const handleResolve = async (id) => {
    try {
      await adminService.updateHealthCase(id, { resolved: true });
      toast.success('تم إغلاق الحالة');
      fetchCases();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const columns = [
    { key: 'animal', label: 'الحيوان', render: (r) => <span className="font-bold text-stone-700">{r.animal_id?.tag_number || '—'}</span> },
    { key: 'diagnosis', label: 'التشخيص', render: (r) => <span className="text-stone-600 font-medium">{r.ai_diagnosis?.slice(0, 40) || '—'}</span> },
    { key: 'symptoms', label: 'الأعراض', className: 'whitespace-normal leading-relaxed text-xs min-w-[250px]', render: (r) => <span className="text-stone-500 text-xs">{r.symptoms?.join('، ') || '—'}</span> },
    { key: 'prevention', label: 'طرق الوقاية', className: 'whitespace-normal leading-relaxed text-xs min-w-[250px]', render: (r) => <span className="text-stone-500 text-xs">{r.suggested_actions?.join('، ') || '—'}</span> },
    { key: 'treatment', label: 'العلاج', className: 'whitespace-normal leading-relaxed text-xs min-w-[250px]', render: (r) => <span className="text-[#2a5c2a] text-xs font-bold">{r.recommended_treatment || '—'}</span> },
    { key: 'severity', label: 'الخطورة', render: (r) => (
      <span className={`px-2 py-1 text-xs font-bold rounded-md ${r.severity === 'high' ? 'bg-red-100 text-red-700' : r.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
        {SEVERITY_LABELS[r.severity] || r.severity}
      </span>
    ) },
    { key: 'governorate', label: 'المحافظة', render: (r) => r.governorate || '—' },
    { key: 'status', label: 'الحالة', render: (r) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${r.resolved ? 'bg-stone-100 text-stone-500 border border-stone-200/50' : 'bg-green-50 text-[#2a5c2a] border border-green-200/50'}`}>
        {r.resolved ? 'مغلقة' : 'مفتوحة'}
      </span>
    ) },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => !r.resolved && (
        <button type="button" onClick={() => handleResolve(r._id)} className="px-3 py-1 bg-green-50 text-[#2a5c2a] rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">إغلاق</button>
      ),
    },
  ];

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-stone-800 drop-shadow-sm">الحالات الصحية المكتشفة</h2>
        <p className="text-sm text-stone-500 font-medium">متابعة جميع الحالات الصحية للحيوانات والتي تم تشخيصها عبر المنصة.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-stone-600">تصفية حسب الحالة:</label>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border-none bg-stone-50 shadow-inner rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 outline-none focus:ring-2 focus:ring-[#2a5c2a]/20 transition-all cursor-pointer">
              <option value="">الكل</option>
              <option value="open">مفتوحة</option>
              <option value="resolved">مغلقة</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-stone-100/80 bg-white/50 pb-2">
          <DataTable columns={columns} data={cases} loading={loading} pagination={pagination} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
