import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Loader2, Stethoscope, AlertCircle } from 'lucide-react';
import { fetchAnimalById, addMedicalRecord } from '../../redux/animalSlice';

// ─── Backend HealthCase Model (Mapping) ──────────────────────────────────────
// The user requested: Disease Name, Symptoms, Diagnosis Date, Recovery Status, Notes.
// We map these to the backend model:
// - Symptoms -> `symptoms` (Array of Strings)
// - Disease Name -> `ai_diagnosis` (Manual override of AI)
// - Recovery Status -> `resolved` (Boolean)
// - Notes -> (Merged into symptoms or sent as extra)
// ─────────────────────────────────────────────────────────────────────────────

const AddMedicalRecordPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal, loading, error } = useSelector((state) => state.animal);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      input_type: 'text',
      resolved: 'false',
    }
  });

  const isResolved = watch('resolved') === 'true';

  useEffect(() => {
    if (id && (!animal || animal._id !== id)) {
      dispatch(fetchAnimalById(id));
    }
  }, [dispatch, id, animal]);

  const onSubmit = async (data) => {
    // Backend expects an array of symptoms (1 to 20 items)
    const symptomsArray = data.symptoms
      .split(/[\n,،]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (data.notes) {
      symptomsArray.push(`ملاحظات إضافية: ${data.notes.trim()}`);
    }

    if (symptomsArray.length === 0) {
      symptomsArray.push('حالة مرضية عامة');
    }

    const payload = {
      symptoms:      symptomsArray.slice(0, 20), // Max 20 according to backend validation
      input_type:    'text',
      ai_diagnosis:  data.disease_name.trim() || undefined,
      resolved:      data.resolved === 'true',
      vet_consulted: true, // Assuming manual entry implies vet/human consultation
      // severity could be added here if desired, e.g. based on resolved status
    };

    try {
      await dispatch(addMedicalRecord({ id, data: payload })).unwrap();
      navigate(`/animals/${id}`);
    } catch (err) {
      // Error handled by Redux state
    }
  };

  const inputCls = (hasError) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all font-cairo bg-white
     ${hasError
      ? 'border-red-400 focus:ring-2 focus:ring-red-200'
      : 'border-gray-200 focus:ring-2 focus:ring-[#2a5c2a]/20 focus:border-[#2a5c2a]'}`;

  const labelCls = 'block text-[13px] font-bold text-gray-700 mb-2';

  if (loading.animal && !animal) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5] font-cairo" dir="rtl">
      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-gray-900">إضافة سجل طبي</h1>
              <p className="text-[11px] text-gray-400 font-medium">سجل صحي للحيوان: {animal?.name}</p>
            </div>
          </div>
          <span className="text-[12px] text-red-600 font-medium bg-red-50 border border-red-100 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5" />
            فحص طبي
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {error?.saving && (
          <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error.saving}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ── Section 1: Basic Info ──────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              تفاصيل الحالة الطبية <span className="text-red-400 text-[11px] font-medium mr-1">* مطلوب</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Disease Name */}
              <div className="md:col-span-2">
                <label className={labelCls}>اسم المرض / التشخيص المبدئي</label>
                <input
                  type="text"
                  {...register('disease_name', { maxLength: { value: 200, message: 'الاسم طويل جداً' } })}
                  placeholder="مثال: التهاب الضرع، حمى..."
                  className={inputCls(errors.disease_name)}
                />
                {errors.disease_name && <p className="text-[11px] text-red-500 mt-1">{errors.disease_name.message}</p>}
              </div>

              {/* Diagnosis Date */}
              <div>
                <label className={labelCls}>تاريخ الفحص / التشخيص</label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  defaultValue={new Date().toISOString().split('T')[0]}
                  {...register('diagnosis_date')}
                  className={inputCls(errors.diagnosis_date)}
                />
              </div>

              {/* Recovery Status */}
              <div>
                <label className={labelCls}>حالة الشفاء (Recovery Status)</label>
                <select
                  {...register('resolved')}
                  className={`${inputCls(errors.resolved)} bg-white`}
                >
                  <option value="false">تحت العلاج / مريض</option>
                  <option value="true">تم الشفاء</option>
                </select>
              </div>

              {/* Symptoms */}
              <div className="md:col-span-2">
                <label className={labelCls}>الأعراض الملحوظة <span className="text-red-400">*</span></label>
                <textarea
                  {...register('symptoms', { required: 'يرجى إدخال عرض واحد على الأقل' })}
                  rows={3}
                  placeholder="افصل بين الأعراض بفاصلة (،) أو سطر جديد. مثال: ارتفاع الحرارة، فقدان الشهية..."
                  className={`${inputCls(errors.symptoms)} resize-none`}
                />
                {errors.symptoms && <p className="text-[11px] text-red-500 mt-1">{errors.symptoms.message}</p>}
              </div>
            </div>
          </div>

          {/* ── Section 2: Notes ───────────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">ملاحظات إضافية</h2>
            <div>
              <label className={labelCls}>أي ملاحظات حول العلاج، الأدوية، أو توصيات الطبيب</label>
              <textarea
                {...register('notes', { maxLength: { value: 1000, message: 'الملاحظات طويلة جداً' } })}
                rows={4}
                placeholder="تفاصيل الأدوية الموصوفة وتوصيات الرعاية..."
                className={`${inputCls(errors.notes)} resize-none`}
              />
              {errors.notes && <p className="text-[11px] text-red-500 mt-1">{errors.notes.message}</p>}
            </div>
          </div>

          {/* ── Action Buttons ────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading.saving}
              className="flex items-center gap-2 px-8 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm shadow-red-900/20 disabled:opacity-70"
            >
              {loading.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ السجل الطبي
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default AddMedicalRecordPage;
