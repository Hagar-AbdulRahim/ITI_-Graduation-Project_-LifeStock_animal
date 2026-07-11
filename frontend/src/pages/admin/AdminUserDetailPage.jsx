import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import { MapPin, Phone, Home, PawPrint, MessageSquare, Syringe, Stethoscope } from 'lucide-react';
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

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader size="lg" color="#2a5c2a" />
    </div>
  );
  if (!data) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="text-4xl">👤</div>
      <p className="text-stone-400 font-medium">المستخدم غير موجود</p>
    </div>
  );

  const { user, farms_count, animals_count } = data;
  const statsCards = [
    { label: 'المزارع', value: farms_count, icon: <Home className="w-4 h-4" />, color: 'green' },
    { label: 'الحيوانات', value: animals_count, icon: <PawPrint className="w-4 h-4" />, color: 'green' },
    { label: 'الاستشارات', value: data.consultations_count ?? 0, icon: <MessageSquare className="w-4 h-4" />, color: 'blue' },
    { label: 'التطعيمات', value: data.vaccinations_count ?? 0, icon: <Syringe className="w-4 h-4" />, color: 'purple' },
  ];

  const colorMap = {
    green:  'bg-[#f0f8f2] text-[#1b4d2c] border-[#2a5c2a]/20',
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
  };

  return (
    <div className="space-y-5">
      {/* Back Link */}
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#1b4d2c] hover:text-[#2a5c2a] transition-colors group"
      >
        <div className="w-7 h-7 rounded-lg border border-[#2a5c2a]/20 bg-[#f0f8f2] flex items-center justify-center group-hover:bg-[#1b4d2c] group-hover:text-white transition-all duration-200">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        العودة للمستخدمين
      </Link>

      {/* Profile Header Card */}
      <AdminPanel>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div className="flex items-center gap-4">
            {/* Large Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1b4d2c]/15 to-[#2a5c2a]/10 border border-[#2a5c2a]/20 flex items-center justify-center text-2xl font-black text-[#1b4d2c] shadow-sm">
              {user.name?.charAt(0) || 'م'}
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-800">{user.name}</h2>
              <p className="text-stone-400 text-sm font-medium mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <AdminStatusBadge active={user.is_active} />
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
<<<<<<< HEAD
        <div className="grid grid-cols-2 gap-4 mt-5">
          {[
            { label: 'المحافظة', value: user.governorate || '—', icon: '📍' },
            { label: 'الهاتف', value: user.phone || '—', icon: '📞' },
=======
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {[
            { label: 'المحافظة', value: user.governorate || '—', icon: <MapPin className="w-3.5 h-3.5" /> },
            { label: 'الهاتف', value: user.phone || '—', icon: <Phone className="w-3.5 h-3.5" /> },
>>>>>>> 1d6cde6b63c3a354f99d19b6509925cb05fb1df8
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5 hover:border-[#2a5c2a]/25 hover:bg-[#f6fbf4] transition-all duration-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-black text-stone-400 uppercase tracking-wider mb-2">
                {icon} <span>{label}</span>
              </div>
              <p className="font-bold text-stone-800 text-base">{value}</p>
            </div>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {statsCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl p-5 border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${colorMap[card.color] || colorMap.green}`}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider mb-3 opacity-80">
                {card.icon} <span>{card.label}</span>
              </div>
              <p className="font-black text-3xl leading-none">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Doctor Info */}
        {user.role === 'doctor' && (
          <div className="mt-5 p-6 rounded-2xl border border-blue-100 bg-gradient-to-l from-blue-50/80 to-transparent space-y-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-[12px] font-black text-blue-500 uppercase tracking-wider">
              <Stethoscope className="w-4 h-4" /> <span>معلومات الطبيب</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wide">التخصص</p>
                <p className="text-sm font-bold text-blue-800 mt-0.5">{user.specialization || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wide">رقم الترخيص</p>
                <p className="text-sm font-bold text-blue-800 mt-0.5">{user.license_number || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
