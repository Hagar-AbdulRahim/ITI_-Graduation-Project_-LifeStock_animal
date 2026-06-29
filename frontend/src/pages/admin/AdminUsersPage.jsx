import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import DataTable from '../../components/admin/DataTable';
import RoleBadge from '../../components/admin/RoleBadge';
import UserFormModal from '../../components/admin/UserFormModal';
import Button from '../../components/common/Button';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ page, limit: 15, search: search || undefined, role: roleFilter || undefined });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchUsers, search]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editUser?._id) {
        await adminService.updateUser(editUser._id, form);
        toast.success('تم تحديث المستخدم');
      } else {
        await adminService.createUser(form);
        toast.success('تم إنشاء المستخدم');
      }
      setModalOpen(false);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('تعطيل هذا المستخدم؟')) return;
    try {
      await adminService.deleteUser(id);
      toast.success('تم التعطيل');
      fetchUsers();
    } catch {
      toast.error('فشل التعطيل');
    }
  };

  const columns = [
    { key: 'name', label: 'الاسم' },
    { key: 'email', label: 'البريد' },
    { key: 'role', label: 'الدور', render: (r) => <RoleBadge role={r.role} /> },
    { key: 'governorate', label: 'المحافظة' },
    { key: 'is_active', label: 'الحالة', render: (r) => (r.is_active ? 'نشط' : 'معطل') },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => (
        <div className="flex gap-2">
          <Link to={`/admin/users/${r._id}`} className="text-[#2d5a1b] text-xs font-bold hover:underline">عرض</Link>
          <button type="button" onClick={() => { setEditUser(r); setModalOpen(true); }} className="text-blue-600 text-xs font-bold">تعديل</button>
          {r.is_active && (
            <button type="button" onClick={() => handleDeactivate(r._id)} className="text-red-600 text-xs font-bold">تعطيل</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black text-stone-800">إدارة المستخدمين</h2>
        <Button className="w-auto px-6" onClick={() => { setEditUser(null); setModalOpen(true); }}>+ مستخدم جديد</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="بحث بالاسم أو البريد..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-stone-200 rounded-xl px-4 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="border border-stone-200 rounded-xl px-3 py-2 text-sm">
          <option value="">كل الأدوار</option>
          <option value="user">مزارع</option>
          <option value="doctor">طبيب</option>
          <option value="admin">مدير</option>
        </select>
      </div>

      <DataTable columns={columns} data={users} loading={loading} pagination={pagination} onPageChange={setPage} />

      <UserFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditUser(null); }} onSubmit={handleSave} initialData={editUser} loading={saving} />
    </div>
  );
}
