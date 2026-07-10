// features/dashboard/components/StatsCard.jsx
import { useInView } from '../../../utils/useInView';
import SidebarIcon from '../../../components/SidebarIcon';

const colorMap = {
  green: {
    bg: 'bg-gradient-to-br from-[#f0f8f2] to-[#f6fbf4]',
    icon: 'bg-[#1b4d2c]/10',
    text: 'text-[#1b4d2c]',
    badge: 'bg-[#1b4d2c]/8 text-[#1b4d2c]',
    border: 'border-[#2a5c2a]/15',
    dot: 'bg-[#2a5c2a]',
    hover: 'hover:border-[#2a5c2a]/30 hover:shadow-[0_8px_24px_-4px_rgba(27,77,44,0.18)]',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-50 to-pink-50',
    icon: 'bg-rose-100',
    text: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-600',
    border: 'border-rose-200/60',
    dot: 'bg-rose-500',
    hover: 'hover:border-rose-300/60 hover:shadow-[0_8px_24px_-4px_rgba(244,63,94,0.18)]',
  },
  blue: {
    bg: 'bg-gradient-to-br from-sky-50 to-blue-50',
    icon: 'bg-sky-100',
    text: 'text-sky-700',
    badge: 'bg-sky-50 text-sky-700',
    border: 'border-sky-200/60',
    dot: 'bg-sky-500',
    hover: 'hover:border-sky-300/60 hover:shadow-[0_8px_24px_-4px_rgba(14,165,233,0.18)]',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-50 to-orange-50',
    icon: 'bg-red-100',
    text: 'text-red-600',
    badge: 'bg-red-50 text-red-600',
    border: 'border-red-200/60',
    dot: 'bg-red-500',
    hover: 'hover:border-red-300/60 hover:shadow-[0_8px_24px_-4px_rgba(239,68,68,0.18)]',
  },
};

export default function StatsCard({ stat, index = 0 }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const c = colorMap[stat.color] || colorMap.green;

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${index * 70}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
      }}
      className={`${c.bg} rounded-2xl p-5 border ${c.border} shadow-sm ${c.hover} hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden`}
    >
      {/* Icon + urgent dot */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl ${c.icon} flex items-center justify-center shadow-sm`}>
          <SidebarIcon name={stat.icon} className={`w-5 h-5 ${c.text}`} />
        </div>
        {stat.urgent && (
          <span className="flex items-center gap-1 text-[11px] text-red-500 font-bold">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            تنبيه
          </span>
        )}
        {stat.change && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
            {stat.change}
          </span>
        )}
        {stat.badge && !stat.change && (
          <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-center leading-tight max-w-[80px] border border-blue-100">
            {stat.badge}
          </span>
        )}
      </div>

      {/* Value */}
      <p className={`text-3xl font-black ${c.text} leading-none mb-1.5`}>
        {stat.value.toLocaleString?.() ?? stat.value}
      </p>
      <p className="text-sm text-stone-500 font-medium">{stat.label}</p>

      {/* Decorative blob */}
      <div className={`absolute -bottom-4 -left-4 w-20 h-20 rounded-full ${c.icon} blur-2xl opacity-60 pointer-events-none`} />
    </div>
  );
}
