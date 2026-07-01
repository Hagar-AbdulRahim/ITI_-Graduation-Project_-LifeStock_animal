import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowRight, Syringe, Loader2, Calendar, AlertCircle, Plus, 
  Trash2, Edit, CheckCircle, Clock, User, Tag, FileText, Check, X, CalendarDays
} from 'lucide-react';
import { 
  fetchAnimalById, 
  fetchAnimalVaccinations, 
  editVaccination, 
  deleteVaccination 
} from '../../redux/animalSlice';
import { animalService } from '../../features/animals/services/animalService';
import toast from 'react-hot-toast';

const AnimalVaccinationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal, vaccinations, loading, error } = useSelector((state) => state.animal);
  const [deletingId, setDeletingId] = useState(null);

  // States for Details Modal
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // States for Postpone Modal
  const [postponeVaccination, setPostponeVaccination] = useState(null);
  const [isPostponeOpen, setIsPostponeOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [postponeNotes, setPostponeNotes] = useState('');
  const [submittingPostpone, setSubmittingPostpone] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchAnimalById(id));
      dispatch(fetchAnimalVaccinations(id));
    }
  }, [dispatch, id]);

  const handleOpenDetails = async (vac) => {
    setIsDetailsOpen(true);
    setLoadingDetail(true);
    try {
      const response = await animalService.getVaccinationById(vac._id);
      if (response && response.success) {
        setSelectedVaccination(response.data);
      } else {
        setSelectedVaccination(vac); // fallback to local list data
      }
    } catch (err) {
      console.error("Error fetching vaccination details:", err);
      setSelectedVaccination(vac); // fallback
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleConfirmCompleted = async (vacId) => {
    if (window.confirm('هل أنت متأكد أن هذا التطعيم قد أُعطي للحيوان بالفعل؟')) {
      try {
        await dispatch(editVaccination({ vacId, data: { completed: true } })).unwrap();
        toast.success('تم تأكيد إتمام التطعيم وتحديث السجل بنجاح');
        
        // Refresh details modal if it's currently open for this vaccination
        if (selectedVaccination && selectedVaccination._id === vacId) {
          setSelectedVaccination(prev => prev ? { ...prev, completed: true, completed_at: new Date() } : null);
        }
        dispatch(fetchAnimalVaccinations(id));
      } catch (err) {
        toast.error(err || 'فشل في تحديث حالة التطعيم');
      }
    }
  };

  const handleOpenPostpone = (vac) => {
    setPostponeVaccination(vac);
    const currentDate = vac.vaccine_type === 'one_time' ? vac.scheduled_date : vac.next_due_date;
    setNewDate(currentDate ? new Date(currentDate).toISOString().split('T')[0] : '');
    setPostponeNotes(vac.notes || '');
    setIsPostponeOpen(true);
  };

  const handlePostponeSubmit = async (e) => {
    e.preventDefault();
    if (!newDate) {
      toast.error('يرجى اختيار التاريخ الجديد');
      return;
    }

    setSubmittingPostpone(true);
    try {
      const isOneTime = postponeVaccination.vaccine_type === 'one_time';
      const payload = {
        notes: postponeNotes.trim(),
        [isOneTime ? 'scheduled_date' : 'next_due_date']: newDate
      };

      await dispatch(editVaccination({ vacId: postponeVaccination._id, data: payload })).unwrap();
      toast.success('تم تأجيل موعد التطعيم وتحديث البيانات');
      setIsPostponeOpen(false);
      setPostponeVaccination(null);

      // Refresh list and details
      dispatch(fetchAnimalVaccinations(id));
      if (selectedVaccination && selectedVaccination._id === postponeVaccination._id) {
        setIsDetailsOpen(false);
      }
    } catch (err) {
      toast.error(err || 'حدث خطأ أثناء تأجيل التطعيم');
    } finally {
      setSubmittingPostpone(false);
    }
  };

  const handleDelete = async (vacId) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا التطعيم نهائياً؟')) {
      try {
        setDeletingId(vacId);
        await dispatch(deleteVaccination(vacId)).unwrap();
        toast.success('تم حذف سجل التطعيم بنجاح');
        setIsDetailsOpen(false);
        dispatch(fetchAnimalVaccinations(id));
      } catch (err) {
        toast.error(err || 'فشل في حذف سجل التطعيم');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatus = (vac) => {
    if (vac.completed) {
      return { 
        label: 'مكتمل', 
        color: 'bg-green-50 text-green-700 border-green-150', 
        dot: 'bg-green-600' 
      };
    }
    const dateStr = vac.vaccine_type === 'one_time' ? vac.scheduled_date : vac.next_due_date;
    if (!dateStr) {
      return { 
        label: 'قيد الانتظار', 
        color: 'bg-stone-100 text-stone-600 border-stone-200', 
        dot: 'bg-stone-400' 
      };
    }
    
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (date < today) {
      return { 
        label: 'متأخر', 
        color: 'bg-rose-50 text-rose-700 border-rose-150', 
        dot: 'bg-rose-600' 
      };
    }
    
    return { 
      label: 'مجدول', 
      color: 'bg-blue-50 text-blue-700 border-blue-150', 
      dot: 'bg-blue-600' 
    };
  };

  const getSpeciesLabel = (species) => {
    switch (species) {
      case 'cattle': return 'أبقار';
      case 'sheep': return 'أغنام';
      case 'goat': return 'ماعز';
      default: return species || 'غير محدد';
    }
  };

  if (loading.animal && !animal) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center font-cairo">
        <Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5] font-cairo pb-12" dir="rtl">
      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/animals/${id}`)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-stone-50 text-stone-500 transition-colors"
              title="رجوع لملف الحيوان"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-stone-900">سجل تطعيمات الحيوان</h1>
              <p className="text-[11px] text-stone-400 font-medium">
                تحصينات الحيوان: <span className="font-semibold text-[#2a5c2a]">{animal?.name || animal?.tag_number || '...'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/animals/${id}/vaccinations/add`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2a5c2a] text-white rounded-xl text-xs font-bold hover:bg-[#1f451f] transition-colors shadow-sm shadow-emerald-950/20"
          >
            <Plus className="w-4 h-4" />
            إضافة تطعيم جديد
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Loading state */}
        {loading.vaccinations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                  <div className="h-6 bg-stone-200 rounded-full w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-stone-100 rounded w-2/3"></div>
                  <div className="h-3 bg-stone-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error.vaccinations ? (
          <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error.vaccinations}
          </div>
        ) : !vaccinations || vaccinations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto mt-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#2a5c2a] flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Syringe className="w-8 h-8" />
            </div>
            <p className="font-bold text-stone-800 text-lg">لا توجد تطعيمات مسجلة بعد</p>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              سجل تطعيمات الحيوان يساعد على حمايته وتجنب انتشار الأوبئة داخل المزرعة.
            </p>
            <button
              onClick={() => navigate(`/animals/${id}/vaccinations/add`)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#2a5c2a] text-white rounded-xl text-xs font-bold hover:bg-[#1f451f] transition-all"
            >
              <Plus className="w-4 h-4" />
              سجل أول تطعيم الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {vaccinations.map((vac) => {
              const status = getStatus(vac);
              return (
                <div 
                  key={vac._id} 
                  className="bg-white border border-stone-200 rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col group"
                >
                  {/* Status & Type badge */}
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                      {status.label}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                      vac.vaccine_type === 'one_time' 
                        ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                        : 'bg-emerald-50 text-[#2a5c2a] border border-emerald-100'
                    }`}>
                      {vac.vaccine_type === 'one_time' ? 'لمرة واحدة' : 'متكرر'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="cursor-pointer flex-1" onClick={() => handleOpenDetails(vac)}>
                    <h3 className="font-extrabold text-stone-900 text-lg leading-tight group-hover:text-[#2a5c2a] transition-colors mb-1.5">
                      {vac.vaccine_name}
                    </h3>

                    <div className="space-y-1.5 text-xs text-stone-500 font-medium">
                      {vac.dose_ml && (
                        <p className="flex items-center gap-1">
                          <span className="text-stone-400">حجم الجرعة:</span>
                          <strong className="text-stone-850 font-bold">{vac.dose_ml} مل</strong>
                        </p>
                      )}

                      {vac.vaccine_type === 'recurring' ? (
                        <>
                          {vac.last_date && (
                            <p className="flex items-center gap-1">
                              <span className="text-stone-400">آخر جرعة:</span>
                              <span className="text-stone-700 font-semibold">{formatDate(vac.last_date)}</span>
                            </p>
                          )}
                          <p className="flex items-center gap-1 text-stone-600">
                            <span className="text-stone-400">الجرعة القادمة:</span>
                            <span className="font-extrabold text-stone-900">{formatDate(vac.next_due_date)}</span>
                          </p>
                        </>
                      ) : (
                        <p className="flex items-center gap-1 text-stone-600">
                          <span className="text-stone-400">موعد اللقاح:</span>
                          <span className="font-extrabold text-stone-900">{formatDate(vac.scheduled_date)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenDetails(vac)}
                      className="text-xs font-bold text-[#2a5c2a] hover:underline"
                    >
                      عرض التفاصيل
                    </button>

                    <div className="flex items-center gap-1.5">
                      {!vac.completed && (
                        <>
                          <button
                            onClick={() => handleConfirmCompleted(vac._id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-100 transition-all"
                            title="تأكيد الإعطاء"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenPostpone(vac)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all"
                            title="تأجيل الموعد"
                          >
                            <CalendarDays className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(vac._id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all"
                        title="حذف السجل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── DETAILS MODAL ─────────────────────────────────────────── */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border border-stone-100 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#2a5c2a] flex items-center justify-center border border-emerald-100">
                  <Syringe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-lg">تفاصيل سجل التطعيم</h3>
                  <p className="text-xs text-stone-400 font-medium">البيانات الكاملة للقاح المسجل</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-50 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin" />
                  <p className="text-xs text-stone-400 font-medium">جاري جلب تفاصيل اللقاح...</p>
                </div>
              ) : selectedVaccination ? (
                <>
                  {/* Animal Info Section (Populated by backend) */}
                  <div className="bg-[#f5f7f5] rounded-2xl p-4 border border-stone-200/40 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-400 block mb-0.5">الحيوان (رقم التعريف)</span>
                      <strong className="text-stone-800 flex items-center gap-1 font-bold text-sm">
                        <Tag className="w-3.5 h-3.5 text-stone-500" />
                        {selectedVaccination.animal_id?.tag_number || animal?.tag_number || '—'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block mb-0.5">الفصيلة / النوع</span>
                      <strong className="text-stone-850 font-extrabold text-sm">
                        {getSpeciesLabel(selectedVaccination.animal_id?.species || animal?.species)}
                      </strong>
                    </div>
                  </div>

                  {/* Main Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                      <span className="text-xs text-stone-500 font-bold">اسم التطعيم:</span>
                      <span className="text-sm font-extrabold text-stone-900">{selectedVaccination.vaccine_name}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                      <span className="text-xs text-stone-500 font-bold">نوع التطعيم:</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        selectedVaccination.vaccine_type === 'one_time' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-[#2a5c2a]'
                      }`}>
                        {selectedVaccination.vaccine_type === 'one_time' ? 'لمرة واحدة (طارئ)' : 'متكرر (دوري)'}
                      </span>
                    </div>

                    {selectedVaccination.vaccine_type === 'recurring' && (
                      <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                        <span className="text-xs text-stone-500 font-bold">أول جرعة للحيوان؟</span>
                        <span className="text-xs font-bold text-stone-800">{selectedVaccination.is_first_dose ? 'نعم' : 'لا'}</span>
                      </div>
                    )}

                    {selectedVaccination.dose_ml && (
                      <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                        <span className="text-xs text-stone-500 font-bold">حجم الجرعة:</span>
                        <span className="text-sm font-bold text-stone-800">{selectedVaccination.dose_ml} مل</span>
                      </div>
                    )}

                    {selectedVaccination.vaccine_type === 'recurring' ? (
                      <>
                        {selectedVaccination.last_date && (
                          <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                            <span className="text-xs text-stone-500 font-bold">تاريخ آخر جرعة:</span>
                            <span className="text-sm font-medium text-stone-850">{formatDate(selectedVaccination.last_date)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center border-b border-stone-50 pb-2 bg-emerald-50/30 p-2 rounded-lg">
                          <span className="text-xs text-[#2a5c2a] font-extrabold">الجرعة القادمة المستحقة:</span>
                          <span className="text-sm font-black text-stone-900">{formatDate(selectedVaccination.next_due_date)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center border-b border-stone-50 pb-2 bg-purple-50/20 p-2 rounded-lg">
                        <span className="text-xs text-purple-700 font-extrabold">موعد إعطاء التطعيم:</span>
                        <span className="text-sm font-black text-stone-900">{formatDate(selectedVaccination.scheduled_date)}</span>
                      </div>
                    )}

                    {selectedVaccination.administered_by && (
                      <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                        <span className="text-xs text-stone-500 font-bold">أُعطيت بواسطة:</span>
                        <span className="text-sm font-bold text-stone-800 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          {selectedVaccination.administered_by}
                        </span>
                      </div>
                    )}

                    {selectedVaccination.batch_number && (
                      <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                        <span className="text-xs text-stone-500 font-bold">رقم التشغيلة (Batch):</span>
                        <span className="text-sm font-mono text-stone-800">{selectedVaccination.batch_number}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                      <span className="text-xs text-stone-500 font-bold">حالة الإتمام:</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        selectedVaccination.completed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {selectedVaccination.completed ? (
                          <>
                            <Check className="w-3 h-3" /> تم الإعطاء
                          </>
                        ) : 'قيد الانتظار'}
                      </span>
                    </div>

                    {selectedVaccination.completed_at && (
                      <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                        <span className="text-xs text-stone-500 font-bold">تاريخ الإتمام الفعلي:</span>
                        <span className="text-xs font-medium text-stone-700">{formatDate(selectedVaccination.completed_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes box */}
                  {selectedVaccination.notes && (
                    <div className="bg-stone-50 border border-stone-150 rounded-xl p-3.5">
                      <span className="text-[11px] font-bold text-stone-400 block mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> ملاحظات خاصة:
                      </span>
                      <p className="text-xs text-stone-600 leading-relaxed">{selectedVaccination.notes}</p>
                    </div>
                  )}

                  {/* Actions Footer inside Modal */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setIsDetailsOpen(false);
                        navigate(`/animals/${id}/vaccinations/edit/${selectedVaccination._id}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-stone-100 hover:bg-stone-200/80 text-stone-700 rounded-xl text-xs font-bold transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      تعديل / تأجيل
                    </button>

                    {!selectedVaccination.completed && (
                      <button
                        onClick={() => {
                          handleConfirmCompleted(selectedVaccination._id);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        تأكيد الإعطاء
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(selectedVaccination._id)}
                      disabled={deletingId === selectedVaccination._id}
                      className="px-3.5 py-2.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-stone-500">فشل تحميل التفاصيل.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── POSTPONE MODAL ─────────────────────────────────────────── */}
      {isPostponeOpen && postponeVaccination && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] max-w-md w-full overflow-hidden shadow-xl border border-stone-100 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-extrabold text-stone-900 text-base">تأجيل موعد التطعيم</h3>
              <button
                onClick={() => {
                  setIsPostponeOpen(false);
                  setPostponeVaccination(null);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-50 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePostponeSubmit} className="p-5 space-y-4">
              <p className="text-xs text-stone-500 leading-relaxed">
                لقاح: <strong className="text-stone-800">{postponeVaccination.vaccine_name}</strong>
                <br />
                يمكنك تغيير التاريخ المستحق وإضافة سبب التأجيل في الملاحظات بالأسفل.
              </p>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">التاريخ الجديد المقترح *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]} // Future dates only
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2a5c2a]/20 focus:border-[#2a5c2a] transition-all font-cairo bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">ملاحظات أو سبب التأجيل</label>
                <textarea
                  rows={3}
                  value={postponeNotes}
                  onChange={(e) => setPostponeNotes(e.target.value)}
                  placeholder="مثال: تأجيل نظراً لعدم استقرار الحالة الصحية للحيوان مؤقتاً..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2a5c2a]/20 focus:border-[#2a5c2a] transition-all font-cairo bg-white resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPostponeOpen(false);
                    setPostponeVaccination(null);
                  }}
                  className="flex-1 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingPostpone}
                  className="flex-1 py-2.5 bg-[#2a5c2a] text-white rounded-xl text-xs font-bold hover:bg-[#1f451f] transition-colors shadow-sm disabled:opacity-75 flex items-center justify-center gap-1.5"
                >
                  {submittingPostpone ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : 'حفظ الموعد الجديد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalVaccinationsPage;
