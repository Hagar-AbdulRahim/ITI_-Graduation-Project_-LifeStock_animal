import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import { HEALTH_STATUS_LABELS, SPECIES_LABELS } from '../../constant/adminData';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import {
  AdminPageHeader,
  AdminPanel,
  AdminFilterBar,
  AdminSelect,
  AdminDetailBtn,
} from '../../components/admin/AdminUI';

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

  const clearFarmFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('farm_id');
      next.delete('farm_name');
      return next;
    });
  };

  const columns = [
    { key: 'tag', label: 'رقم الوسم', render: (r) => <span className="font-bold text-stone-800">{r.tag_number}</span> },
    {
      key: 'species',
      label: 'النوع',
      render: (r) => (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-stone-200 bg-stone-50 text-stone-600">
          {SPECIES_LABELS[r.species] || r.species}
        </span>
      ),
    },
    { key: 'farm', label: 'المزرعة', render: (r) => r.farm_id?.name || '—' },
    { key: 'gov', label: 'المحافظة', render: (r) => r.farm_id?.governorate || '—' },
    {
      key: 'health',
      label: 'الحالة الصحية',
      render: (r) => (
        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide border ${
          r.health_status === 'healthy' ? 'bg-emerald-50 text-[#1b4d2c] border-emerald-200' :
          r.health_status === 'critical' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
        }`}>
          {HEALTH_STATUS_LABELS[r.health_status] || r.health_status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => (
        <AdminDetailBtn onClick={() => navigate(`/animals/${r._id}`)} />
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="سجل الحيوانات"
        subtitle="إدارة ومتابعة الحيوانات المسجلة وحالاتها الصحية."
      />
      <AdminPanel>
        <AdminFilterBar>
          <AdminSelect
            label="تصفية حسب الحالة"
            value={healthStatus}
            onChange={(e) => { setHealthStatus(e.target.value); setPage(1); }}
          >
            <option value="">جميع الحالات</option>
            <option value="healthy">سليم</option>
            <option value="sick">مريض</option>
            <option value="critical">حرج</option>
          </AdminSelect>
          {farmId && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#2a5c2a]/8 text-[#1b4d2c] rounded-xl text-sm font-bold border border-[#2a5c2a]/20">
              <span>مزرعة: {farmName || farmId}</span>
              <button type="button" onClick={clearFarmFilter} className="hover:text-red-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </AdminFilterBar>
        <DataTable columns={columns} data={animals} loading={loading} pagination={pagination} onPageChange={setPage} />
      </AdminPanel>
    </div>
  );
}
