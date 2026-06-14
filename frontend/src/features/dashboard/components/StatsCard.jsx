// features/dashboard/components/StatsCard.jsx
import { useInView } from '../../../utils/useInView';
import SidebarIcon from '../../../components/SidebarIcon';

const colorMap = {
  green: {
    bg: 'bg-[#eaf3e8]',
    text: 'text-[#2d5a1b]',
    badge: 'bg-[#2d5a1b]/10 text-[#2d5a1b]',
    dot: 'bg-[#3d6b47]',
  },
  rose: {
    bg: 'bg-[#fce7f3]',
    text: 'text-[#be124c]',
    badge: 'bg-[#fce7f3] text-[#be124c]',
    dot: 'bg-[#f43f5e]',
  },
  blue: {
    bg: 'bg-[#e0f2fe]',
    text: 'text-[#0369a1]',
    badge: 'bg-[#e0f2fe] text-[#0369a1]',
    dot: 'bg-[#0ea5e9]',
  },
  red: {
    bg: 'bg-[#fee2e2]',
    text: 'text-[#b91c1c]',
    badge: 'bg-[#fee2e2] text-[#b91c1c]',
    dot: 'bg-[#ef4444]',
  },
};

export default function StatsCard({ stat, index = 0 }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const c = colorMap[stat.color] || colorMap.green;

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${index * 80}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
      className='bg-white rounded-2xl p-5 shadow-sm border border-stone-100
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300'
    >
      {/* Icon + urgent dot */}
      <div className='flex items-start justify-between mb-3'>
        <div
          className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}
        >
          <span className={`w-5 h-5 ${c.text}`}>
            <SidebarIcon name={stat.icon} className={`w-5 h-5 ${c.text}`} />
          </span>
        </div>
        {stat.urgent && (
          <span className='flex items-center gap-1 text-[11px] text-red-500 font-medium'>
            <span className='w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse' />
          </span>
        )}
        {stat.change && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}
          >
            {stat.change}
          </span>
        )}
        {stat.badge && !stat.change && (
          <span className='text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-center leading-tight max-w-[80px]'>
            {stat.badge}
          </span>
        )}
      </div>

      {/* Value */}
      <p className={`text-3xl font-black ${c.text} leading-none mb-1`}>
        {stat.value}
      </p>
      <p className='text-sm text-stone-500'>{stat.label}</p>
    </div>
  );
}
