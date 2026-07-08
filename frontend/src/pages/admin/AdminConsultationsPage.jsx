import { useCallback, useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import toast from 'react-hot-toast';
import { EGYPTIAN_GOVERNORATES } from '../../constant/adminData';

export default function AdminConsultationsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [governorate, setGovernorate] = useState('');
  const [status, setStatus] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getConsultations({ page, limit: 15, governorate: governorate || undefined, status: status || undefined });
      setItems(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('فشل تحميل الاستشارات');
    } finally {
      setLoading(false);
    }
  }, [page, governorate, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'user', label: 'المستخدم', render: (r) => <span className="font-bold text-stone-700">{r.user_id?.name || '—'}</span> },
    { key: 'governorate', label: 'المحافظة', render: (r) => <span className="text-stone-600">{r.governorate}</span> },
    { key: 'diagnosis', label: 'التشخيص', render: (r) => <span className="text-stone-600">{r.ai_diagnosis?.slice(0, 50) || '—'}</span> },
    { key: 'symptoms', label: 'الأعراض', className: 'whitespace-normal leading-relaxed text-xs min-w-[250px]', render: (r) => <span className="text-stone-500 text-xs">{r.symptoms?.join('، ') || '—'}</span> },
    { key: 'prevention', label: 'طرق الوقاية', className: 'whitespace-normal leading-relaxed text-xs min-w-[250px]', render: (r) => <span className="text-stone-500 text-xs">{r.suggested_actions?.join('، ') || '—'}</span> },
    { key: 'treatment', label: 'العلاج', className: 'whitespace-normal leading-relaxed text-xs min-w-[250px]', render: (r) => <span className="text-[#2a5c2a] text-xs font-bold">{r.doctor_response || '—'}</span> },
    { key: 'severity', label: 'الخطورة', render: (r) => <span className="text-stone-500 font-bold">{r.severity || '—'}</span> },
    { key: 'status', label: 'حالة الرد', render: (r) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${r.doctor_status === 'responded' ? 'bg-green-50 text-[#2a5c2a] border border-green-200/50' : 'bg-amber-50 text-amber-600 border border-amber-200/50'}`}>
        {r.doctor_status === 'responded' ? 'تم الرد' : 'معلق'}
      </span>
    ) },
    { key: 'date', label: 'التاريخ', render: (r) => <span className="text-xs text-stone-400">{new Date(r.created_at).toLocaleDateString('ar-EG')}</span> },
  ];

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-stone-800 drop-shadow-sm">الاستشارات العامة</h2>
        <p className="text-sm text-stone-500 font-medium">متابعة استشارات المزارعين الموجهة للأطباء البيطريين عبر المنصة.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="flex flex-wrap gap-4 mb-6">
          <select value={governorate} onChange={(e) => { setGovernorate(e.target.value); setPage(1); }} className="border-none bg-stone-50 shadow-inner rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 outline-none">
            <option value="">كل المحافظات</option>
            {EGYPTIAN_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border-none bg-stone-50 shadow-inner rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 outline-none">
            <option value="">كل الحالات</option>
            <option value="pending">معلق</option>
            <option value="responded">تم الرد</option>
          </select>
        </div>
        <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-stone-100/80 bg-white/50 mt-2 pb-2">
          <DataTable columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
