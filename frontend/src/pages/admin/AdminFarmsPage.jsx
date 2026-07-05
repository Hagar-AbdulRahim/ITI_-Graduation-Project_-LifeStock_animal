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
    { key: 'name', label: 'اسم المزرعة', render: (r) => <span className="font-bold text-stone-700">{r.name}</span> },
    { key: 'governorate', label: 'المحافظة', render: (r) => <span className="text-stone-600">{r.governorate}</span> },
    { key: 'owner', label: 'المالك', render: (r) => <span className="text-stone-500 font-medium">{r.user_id?.name || '—'}</span> },
    { key: 'total_animals', label: 'عدد الحيوانات', render: (r) => <span className="px-2 py-1 bg-stone-100 rounded-md font-bold text-stone-600">{r.total_animals}</span> },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => (
        <button type="button" onClick={() => handleDelete(r._id)} className="text-red-500 text-xs font-bold hover:text-red-700 transition-colors">حذف</button>
      ),
    },
  ];

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-stone-800 drop-shadow-sm">إدارة المزارع</h2>
        <p className="text-sm text-stone-500 font-medium">سجل يضم كافة المزارع المسجلة في المنصة.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="تصفية بالمحافظة..."
              value={governorate}
              onChange={(e) => { setGovernorate(e.target.value); setPage(1); }}
              className="w-full max-w-sm border-none bg-stone-50 shadow-inner rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2a5c2a]/20 transition-all placeholder:text-stone-400"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-100/80 bg-white/50">
          <DataTable columns={columns} data={farms} loading={loading} pagination={pagination} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
