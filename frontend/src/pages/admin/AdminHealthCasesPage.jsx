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
    { key: 'animal', label: 'الحيوان', render: (r) => r.animal_id?.tag_number || '—' },
    { key: 'diagnosis', label: 'التشخيص', render: (r) => r.ai_diagnosis?.slice(0, 40) || '—' },
    { key: 'severity', label: 'الخطورة', render: (r) => SEVERITY_LABELS[r.severity] || r.severity },
    { key: 'governorate', label: 'المحافظة' },
    { key: 'status', label: 'الحالة', render: (r) => (r.resolved ? 'مغلقة' : 'مفتوحة') },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => !r.resolved && (
        <button type="button" onClick={() => handleResolve(r._id)} className="text-[#2d5a1b] text-xs font-bold">إغلاق</button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-stone-800">الحالات الصحية</h2>
      <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border border-stone-200 rounded-xl px-3 py-2 text-sm">
        <option value="">الكل</option>
        <option value="open">مفتوحة</option>
        <option value="resolved">مغلقة</option>
      </select>
      <DataTable columns={columns} data={cases} loading={loading} pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
