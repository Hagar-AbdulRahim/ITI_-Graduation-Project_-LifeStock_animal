import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import RoleBadge from '../../components/admin/RoleBadge';
import Loader from '../../components/common/Loader';

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

  if (loading) return <div className="flex justify-center py-20"><Loader size="lg" color="#2d5a1b" /></div>;
  if (!data) return <p className="text-stone-500">المستخدم غير موجود</p>;

  const { user, farms_count, animals_count } = data;

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="text-sm text-[#2d5a1b] font-bold">← العودة للمستخدمين</Link>
      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-stone-800">{user.name}</h2>
            <p className="text-stone-500 mt-1">{user.email}</p>
          </div>
          <RoleBadge role={user.role} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-stone-50 rounded-xl p-4"><p className="text-xs text-stone-500">المحافظة</p><p className="font-bold">{user.governorate}</p></div>
          <div className="bg-stone-50 rounded-xl p-4"><p className="text-xs text-stone-500">الهاتف</p><p className="font-bold">{user.phone || '—'}</p></div>
          <div className="bg-stone-50 rounded-xl p-4"><p className="text-xs text-stone-500">المزارع</p><p className="font-bold">{farms_count}</p></div>
          <div className="bg-stone-50 rounded-xl p-4"><p className="text-xs text-stone-500">الحيوانات</p><p className="font-bold">{animals_count}</p></div>
        </div>
        {user.role === 'doctor' && (
          <div className="mt-4 text-sm text-stone-600">
            <p>التخصص: {user.specialization || '—'}</p>
            <p>رقم الترخيص: {user.license_number || '—'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
