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
    { key: 'name', label: 'الاسم', render: (r) => <span className="font-bold text-stone-700">{r.name}</span> },
    { key: 'email', label: 'البريد', render: (r) => <span className="text-stone-500">{r.email}</span> },
    { key: 'role', label: 'الدور', render: (r) => <RoleBadge role={r.role} /> },
    { key: 'governorate', label: 'المحافظة', render: (r) => r.governorate || '—' },
    { key: 'is_active', label: 'الحالة', render: (r) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${r.is_active ? 'bg-green-50 text-[#2a5c2a] border border-green-200/50' : 'bg-stone-100 text-stone-500 border border-stone-200/50'}`}>
        {r.is_active ? 'نشط' : 'معطل'}
      </span>
    ) },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (r) => (
        <div className="flex gap-3">
          <Link to={`/admin/users/${r._id}`} className="text-[#2a5c2a] text-xs font-bold hover:underline">عرض</Link>
          <button type="button" onClick={() => { setEditUser(r); setModalOpen(true); }} className="text-blue-600 text-xs font-bold hover:underline">تعديل</button>
          {r.is_active && (
            <button type="button" onClick={() => handleDeactivate(r._id)} className="text-red-600 text-xs font-bold hover:underline">تعطيل</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-stone-800 drop-shadow-sm">إدارة المستخدمين</h2>
          <p className="text-sm text-stone-500 font-medium">سجل بجميع المزارعين والأطباء والمديرين.</p>
        </div>
        <Button className="w-auto px-6 shadow-md hover:shadow-lg transition-all" onClick={() => { setEditUser(null); setModalOpen(true); }}>
          + مستخدم جديد
        </Button>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[250px] relative">
            <input
              type="search"
              placeholder="بحث بالاسم أو البريد..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full border-none bg-stone-50 shadow-inner rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2a5c2a]/20 transition-all placeholder:text-stone-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-stone-600">تصفية:</label>
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="border-none bg-stone-50 shadow-inner rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 outline-none focus:ring-2 focus:ring-[#2a5c2a]/20 transition-all cursor-pointer">
              <option value="">كل الأدوار</option>
              <option value="user">مزارع</option>
              <option value="doctor">طبيب</option>
              <option value="admin">مدير</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-100/80 bg-white/50">
          <DataTable columns={columns} data={users} loading={loading} pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      <UserFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditUser(null); }} onSubmit={handleSave} initialData={editUser} loading={saving} />
    </div>
  );
}
