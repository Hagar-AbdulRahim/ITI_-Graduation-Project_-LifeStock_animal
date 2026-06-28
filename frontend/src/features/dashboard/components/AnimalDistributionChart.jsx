// features/dashboard/components/AnimalDistributionChart.jsx
import { useSelector } from 'react-redux';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0];

    return (
      <div
        className="bg-white shadow-lg rounded-xl px-3 py-2 border border-stone-100 text-sm"
        dir="rtl"
      >
        <p className="font-bold text-stone-800">{d.name}</p>
        <p className="text-stone-500">
          {d.value} رأس — {d.payload.percentage}٪
        </p>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ cx, cy, total }) => {
  const safeCx = Number(cx);
  const safeCy = Number(cy);
  const safeTotal = Number(total) || 0;

  if (!Number.isFinite(safeCx) || !Number.isFinite(safeCy)) return null;

  return (
    <>
      <text
        x={safeCx}
        y={safeCy - 8}
        textAnchor="middle"
        fill="#1c1c1c"
        fontSize={26}
        fontWeight={900}
      >
        {safeTotal.toLocaleString('ar-EG')}
      </text>

      <text
        x={safeCx}
        y={safeCy + 14}
        textAnchor="middle"
        fill="#6b7280"
        fontSize={12}
      >
        رأس
      </text>
    </>
  );
};

export default function AnimalDistributionChart() {
  const mockData = useSelector(
    (state) => state.dashboard.animalDistribution
  );

  const farmStats = useSelector((state) => state.farm.farmStats);

  let data = mockData || [];

  if (
    farmStats?.stats?.by_species &&
    farmStats.stats.by_species.length > 0
  ) {
    const totalAnimals = Number(farmStats.stats.total_animals) || 1;

    const SPECIES_MAP = {
      cattle: { name: 'الأبقار', color: '#3d6b47' },
      sheep: { name: 'الأغنام', color: '#5b9bd5' },
      goat: { name: 'الماعز', color: '#f59e0b' },
      horse: { name: 'الخيول', color: '#7c4d8a' },
      pig: { name: 'الخنازير', color: '#ef4444' },
    };

    data = farmStats.stats.by_species.map((item) => {
      const count = Number(item.count) || 0;

      const speciesInfo = SPECIES_MAP[item._id] || {
        name: item._id,
        color: '#9ca3af',
      };

      return {
        name: speciesInfo.name,
        value: count,
        percentage: Math.round((count / totalAnimals) * 100),
        color: speciesInfo.color,
      };
    });
  } else if (farmStats) {
    data = [
      {
        name: 'لا توجد بيانات',
        value: 1,
        percentage: 100,
        color: '#e5e7eb',
      },
    ];
  }

  const total =
    farmStats?.stats
      ? Number(farmStats.stats.total_animals) || 0
      : data.reduce((acc, d) => acc + (Number(d.value) || 0), 0);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 h-full">
      <h3 className="text-sm font-bold text-stone-700 mb-4">
        توزيع الحيوانات
      </h3>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            label={(props) => (
              <CustomLabel {...props} total={total} />
            )}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 space-y-2">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-stone-600">{item.name}</span>
            </div>

            <div className="flex items-center gap-2 text-stone-500">
              <span className="font-semibold text-stone-800">
                {Number(item.value).toLocaleString('ar-EG')}
              </span>
              <span className="text-xs">({item.percentage}٪)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}