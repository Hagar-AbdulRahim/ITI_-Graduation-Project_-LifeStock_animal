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
    {
      key: 'tag',
      label: 'رقم الوسم',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 font-black text-stone-800 text-sm">
          <span className="w-6 h-6 rounded-lg bg-[#f0f8f2] border border-[#2a5c2a]/20 flex items-center justify-center text-[10px] text-[#1b4d2c] font-black">
            #
          </span>
          {r.tag_number}
        </span>
      ),
    },
    {
      key: 'species',
      label: 'النوع',
      render: (r) => (
        <span className="px-3 py-1 rounded-full text-[11px] font-black border border-stone-200 bg-stone-50 text-stone-600 uppercase tracking-wide">
          {SPECIES_LABELS[r.species] || r.species}
        </span>
      ),
    },
    { key: 'farm', label: 'المزرعة', render: (r) => (
      <span className="text-stone-700 font-medium text-sm">{r.farm_id?.name || '—'}</span>
    )},
    { key: 'gov', label: 'المحافظة', render: (r) => (
      <span className="text-stone-500 text-sm">{r.farm_id?.governorate || '—'}</span>
    )},
    {
      key: 'health',
      label: 'الحالة الصحية',
      render: (r) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide border ${
          r.health_status === 'healthy'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : r.health_status === 'critical'
            ? 'bg-red-50 text-red-600 border-red-200'
            : 'bg-amber-50 text-amber-600 border-amber-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            r.health_status === 'healthy' ? 'bg-emerald-400 animate-pulse' :
            r.health_status === 'critical' ? 'bg-red-400 animate-pulse' : 'bg-amber-400'
          }`} />
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
            <div className="flex items-center gap-2.5 px-4 py-2 bg-[#f0f8f2] text-[#1b4d2c] rounded-xl text-sm font-bold border border-[#2a5c2a]/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#1b4d2c] animate-pulse" />
              <span>مزرعة: {farmName || farmId}</span>
              <button
                type="button"
                onClick={clearFarmFilter}
                className="w-5 h-5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors"
              >
                <X className="w-3 h-3 text-red-500" />
              </button>
            </div>
          )}
        </AdminFilterBar>
        <DataTable columns={columns} data={animals} loading={loading} pagination={pagination} onPageChange={setPage} />
      </AdminPanel>
    </div>
  );
}
