// ─── Vaccination History Table ────────────────────────────────────────────────
// Displays all vaccinations for the selected animal.

import React from 'react';
import { Syringe, AlertCircle } from 'lucide-react';
import { VACCINATION_STATUS_MAP, formatDate } from '../utils/formatters';

const VaccinationTable = ({ vaccinations, loading, error }) => {
  if (loading) return <SectionSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!vaccinations || vaccinations.length === 0) return <EmptyState />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <SectionHeader title="سجل التطعيمات" icon={<Syringe className="w-5 h-5 text-blue-500" />} count={vaccinations.length} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['اللقاح', 'آخر جرعة', 'الموعد القادم', 'الجرعة (مل)', 'المُعطي', 'الحالة', 'ملاحظات'].map((h) => (
                <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-gray-500 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {vaccinations.map((v) => {
              const statusInfo = VACCINATION_STATUS_MAP[v.status] || VACCINATION_STATUS_MAP.upcoming;
              return (
                <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">{v.vaccine_name}</td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{formatDate(v.last_date)}</td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{formatDate(v.next_due_date)}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-center">{v.dose_ml ?? '—'}</td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{v.administered_by || '—'}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.badgeColor}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 max-w-[180px] truncate">{v.notes || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────
export const SectionHeader = ({ title, icon, count }) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="font-semibold text-gray-800">{title}</h2>
    </div>
    {count !== undefined && (
      <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5 font-medium">
        {count} سجلات
      </span>
    )}
  </div>
);

export const SectionSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-1/4 mb-4" />
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-4 bg-gray-100 rounded mb-3" />
    ))}
  </div>
);

export const ErrorState = ({ message }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 flex items-center gap-3 text-red-600">
    <AlertCircle className="w-5 h-5 flex-shrink-0" />
    <p className="text-sm">{message}</p>
  </div>
);

export const EmptyState = ({ label = 'لا توجد بيانات متاحة حتى الآن' }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
    <p className="text-sm">{label}</p>
  </div>
);

export default VaccinationTable;
