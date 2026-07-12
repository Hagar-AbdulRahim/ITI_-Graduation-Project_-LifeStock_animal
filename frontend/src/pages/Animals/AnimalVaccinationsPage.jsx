import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight, Syringe, Loader2, AlertCircle, Plus,
  Trash2, Edit, CheckCircle, User, Tag, FileText,
  Check, X, CalendarDays, PauseCircle
} from 'lucide-react';
import {
  fetchAnimalById, fetchAnimalVaccinations,
  editVaccination, deleteVaccination,
} from '../../redux/animalSlice';
import { animalService } from '../../features/animals/services/animalService';
import toast from 'react-hot-toast';
import bgImage from '../../assets/images/cows-field-bg.jpg';

const AnimalVaccinationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal, vaccinations, loading, error } = useSelector((state) => state.animal);
  const [deletingId, setDeletingId] = useState(null);

  // Details modal
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Postpone modal
  const [postponeVaccination, setPostponeVaccination] = useState(null);
  const [isPostponeOpen, setIsPostponeOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [postponeNotes, setPostponeNotes] = useState('');
  const [submittingPostpone, setSubmittingPostpone] = useState(false);

  // ── Confirm Dose modal (recurring) ───────────────────────────────────────
  const [confirmDoseVac, setConfirmDoseVac] = useState(null);
  const [isConfirmDoseOpen, setIsConfirmDoseOpen] = useState(false);
  const [doseAdminDate, setDoseAdminDate] = useState('');
  const [doseRepeatMonths, setDoseRepeatMonths] = useState('');
  const [submittingDose, setSubmittingDose] = useState(false);

  // Delete / Stop modals
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [stopTargetId, setStopTargetId] = useState(null);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);

  // one_time confirm
  const [confirmTargetId, setConfirmTargetId] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Filter
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setSelectedVaccination(response?.success ? response.data : vac);
    } catch {
      setSelectedVaccination(vac);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── تأكيد الجرعة: one_time → مباشر، recurring → modal ───────────────────
  const handleConfirmCompleted = (vac) => {
    if (vac.vaccine_type === 'recurring') {
      setConfirmDoseVac(vac);
      setDoseAdminDate(new Date().toISOString().split('T')[0]);
      setDoseRepeatMonths(vac.repeat_every_months || '');
      setIsConfirmDoseOpen(true);
    } else {
      setConfirmTargetId(vac._id);
      setIsConfirmModalOpen(true);
    }
  };

  // ── تأكيد الجرعة (one_time) ──────────────────────────────────────────────
  const executeConfirmOneTime = async () => {
    const vacId = confirmTargetId;
    setIsConfirmModalOpen(false);
    setConfirmTargetId(null);
    try {
      await dispatch(editVaccination({ vacId, data: { completed: true } })).unwrap();
      toast.success('تم تأكيد إتمام التطعيم بنجاح');
      dispatch(fetchAnimalVaccinations(id));
    } catch (err) {
      toast.error(err || 'فشل في تحديث حالة التطعيم');
    }
  };

  // ── تأكيد الجرعة (recurring) — مع administration_date ────────────────────
  const executeConfirmDose = async (e) => {
    e.preventDefault();
    if (!doseAdminDate) { toast.error('تاريخ إعطاء الجرعة مطلوب'); return; }
    setSubmittingDose(true);
    try {
      const payload = {
        completed: true,
        administration_date: doseAdminDate,
      };
      if (doseRepeatMonths) payload.repeat_every_months = Number(doseRepeatMonths);

      await dispatch(editVaccination({ vacId: confirmDoseVac._id, data: payload })).unwrap();
      toast.success('تم تسجيل الجرعة — الموعد القادم تم حسابه تلقائياً');
      setIsConfirmDoseOpen(false);
      setConfirmDoseVac(null);
      dispatch(fetchAnimalVaccinations(id));
    } catch (err) {
      toast.error(err || 'حدث خطأ');
    } finally {
      setSubmittingDose(false);
    }
  };

  // ── تأجيل ────────────────────────────────────────────────────────────────
  const handleOpenPostpone = (vac) => {
    setPostponeVaccination(vac);
    const currentDate = vac.vaccine_type === 'one_time' ? vac.scheduled_date : vac.next_due_date;
    setNewDate(currentDate ? new Date(currentDate).toISOString().split('T')[0] : '');
    setPostponeNotes(vac.notes || '');
    setIsPostponeOpen(true);
  };

  const handlePostponeSubmit = async (e) => {
    e.preventDefault();
    if (!newDate) { toast.error('يرجى اختيار التاريخ الجديد'); return; }
    setSubmittingPostpone(true);
    try {
      const isOneTime = postponeVaccination.vaccine_type === 'one_time';
      await dispatch(editVaccination({
        vacId: postponeVaccination._id,
        data: {
          notes: postponeNotes.trim(),
          [isOneTime ? 'scheduled_date' : 'next_due_date']: newDate,
        },
      })).unwrap();
      toast.success('تم تأجيل موعد التطعيم');
      setIsPostponeOpen(false);
      setPostponeVaccination(null);
      dispatch(fetchAnimalVaccinations(id));
      if (selectedVaccination?._id === postponeVaccination._id) setIsDetailsOpen(false);
    } catch (err) {
      toast.error(err || 'حدث خطأ');
    } finally {
      setSubmittingPostpone(false);
    }
  };

  // ── حذف ──────────────────────────────────────────────────────────────────
  const handleDelete = (vacId) => { setDeleteTargetId(vacId); setIsDeleteModalOpen(true); };
  const executeDelete = async () => {
    const vacId = deleteTargetId;
    setIsDeleteModalOpen(false); setDeleteTargetId(null);
    try {
      setDeletingId(vacId);
      await dispatch(deleteVaccination(vacId)).unwrap();
      toast.success('تم حذف سجل التطعيم بنجاح');
      setIsDetailsOpen(false);
      dispatch(fetchAnimalVaccinations(id));
    } catch (err) {
      toast.error(err || 'فشل في الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  // ── إيقاف متابعة اللقاح ──────────────────────────────────────────────────
  const handleStop = (vacId) => { setStopTargetId(vacId); setIsStopModalOpen(true); };
  const executeStop = async () => {
    const vacId = stopTargetId;
    setIsStopModalOpen(false); setStopTargetId(null);
    try {
      await dispatch(editVaccination({ vacId, data: { is_active: false } })).unwrap();
      toast.success('تم إيقاف متابعة اللقاح — السجل محفوظ');
      setIsDetailsOpen(false);
      dispatch(fetchAnimalVaccinations(id));
    } catch (err) {
      toast.error(err || 'حدث خطأ');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateStr; }
  };

  const getStatus = (vac) => {
    if (!vac.is_active) return { label: 'موقوف', color: 'bg-stone-50 text-stone-500 border-stone-200', dot: 'bg-stone-400' };
    if (vac.completed) return { label: 'مكتمل', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' };
    const dateStr = vac.vaccine_type === 'one_time' ? vac.scheduled_date : vac.next_due_date;
    if (!dateStr) return { label: 'قيد الانتظار', color: 'bg-stone-50 text-stone-600 border-stone-200', dot: 'bg-stone-400' };
    const date = new Date(dateStr); const today = new Date();
    today.setHours(0, 0, 0, 0); date.setHours(0, 0, 0, 0);
    if (date < today) return { label: 'متأخر', color: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500' };
    return { label: 'مجدول', color: 'bg-blue-50/80 text-blue-700 border-blue-100', dot: 'bg-blue-500' };
  };

  const getSpeciesLabel = (s) => ({ cattle: 'أبقار', sheep: 'أغنام', goat: 'ماعز' }[s] || s || 'غير محدد');
  const getTodayString = () => new Date().toISOString().split('T')[0];

  if (loading.animal && !animal) {
    return <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center font-cairo"><Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen font-cairo relative pb-12" dir="rtl">

      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="fixed inset-0 z-0 bg-[#fbf9f6]/80 backdrop-blur-[2px]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-[#1b4d2c] border-b border-[#154022] sticky top-0 z-20 shadow-md">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(`/animals/${id}`)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-[17px] font-bold text-white">سجل تطعيمات الحيوان</h1>
                <p className="text-[11px] text-white/60 font-medium">
                  تحصينات الحيوان: <span className="font-semibold text-white">#{animal?.tag_number || '...'}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter */}
              <div className="relative" ref={filterRef}>
                <button onClick={() => setIsFilterOpen(p => !p)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${filterStatus !== 'all' ? 'bg-white text-[#1b4d2c] border-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
                  {filterStatus === 'completed' ? 'مكتمل' : filterStatus === 'scheduled' ? 'مجدول' : 'الكل'}
                </button>
                {isFilterOpen && (
                  <div className="absolute top-full mt-1.5 left-0 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-30 min-w-[130px] py-1.5">
                    {[
                      { key: 'all', label: 'الكل', dot: 'bg-stone-400', textColor: 'text-stone-700' },
                      { key: 'completed', label: 'مكتمل', dot: 'bg-green-500', textColor: 'text-green-700' },
                      { key: 'scheduled', label: 'مجدول', dot: 'bg-blue-500', textColor: 'text-blue-700' },
                    ].map(({ key, label, dot, textColor }) => (
                      <button key={key} onClick={() => { setFilterStatus(key); setIsFilterOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-stone-50 ${filterStatus === key ? 'bg-stone-50' : ''}`}>
                        <span className={`w-2 h-2 rounded-full ${dot}`} />
                        <span className={textColor}>{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => navigate(`/animals/${id}/vaccinations/add`)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#2a5c2a] text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold hover:bg-[#1f451f] transition-colors shadow-sm whitespace-nowrap">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="sm:hidden">إضافة تطعيم</span>
                <span className="hidden sm:inline">إضافة تطعيم جديد</span>
              </button>
            </div>
          </div>
        </div>

        <main className="max-w-[1300px] mx-auto px-6 py-8">
          {loading.vaccinations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 animate-pulse">
                  <div className="flex justify-between"><div className="h-4 bg-stone-200 rounded w-1/3"></div><div className="h-6 bg-stone-200 rounded-full w-16"></div></div>
                  <div className="space-y-2"><div className="h-3 bg-stone-100 rounded w-2/3"></div><div className="h-3 bg-stone-100 rounded w-1/2"></div></div>
                </div>
              ))}
            </div>
          ) : error?.vaccinations ? (
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />{error.vaccinations}
            </div>
          ) : !vaccinations || vaccinations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto mt-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#2a5c2a] flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <Syringe className="w-8 h-8" />
              </div>
              <p className="font-bold text-stone-800 text-lg">لا توجد تطعيمات مسجلة بعد</p>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">سجل تطعيمات الحيوان يساعد على حمايته وتجنب انتشار الأوبئة.</p>
              <button onClick={() => navigate(`/animals/${id}/vaccinations/add`)}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#2a5c2a] text-white rounded-xl text-xs font-bold hover:bg-[#1f451f] transition-all">
                <Plus className="w-4 h-4" />سجل أول تطعيم الآن
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-start">
              {(() => {
                const filtered = [...vaccinations].filter(vac => {
                  if (filterStatus === 'completed') return vac.completed;
                  if (filterStatus === 'scheduled') return !vac.completed;
                  return true;
                });
                const scheduled = filtered.filter(vac => !vac.completed);
                const completed = filtered.filter(vac => vac.completed);

                const renderCard = (vac) => {
                  const status = getStatus(vac);
                  return (
                    <div key={vac._id}
                      className={`flex-1 min-w-[300px] sm:min-w-[370px] max-w-[420px] bg-white border border-stone-200/80 border-t-4 border-t-[#1b4d2c] rounded-[28px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 relative flex flex-col group overflow-hidden min-h-[326px] ${!vac.is_active ? 'opacity-70' : ''}`}>

                      {/* Content Area */}
                      <div className="p-8 flex-1 flex flex-col text-right justify-start gap-4">
                        {/* Top Row: type badge (left) & status badge (right) */}
                        <div className="flex items-center justify-between gap-2 w-full" dir="rtl">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${vac.vaccine_type === 'one_time'
                              ? 'bg-purple-50 text-purple-700 border border-purple-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                            {vac.vaccine_type === 'one_time' ? 'لمرة واحدة' : 'متكرر'}
                          </span>

                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                            {status.label}
                          </span>
                        </div>

                        {/* Content Section */}
                        <div className="cursor-pointer flex-1 mt-2" onClick={() => handleOpenDetails(vac)}>
                          <h3 className="font-black text-stone-800 text-xl leading-tight group-hover:text-[#1b4d2c] transition-colors mb-4">
                            {vac.vaccine_name}
                          </h3>
                          <div className="space-y-3.5 text-xs font-medium text-stone-400">
                            {vac.dose_ml && (
                              <p className="flex items-center gap-1">
                                <span>حجم الجرعة:</span>
                                <strong className="font-bold text-stone-600">{vac.dose_ml} مل</strong>
                              </p>
                            )}
                            {vac.vaccine_type === 'recurring' && vac.repeat_every_months && (
                              <p className="flex items-center gap-1">
                                <span>يتكرر كل:</span>
                                <strong className="font-bold text-stone-600">{vac.repeat_every_months} أشهر</strong>
                              </p>
                            )}
                            {vac.vaccine_type === 'recurring' ? (
                              <p className="flex items-center gap-1">
                                <span>الجرعة القادمة:</span>
                                <strong className="font-extrabold text-stone-700">{formatDate(vac.next_due_date)}</strong>
                              </p>
                            ) : (
                              <p className="flex items-center gap-1">
                                <span>موعد اللقاح:</span>
                                <strong className="font-extrabold text-stone-700">{formatDate(vac.scheduled_date)}</strong>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Green Action Area (Footer - Full Width) */}
                      <div className="bg-[#f4faf5] border-t border-[#1b4d2c]/10 px-8 py-4 flex items-center justify-between gap-3 mt-auto w-full">
                        {/* Right side: Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleOpenDetails(vac)}
                            className="w-[120px] flex items-center justify-center py-2.5 px-3 bg-[#1b4d2c] hover:bg-[#2d5a1b] text-white rounded-xl text-xs font-black transition-all shadow-sm">
                            <span>التفاصيل</span>
                          </button>

                          {vac.is_active && !vac.completed && (
                            <button onClick={() => handleConfirmCompleted(vac)}
                              className="flex items-center justify-center px-4 py-2.5 bg-[#1b4d2c] hover:bg-[#2d5a1b] text-white rounded-xl text-xs font-black transition-all shadow-sm">
                              <span>تأكيد</span>
                            </button>
                          )}
                        </div>

                        {/* Left side: Icon Buttons */}
                        <div className="flex items-center gap-2">
                          {vac.is_active && !vac.completed && (
                            <button onClick={() => handleOpenPostpone(vac)}
                              className="p-2 text-blue-600 hover:bg-white rounded-xl border border-stone-200 bg-white transition-all shadow-xs" title="تأجيل الموعد">
                              <CalendarDays className="w-4 h-4" />
                            </button>
                          )}
                          {vac.is_active && vac.vaccine_type === 'recurring' && (
                            <button onClick={() => handleStop(vac._id)}
                              className="p-2 text-amber-600 hover:bg-white rounded-xl border border-stone-200 bg-white transition-all shadow-xs" title="إيقاف متابعة اللقاح">
                              <PauseCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(vac._id)}
                            className="p-2 text-rose-600 hover:bg-white rounded-xl border border-stone-200 bg-white transition-all shadow-xs" title="حذف السجل">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="space-y-10">
                    {/* Scheduled Section */}
                    {scheduled.length > 0 && (
                      <div className="space-y-4">
                        {filterStatus === 'all' && (
                          <h3 className="text-sm font-bold text-stone-500 text-right pr-2">اللقاحات المجدولة والقادمة</h3>
                        )}
                        <div className="flex flex-wrap gap-6 justify-start">
                          {scheduled.map(renderCard)}
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    {scheduled.length > 0 && completed.length > 0 && (
                      <div className="w-full border-t border-stone-200/50 pt-2" />
                    )}

                    {/* Completed Section */}
                    {completed.length > 0 && (
                      <div className="space-y-4">
                        {filterStatus === 'all' && (
                          <h3 className="text-sm font-bold text-stone-500 text-right pr-2">اللقاحات المكتملة</h3>
                        )}
                        <div className="flex flex-wrap gap-6 justify-start">
                          {completed.map(renderCard)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </main>

        {/* ── CONFIRM DOSE MODAL (recurring) ──────────────────────────────────── */}
        {isConfirmDoseOpen && confirmDoseVac && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-[#f2f8f3] rounded-[32px] max-w-md w-full shadow-2xl border border-[#154b23]/20 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
              <div className="relative bg-[#154b23] p-6 text-white flex items-center justify-between">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="relative z-10">
                  <h3 className="font-extrabold text-white text-lg">تسجيل إعطاء الجرعة</h3>
                  <p className="text-[13px] text-white/80 mt-0.5">{confirmDoseVac.vaccine_name}</p>
                </div>
                <button onClick={() => { setIsConfirmDoseOpen(false); setConfirmDoseVac(null); }}
                  className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/80 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={executeConfirmDose} className="p-6 sm:p-8 space-y-5">
                <p className="text-[13px] text-gray-500 leading-relaxed bg-white p-3 rounded-xl border border-[#154b23]/10 shadow-sm">
                  أدخل تاريخ إعطاء الجرعة وسيتم حساب موعد الجرعة القادمة تلقائياً.
                </p>
                <div>
                  <label className="block text-[14px] font-bold text-[#1b4d2c] mb-2">تاريخ إعطاء الجرعة <span className="text-red-500">*</span></label>
                  <input type="date" required max={getTodayString()}
                    value={doseAdminDate} onChange={e => setDoseAdminDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-transparent focus:border-[#154b23] rounded-2xl text-[14px] outline-none focus:shadow-[0_0_0_4px_rgba(21,75,35,0.1)] transition-all font-cairo bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-[#1b4d2c] mb-2">يتكرر كل (أشهر) — اختياري للتعديل</label>
                  <input type="number" min="1" max="120" placeholder={`الحالي: ${confirmDoseVac.repeat_every_months || '—'} شهر`}
                    value={doseRepeatMonths} onChange={e => setDoseRepeatMonths(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-transparent focus:border-[#154b23] rounded-2xl text-[14px] outline-none focus:shadow-[0_0_0_4px_rgba(21,75,35,0.1)] transition-all font-cairo bg-white shadow-sm" />
                </div>
                <div className="pt-4 flex items-center gap-3">
                  <button type="button" onClick={() => { setIsConfirmDoseOpen(false); setConfirmDoseVac(null); }}
                    className="flex-1 py-3 bg-white border border-[#154b23]/10 shadow-sm rounded-2xl text-[14px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                    إلغاء
                  </button>
                  <button type="submit" disabled={submittingDose}
                    className="flex-1 py-3 bg-[#154b23] hover:bg-[#0f3619] text-white rounded-2xl text-[14px] font-bold transition-all shadow-md disabled:opacity-75 flex items-center justify-center gap-1.5">
                    {submittingDose ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />تأكيد الجرعة</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── DETAILS MODAL ────────────────────────────────────────────────────── */}
        {isDetailsOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-xs" onClick={() => setIsDetailsOpen(false)}>
            <div className="bg-[#f2f8f3] rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl border border-[#154b23]/20 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="relative bg-[#154b23] px-6 py-8 text-white flex items-center justify-between">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                    <Syringe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-xl mb-1">تفاصيل سجل التطعيم</h3>
                    <p className="text-xs text-white/80 font-medium">البيانات الكاملة للقاح المسجل</p>
                  </div>
                </div>
                <button onClick={() => setIsDetailsOpen(false)} className="relative z-10 p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
                {loadingDetail ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-3">
                    <Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin" />
                    <p className="text-xs text-stone-400">جاري جلب التفاصيل...</p>
                  </div>
                ) : selectedVaccination ? (
                  <>
                    <div className="bg-white rounded-2xl p-4 border border-[#154b23]/10 grid grid-cols-2 gap-3 text-xs shadow-sm">
                      <div>
                        <span className="text-gray-500 block mb-1">الحيوان (رقم التعريف)</span>
                        <strong className="text-[#1b4d2c] flex items-center gap-1.5 font-bold text-[15px]">
                          <Tag className="w-4 h-4 text-[#1b4d2c]/60" />
                          {selectedVaccination.animal_id?.tag_number || animal?.tag_number || '—'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">الفصيلة / النوع</span>
                        <strong className="font-extrabold text-[15px] text-gray-800">{getSpeciesLabel(selectedVaccination.animal_id?.species || animal?.species)}</strong>
                      </div>
                    </div>

                    <div className="space-y-3 bg-white rounded-2xl p-5 border border-[#154b23]/10 shadow-sm">
                      {[
                        { label: 'اسم التطعيم', value: selectedVaccination.vaccine_name, bold: true },
                        { label: 'نوع التطعيم', value: selectedVaccination.vaccine_type === 'one_time' ? 'لمرة واحدة (طارئ)' : 'متكرر (دوري)' },
                        selectedVaccination.administration_date && { label: 'تاريخ آخر جرعة', value: formatDate(selectedVaccination.administration_date) },
                        selectedVaccination.repeat_every_months && { label: 'يتكرر كل', value: `${selectedVaccination.repeat_every_months} شهر` },
                        selectedVaccination.dose_ml && { label: 'حجم الجرعة', value: `${selectedVaccination.dose_ml} مل` },
                      ].filter(Boolean).map(({ label, value, bold }, idx) => (
                        <div key={label} className={`flex justify-between items-center pb-3 ${idx !== 0 ? 'pt-3 border-t border-gray-100' : ''}`}>
                          <span className="text-[13px] text-gray-500 font-bold">{label}:</span>
                          <span className={`text-[14px] ${bold ? 'font-extrabold text-[#1b4d2c]' : 'font-bold text-gray-800'}`}>{value}</span>
                        </div>
                      ))}

                      {selectedVaccination.vaccine_type === 'recurring' ? (
                        <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3 bg-[#1b4d2c]/5 p-3 rounded-xl">
                          <span className="text-[13px] text-[#1b4d2c] font-extrabold">الجرعة القادمة:</span>
                          <span className="text-[15px] font-black text-gray-900">{formatDate(selectedVaccination.next_due_date)}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3 bg-purple-50/50 p-3 rounded-xl">
                          <span className="text-[13px] text-purple-700 font-extrabold">موعد إعطاء التطعيم:</span>
                          <span className="text-[15px] font-black text-gray-900">{formatDate(selectedVaccination.scheduled_date)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                        <span className="text-[13px] text-gray-500 font-bold">حالة المتابعة:</span>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${selectedVaccination.is_active ? 'bg-[#1b4d2c]/10 text-[#1b4d2c]' : 'bg-gray-100 text-gray-500'}`}>
                          {selectedVaccination.is_active ? 'نشط' : 'موقوف'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                        <span className="text-[13px] text-gray-500 font-bold">حالة الجرعة:</span>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${selectedVaccination.completed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {selectedVaccination.completed ? <><Check className="w-3.5 h-3.5" />تم الإعطاء</> : 'قيد الانتظار'}
                        </span>
                      </div>

                      {selectedVaccination.administered_by && (
                        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                          <span className="text-[13px] text-gray-500 font-bold">أُعطيت بواسطة:</span>
                          <span className="text-[14px] font-bold text-gray-800 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-gray-400" />{selectedVaccination.administered_by}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedVaccination.notes && (
                      <div className="bg-white border border-[#154b23]/10 rounded-2xl p-4 shadow-sm">
                        <span className="text-[12px] font-bold text-[#1b4d2c] block mb-2 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />ملاحظات خاصة:
                        </span>
                        <p className="text-[13px] text-gray-600 leading-relaxed">{selectedVaccination.notes}</p>
                      </div>
                    )}

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <button onClick={() => { setIsDetailsOpen(false); navigate(`/animals/${id}/vaccinations/edit/${selectedVaccination._id}`); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white hover:bg-gray-50 text-[#1b4d2c] rounded-xl text-[13px] font-bold transition-all border border-[#154b23]/10 shadow-sm">
                        <Edit className="w-4 h-4" />تعديل
                      </button>
                      <button onClick={() => handleOpenPostpone(selectedVaccination)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[13px] font-bold transition-all border border-blue-200 shadow-sm">
                        <CalendarDays className="w-4 h-4" />تأجيل
                      </button>
                      {selectedVaccination.is_active && !selectedVaccination.completed && (
                        <button onClick={() => handleConfirmCompleted(selectedVaccination)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-[#154b23] hover:bg-[#0f3619] text-white rounded-xl text-[13px] font-bold transition-all shadow-md">
                          <Check className="w-4 h-4" />تأكيد الإعطاء
                        </button>
                      )}
                      <button onClick={() => handleDelete(selectedVaccination._id)} disabled={deletingId === selectedVaccination._id}
                        className="px-4 py-3 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-[13px] font-bold transition-all disabled:opacity-50 bg-white shadow-sm" title="حذف">
                        <Trash2 className="w-4 h-4" />
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

        {/* ── POSTPONE MODAL ────────────────────────────────────────────────────── */}
        {isPostponeOpen && postponeVaccination && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-[#f2f8f3] rounded-[32px] max-w-md w-full shadow-2xl border border-[#154b23]/20 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
              <div className="relative bg-[#154b23] p-6 text-white flex items-center justify-between">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <h3 className="relative z-10 font-extrabold text-white text-lg">تأجيل موعد التطعيم</h3>
                <button onClick={() => { setIsPostponeOpen(false); setPostponeVaccination(null); }}
                  className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/80 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handlePostponeSubmit} className="p-6 sm:p-8 space-y-5">
                <p className="text-[13px] text-gray-600 bg-white p-3 rounded-xl border border-[#154b23]/10 shadow-sm">
                  لقاح: <strong className="text-[#1b4d2c] font-bold">{postponeVaccination.vaccine_name}</strong>
                </p>
                <div>
                  <label className="block text-[14px] font-bold text-[#1b4d2c] mb-2">التاريخ الجديد <span className="text-red-500">*</span></label>
                  <input type="date" required min={getTodayString()} value={newDate} onChange={e => setNewDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-transparent focus:border-[#154b23] rounded-2xl text-[14px] outline-none focus:shadow-[0_0_0_4px_rgba(21,75,35,0.1)] transition-all font-cairo bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-[#1b4d2c] mb-2">سبب التأجيل</label>
                  <textarea rows={3} value={postponeNotes} onChange={e => setPostponeNotes(e.target.value)}
                    placeholder="مثال: تأجيل نظراً لعدم استقرار الحالة الصحية..."
                    className="w-full px-4 py-3 border-2 border-transparent focus:border-[#154b23] rounded-2xl text-[14px] outline-none focus:shadow-[0_0_0_4px_rgba(21,75,35,0.1)] transition-all font-cairo bg-white resize-none shadow-sm" />
                </div>
                <div className="pt-4 flex items-center gap-3">
                  <button type="button" onClick={() => { setIsPostponeOpen(false); setPostponeVaccination(null); }}
                    className="flex-1 py-3 bg-white border border-[#154b23]/10 shadow-sm rounded-2xl text-[14px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                    إلغاء
                  </button>
                  <button type="submit" disabled={submittingPostpone}
                    className="flex-1 py-3 bg-[#154b23] text-white rounded-2xl text-[14px] font-bold hover:bg-[#0f3619] transition-colors shadow-md disabled:opacity-75 flex items-center justify-center gap-1.5">
                    {submittingPostpone ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ الموعد الجديد'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── DELETE MODAL ────────────────────────────────────────────────────── */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer" onClick={() => { setIsDeleteModalOpen(false); setDeleteTargetId(null); }}>
            <div className="bg-white rounded-[20px] max-w-sm w-full shadow-xl border border-stone-100 animate-in fade-in zoom-in-95 duration-200 cursor-default" onClick={e => e.stopPropagation()}>
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100"><Trash2 className="w-7 h-7" /></div>
                <h3 className="font-extrabold text-stone-900 text-lg mb-2">حذف سجل التطعيم</h3>
                <p className="text-sm text-stone-500 leading-relaxed">هل أنت متأكد من حذف هذا التطعيم نهائياً؟<br /><span className="text-rose-500 font-bold text-xs">هذا الإجراء لا يمكن التراجع عنه.</span></p>
              </div>
              <div className="px-6 pb-6 flex items-center gap-3">
                <button onClick={() => { setIsDeleteModalOpen(false); setDeleteTargetId(null); }}
                  className="flex-1 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors">إلغاء</button>
                <button onClick={executeDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5">
                  <Trash2 className="w-4 h-4" />نعم، احذف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STOP MODAL ──────────────────────────────────────────────────────── */}
        {isStopModalOpen && (
          <div className="fixed inset-0 z-[60] bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer" onClick={() => { setIsStopModalOpen(false); setStopTargetId(null); }}>
            <div className="bg-white rounded-[20px] max-w-sm w-full shadow-xl border border-stone-100 animate-in fade-in zoom-in-95 duration-200 cursor-default" onClick={e => e.stopPropagation()}>
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100"><PauseCircle className="w-7 h-7" /></div>
                <h3 className="font-extrabold text-stone-900 text-lg mb-2">إيقاف متابعة اللقاح</h3>
                <p className="text-sm text-stone-500 leading-relaxed">سيتوقف نظام التذكير لهذا اللقاح.<br /><span className="text-amber-600 font-bold text-xs">السجل سيظل محفوظاً ويمكن تفعيله مجدداً.</span></p>
              </div>
              <div className="px-6 pb-6 flex items-center gap-3">
                <button onClick={() => { setIsStopModalOpen(false); setStopTargetId(null); }}
                  className="flex-1 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors">إلغاء</button>
                <button onClick={executeStop}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5">
                  <PauseCircle className="w-4 h-4" />نعم، أوقف المتابعة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CONFIRM ONE_TIME MODAL ───────────────────────────────────────────── */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[60] bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer" onClick={() => { setIsConfirmModalOpen(false); setConfirmTargetId(null); }}>
            <div className="bg-white rounded-[20px] max-w-sm w-full shadow-xl border border-stone-100 animate-in fade-in zoom-in-95 duration-200 cursor-default" onClick={e => e.stopPropagation()}>
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100"><CheckCircle className="w-7 h-7" /></div>
                <h3 className="font-extrabold text-stone-900 text-lg mb-2">تأكيد إعطاء التطعيم</h3>
                <p className="text-sm text-stone-500 leading-relaxed">هل تأكد أن هذا التطعيم قد أُعطي للحيوان؟<br /><span className="text-emerald-600 font-bold text-xs">سيتم تسجيله كمكتمل.</span></p>
              </div>
              <div className="px-6 pb-6 flex items-center gap-3">
                <button onClick={() => { setIsConfirmModalOpen(false); setConfirmTargetId(null); }}
                  className="flex-1 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors">إلغاء</button>
                <button onClick={executeConfirmOneTime}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />نعم، تأكيد
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AnimalVaccinationsPage;
