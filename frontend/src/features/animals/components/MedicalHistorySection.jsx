// ─── Medical History Section ──────────────────────────────────────────────────
// Displays health cases: disease name, symptoms, AI diagnosis, severity, status.

import React from 'react';
import { HeartPulse, CheckCircle, XCircle } from 'lucide-react';
import {
  SEVERITY_MAP,
  formatDate,
} from '../utils/formatters';
import {
  SectionHeader,
  SectionSkeleton,
  ErrorState,
  EmptyState,
} from './VaccinationTable';

const MedicalHistorySection = ({ medicalHistory, loading, error }) => {
  if (loading) return <SectionSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!medicalHistory || medicalHistory.length === 0)
    return <EmptyState label="لا توجد حالات مرضية مسجلة" />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <SectionHeader
        title="السجل الطبي"
        icon={<HeartPulse className="w-5 h-5 text-red-500" />}
        count={medicalHistory.length}
      />

      <div className="divide-y divide-gray-50">
        {medicalHistory.map((item) => {
          const severity = SEVERITY_MAP[item.severity] || SEVERITY_MAP.green;
          return (
            <div key={item._id} className="px-5 py-4 hover:bg-gray-50/40 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3">
                {/* Title row */}
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${severity.dot}`} />
                  <h3 className="font-semibold text-gray-800">
                    {item.ai_diagnosis || (Array.isArray(item.symptoms) ? item.symptoms[0] : item.symptoms) || 'حالة مرضية'}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severity.badgeColor}`}>
                    {severity.riskLabel}
                  </span>
                </div>

                {/* Resolved badge */}
                <span
                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    item.resolved
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}
                >
                  {item.resolved ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {item.resolved ? 'تعافى' : 'جارٍ العلاج'}
                </span>
              </div>

              {/* Details grid */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="text-gray-400 text-xs">الأعراض: </span>
                  {Array.isArray(item.symptoms) ? item.symptoms.join(' — ') : item.symptoms}
                </div>
                {item.ai_diagnosis && (
                  <div>
                    <span className="text-gray-400 text-xs">تشخيص الذكاء الاصطناعي: </span>
                    <span className="font-medium text-indigo-700">{item.ai_diagnosis}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 text-xs">تاريخ البداية: </span>
                  {formatDate(item.created_at)}
                </div>
                {item.resolved_at && (
                  <div>
                    <span className="text-gray-400 text-xs">تاريخ التعافي: </span>
                    {formatDate(item.resolved_at)}
                  </div>
                )}
                <div>
                  <span className="text-gray-400 text-xs">استُشير طبيب بيطري: </span>
                  {item.vet_consulted ? 'نعم' : 'لا'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MedicalHistorySection;
