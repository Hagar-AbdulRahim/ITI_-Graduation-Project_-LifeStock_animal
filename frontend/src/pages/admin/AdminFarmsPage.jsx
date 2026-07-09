import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PawPrint, Trash2 } from 'lucide-react';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import { canModifyLivestock } from '../../utils/roleRedirect';
import {
  AdminPageHeader,
  AdminPanel,
  AdminFilterBar,
  AdminSearchInput,
  AdminDetailBtn,
} from '../../components/admin/AdminUI';

export default function AdminFarmsPage() {
  const navigate = useNavigate();
  const userRole = useSelector((state) => state.auth?.user?.role);
  const canDeleteFarms = canModifyLivestock(userRole);
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

  const goToFarmAnimals = (farm) => {
    navigate(`/admin/animals?farm_id=${farm._id}&farm_name=${encodeURIComponent(farm.name)}`);
  };

  const columns = [
    { key: 'name', label: 'اسم المزرعة', render: (r) => <span className="font-bold text-stone-800">{r.name}</span> },
    { key: 'governorate', label: 'المحافظة', render: (r) => <span className="text-stone-600">{r.governorate}</span> },
    { key: 'owner', label: 'المالك', render: (r) => <span className="text-stone-500 font-medium">{r.user_id?.name || '—'}</span> },
    {
      key: 'total_animals',
      label: 'عدد الحيوانات',
      render: (r) => (
        <button
          type="button"
          onClick={() => goToFarmAnimals(r)}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#2a5c2a]/8 hover:bg-[#2a5c2a]/15 rounded-lg font-bold text-[#1b4d2c] transition-colors border border-[#2a5c2a]/15"
          title="عرض حيوانات المزرعة"
        >
          {r.total_animals || 0}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => (
        <div className="flex items-center gap-2">
          <AdminDetailBtn onClick={() => goToFarmAnimals(r)} label="عرض الحيوانات" />
          {canDeleteFarms && (
            <button
              type="button"
              onClick={() => handleDelete(r._id)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              حذف
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="إدارة المزارع"
        subtitle="سجل يضم كافة المزارع المسجلة في المنصة."
      />
      <AdminPanel>
        <AdminFilterBar>
          <AdminSearchInput
            value={governorate}
            onChange={(e) => { setGovernorate(e.target.value); setPage(1); }}
            placeholder="تصفية بالمحافظة..."
          />
        </AdminFilterBar>
        <DataTable columns={columns} data={farms} loading={loading} pagination={pagination} onPageChange={setPage} />
      </AdminPanel>
    </div>
  );
}
