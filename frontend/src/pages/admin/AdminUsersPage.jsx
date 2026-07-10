import { useCallback, useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';

import toast from 'react-hot-toast';

import adminService from '../../services/adminService';

import DataTable from '../../components/admin/DataTable';

import RoleBadge from '../../components/admin/RoleBadge';

import UserFormModal from '../../components/admin/UserFormModal';
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
} from '../../components/admin/AdminUI';
import { EGYPTIAN_GOVERNORATES } from '../../constant/adminData';

export default function AdminUsersPage() {

  const currentUserRole = useSelector((state) => state.auth?.user?.role);

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

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [confirmData, setConfirmData] = useState(null);



  const fetchUsers = useCallback(async () => {

    setLoading(true);

    try {

      const res = await adminService.getUsers({
        page,
        limit: 15,
        search: search || undefined,
        role: role || undefined,
        is_active: status !== '' ? status : undefined,
        governorate: governorate || undefined,
      });

      setUsers(res.data.data);

      setPagination(res.data.pagination);

    } catch {

      toast.error('فشل تحميل المستخدمين');

    } finally {

      setLoading(false);

    }

  }, [page, search, role, status, governorate]);



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



  const handleToggleStatus = (r) => {

    if (!canManageUser(r)) {

      toast.error('ليس لديك صلاحية تعديل حساب مدير النظام');

      return;

    }

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

          {canManageUser(r) && (

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

        action={
          <AdminPrimaryButton onClick={() => setModalOpen(true)}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              مدير جديد
            </span>
          </AdminPrimaryButton>
        }

      />



      <AdminPanel>

        <AdminFilterBar>

          <AdminSearchInput

            value={search}

            onChange={(e) => { setSearch(e.target.value); setPage(1); }}

            placeholder="بحث بالاسم أو البريد الإلكتروني..."

          />

          <AdminSelect
            label="الدور"
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
          >
            <option value="">كل الأدوار</option>
            <option value="user">مزارع</option>
            <option value="doctor">طبيب</option>
            <option value="sub_admin">مدير فرعي</option>
            <option value="admin">مدير نظام</option>
          </AdminSelect>

          <AdminSelect
            label="الحالة"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">كل الحالات</option>
            <option value="true">نشط</option>
            <option value="false">معطل</option>
          </AdminSelect>

          <AdminSelect
            label="المحافظة (للمزارع)"
            value={governorate}
            onChange={(e) => { setGovernorate(e.target.value); setPage(1); }}
          >
            <option value="">كل المحافظات</option>
            {EGYPTIAN_GOVERNORATES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </AdminSelect>

        </AdminFilterBar>

        <DataTable columns={columns} data={users} loading={loading} pagination={pagination} onPageChange={setPage} />

      </AdminPanel>



      <UserFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSave} initialData={null} loading={saving} />

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


