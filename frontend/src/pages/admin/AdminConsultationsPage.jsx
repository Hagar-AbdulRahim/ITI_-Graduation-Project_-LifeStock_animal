import { useCallback, useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import toast from 'react-hot-toast';

export default function AdminConsultationsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getConsultations({ page, limit: 15 });
      setItems(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('فشل تحميل الاستشارات');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'user', label: 'المستخدم', render: (r) => r.user_id?.name || '—' },
    { key: 'governorate', label: 'المحافظة' },
    { key: 'diagnosis', label: 'التشخيص', render: (r) => r.ai_diagnosis?.slice(0, 50) || '—' },
    { key: 'severity', label: 'الخطورة' },
    { key: 'status', label: 'حالة الرد', render: (r) => (r.doctor_status === 'responded' ? 'تم الرد' : 'معلق') },
    { key: 'date', label: 'التاريخ', render: (r) => new Date(r.created_at).toLocaleDateString('ar-EG') },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-stone-800">الاستشارات العامة</h2>
      <DataTable columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
