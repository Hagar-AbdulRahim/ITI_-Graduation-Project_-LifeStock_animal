// ─── Weight Tracking Section ──────────────────────────────────────────────────
// Recharts line chart showing monthly weight history + records table.
// Chart automatically adapts to API data when real endpoint is connected.

import React from 'react';
import { Scale } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts';
import {
  SectionHeader,
  SectionSkeleton,
  ErrorState,
  EmptyState,
} from './VaccinationTable';

const WeightTrackingSection = ({ weightHistory, loading, error }) => {
  if (loading) return <SectionSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!weightHistory || weightHistory.length === 0)
    return <EmptyState label="لا توجد بيانات وزن متاحة" />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <SectionHeader
        title="متابعة الوزن"
        icon={<Scale className="w-5 h-5 text-emerald-500" />}
      />

      {/* Chart */}
      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weightHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              unit=" كجم"
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(v) => [`${v} كجم`, 'الوزن']}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#weightGrad)"
              dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Records table */}
      <div className="border-t border-gray-50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['الشهر', 'التاريخ', 'الوزن (كجم)'].map((h) => (
                  <th key={h} className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...weightHistory].reverse().map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{record.month}</td>
                  <td className="px-5 py-3 text-gray-500">{record.date}</td>
                  <td className="px-5 py-3 font-semibold text-emerald-600">{record.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeightTrackingSection;
