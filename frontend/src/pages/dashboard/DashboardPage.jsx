// pages/DashboardPage.jsx
// ────────────────────────────────────────────────────────────
// الصفحة الرئيسية — بتجمّع كل كمبوننتات الـ dashboard feature
// ────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFarmById, fetchFarmStats } from '../../redux/farmSlice';
import { useInView } from '../../utils/useInView'

import StatsCard from '../../features/dashboard/components/StatsCard'
import AnimalDistributionChart from '../../features/dashboard/components/AnimalDistributionChart'
import WeeklyHealthChart from '../../features/dashboard/components/WeeklyHealthChart'
import AIRecommendations from '../../features/dashboard/components/AIRecommendations'
import RecentActivities from '../../features/dashboard/components/RecentActivities'

function PageHeader({ farmId }) {
  const { ref, inView } = useInView({ triggerOnce: true })
  const currentFarm = useSelector(state => state.farm.currentFarm);
  const navigate = useNavigate();

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ farm: currentFarm, exported_at: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm-${farmId || 'export'}-stats.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          type="button"
          onClick={handleExport}
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
          type="button"
          onClick={() => navigate(`/animals/add?farmId=${farmId}`)}
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

export default function DashboardPage() {
  const { farmId } = useParams();
  const dispatch = useDispatch();
  
  const stats = useSelector((state) => state.dashboard.stats)
  const currentFarm = useSelector(state => state.farm.currentFarm);
  const farmStats = useSelector(state => state.farm.farmStats);

  useEffect(() => {
    if (farmId) {
      dispatch(fetchFarmById(farmId));
      dispatch(fetchFarmStats(farmId));
    }
  }, [dispatch, farmId]);

  return (
    <div dir="rtl" className="max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader farmId={farmId} />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => {
          const displayStat = { ...stat };
          if (farmStats?.stats) {
            if (stat.id === 'total') {
              displayStat.value = farmStats.stats.total_animals?.toLocaleString('ar-EG') || '٠';
              displayStat.rawValue = farmStats.stats.total_animals || 0;
            } else if (stat.id === 'sick') {
              const sickCount = farmStats.stats.by_health_status?.find(s => s._id === 'sick')?.count || 0;
              const criticalCount = farmStats.stats.by_health_status?.find(s => s._id === 'critical')?.count || 0;
              const totalSick = sickCount + criticalCount;
              displayStat.value = totalSick?.toLocaleString('ar-EG') || '٠';
              displayStat.rawValue = totalSick || 0;
            } else if (stat.id === 'vaccinations') {
              displayStat.value = farmStats.stats.upcoming_vaccinations?.toLocaleString('ar-EG') || '٠';
              displayStat.rawValue = farmStats.stats.upcoming_vaccinations || 0;
            } else if (stat.id === 'emergencies') {
              displayStat.value = farmStats.stats.emergencies?.toLocaleString('ar-EG') || '٠';
              displayStat.rawValue = farmStats.stats.emergencies || 0;
            }
          } else if (currentFarm && stat.id === 'total') {
            displayStat.value = currentFarm.total_animals?.toLocaleString('ar-EG') || '٠';
            displayStat.rawValue = currentFarm.total_animals || 0;
          }
          return <StatsCard key={stat.id} stat={displayStat} index={i} />;
        })}
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
