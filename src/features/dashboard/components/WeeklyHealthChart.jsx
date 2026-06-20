// features/dashboard/components/WeeklyHealthChart.jsx
// ────────────────────────────────────────────────────────────
// الـ data جايه من Redux → لما يجي API
// dispatch(fetchWeeklyTrends(period)) في useEffect
// ────────────────────────────────────────────────────────────
import { useSelector, useDispatch } from 'react-redux'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { setTrendPeriod } from '../../../redux/dashBoard/dashboardSlice'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div
        className="bg-white shadow-lg rounded-xl px-3 py-2 border border-stone-100 text-sm"
        dir="rtl"
      >
        <p className="font-bold text-stone-800">{label}</p>
        <p className="text-[#3d6b47]">
          مؤشر الصحة: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    )
  }
  return null
}

export default function WeeklyHealthChart() {
  const dispatch = useDispatch()
  const data = useSelector((state) => state.dashboard.weeklyTrends)
  const period = useSelector((state) => state.dashboard.trendPeriod)

  // الحد الأدنى للـ score الطبيعي — تحته يتلوّن وردي
  const THRESHOLD = 60

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-sm font-bold text-stone-700">
            اتجاهات الصحة الأسبوعية
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            متوسط مؤشرات حركة القطيع وتكوين الجسم
          </p>
        </div>
        {/* Period Selector */}
        <button
          onClick={() =>
            dispatch(setTrendPeriod(period === '7days' ? '30days' : '7days'))
          }
          className="text-xs font-medium px-3 py-1 rounded-lg bg-stone-100 hover:bg-[#eaf3e8]
                     text-stone-600 hover:text-[#2d5a1b] transition-colors"
        >
          {period === '7days' ? 'آخر ٧ أيام' : 'آخر ٣٠ يوم'}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          barCategoryGap="20%"
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#f0ede8"
            strokeDasharray="0"
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
          />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.score < THRESHOLD ? '#f9a8d4' : '#c5ddb8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Note */}
      <p className="text-[11px] text-stone-400 mt-2">
        <span className="inline-block w-2 h-2 rounded-sm bg-pink-300 ml-1 align-middle" />
        البيانات الوردية تشير لمؤشر صحة منخفض (أقل من {THRESHOLD})
      </p>
    </div>
  )
}
