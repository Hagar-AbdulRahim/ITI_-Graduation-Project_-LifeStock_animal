import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, AlertCircle, Loader2, ShieldAlert, 
  CheckCircle2, AlertTriangle, Sparkles, Activity, FileText, Check, X,
  User, Stethoscope
} from 'lucide-react';
import healthRecordService from '../../services/healthRecord.service';

const HealthCaseDetailPage = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [caseDetail, setCaseDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (caseId) {
      fetchDetail();
    }
  }, [caseId]);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await healthRecordService.getCaseById(caseId);
      console.log("Case Details API Response:", response);
      if (response && response.success && response.data) {
        setCaseDetail(response.data);
      } else {
        setError('الحالة غير موجودة');
      }
    } catch (err) {
      console.error("fetchDetail error:", err);
      const status = err.response?.status;
      if (status === 401) {
        setError('غير مصرح، الرجاء تسجيل الدخول مرة أخرى');
      } else if (status === 404) {
        setError('الحالة غير موجودة');
      } else {
        setError('حدث خطأ، حاول لاحقاً');
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const handleResolve = async () => {
    if (caseDetail.resolved) {
      showToast('الحالة محلولة بالفعل.', 'error');
      return;
    }
    
    setResolving(true);
    try {
      const response = await healthRecordService.resolveCase(caseId);
      console.log("Resolve API Response:", response);
      if (response && response.success) {
        showToast('تم استشارة الطبيب البيطري وإغلاق الحالة بنجاح!', 'success');
        await fetchDetail();
      } else {
        showToast(response?.message || 'فشل تحديث الحالة.', 'error');
      }
    } catch (err) {
      console.error("handleResolve error:", err);
      const status = err.response?.status;
      if (status === 401) {
        showToast('غير مصرح، الرجاء تسجيل الدخول مرة أخرى', 'error');
      } else if (status === 404) {
        showToast('الحالة غير موجودة', 'error');
      } else {
        showToast('حدث خطأ أثناء الاتصال بالخادم، حاول لاحقاً', 'error');
      }
    } finally {
      setResolving(false);
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
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-600 text-white shadow-sm uppercase tracking-wide">
            Critical
          </span>
        );
      case 'yellow':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-sm uppercase tracking-wide">
            Warning
          </span>
        );
      case 'green':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-sm uppercase tracking-wide">
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
    <div className="min-h-screen bg-[#f8fafc] font-cairo text-slate-800 relative pb-12" dir="ltr">
      
      {/* Toast Alert Popup */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 animate-bounce transition-all duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold max-w-sm ${
            toast.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

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
        
        {/* Core Diagnosis Card */}
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
                <span className="text-xs font-bold text-slate-400 block mb-1">AI Diagnosis Verdict</span>
                <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-red-500" />
                  {caseDetail.ai_diagnosis || 'Unspecified'}
                </h2>
              </div>
            </div>

            {/* Case Images */}
            {(caseDetail.image_urls?.length > 0 || caseDetail.image_url) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(caseDetail.image_urls?.length > 0 ? caseDetail.image_urls : [caseDetail.image_url]).map((url, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center max-h-40">
                    <img 
                      src={url} 
                      alt={`Case attachment ${idx + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {caseDetail.image_findings && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 mb-1.5">Image Analysis Findings</h4>
              <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                {caseDetail.image_findings}
              </p>
            </div>
          )}
        </div>

        {/* Animal Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            Animal Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Tag Number</span>
              <span className="text-sm font-bold text-slate-700">{caseDetail.animal_id?.tag_number || '—'}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Species</span>
              <span className="text-sm font-bold text-slate-700 capitalize">{caseDetail.animal_id?.species || '—'}</span>
            </div>
          </div>
        </div>

        {/* Symptoms & Matched Symptoms Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Symptoms & Observations
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 mb-2">Reported Symptoms</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(caseDetail.symptoms) && caseDetail.symptoms.length > 0 ? (
                  caseDetail.symptoms.map((symptom, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                      {symptom}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No symptoms reported.</span>
                )}
              </div>
            </div>

            {caseDetail.matched_symptoms && caseDetail.matched_symptoms.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 mb-2">Matched Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  {caseDetail.matched_symptoms.map((symptom, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-150">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Suggested Actions (AI Analysis) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Recommendations & Actions
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
              <li className="text-slate-400 text-sm">No actions suggested.</li>
            )}
          </ul>
        </div>

        {/* Vet Notes & Treatments (Optional) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-slate-500" />
            Veterinarian Notes & Treatment
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">Vet Notes</span>
              {caseDetail.vet_notes ? (
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                  {caseDetail.vet_notes}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No notes recorded by veterinarian.</p>
              )}
            </div>
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-400 block mb-1">Recommended Treatment</span>
              {caseDetail.recommended_treatment ? (
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                  {caseDetail.recommended_treatment}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No recommended treatments recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Medical Status Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Case Status & Review Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  caseDetail.vet_consulted 
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {caseDetail.vet_consulted ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Vet Consulted</span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {caseDetail.vet_consulted ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  caseDetail.vet_required 
                    ? 'bg-red-50 text-red-600'
                    : 'bg-slate-100 text-slate-400'
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
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-300 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {!caseDetail.resolved && (
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-450 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
              {resolving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  تم استشارة الطبيب البيطري
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default HealthCaseDetailPage;
