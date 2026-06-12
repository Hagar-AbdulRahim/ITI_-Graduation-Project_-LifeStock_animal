// features/dashboard/components/AnimalDistributionChart.jsx
// ────────────────────────────────────────────────────────────
// بتربطه بالـ Redux state — لما يجي الـ API،
// بدّل useSelector بـ dispatch(fetchDistribution())
// ────────────────────────────────────────────────────────────
import { useSelector } from 'react-redux';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0];
    return (
      <div
        className='bg-white shadow-lg rounded-xl px-3 py-2 border border-stone-100 text-sm'
        dir='rtl'
      >
        <p className='font-bold text-stone-800'>{d.name}</p>
        <p className='text-stone-500'>
          {d.value} رأس — {d.payload.percentage}٪
        </p>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ cx, cy, total }) => (
  <>
    <text
      x={cx}
      y={cy - 8}
      textAnchor='middle'
      fill='#1c1c1c'
      className='font-black'
      fontSize={26}
      fontWeight={900}
    >
      {total.toLocaleString('ar-EG')}
    </text>
    <text x={cx} y={cy + 14} textAnchor='middle' fill='#6b7280' fontSize={12}>
      رأس
    </text>
  </>
);

export default function AnimalDistributionChart() {
  // ← هنا مربوط بالـ Redux store
  const data = useSelector((state) => state.dashboard.animalDistribution);
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className='bg-white rounded-2xl p-5 shadow-sm border border-stone-100 h-full'>
      <h3 className='text-sm font-bold text-stone-700 mb-4'>توزيع الحيوانات</h3>

      <ResponsiveContainer width='100%' height={220}>
        <PieChart>
          <Pie
            data={data}
            cx='50%'
            cy='50%'
            innerRadius={65}
            outerRadius={90}
            paddingAngle={3}
            dataKey='value'
            label={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                stroke='white'
                strokeWidth={2}
              />
            ))}
          </Pie>
          {/* Center Label */}
          <text x='50%' y='43%' textAnchor='middle' dominantBaseline='middle'>
            <CustomLabel cx='50%' cy='50%' total={total} />
          </text>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className='mt-3 space-y-2'>
        {data.map((item) => (
          <div
            key={item.name}
            className='flex items-center justify-between text-sm'
          >
            <div className='flex items-center gap-2'>
              <span
                className='w-2.5 h-2.5 rounded-full flex-shrink-0'
                style={{ backgroundColor: item.color }}
              />
              <span className='text-stone-600'>{item.name}</span>
            </div>
            <div className='flex items-center gap-2 text-stone-500'>
              <span className='font-semibold text-stone-800'>
                {item.value.toLocaleString('ar-EG')}
              </span>
              <span className='text-xs'>({item.percentage}٪)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
