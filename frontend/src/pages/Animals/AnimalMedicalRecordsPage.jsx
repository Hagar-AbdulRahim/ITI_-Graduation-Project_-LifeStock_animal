import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight, HeartPulse, Loader2, Calendar, AlertCircle,
  CheckCircle, XCircle, ShieldAlert, Eye, User, Clock,
  AlertTriangle, Check, FileText, Activity, MapPin, Sparkles,
  MessageSquareCode, RefreshCw, X, Mic, Image as ImageIcon,
  Type, TriangleAlert, History
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchAnimalById } from '../../redux/animalSlice';
import healthRecordService from '../../services/healthRecord.service';
import api from '../../services/api';

const BASE_IMG_URL = 'http://localhost:5000';

// ── Severity config ──────────────────────────────────────────────────────────
const SEVERITY = {
  red: {
    badge: 'bg-red-100 text-red-700 border border-red-200',
    solid: 'bg-red-600 text-white',
    sideBorder: 'border-r-4 border-r-red-500',
    dot: 'bg-red-500',
    label: 'حالة حرجة',
  },
  yellow: {
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    solid: 'bg-amber-500 text-white',
    sideBorder: 'border-r-4 border-r-amber-400',
    dot: 'bg-amber-400',
    label: 'تحتاج متابعة',
  },
  green: {
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    solid: 'bg-emerald-600 text-white',
    sideBorder: 'border-r-4 border-r-emerald-500',
    dot: 'bg-emerald-500',
    label: 'الحالة مستقرة',
  },
};

const getSev = (severity) => SEVERITY[String(severity).toLowerCase()] || SEVERITY.green;

// ── Input type icon ──────────────────────────────────────────────────────────
const InputTypeIcon = ({ type }) => {
  if (type === 'image') return <ImageIcon className="w-3.5 h-3.5 text-purple-500" />;
  if (type === 'voice') return <Mic className="w-3.5 h-3.5 text-blue-500" />;
  return <Type className="w-3.5 h-3.5 text-gray-400" />;
};

// ── Format date ──────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

// ── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-gray-200 mt-1" />
        <div className="h-4 bg-gray-200 rounded w-40" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-20" />
    </div>
    <div className="flex gap-2 mb-3">
      <div className="h-6 w-20 bg-gray-200 rounded-full" />
      <div className="h-6 w-16 bg-gray-100 rounded-full" />
    </div>
    <div className="h-3 bg-gray-100 rounded w-full mb-2" />
    <div className="h-3 bg-gray-100 rounded w-4/5" />
  </div>
);

// ── Resolve Confirm Dialog ────────────────────────────────────────────────────
const ResolveDialog = ({ onConfirm, onCancel, loading }) => {
  const [vetConsulted, setVetConsulted] = useState(false);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-base">تأكيد إغلاق الحالة</h3>
            <p className="text-xs text-gray-500 mt-0.5">هل تأكد شفاء الحيوان من هذه الحالة؟</p>
          </div>
        </div>

        {/* Vet consulted toggle */}
        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={vetConsulted}
            onChange={(e) => setVetConsulted(e.target.checked)}
            className="w-4 h-4 accent-[#2d5a1b] cursor-pointer"
          />
          <span className="text-sm text-gray-700 font-medium">تمت استشارة طبيب بيطري</span>
        </label>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => onConfirm(vetConsulted)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2d5a1b] text-white rounded-xl text-sm font-bold hover:bg-[#1e4520] transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {loading ? 'جاري الإغلاق...' : 'تأكيد الشفاء'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Case Detail Modal ─────────────────────────────────────────────────────────
const CaseDetailModal = ({ caseId, onClose, onResolved }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResolve, setShowResolve] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await healthRecordService.getCaseById(caseId);
        if (res?.success && res?.data) {
          setDetail(res.data);
        } else {
          setError(res?.message || 'تعذر تحميل تفاصيل الحالة');
        }
      } catch (err) {
        const msg = err?.response?.data?.message;
        if (err?.response?.status === 403) {
          setError('غير مصرح بالوصول لهذه البيانات');
        } else if (err?.response?.status === 404) {
          setError('الحالة غير موجودة');
        } else {
          setError(msg || 'حدث خطأ أثناء تحميل تفاصيل الحالة');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [caseId]);

  const handleResolve = async (vetConsulted) => {
    setResolving(true);
    try {
      const res = await api.put(`/api/health-cases/${caseId}/resolve`, { vet_consulted: vetConsulted });
      if (res.data?.success) {
        toast.success(res.data.message || 'تم إغلاق الحالة بنجاح');
        setDetail(prev => ({ ...prev, resolved: true, resolved_at: new Date().toISOString() }));
        setShowResolve(false);
        onResolved(caseId);
      } else {
        toast.error(res.data?.message || 'فشل في إغلاق الحالة');
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 403) toast.error('غير مصرح بهذا الإجراء');
      else if (err?.response?.status === 404) toast.error('الحالة غير موجودة');
      else toast.error(msg || 'حدث خطأ أثناء إغلاق الحالة');
    } finally {
      setResolving(false);
    }
  };

  const sev = detail ? getSev(detail.severity) : null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8 px-4"
        dir="rtl"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#2d5a1b]/4">
            <h2 className="text-base font-black text-gray-900">تفاصيل الحالة الصحية</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-12 flex flex-col items-center gap-3 text-gray-400">
                <Loader2 className="w-8 h-8 text-[#2d5a1b] animate-spin" />
                <p className="text-sm font-medium">جاري تحميل تفاصيل الحالة...</p>
              </div>
            ) : error ? (
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-sm font-bold text-gray-700">{error}</p>
                <button onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200">
                  إغلاق
                </button>
              </div>
            ) : detail ? (
              <div className="space-y-5">

                {/* Historical badge */}
                {detail.is_historical && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-semibold">
                    <History className="w-4 h-4" />
                    حالة مُدخَلة تاريخياً
                    {detail.reported_date && ` — تاريخ الإبلاغ: ${formatDate(detail.reported_date)}`}
                  </div>
                )}

                {/* Populated Animal Data */}
                {detail.animal_id && typeof detail.animal_id === 'object' && detail.animal_id.tag_number && (
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-800 font-bold">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span>رقم الوسم: {detail.animal_id.tag_number}</span>
                    {detail.animal_id.species && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-blue-300" />
                        <span>النوع: {
                          detail.animal_id.species === 'cattle' ? 'أبقار 🐄' :
                          detail.animal_id.species === 'sheep' ? 'أغنام 🐑' :
                          detail.animal_id.species === 'goat' ? 'ماعز 🐐' : detail.animal_id.species
                        }</span>
                      </>
                    )}
                  </div>
                )}

                {/* Diagnosis header */}
                <div className={`rounded-2xl p-5 border ${sev.badge} space-y-3`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sev.dot}`} />
                      <h3 className="text-lg font-black text-gray-900">{detail.ai_diagnosis}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${sev.badge}`}>{sev.label}</span>
                      <span className="text-xs font-bold bg-white/70 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                        الموثوقية: {detail.confidence || '—'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(detail.created_at)}</span>
                    <span className="flex items-center gap-1"><InputTypeIcon type={detail.input_type} />
                      {detail.input_type === 'image' ? 'تحليل صورة' : detail.input_type === 'voice' ? 'تسجيل صوتي' : 'إدخال نصي'}
                    </span>
                    {detail.governorate && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{detail.governorate}</span>}
                  </div>
                </div>

                {/* Case status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${detail.resolved ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    {detail.resolved ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                    <div>
                      <p className="text-[10px] text-gray-500">حالة الملف</p>
                      <p className="text-xs font-bold text-gray-800">{detail.resolved ? 'تم الشفاء ✓' : 'قيد المتابعة'}</p>
                      {detail.resolved_at && <p className="text-[10px] text-gray-500 mt-0.5">{formatDate(detail.resolved_at)}</p>}
                    </div>
                  </div>
                  {detail.vet_required && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
                      <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-500">طبيب بيطري</p>
                        <p className="text-xs font-bold text-red-700">يُنصح باستشارة طبيب</p>
                        {detail.vet_urgency && <p className="text-[10px] text-red-500 mt-0.5">{detail.vet_urgency}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Image */}
                {detail.image_url && (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={`${BASE_IMG_URL}${detail.image_url}`}
                      alt="صورة الحالة"
                      className="w-full max-h-52 object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    {detail.image_findings && (
                      <p className="text-xs text-gray-600 px-4 py-2 bg-gray-50 border-t border-gray-100 leading-relaxed">
                        <span className="font-bold">نتائج الصورة: </span>{detail.image_findings}
                      </p>
                    )}
                  </div>
                )}

                {/* Symptoms */}
                {Array.isArray(detail.symptoms) && detail.symptoms.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> الأعراض
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detail.symptoms.map((s, i) => (
                        <span key={i} className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched symptoms */}
                {Array.isArray(detail.matched_symptoms) && detail.matched_symptoms.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> الأعراض المطابقة للتشخيص
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detail.matched_symptoms.map((s, i) => (
                        <span key={i} className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested actions */}
                {Array.isArray(detail.suggested_actions) && detail.suggested_actions.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> الإجراءات الموصى بها
                    </p>
                    <ul className="space-y-1.5">
                      {detail.suggested_actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Vet section — only if any vet field exists */}
                {(detail.vet_notes || detail.recommended_treatment || detail.reviewed_by) && (
                  <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-black text-blue-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> متابعة الطبيب البيطري
                    </p>
                    {detail.vet_notes && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 mb-1">ملاحظات الطبيب</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{detail.vet_notes}</p>
                      </div>
                    )}
                    {detail.recommended_treatment && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 mb-1">العلاج الموصى به</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{detail.recommended_treatment}</p>
                      </div>
                    )}
                    {detail.reviewed_by && (
                      <p className="text-xs text-gray-600">
                        <span className="font-bold">راجعه: </span>{detail.reviewed_by}
                        {detail.reviewed_at && ` • ${formatDate(detail.reviewed_at)}`}
                      </p>
                    )}
                  </div>
                )}

                {/* Vet consulted */}
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  {detail.vet_consulted
                    ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> تمت استشارة طبيب بيطري</>
                    : <><XCircle className="w-3.5 h-3.5 text-gray-300" /> لم تتم استشارة طبيب بعد</>}
                </div>

                {/* Footer actions */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <button onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                    إغلاق
                  </button>
                  {!detail.resolved && (
                    <button
                      onClick={() => setShowResolve(true)}
                      className="flex items-center gap-2 px-5 py-2 bg-[#2d5a1b] text-white rounded-xl text-sm font-bold hover:bg-[#1e4520] transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      إغلاق الحالة (تم الشفاء)
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showResolve && (
        <ResolveDialog
          onConfirm={handleResolve}
          onCancel={() => setShowResolve(false)}
          loading={resolving}
        />
      )}
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AnimalMedicalRecordsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { animal } = useSelector((state) => state.animal);

  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [errorCases, setErrorCases] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchAnimalById(id));
    }
  }, [dispatch, id]);

  const fetchCases = useCallback(async () => {
    setLoadingCases(true);
    setErrorCases(null);
    try {
      const res = await healthRecordService.getAnimalCases(id);
      if (res?.success && Array.isArray(res.data)) {
        const sorted = [...res.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setCases(sorted);
      } else {
        setCases([]);
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 403) {
        setErrorCases('غير مصرح بالوصول لهذه البيانات');
      } else if (err?.response?.status === 404) {
        setErrorCases('الحيوان غير موجود أو غير مصرح');
      } else {
        setErrorCases(msg || 'حدث خطأ أثناء تحميل السجلات الطبية');
      }
    } finally {
      setLoadingCases(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchCases();
  }, [fetchCases]);

  // Update resolved status in list without refetch
  const handleResolved = useCallback((caseId) => {
    setCases(prev =>
      prev.map(c => c._id === caseId ? { ...c, resolved: true, resolved_at: new Date().toISOString() } : c)
    );
  }, []);

  const animalLabel = animal?.tag_number || animal?.name || '...';

  return (
    <div className="min-h-screen bg-[#f5f7f5] font-cairo" dir="rtl">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black text-gray-900">السجل الطبي</h1>
            <p className="text-[11px] text-gray-400 font-medium">الحيوان: {animalLabel}</p>
          </div>
          {!loadingCases && !errorCases && (
            <div className="mr-auto flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">{cases.length} حالة</span>
              <button
                onClick={fetchCases}
                title="إعادة التحميل"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {loadingCases ? (
          /* Skeleton */
          <>{[1, 2, 3].map(n => <SkeletonCard key={n} />)}</>

        ) : errorCases ? (
          /* Error */
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <p className="font-black text-gray-800 text-base">{errorCases}</p>
              <p className="text-sm text-gray-500 mt-1">تحقق من اتصالك بالشبكة وحاول مرة أخرى</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchCases}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#2d5a1b] text-white rounded-xl text-sm font-bold hover:bg-[#1e4520] transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> إعادة المحاولة
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                رجوع
              </button>
            </div>
          </div>

        ) : cases.length === 0 ? (
          /* Empty */
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <HeartPulse className="w-8 h-8 text-gray-300" />
            </div>
            <p className="font-black text-gray-600 text-base">لا توجد حالات صحية مسجلة لهذا الحيوان</p>
            <p className="text-sm text-gray-400">ستظهر الحالات الصحية هنا بعد إجراء تشخيص من صفحة "تشخيص الذكاء الاصطناعي"</p>
          </div>

        ) : (
          /* Cases list */
          cases.map((item) => {
            const sev = getSev(item.severity);
            const visibleSymptoms = item.symptoms?.slice(0, 3) || [];
            const extraCount = (item.symptoms?.length || 0) - 3;

            return (
              <div
                key={item._id}
                className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${sev.sideBorder}`}
                onClick={() => setSelectedCaseId(item._id)}
              >
                {/* Card header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${sev.dot}`} />
                    <h3 className="font-black text-gray-900 text-base leading-snug">
                      {item.ai_diagnosis || 'فحص صحي'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${sev.badge}`}>
                      {sev.label}
                    </span>
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      item.resolved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {item.resolved ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {item.resolved ? 'تم الشفاء ✓' : 'قيد المتابعة'}
                    </span>
                  </div>
                </div>

                {/* Symptoms tags */}
                {visibleSymptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {visibleSymptoms.map((s, i) => (
                      <span key={i} className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                    {extraCount > 0 && (
                      <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">
                        +{extraCount}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer row */}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{formatDate(item.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <InputTypeIcon type={item.input_type} />
                      {item.input_type === 'image' ? 'صورة' : item.input_type === 'voice' ? 'صوت' : 'نص'}
                    </span>
                    {item.confidence && (
                      <span className="font-semibold text-gray-500">الموثوقية: {item.confidence}</span>
                    )}
                  </div>
                  {item.vet_required && (
                    <span className="flex items-center gap-1 text-red-500 font-bold text-[10px]">
                      <ShieldAlert className="w-3.5 h-3.5" /> يحتاج طبيب بيطري
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* ── Detail Modal ── */}
      {selectedCaseId && (
        <CaseDetailModal
          caseId={selectedCaseId}
          onClose={() => setSelectedCaseId(null)}
          onResolved={handleResolved}
        />
      )}
    </div>
  );
};

export default AnimalMedicalRecordsPage;
