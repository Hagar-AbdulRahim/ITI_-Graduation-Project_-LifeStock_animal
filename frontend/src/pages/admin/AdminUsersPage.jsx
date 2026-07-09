import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import RoleBadge from '../../components/admin/RoleBadge';
import UserFormModal from '../../components/admin/UserFormModal';
import {
  AdminPageHeader,
  AdminPanel,
  AdminFilterBar,
  AdminSearchInput,
  AdminPrimaryButton,
  AdminDetailBtn,
  AdminStatusBadge,
  AdminUserAvatar,
} from '../../components/admin/AdminUI';

export default function AdminUsersPage() {
  const currentUserRole = useSelector((state) => state.auth?.user?.role);
  const currentUserId = useSelector((state) => state.auth?.user?._id);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleSave = async (form) => {
    setSaving(true);
    try {
      await adminService.createUser(form);
      toast.success('تم إنشاء المستخدم');
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const canManageUser = (targetUser) =>
    currentUserRole !== 'sub_admin' || targetUser.role !== 'admin';

  const handleToggleStatus = async (r) => {
    if (!canManageUser(r)) {
      toast.error('ليس لديك صلاحية تعديل حساب مدير النظام');
      return;
    }
    const confirmMsg = r.is_active ? 'هل تريد تعطيل هذا المستخدم؟' : 'هل تريد تنشيط هذا المستخدم؟';
    if (!window.confirm(confirmMsg)) return;
    try {
      await adminService.toggleUser(r._id);
      toast.success(r.is_active ? 'تم تعطيل المستخدم' : 'تم تنشيط المستخدم');
      fetchUsers();
    } catch {
      toast.error('فشل تحديث الحالة');
    }
  };

  const handleDelete = async (r) => {
    if (!canManageUser(r)) {
      toast.error('ليس لديك صلاحية حذف حساب مدير النظام');
      return;
    }
    if (currentUserId && r._id === currentUserId) {
      toast.error('لا يمكنك حذف حسابك الخاص');
      return;
    }
    const confirmMsg = `هل أنت متأكد من حذف المستخدم "${r.name}"؟ لا يمكن التراجع عن هذا الإجراء.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(r._id);
    try {
      await adminService.deleteUser(r._id);
      toast.success('تم حذف المستخدم');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل حذف المستخدم');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'الاسم',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <AdminUserAvatar name={r.name} />
          <span className="font-bold text-stone-800">{r.name}</span>
        </div>
      ),
    },
    { key: 'email', label: 'البريد', render: (r) => <span className="text-stone-500">{r.email}</span> },
    { key: 'role', label: 'الدور', render: (r) => <RoleBadge role={r.role} /> },
    { key: 'governorate', label: 'المحافظة', render: (r) => <span className="text-stone-600">{r.governorate || '—'}</span> },
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
          {canManageUser(r) && (
            <button
              type="button"
              onClick={() => handleToggleStatus(r)}
              className={`text-xs font-bold px-2 py-1 rounded-lg border transition-all ${
                r.is_active
                  ? 'text-red-600 border-red-100 hover:bg-red-50'
                  : 'text-[#2a5c2a] border-green-100 hover:bg-green-50'
              }`}
            >
              {r.is_active ? 'تعطيل' : 'تنشيط'}
            </button>
          )}
          {canManageUser(r) && (
            <button
              type="button"
              onClick={() => handleDelete(r)}
              disabled={deletingId === r._id}
              className="text-xs font-bold px-2 py-1 rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingId === r._id ? '...جارٍ الحذف' : 'حذف'}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-0">
      <AdminPageHeader
        title="إدارة المستخدمين"
        subtitle="سجل بجميع المزارعين والأطباء والمديرين."
        action={<AdminPrimaryButton onClick={() => setModalOpen(true)}>+ مدير جديد</AdminPrimaryButton>}
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

      <UserFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSave} initialData={null} loading={saving} />
    </div>
  );
}