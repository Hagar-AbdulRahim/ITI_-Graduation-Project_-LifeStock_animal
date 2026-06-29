import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';

export default function AdminFarmsPage() {
  const [farms, setFarms] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [governorate, setGovernorate] = useState('');

  const fetchFarms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getFarms({ page, limit: 15, governorate: governorate || undefined });
      setFarms(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('فشل تحميل المزارع');
    } finally {
      setLoading(false);
    }
  }, [page, governorate]);

  useEffect(() => { fetchFarms(); }, [fetchFarms]);

  const handleDelete = async (id) => {
    if (!window.confirm('حذف هذه المزرعة؟')) return;
    try {
      await adminService.deleteFarm(id);
      toast.success('تم الحذف');
      fetchFarms();
    } catch {
      toast.error('فشل الحذف');
    }
  };

  const columns = [
    { key: 'name', label: 'اسم المزرعة' },
    { key: 'governorate', label: 'المحافظة' },
    { key: 'owner', label: 'المالك', render: (r) => r.user_id?.name || '—' },
    { key: 'total_animals', label: 'عدد الحيوانات' },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => (
        <button type="button" onClick={() => handleDelete(r._id)} className="text-red-600 text-xs font-bold">حذف</button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-stone-800">جميع المزارع</h2>
      <input
        type="text"
        placeholder="تصفية بالمحافظة..."
        value={governorate}
        onChange={(e) => { setGovernorate(e.target.value); setPage(1); }}
        className="border border-stone-200 rounded-xl px-4 py-2 text-sm w-full max-w-xs"
      />
      <DataTable columns={columns} data={farms} loading={loading} pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
