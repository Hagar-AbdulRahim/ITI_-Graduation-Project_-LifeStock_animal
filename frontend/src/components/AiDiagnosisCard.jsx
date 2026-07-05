import React from 'react';
import { 
  AlertTriangle, Activity, ShieldCheck, Stethoscope, Clock, 
  CheckCircle2, Thermometer, Mic, ShieldAlert
} from 'lucide-react';

export default function AiDiagnosisCard({ diagnosisData }) {
  if (!diagnosisData || !diagnosisData.data) return null;

  const {
    diagnosis,
    confidence,
    severity,
    severity_explanation,
    matched_symptoms,
    immediate_actions,
    treatment_summary,
    vet_required,
    vet_urgency,
    prevention_tips
  } = diagnosisData.data;

  // Severity config
  const severityConfig = {
    red: {
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
      label: 'خطير (أحمر)'
    },
    yellow: {
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
      label: 'متوسط (أصفر)'
    },
    green: {
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      label: 'طبيعي (أخضر)'
    }
  };

  const currentSeverity = severityConfig[severity] || severityConfig.yellow;

  return (
    <div className="flex flex-col gap-4 mt-3 w-full font-cairo" dir="rtl">
      
      {/* Transcribed Text (if audio) */}
      {diagnosisData.transcribed_text && (
        <div className="flex items-start gap-2 bg-stone-100/80 p-3 rounded-xl border border-stone-200 text-stone-700 text-sm italic shadow-inner">
          <Mic className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" />
          <p>"{diagnosisData.transcribed_text.trim()}"</p>
        </div>
      )}

      {/* Main Diagnosis Header */}
      <div className={`p-4 rounded-2xl border ${currentSeverity.bg} ${currentSeverity.border} shadow-sm relative overflow-hidden transition-all hover:shadow-md`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-white/60 shadow-sm ${currentSeverity.border} border`}>
               {currentSeverity.icon}
            </div>
            <h3 className={`font-bold text-lg ${currentSeverity.color}`}>{diagnosis}</h3>
          </div>
          {confidence && (
            <span className="text-[10px] font-bold bg-white/80 px-2.5 py-1 rounded-full text-stone-700 border border-stone-200 shadow-sm flex items-center gap-1">
              <span>درجة الثقة:</span>
              <span className={confidence === 'عالية' ? 'text-emerald-600' : 'text-amber-600'}>{confidence}</span>
            </span>
          )}
        </div>
        
        {severity_explanation && (
          <p className={`text-xs mt-3 leading-relaxed ${currentSeverity.color} font-medium`}>
            {severity_explanation}
          </p>
        )}
      </div>

      {/* Matched Symptoms */}
      {matched_symptoms && matched_symptoms.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-3 text-stone-800 font-bold text-sm">
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <Thermometer className="w-4 h-4 text-rose-500" />
            </div>
            <h4>الأعراض المكتشفة</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {matched_symptoms.map((symptom, idx) => (
              <span key={idx} className="bg-stone-50 border border-stone-200 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Immediate Actions */}
      {immediate_actions && immediate_actions.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-3 text-stone-800 font-bold text-sm">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <h4>إجراءات عاجلة مطلوبة</h4>
          </div>
          <ul className="space-y-3">
            {immediate_actions.map((action, idx) => (
              <li key={idx} className="flex gap-3 text-xs text-stone-700 leading-relaxed bg-stone-50/50 p-2.5 rounded-xl border border-stone-100">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="pt-1">{action}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Treatment Summary */}
      {treatment_summary && (
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-3 text-[#2d5a1b] font-bold text-sm">
            <div className="p-1.5 bg-white/60 rounded-lg border border-emerald-100">
               <Stethoscope className="w-4 h-4 text-[#2d5a1b]" />
            </div>
            <h4>خطة العلاج المقترحة</h4>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed font-medium">
            {treatment_summary}
          </p>
        </div>
      )}

      {/* Vet Requirement & Prevention */}
      <div className="flex flex-col md:flex-row gap-3">
        {vet_required && (
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3 md:w-1/3 transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block font-bold mb-0.5">استدعاء الطبيب البيطري</span>
              <span className="text-xs font-black text-rose-700">{vet_urgency || 'مطلوب'}</span>
            </div>
          </div>
        )}

        {prevention_tips && prevention_tips.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-start gap-3 md:w-2/3 transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold text-stone-800 block mb-2">نصائح وقائية للمستقبل</span>
              <ul className="space-y-2">
                {prevention_tips.map((tip, idx) => (
                  <li key={idx} className="text-[11px] font-medium text-stone-600 leading-relaxed flex gap-2">
                    <span className="text-indigo-400 font-bold mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
