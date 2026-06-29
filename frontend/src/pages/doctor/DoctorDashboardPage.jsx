import { useEffect, useState } from 'react';
import doctorService from '../../services/doctorService';
import StatsCard from '../../features/dashboard/components/StatsCard';
import Loader from '../../components/common/Loader';

export default function DoctorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await doctorService.getDashboardStats();
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" color="#2d5a1b" />
      </div>
    );
  }

  const cards = [
    { id: 'cases', label: 'حالات مفتوحة', value: stats?.open_cases?.toLocaleString('ar-EG') || '٠', rawValue: stats?.open_cases || 0, icon: 'diagnosis', color: 'rose', trend: null },
    { id: 'consultations', label: 'استشارات اليوم', value: stats?.consultations_today?.toLocaleString('ar-EG') || '٠', rawValue: stats?.consultations_today || 0, icon: 'ai', color: 'blue', trend: null },
    { id: 'outbreaks', label: 'فاشيات نشطة', value: stats?.active_outbreaks?.toLocaleString('ar-EG') || '٠', rawValue: stats?.active_outbreaks || 0, icon: 'emergency', color: 'red', trend: null },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-stone-800">لوحة الطبيب</h2>
        <p className="text-sm text-stone-500 mt-1">نظرة عامة على الحالات والاستشارات في محافظاتك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((stat, i) => (
          <StatsCard key={stat.id} stat={stat} index={i} />
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-stone-100">
        <h3 className="font-bold text-stone-700 mb-2">إجراءات سريعة</h3>
        <p className="text-sm text-stone-500">
          راجع الحالات الصحية المفتوحة من قائمة «الحالات الصحية»، ورد على الاستشارات المعلقة من «الاستشارات».
        </p>
      </div>
    </div>
  );
}
