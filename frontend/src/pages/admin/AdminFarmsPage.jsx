import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PawPrint, Trash2 } from 'lucide-react';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import { canModifyLivestock } from '../../utils/roleRedirect';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { EGYPTIAN_GOVERNORATES } from '../../constant/adminData';
import {
  AdminPageHeader,
  AdminPanel,
  AdminFilterBar,
  AdminSelect,
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

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

  const handleDelete = (id) => {
    setConfirmData({
      title: 'حذف المزرعة',
      message: 'هل أنت متأكد من حذف هذه المزرعة نهائياً؟',
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminService.deleteFarm(id);
          toast.success('تم الحذف');
          fetchFarms();
        } catch {
          toast.error('فشل الحذف');
        }
      }
    });
    setConfirmOpen(true);
  };

  const goToFarmAnimals = (farm) => {
    navigate(`/admin/animals?farm_id=${farm._id}&farm_name=${encodeURIComponent(farm.name)}`);
  };

  const columns = [
    {
      key: 'name',
      label: 'اسم المزرعة',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#f0f8f2] border border-[#2a5c2a]/20 flex items-center justify-center shrink-0">
            <PawPrint className="w-4 h-4 text-[#1b4d2c]" />
          </div>
          <span className="font-bold text-stone-800 text-sm">{r.name}</span>
        </div>
      ),
    },
    {
      key: 'governorate',
      label: 'المحافظة',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 text-stone-600 text-sm font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
          {r.governorate}
        </span>
      ),
    },
    {
      key: 'owner',
      label: 'المالك',
      render: (r) => (
        <span className="text-stone-500 font-medium text-sm">{r.user_id?.name || '—'}</span>
      ),
    },
    {
      key: 'total_animals',
      label: 'الحيوانات',
      render: (r) => (
        <button
          type="button"
          onClick={() => goToFarmAnimals(r)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f8f2] hover:bg-[#1b4d2c] hover:text-white text-[#1b4d2c] rounded-xl font-black text-sm transition-all duration-200 border border-[#2a5c2a]/20 shadow-sm"
          title="عرض حيوانات المزرعة"
        >
          <PawPrint className="w-3.5 h-3.5" />
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 border border-red-100 bg-red-50/50 rounded-lg hover:bg-red-100 hover:border-red-200 transition-all duration-200 shadow-sm"
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
          <AdminSelect
            label="تصفية بالمحافظة"
            value={governorate}
            onChange={(e) => { setGovernorate(e.target.value); setPage(1); }}
          >
            <option value="">كل المحافظات</option>
            {EGYPTIAN_GOVERNORATES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </AdminSelect>
        </AdminFilterBar>
        <DataTable columns={columns} data={farms} loading={loading} pagination={pagination} onPageChange={setPage} />
      </AdminPanel>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmData?.onConfirm}
        title={confirmData?.title}
        message={confirmData?.message}
        type={confirmData?.type}
      />
    </div>
  );
}
