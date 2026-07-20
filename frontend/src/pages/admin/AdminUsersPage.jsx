import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import RoleBadge from '../../components/admin/RoleBadge';
import ConfirmModal from '../../components/admin/ConfirmModal';

import {
  AdminPageHeader,
  AdminPanel,
  AdminFilterBar,
  AdminSearchInput,
  AdminPrimaryButton,
  AdminDetailBtn,
  AdminStatusBadge,
  AdminUserAvatar,
  AdminSelect,
  AdminGovernorateDropdown,
} from '../../components/admin/AdminUI';

export default function AdminUsersPage() {
  const currentUserId = useSelector((state) => state.auth?.user?._id);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const [role, setRole] = useState('');

  const [status, setStatus] = useState('');

  const [governorate, setGovernorate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);  const [confirmOpen, setConfirmOpen] = useState(false);

  const [confirmData, setConfirmData] = useState(null);



  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ page, limit: 15, search: search || undefined });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }

  }, [page, search]);



  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchUsers, search]);


  const handleToggleStatus = async (r) => {

    const confirmMsg = r.is_active ? 'هل تريد تعطيل هذا المستخدم؟' : 'هل تريد تنشيط هذا المستخدم؟';

    setConfirmData({
      title: r.is_active ? 'تعطيل المستخدم' : 'تنشيط المستخدم',
      message: confirmMsg,
      type: r.is_active ? 'danger' : 'success',
      onConfirm: async () => {
        try {
          await adminService.toggleUser(r._id);
          toast.success(r.is_active ? 'تم تعطيل المستخدم' : 'تم تنشيط المستخدم');
          fetchUsers();
        } catch {
          toast.error('فشل تحديث الحالة');
        }
      }
    });

    setConfirmOpen(true);

  };

  const handleDelete = (r) => {
    setConfirmData({
      title: 'حذف المستخدم',
      message: `هل أنت متأكد من حذف "${r.name}"؟ سيتم حذف كل بياناته المرتبطة نهائيًا ولا يمكن التراجع عن هذا الإجراء.`,
      type: 'danger',
      onConfirm: async () => {
        setDeletingId(r._id);
        try {
          await adminService.deleteUser(r._id);
          toast.success('تم حذف المستخدم وكل بياناته');
          fetchUsers();
        } catch (err) {
          toast.error(err.response?.data?.message || 'فشل حذف المستخدم');
        } finally {
          setDeletingId(null);
        }
      }
    });
    setConfirmOpen(true);
  };



  const columns = [
    {
      key: 'name',
      label: 'المستخدم',
      render: (r) => (
        <div className="flex items-center gap-2.5 ">
          <AdminUserAvatar name={r.name} />
          <div>
            <span className="font-bold text-stone-800 text-sm block">{r.name}</span>
            <span className="text-[11px] text-stone-400 font-medium">{r.email}</span>
          </div>
        </div>
      ),
    },

    { key: 'email', label: 'البريد', render: (r) => <span className="text-stone-500">{r.email}</span> },

    { key: 'role', label: 'الدور', render: (r) => <RoleBadge role={r.role} /> },
    {
      key: 'governorate', label: 'المحافظة', render: (r) => (
        <span className="inline-flex items-center gap-1 text-stone-600 text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300 inline-block" />
          {r.governorate || '—'}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'الحالة',
      render: (r) => <AdminStatusBadge active={r.is_active} />,
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/users/${r._id}`}>
            <AdminDetailBtn label="عرض" />
          </Link>
          <button
            type="button"
            onClick={() => handleToggleStatus(r)}

            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 shadow-sm ${r.is_active

              ? 'text-red-600 border-red-100 bg-red-50/50 hover:bg-red-100 hover:border-red-200'

              : 'text-[#1b4d2c] border-green-100 bg-green-50/50 hover:bg-green-100 hover:border-[#1b4d2c]/20'

              }`}

          >
            {r.is_active ? 'تعطيل' : 'تنشيط'}
          </button>
          <button
            type="button"
            onClick={() => handleDelete(r)}
            disabled={deletingId === r._id}
            className="text-xs font-bold px-2 py-1 rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deletingId === r._id ? '...جارٍ الحذف' : 'حذف'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-0">
      <AdminPageHeader
        title="إدارة المستخدمين"
        subtitle="سجل بجميع المزارعين والأطباء والمديرين."



      />

      <AdminPanel>
        <AdminFilterBar>
          <AdminSearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="بحث بالاسم أو البريد..."
          />
        </AdminFilterBar>
        <DataTable columns={columns} data={users} loading={loading} pagination={pagination} onPageChange={setPage} />
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