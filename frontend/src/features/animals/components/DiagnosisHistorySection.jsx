// ─── AI Diagnosis History Section ────────────────────────────────────────────
// Displays AI-generated diagnoses: symptoms, disease, confidence, severity.

import React from 'react';
import { Brain } from 'lucide-react';
import {
  SEVERITY_MAP,
  INPUT_TYPE_MAP,
  getConfidenceLabel,
  formatDate,
} from '../utils/formatters';
import {
  SectionHeader,
  SectionSkeleton,
  ErrorState,
  EmptyState,
} from './VaccinationTable';

const DiagnosisHistorySection = ({ diagnosisHistory, loading, error }) => {
  if (loading) return <SectionSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!diagnosisHistory || diagnosisHistory.length === 0)
    return <EmptyState label="لا توجد تشخيصات مسجلة" />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <SectionHeader
        title="سجل تشخيصات الذكاء الاصطناعي"
        icon={<Brain className="w-5 h-5 text-violet-500" />}
        count={diagnosisHistory.length}
      />

      <div className="divide-y divide-gray-50">
        {diagnosisHistory.map((diag) => {
          const severity = SEVERITY_MAP[diag.severity] || SEVERITY_MAP.green;
          const confidence = getConfidenceLabel(diag.confidence_score);
          const inputType = INPUT_TYPE_MAP[diag.input_type] || { label: diag.input_type, icon: '🔍' };

          return (
            <div key={diag._id} className="px-5 py-4 hover:bg-gray-50/40 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                {/* Disease title */}
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${severity.dot}`} />
                  <h3 className="font-semibold text-gray-800">{diag.ai_diagnosis}</h3>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {/* Severity badge */}
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${severity.badgeColor}`}>
                    {severity.riskLabel}
                  </span>
                  {/* Input type badge */}
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {inputType.icon} {inputType.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
                {/* Symptoms */}
                <div className="sm:col-span-2">
                  <span className="text-gray-400 text-xs block mb-1">الأعراض</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(diag.symptoms)
                      ? diag.symptoms.map((s, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))
                      : <span>{diag.symptoms}</span>}
                  </div>
                </div>

                {/* Confidence + date */}
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400 text-xs block mb-0.5">نسبة الثقة</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${diag.confidence_score}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${confidence.color}`}>
                        {diag.confidence_score}%
                      </span>
                    </div>
                    <span className={`text-xs ${confidence.color}`}>{confidence.label}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">التاريخ: </span>
                    <span className="text-xs">{formatDate(diag.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiagnosisHistorySection;
