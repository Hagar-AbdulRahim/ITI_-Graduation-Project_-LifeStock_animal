// features/dashboard/components/AIRecommendations.jsx
import { useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';

const priorityStyle = {
  high: { label: 'أولوية عالية', bg: 'bg-[#fee2e2]', text: 'text-[#b91c1c]' },
  medium: {
    label: 'أولوية متوسطة',
    bg: 'bg-[#fef3c7]',
    text: 'text-[#b45309]',
  },
  low: { label: 'أولوية منخفضة', bg: 'bg-[#dcfce7]', text: 'text-[#15803d]' },
};

function RecommendationCard({ rec, index }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const p = priorityStyle[rec.priorityLevel] || priorityStyle.medium;

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${index * 100}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : 'translateX(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
      className='p-4 rounded-xl border border-stone-100 bg-stone-50 hover:bg-white
                 hover:shadow-sm transition-all duration-300'
    >
      <div className='flex items-start justify-between gap-2 mb-2'>
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}
        >
          {p.label}
        </span>
        <button className='text-stone-400 hover:text-stone-600 transition-colors text-lg leading-none'>
          ⋯
        </button>
      </div>
      <p className='text-sm font-semibold text-stone-800 mb-1'>{rec.title}</p>
      <p className='text-xs text-stone-500 leading-relaxed'>
        {rec.description}
      </p>
    </div>
  );
}

export default function AIRecommendations() {
  const recs = useSelector((state) => state.dashboard.aiRecommendations);

  return (
    <div className='bg-white rounded-2xl p-5 shadow-sm border border-stone-100 h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <div className='w-7 h-7 bg-[#eaf3e8] rounded-lg flex items-center justify-center'>
            <span className='text-sm'>🤖</span>
          </div>
          <div>
            <p className='text-sm font-bold text-stone-700'>
              توصيات الذكاء الاصطناعي
            </p>
            <p className='text-[11px] text-stone-400'>
              رؤى مخصصة للقطيع رقم ٠٤
            </p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className='flex-1 space-y-3 overflow-y-auto'>
        {recs.map((rec, i) => (
          <RecommendationCard key={rec.id} rec={rec} index={i} />
        ))}
      </div>

      {/* Footer CTA */}
      <button
        className='mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                         border-2 border-dashed border-[#3d6b47]/30 text-[#3d6b47] text-sm font-medium
                         hover:border-[#3d6b47] hover:bg-[#eaf3e8] transition-all duration-200'
      >
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          viewBox='0 0 24 24'
        >
          <path d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
        </svg>
        تحديث الرؤى
      </button>
    </div>
  );
}
