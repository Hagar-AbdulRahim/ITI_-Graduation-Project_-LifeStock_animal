import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowRight, HeartPulse, Loader2, Calendar, AlertCircle, Plus, 
  CheckCircle, XCircle, ShieldAlert, Eye, User, Clock, 
  AlertTriangle, Check, FileText, Activity, MapPin, Sparkles, MessageSquareCode
} from 'lucide-react';
import { fetchAnimalById } from '../../redux/animalSlice';
import healthRecordService from '../../services/healthRecord.service';

const AnimalMedicalRecordsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal, loading: animalLoading } = useSelector((state) => state.animal);

  // Local state for medical history
  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [errorCases, setErrorCases] = useState(null);

  // Local state for active detail view
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [caseDetail, setCaseDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState(null);

  // Fetch animal and list of cases
  useEffect(() => {
    if (id) {
      dispatch(fetchAnimalById(id));
      fetchCases();
    }
  }, [dispatch, id]);

  const fetchCases = async () => {
    setLoadingCases(true);
    setErrorCases(null);
    try {
      const response = await healthRecordService.getAnimalCases(id);
      if (response && response.success && Array.isArray(response.data)) {
        // Sort cases by newest first
        const sorted = [...response.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setCases(sorted);
      } else {
        setCases([]);
      }
    } catch (err) {
      console.error(err);
      setErrorCases('حدث خطأ أثناء تحميل السجلات الطبية. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoadingCases(false);
    }
  };

  // Fetch single case details when selectedCaseId changes
  useEffect(() => {
    if (selectedCaseId) {
      fetchCaseDetail(selectedCaseId);
    } else {
      setCaseDetail(null);
    }
  }, [selectedCaseId]);

  const fetchCaseDetail = async (caseId) => {
    setLoadingDetail(true);
    setErrorDetail(null);
    try {
      const response = await healthRecordService.getCaseById(caseId);
      if (response && response.success && response.data) {
        setCaseDetail(response.data);
      } else {
        setErrorDetail('تعذر تحميل تفاصيل الحالة الطبية.');
      }
    } catch (err) {
      console.error(err);
      setErrorDetail('حدث خطأ أثناء تحميل تفاصيل الحالة الطبية.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityStyle = (severity) => {
    const s = String(severity || '').toLowerCase();
    if (s === 'red') {
      return {
        bg: 'bg-red-50 text-red-700 border-red-200',
        badgeBg: 'bg-red-600 text-white',
        border: 'border-red-200',
        sideBorder: 'border-r-4 border-r-red-600',
        dot: 'bg-red-500',
        label: 'حالة حرجة جداً'
      };
    } else if (s === 'yellow') {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        badgeBg: 'bg-amber-500 text-white',
        border: 'border-amber-200',
        sideBorder: 'border-r-4 border-r-amber-500',
        dot: 'bg-amber-500',
        label: 'تحذير ومتابعة'
      };
    } else {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badgeBg: 'bg-emerald-600 text-white',
        border: 'border-emerald-200',
        sideBorder: 'border-r-4 border-r-emerald-500',
        dot: 'bg-emerald-500',
        label: 'مستقرة / بسيطة'
      };
    }
  };

  const getInputTypeLabel = (type) => {
    switch (type) {
      case 'image': return 'تحليل صورة';
      case 'voice': return 'تسجيل صوتي';
      case 'text+image': return 'نص وصورة';
      case 'text':
      default:
        return 'إدخال نصي';
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f5] font-cairo" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (selectedCaseId) {
                  setSelectedCaseId(null);
                } else {
                  navigate(-1);
                }
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-gray-900">
                {selectedCaseId ? 'تفاصيل السجل الطبي' : 'السجل المرضي والطبي'}
              </h1>
              <p className="text-[11px] text-gray-400 font-medium">
                الملف الطبي للحيوان: {animal?.name || animal?.tag_number || '...'}
              </p>
            </div>
          </div>
          {!selectedCaseId && (
            <button
              onClick={() => navigate(`/animals/${id}/medical-records/add`)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              إضافة فحص طبي
            </button>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {selectedCaseId ? (
          /* =========================================================================
             DETAIL VIEW
             ========================================================================= */
          <div>
            {loadingDetail ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-500 font-medium">جاري تحميل تفاصيل الحالة الطبية...</p>
              </div>
            ) : errorDetail ? (
              <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {errorDetail}
              </div>
            ) : caseDetail ? (
              <div className="space-y-6">
                {/* Main Diagnosis Card */}
                {(() => {
                  const sev = getSeverityStyle(caseDetail.severity);
                  return (
                    <div className={`bg-white border ${sev.border} rounded-2xl p-6 shadow-sm overflow-hidden relative`}>
                      {/* Top ribbon / status indicator */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${sev.badgeBg}`}>
                            {sev.label}
                          </span>
                          <span className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-bold">
                            الموثوقية: {caseDetail.confidence || 'غير محددة'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>تم التسجيل: {formatDate(caseDetail.created_at)}</span>
                        </div>
                      </div>

                      <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                          <div>
                            <span className="text-xs font-bold text-gray-400 block mb-1">التشخيص المقترح (AI):</span>
                            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                              <Activity className="w-6 h-6 text-red-500" />
                              {caseDetail.ai_diagnosis}
                            </h2>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <span className="text-[10px] font-bold text-gray-400 block">طريقة الإدخال</span>
                              <span className="text-xs font-bold text-gray-800">{getInputTypeLabel(caseDetail.input_type)}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <span className="text-[10px] font-bold text-gray-400 block">المحافظة</span>
                              <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {caseDetail.governorate || '—'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Image section if exists */}
                        {caseDetail.image_url && (
                          <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-stone-50 max-h-40 flex items-center justify-center">
                            <img 
                              src={caseDetail.image_url} 
                              alt="الحالة الصحية للحيوان" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Case Status & Review Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    مراجعة الطبيب البيطري وحالة الملف
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          caseDetail.resolved 
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {caseDetail.resolved ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">الحالة الحالية للملف الطبي</span>
                          <span className="text-sm font-bold text-gray-800">
                            {caseDetail.resolved ? 'تم شفاء الحالة وإغلاقها' : 'حالة نشطة / قيد المتابعة والعلاج'}
                          </span>
                        </div>
                      </div>

                      {caseDetail.resolved_at && (
                        <div className="text-xs text-gray-500 mr-11">
                          تاريخ الشفاء: {formatDate(caseDetail.resolved_at)}
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          caseDetail.vet_required 
                            ? 'bg-red-50 text-red-600'
                            : 'bg-gray-50 text-gray-400'
                        }`}>
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">هل تستدعي تدخل طبي بيطري؟</span>
                          <span className="text-sm font-bold text-gray-800">
                            {caseDetail.vet_required ? `نعم (الأولوية: ${caseDetail.vet_urgency || 'فوري'})` : 'لا تتطلب تدخل بيطري عاجل'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border-t md:border-t-0 md:border-r border-gray-100 md:pr-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          caseDetail.vet_consulted 
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-gray-50 text-gray-400'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">الاستشارة البيطرية</span>
                          <span className="text-sm font-bold text-gray-800">
                            {caseDetail.vet_consulted ? 'تمت استشارة طبيب بيطري' : 'لم تتم الاستشارة بعد'}
                          </span>
                        </div>
                      </div>

                      {caseDetail.reviewed_by && (
                        <div className="text-xs text-gray-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/50 mr-11">
                          <strong>تمت المراجعة بواسطة:</strong> {caseDetail.reviewed_by}
                          {caseDetail.reviewed_at && (
                            <span className="block text-[10px] text-gray-400 mt-0.5">
                              بتاريخ: {formatDate(caseDetail.reviewed_at)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Symptoms and Findings */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                  <div>
                    <h3 className="text-xs font-extrabold text-gray-400 mb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-gray-400" />
                      الأعراض المدخلة:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(caseDetail.symptoms) && caseDetail.symptoms.length > 0 ? (
                        caseDetail.symptoms.map((symptom, idx) => (
                          <span key={idx} className="text-xs font-bold bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200">
                            {symptom}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">لا توجد أعراض مدخلة.</span>
                      )}
                    </div>
                  </div>

                  {caseDetail.matched_symptoms && caseDetail.matched_symptoms.length > 0 && (
                    <div>
                      <h3 className="text-xs font-extrabold text-gray-400 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        الأعراض المطابقة للتشخيص الذكي:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {caseDetail.matched_symptoms.map((symptom, idx) => (
                          <span key={idx} className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {caseDetail.image_findings && (
                    <div className="pt-2">
                      <h3 className="text-xs font-extrabold text-gray-400 mb-1.5">نتائج تحليل الصورة:</h3>
                      <p className="text-sm text-gray-700 bg-amber-50/40 p-4 rounded-xl border border-amber-100/50 leading-relaxed">
                        {caseDetail.image_findings}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions & Treatments */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
                  {caseDetail.suggested_actions && caseDetail.suggested_actions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-extrabold text-stone-900 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        الإجراءات الأولية الموصى بها من الذكاء الاصطناعي:
                      </h3>
                      <ul className="space-y-2">
                        {caseDetail.suggested_actions.map((action, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start text-sm text-gray-700">
                            <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-[11px] font-bold mt-0.5 flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {caseDetail.vet_notes && (
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-extrabold text-stone-900 mb-2 flex items-center gap-2">
                        <MessageSquareCode className="w-4 h-4 text-blue-600" />
                        ملاحظات الطبيب البيطري:
                      </h3>
                      <p className="text-sm text-gray-700 bg-blue-50/30 p-4 rounded-xl border border-blue-100/50 leading-relaxed">
                        {caseDetail.vet_notes}
                      </p>
                    </div>
                  )}

                  {caseDetail.recommended_treatment && (
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-extrabold text-stone-900 mb-2 flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-red-600" />
                        العلاج البيطري الموصى به:
                      </h3>
                      <p className="text-sm text-gray-800 bg-red-50/20 p-4 rounded-xl border border-red-100/50 leading-relaxed font-semibold">
                        {caseDetail.recommended_treatment}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setSelectedCaseId(null)}
                    className="px-6 py-2.5 bg-stone-200 text-stone-700 rounded-xl text-sm font-bold hover:bg-stone-300 transition-colors"
                  >
                    العودة إلى قائمة السجلات
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          /* =========================================================================
             LIST VIEW
             ========================================================================= */
          <div>
            {loadingCases ? (
              /* Skeleton Loader */
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full bg-gray-200" />
                        <div className="h-4 bg-gray-200 rounded w-32" />
                        <div className="h-4 bg-gray-100 rounded w-16" />
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-24" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : errorCases ? (
              <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {errorCases}
              </div>
            ) : cases.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
                <HeartPulse className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="font-semibold text-gray-600">لا يوجد سجل طبي لهذا الحيوان</p>
                <p className="text-xs text-gray-400 mt-1">انقر على زر "إضافة فحص طبي" بالقرن العلوي لبدء تسجيل الفحوصات.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.map((item) => {
                  const sev = getSeverityStyle(item.severity);
                  return (
                    <div 
                      key={item._id} 
                      className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${sev.sideBorder}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${sev.dot}`} />
                          <h3 className="font-extrabold text-gray-900 text-base">
                            {item.ai_diagnosis || 'فحص صحي عام'}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sev.bg}`}>
                            {sev.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(item.created_at)}
                          </span>
                          <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.resolved 
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                          }`}>
                            {item.resolved ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {item.resolved ? 'تم الشفاء' : 'نشط / قيد العلاج'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3 space-y-3">
                          {/* Symptoms */}
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 mb-1">الأعراض الملحوظة:</h4>
                            <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                              {Array.isArray(item.symptoms) && item.symptoms.length > 0
                                ? item.symptoms.join(' — ')
                                : 'لا توجد أعراض مسجلة'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-end justify-end">
                          <button
                            onClick={() => setSelectedCaseId(item._id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-[#2a5c2a] hover:text-white transition-all shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                            عرض التفاصيل
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnimalMedicalRecordsPage;
