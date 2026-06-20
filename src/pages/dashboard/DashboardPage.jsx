// pages/DashboardPage.jsx
// ────────────────────────────────────────────────────────────
// الصفحة الرئيسية — بتجمّع كل كمبوننتات الـ dashboard feature
// ────────────────────────────────────────────────────────────
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useInView } from '../../utils/useInView'
import { fetchFarmStats, fetchFarmById } from '../../redux/farmSlice'

import StatsCard from '../../features/dashboard/components/StatsCard'
import AnimalDistributionChart from '../../features/dashboard/components/AnimalDistributionChart'
import WeeklyHealthChart from '../../features/dashboard/components/WeeklyHealthChart'
import AIRecommendations from '../../features/dashboard/components/AIRecommendations'
import RecentActivities from '../../features/dashboard/components/RecentActivities'

function PageHeader() {
  const { ref, inView } = useInView({ triggerOnce: true })
  const currentFarm = useSelector(state => state.farm.currentFarm);
  
  return (
    <div
      ref={ref}
      className="flex items-center justify-between mb-6"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(-12px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div>
        <h1 className="text-xl font-black text-stone-800">
          نظرة عامة على صحة المزرعة
        </h1>
        <p className="text-sm text-stone-500 mt-0.5">
          المؤشرات الحيوية في الوقت الفعلي وروى مدعومة بالذكاء الاصطناعي لمزرعة{' '}
          <span className="text-[#3d6b47] font-semibold">{currentFarm ? currentFarm.name : '...'}</span>
          .
        </p>
      </div>
      <div className="flex gap-2">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-sm
                     text-stone-600 bg-white hover:bg-stone-50 transition-all duration-200 shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          تصدير البيانات
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                     bg-[#2d5a1b] text-white hover:bg-[#3d6b47] transition-all duration-200
                     shadow-md hover:shadow-[#2d5a1b]/30 hover:scale-[1.02] active:scale-95"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          إدخال جديد
        </button>
      </div>
    </div>
  )
}

const toArabicDigits = (num) => {
  if (num === undefined || num === null) return '٠';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/\d/g, (d) => arabicDigits[d]);
};

export default function DashboardPage() {
  const { farmId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (farmId) {
      dispatch(fetchFarmById(farmId));
      dispatch(fetchFarmStats(farmId));
    }
  }, [dispatch, farmId]);

  const farmStats = useSelector((state) => state.farm.farmStats);
  const statsData = farmStats?.stats;

  const totalAnimals = statsData?.total_animals || 0;
  const sickAnimals = statsData?.by_health_status?.find(s => s._id === 'sick')?.count || 0;
  const upcomingVaccinations = statsData?.upcoming_vaccinations || 0;
  const emergencyAnimals = statsData?.by_health_status?.find(s => s._id === 'critical')?.count || 0;

  const stats = [
    {
      id: 'total',
      label: 'إجمالي الحيوانات',
      value: toArabicDigits(totalAnimals),
      rawValue: totalAnimals,
      icon: 'paw',
      color: 'green',
    },
    {
      id: 'sick',
      label: 'الحيوانات المريضة',
      value: toArabicDigits(sickAnimals),
      rawValue: sickAnimals,
      icon: 'medical',
      color: 'rose',
    },
    {
      id: 'vaccinations',
      label: 'التطعيمات القادمة',
      value: toArabicDigits(upcomingVaccinations),
      rawValue: upcomingVaccinations,
      badge: 'الـ ٧ أيام القادمة',
      icon: 'syringe',
      color: 'blue',
    },
    {
      id: 'emergencies',
      label: 'حالات الطوارئ',
      value: toArabicDigits(emergencyAnimals),
      rawValue: emergencyAnimals,
      icon: 'alert',
      color: 'red',
      urgent: emergencyAnimals > 0,
    },
  ];

  return (
    <div dir="rtl" className="max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <StatsCard key={stat.id} stat={stat} index={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Donut — 1 col */}
        <div className="lg:col-span-1">
          <AnimalDistributionChart />
        </div>
        {/* Bar Chart — 2 cols */}
        <div className="lg:col-span-2">
          <WeeklyHealthChart />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIRecommendations />
        <RecentActivities />
      </div>
    </div>
  )
}
