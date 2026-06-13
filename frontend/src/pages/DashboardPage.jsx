// pages/DashboardPage.jsx
// ────────────────────────────────────────────────────────────
// الصفحة الرئيسية — بتجمّع كل كمبوننتات الـ dashboard feature
// ────────────────────────────────────────────────────────────
import { useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';

import StatsCard from '../features/dashboard/components/StatsCard';
import AnimalDistributionChart from '../features/dashboard/components/AnimalDistributionChart';
import WeeklyHealthChart from '../features/dashboard/components/WeeklyHealthChart';
import AIRecommendations from '../features/dashboard/components/AIRecommendations';
import RecentActivities from '../features/dashboard/components/RecentActivities';
import { FARM_INFO } from '../constants/mockData';

function PageHeader() {
  const { ref, inView } = useInView({ triggerOnce: true });
  return (
    <div
      ref={ref}
      className='flex items-center justify-between mb-6'
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(-12px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div>
        <h1 className='text-xl font-black text-stone-800'>
          نظرة عامة على صحة المزرعة
        </h1>
        <p className='text-sm text-stone-500 mt-0.5'>
          المؤشرات الحيوية في الوقت الفعلي وروى مدعومة بالذكاء الاصطناعي لمزرعة{' '}
          <span className='text-[#3d6b47] font-semibold'>{FARM_INFO.name}</span>
          .
        </p>
      </div>
      <div className='flex gap-2'>
        <button
          className='flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-sm
                     text-stone-600 bg-white hover:bg-stone-50 transition-all duration-200 shadow-sm'
        >
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            viewBox='0 0 24 24'
          >
            <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3' />
          </svg>
          تصدير البيانات
        </button>
        <button
          className='flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                     bg-[#2d5a1b] text-white hover:bg-[#3d6b47] transition-all duration-200
                     shadow-md hover:shadow-[#2d5a1b]/30 hover:scale-[1.02] active:scale-95'
        >
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            strokeWidth={2.5}
            viewBox='0 0 24 24'
          >
            <line x1='12' y1='5' x2='12' y2='19' />
            <line x1='5' y1='12' x2='19' y2='12' />
          </svg>
          إدخال جديد
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const stats = useSelector((state) => state.dashboard.stats);

  return (
    <div dir='rtl' className='max-w-7xl mx-auto'>
      {/* Header */}
      <PageHeader />

      {/* Stats Row */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        {stats.map((stat, i) => (
          <StatsCard key={stat.id} stat={stat} index={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6'>
        {/* Donut — 1 col */}
        <div className='lg:col-span-1'>
          <AnimalDistributionChart />
        </div>
        {/* Bar Chart — 2 cols */}
        <div className='lg:col-span-2'>
          <WeeklyHealthChart />
        </div>
      </div>

      {/* Bottom Row */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <AIRecommendations />
        <RecentActivities />
      </div>
    </div>
  );
}
