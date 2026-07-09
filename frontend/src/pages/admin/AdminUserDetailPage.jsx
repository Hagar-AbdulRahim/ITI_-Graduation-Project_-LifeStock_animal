import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import RoleBadge from '../../components/admin/RoleBadge';
import { ROLE_LABELS } from '../../constant/adminData';
import Loader from '../../components/common/Loader';
import { AdminPanel, AdminStatusBadge, AdminUserAvatar } from '../../components/admin/AdminUI';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getUserById(id)
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('فشل تحميل البيانات'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader size="lg" color="#2a5c2a" /></div>;
  if (!data) return <p className="text-stone-500">المستخدم غير موجود</p>;

  const { user, farms_count, animals_count } = data;
  const statsCards = [
    { label: 'المزارع', value: farms_count },
    { label: 'الحيوانات', value: animals_count },
    { label: 'الاستشارات', value: data.consultations_count ?? 0 },
    { label: 'التطعيمات', value: data.vaccinations_count ?? 0 },
  ];

  return (
    <div className="space-y-5">
      <Link to="/admin/users" className="inline-flex items-center gap-1 text-sm text-[#1b4d2c] font-bold hover:underline">
        ← العودة للمستخدمين
      </Link>
      <AdminPanel>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <AdminUserAvatar name={user.name} />
            <div>
              <h2 className="text-2xl font-black text-stone-800">{user.name}</h2>
              <p className="text-stone-500 mt-0.5 text-sm">{user.email}</p>
            </div>
          </div>
          <RoleBadge role={user.role} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <AdminStatusBadge active={user.is_active} />
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide border bg-[#2a5c2a]/8 text-[#1b4d2c] border-[#2a5c2a]/20">
            {ROLE_LABELS[user.role] || user.role}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4"><p className="text-xs text-stone-500 font-medium">المحافظة</p><p className="font-bold text-stone-800 mt-1">{user.governorate || '—'}</p></div>
          <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4"><p className="text-xs text-stone-500 font-medium">الهاتف</p><p className="font-bold text-stone-800 mt-1">{user.phone || '—'}</p></div>
          <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4"><p className="text-xs text-stone-500 font-medium">المزارع</p><p className="font-bold text-stone-800 mt-1">{farms_count}</p></div>
          <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4"><p className="text-xs text-stone-500 font-medium">الحيوانات</p><p className="font-bold text-stone-800 mt-1">{animals_count}</p></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {statsCards.map((card) => (
            <div key={card.label} className="rounded-xl p-4 border border-[#2a5c2a]/15 bg-[#f6fbf4]">
              <p className="text-xs text-stone-500 font-medium">{card.label}</p>
              <p className="font-black text-[#1b4d2c] mt-1 text-lg">{card.value}</p>
            </div>
          ))}
        </div>
        {user.role === 'doctor' && (
          <div className="mt-5 p-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-600 space-y-1">
            <p>التخصص: {user.specialization || '—'}</p>
            <p>رقم الترخيص: {user.license_number || '—'}</p>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
