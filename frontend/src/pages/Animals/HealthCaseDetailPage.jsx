import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, AlertCircle, Loader2, ShieldAlert, 
  CheckCircle2, AlertTriangle, Sparkles, Activity, FileText, Check, X
} from 'lucide-react';
import healthCaseService from '../../services/healthCaseService';

const HealthCaseDetailPage = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [caseDetail, setCaseDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (caseId) {
      fetchDetail();
    }
  }, [caseId]);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await healthCaseService.getHealthCaseById(caseId);
      if (response && response.success && response.data) {
        setCaseDetail(response.data);
      } else {
        setError('Failed to fetch details for this health case.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading health case details.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityBadge = (severity) => {
    const s = String(severity || '').toLowerCase();
    switch (s) {
      case 'red':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-600 text-white shadow-sm">
            Critical
          </span>
        );
      case 'yellow':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-sm">
            Warning
          </span>
        );
      case 'green':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-sm">
            Stable
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-cairo">
        <Loader2 className="w-8 h-8 text-slate-800 animate-spin mb-2" />
        <span className="text-sm text-slate-500 font-bold">Loading case details...</span>
      </div>
    );
  }

  if (error || !caseDetail) {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-cairo flex items-center justify-center p-6" dir="ltr">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Error Loading Case</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'Case detail not found.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-cairo" dir="ltr">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-slate-900">Medical Case Details</h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Animal Tag: {caseDetail.animal_id?.tag_number || '—'} | Species: <span className="capitalize">{caseDetail.animal_id?.species || '—'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Diagnosis & Summary Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {getSeverityBadge(caseDetail.severity)}
              {caseDetail.confidence && (
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                  Confidence: {caseDetail.confidence}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>Reported: {formatDate(caseDetail.created_at)}</span>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">AI Diagnosis Verdict:</span>
                <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-red-500" />
                  {caseDetail.ai_diagnosis || 'Unspecified'}
                </h2>
              </div>
            </div>

            {/* Case Image if available */}
            {caseDetail.image_url && (
              <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center max-h-40">
                <img 
                  src={caseDetail.image_url} 
                  alt="Case findings attachment" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {caseDetail.image_findings && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 mb-1.5">Image Analysis Findings:</h4>
              <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                {caseDetail.image_findings}
              </p>
            </div>
          )}
        </div>

        {/* Symptoms list */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Reported Symptoms
          </h3>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-2 pl-2">
            {Array.isArray(caseDetail.symptoms) && caseDetail.symptoms.length > 0 ? (
              caseDetail.symptoms.map((symptom, idx) => (
                <li key={idx} className="leading-relaxed">{symptom}</li>
              ))
            ) : (
              <li className="text-slate-400 list-none">No symptoms reported.</li>
            )}
          </ul>
        </div>

        {/* Suggested Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Suggested Initial Actions
          </h3>
          <ul className="space-y-3">
            {Array.isArray(caseDetail.suggested_actions) && caseDetail.suggested_actions.length > 0 ? (
              caseDetail.suggested_actions.map((action, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-sm text-slate-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400">No actions suggested.</li>
            )}
          </ul>
        </div>

        {/* Status section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Health Case Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                caseDetail.resolved 
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
              }`}>
                {caseDetail.resolved ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Resolution Status</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {caseDetail.resolved ? 'Resolved & Closed' : 'Active / Under Treatment'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                caseDetail.vet_required 
                  ? 'bg-red-50 text-red-600'
                  : 'bg-slate-50 text-slate-400'
              }`}>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Vet Required</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {caseDetail.vet_required ? `Required (${caseDetail.vet_urgency || 'Immediate'})` : 'Not Required'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-300 transition-colors"
          >
            Back
          </button>
        </div>
      </main>
    </div>
  );
};

export default HealthCaseDetailPage;
