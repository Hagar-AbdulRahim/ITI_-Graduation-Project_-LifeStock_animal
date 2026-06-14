// features/dashboard/components/RecentActivities.jsx
import { useSelector } from 'react-redux';
import SidebarIcon from '../../../components/SidebarIcon';

const activityStyle = {
  vaccination: { bg: 'bg-[#e0f2fe]', icon: 'syringe', color: 'text-[#0369a1]' },
  alert: { bg: 'bg-[#fee2e2]', icon: 'thermometer', color: 'text-[#b91c1c]' },
  success: { bg: 'bg-[#dcfce7]', icon: 'check', color: 'text-[#15803d]' },
};

export default function RecentActivities() {
  const activities = useSelector((state) => state.dashboard.recentActivities);

  return (
    <div className='bg-white rounded-2xl p-5 shadow-sm border border-stone-100 h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-sm font-bold text-stone-700'>الأنشطة الأخيرة</h3>
        <button className='text-xs text-[#3d6b47] font-medium hover:underline transition-all'>
          عرض الكل
        </button>
      </div>

      {/* Activity List */}
      <div className='flex-1 space-y-4'>
        {activities.map((activity, i) => {
          const s = activityStyle[activity.type] || activityStyle.success;
          return (
            <div
              key={activity.id}
              className='flex items-start gap-3 group'
              style={{
                animationDelay: `${i * 100}ms`,
              }}
            >
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
              >
                <span className={`w-4 h-4 ${s.color}`}>
                  <SidebarIcon name={s.icon} className={`w-4 h-4 ${s.color}`} />
                </span>
              </div>

              {/* Content */}
              <div className='flex-1 min-w-0'>
                <p className='text-sm text-stone-700 leading-snug'>
                  {activity.text}
                </p>
                <div className='flex items-center gap-2 mt-1'>
                  <span className='text-[11px] text-stone-400'>
                    {activity.time}
                  </span>
                  <span className='w-0.5 h-0.5 bg-stone-300 rounded-full' />
                  <span className='text-[11px] text-stone-400'>
                    {activity.actor}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
