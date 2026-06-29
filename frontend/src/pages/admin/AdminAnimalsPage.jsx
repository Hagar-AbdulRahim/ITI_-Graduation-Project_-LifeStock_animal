import { useCallback, useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import { HEALTH_STATUS_LABELS, SPECIES_LABELS } from '../../constant/adminData';
import toast from 'react-hot-toast';

export default function AdminAnimalsPage() {
  const [animals, setAnimals] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [healthStatus, setHealthStatus] = useState('');

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getAnimals({ page, limit: 15, health_status: healthStatus || undefined });
      setAnimals(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('فشل تحميل الحيوانات');
    } finally {
      setLoading(false);
    }
  }, [page, healthStatus]);

  useEffect(() => { fetchAnimals(); }, [fetchAnimals]);

  const columns = [
    { key: 'tag', label: 'رقم الوسم', render: (r) => r.tag_number },
    { key: 'species', label: 'النوع', render: (r) => SPECIES_LABELS[r.species] || r.species },
    { key: 'farm', label: 'المزرعة', render: (r) => r.farm_id?.name || '—' },
    { key: 'gov', label: 'المحافظة', render: (r) => r.farm_id?.governorate || '—' },
    {
      key: 'health',
      label: 'الحالة الصحية',
      render: (r) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          r.health_status === 'healthy' ? 'bg-green-100 text-green-700' :
          r.health_status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {HEALTH_STATUS_LABELS[r.health_status] || r.health_status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-stone-800">جميع الحيوانات</h2>
      <select value={healthStatus} onChange={(e) => { setHealthStatus(e.target.value); setPage(1); }} className="border border-stone-200 rounded-xl px-3 py-2 text-sm">
        <option value="">كل الحالات</option>
        <option value="healthy">سليم</option>
        <option value="sick">مريض</option>
        <option value="critical">حرج</option>
      </select>
      <DataTable columns={columns} data={animals} loading={loading} pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
