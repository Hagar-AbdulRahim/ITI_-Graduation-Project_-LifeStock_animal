import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import { HEALTH_STATUS_LABELS, SPECIES_LABELS } from '../../constant/adminData';
import toast from 'react-hot-toast';
import { X, Eye } from 'lucide-react';

export default function AdminAnimalsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const farmId = searchParams.get('farm_id') || '';
  const farmName = searchParams.get('farm_name') || '';

  const [animals, setAnimals] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [healthStatus, setHealthStatus] = useState('');

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getAnimals({
        page,
        limit: 15,
        health_status: healthStatus || undefined,
        farm_id: farmId || undefined,
      });
      setAnimals(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('فشل تحميل الحيوانات');
    } finally {
      setLoading(false);
    }
  }, [page, healthStatus, farmId]);

  useEffect(() => { fetchAnimals(); }, [fetchAnimals]);
  useEffect(() => { setPage(1); }, [farmId]);

  // يمسح فلتر المزرعة ويرجع لعرض كل الحيوانات
  const clearFarmFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('farm_id');
      next.delete('farm_name');
      return next;
    });
  };

  const columns = [
    { key: 'tag', label: 'رقم الوسم', render: (r) => <span className="font-bold text-stone-700">{r.tag_number}</span> },
    { key: 'species', label: 'النوع', render: (r) => SPECIES_LABELS[r.species] || r.species },
    { key: 'farm', label: 'المزرعة', render: (r) => r.farm_id?.name || '—' },
    { key: 'gov', label: 'المحافظة', render: (r) => r.farm_id?.governorate || '—' },
    {
      key: 'health',
      label: 'الحالة الصحية',
      render: (r) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
          r.health_status === 'healthy' ? 'bg-green-50 text-[#2a5c2a] border border-green-200/50' :
          r.health_status === 'critical' ? 'bg-red-50 text-red-600 border border-red-200/50' : 'bg-amber-50 text-amber-600 border border-amber-200/50'
        }`}>
          {HEALTH_STATUS_LABELS[r.health_status] || r.health_status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => (
        <button
          type="button"
          onClick={() => navigate(`/animals/${r._id}`)}
          className="flex items-center gap-1.5 text-stone-500 text-xs font-bold hover:text-[#2a5c2a] transition-colors"
          title="عرض تفاصيل الحيوان"
        >
          <Eye className="w-3.5 h-3.5" />
          عرض التفاصيل
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-stone-800 drop-shadow-sm">سجل الحيوانات</h2>
        <p className="text-sm text-stone-500 font-medium">إدارة ومتابعة الحيوانات المسجلة وحالاتها الصحية.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-stone-600">تصفية حسب الحالة:</label>
            <select value={healthStatus} onChange={(e) => { setHealthStatus(e.target.value); setPage(1); }} className="border-none bg-stone-50 shadow-inner rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 outline-none focus:ring-2 focus:ring-[#2a5c2a]/20 transition-all cursor-pointer">
              <option value="">جميع الحالات</option>
              <option value="healthy">سليم</option>
              <option value="sick">مريض</option>
              <option value="critical">حرج</option>
            </select>
          </div>

          {farmId && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2a5c2a]/10 text-[#2a5c2a] rounded-full text-sm font-bold">
              <span>مزرعة: {farmName || farmId}</span>
              <button type="button" onClick={clearFarmFilter} className="hover:text-red-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-100/80 bg-white/50">
          <DataTable columns={columns} data={animals} loading={loading} pagination={pagination} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}