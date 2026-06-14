import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { fetchAnimalById, updateExistingAnimal } from '../../redux/animalSlice';
import { fetchMyFarms } from '../../redux/farmSlice';

// ─── Backend Animal Model ─────────────────────────────────────────────────────
// Editable fields according to updateAnimal controller:
// ["name", "weight_kg", "health_status", "notes", "breed", "tag_number", "gender", "birth_date"]
// species and farm_id are not in allowedFields for update in the backend!
// ─────────────────────────────────────────────────────────────────────────────

const EditAnimalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal, loading, error } = useSelector((state) => state.animal);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  useEffect(() => {
    if (id) {
      dispatch(fetchAnimalById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (animal) {
      // Pre-fill the form with existing animal data
      // Note: we only pre-fill fields that the backend allows updating
      reset({
        name: animal.name || '',
        tag_number: animal.tag_number || '',
        breed: animal.breed || '',
        gender: animal.gender || '',
        birth_date: animal.birth_date ? new Date(animal.birth_date).toISOString().split('T')[0] : '',
        weight_kg: animal.weight_kg || '',
        health_status: animal.health_status || 'healthy',
        notes: animal.notes || '',
      });
      if (animal.imageUrl) {
        setImagePreview(animal.imageUrl);
      }
    }
  }, [animal, reset]);

  const onSubmit = async (data) => {
    const payload = {
      name:          data.name.trim(),
      gender:        data.gender,
      birth_date:    data.birth_date,
      health_status: data.health_status,
      ...(data.tag_number && { tag_number:  data.tag_number.trim() }),
      ...(data.breed      && { breed:       data.breed.trim() }),
      ...(data.weight_kg  && { weight_kg:   Number(data.weight_kg) }),
      ...(data.notes      && { notes:       data.notes.trim() }),
    };

    try {
      await dispatch(updateExistingAnimal({ id, data: payload })).unwrap();
      navigate(`/animals/${id}`);
    } catch (err) {
      // Error shown via Redux state
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const inputCls = (hasError) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all font-cairo
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
              <h1 className="text-[17px] font-bold text-gray-900">تعديل بيانات الحيوان</h1>
              <p className="text-[11px] text-gray-400 font-medium">تحديث معلومات: {animal?.name}</p>
            </div>
          </div>
          <span className="text-[12px] text-gray-400 font-medium bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
            تعديل بيانات
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {error?.saving && (
          <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
            {error.saving}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ── Section 1: Image ───────────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">صورة الحيوان</h2>
            <div className="flex items-center gap-5">
              <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 hover:border-[#2a5c2a] transition-colors cursor-pointer">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImageIcon className="w-7 h-7 text-gray-300" />
                    <span className="text-[10px] text-gray-400 font-medium">رفع صورة</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-700 mb-1">تحديث صورة الحيوان</p>
                <p className="text-[12px] text-gray-400">JPG, PNG — حجم أقصى 5MB</p>
              </div>
            </div>
          </div>

          {/* ── Section 2: Basic Info ──────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-[14px] font-bold text-gray-900">المعلومات الأساسية</h2>
              {/* Species and Farm are not editable, show them as info */}
              <div className="text-[11px] text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                النوع: {animal?.species} • المزرعة: {animal?.farm_id?.name || '---'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className={labelCls}>اسم الحيوان <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  {...register('name', { required: 'الاسم مطلوب', maxLength: { value: 100, message: 'الاسم طويل جداً' } })}
                  className={inputCls(errors.name)}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              {/* Tag Number */}
              <div>
                <label className={labelCls}>رقم التعريف (الوسم)</label>
                <input
                  type="text"
                  {...register('tag_number')}
                  className={inputCls(false)}
                />
              </div>

              {/* Gender */}
              <div>
                <label className={labelCls}>الجنس <span className="text-red-400">*</span></label>
                <select
                  {...register('gender', { required: 'الجنس مطلوب' })}
                  className={`${inputCls(errors.gender)} bg-white`}
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
                {errors.gender && <p className="text-[11px] text-red-500 mt-1">{errors.gender.message}</p>}
              </div>

              {/* Birth Date */}
              <div>
                <label className={labelCls}>تاريخ الميلاد <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  {...register('birth_date', { required: 'تاريخ الميلاد مطلوب' })}
                  className={inputCls(errors.birth_date)}
                />
                {errors.birth_date && <p className="text-[11px] text-red-500 mt-1">{errors.birth_date.message}</p>}
              </div>

              {/* Breed */}
              <div>
                <label className={labelCls}>السلالة</label>
                <input
                  type="text"
                  {...register('breed', { maxLength: { value: 100, message: 'السلالة طويلة جداً' } })}
                  className={inputCls(errors.breed)}
                />
                {errors.breed && <p className="text-[11px] text-red-500 mt-1">{errors.breed.message}</p>}
              </div>

              {/* Weight */}
              <div>
                <label className={labelCls}>الوزن (كجم)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  {...register('weight_kg', {
                    min: { value: 0.1, message: 'الوزن يجب أن يكون أكبر من صفر' }
                  })}
                  className={inputCls(errors.weight_kg)}
                />
                {errors.weight_kg && <p className="text-[11px] text-red-500 mt-1">{errors.weight_kg.message}</p>}
              </div>

              {/* Health Status */}
              <div>
                <label className={labelCls}>الحالة الصحية <span className="text-red-400">*</span></label>
                <select
                  {...register('health_status', { required: 'الحالة الصحية مطلوبة' })}
                  className={`${inputCls(errors.health_status)} bg-white`}
                >
                  <option value="healthy">سليم</option>
                  <option value="sick">مراقبة / مريض</option>
                  <option value="critical">حالة حرجة</option>
                  <option value="deceased">متوفى</option>
                </select>
                {errors.health_status && <p className="text-[11px] text-red-500 mt-1">{errors.health_status.message}</p>}
              </div>
            </div>
          </div>

          {/* ── Section 3: Notes ──────────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">ملاحظات إضافية</h2>
            <textarea
              {...register('notes', { maxLength: { value: 1000, message: 'الملاحظات طويلة جداً' } })}
              rows={4}
              className={`${inputCls(errors.notes)} resize-none`}
            />
            {errors.notes && <p className="text-[11px] text-red-500 mt-1">{errors.notes.message}</p>}
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
              disabled={loading.saving || !isDirty}
              className="flex items-center gap-2 px-8 py-2.5 bg-[#2a5c2a] text-white rounded-xl text-sm font-bold hover:bg-[#1e4520] transition-colors shadow-sm shadow-green-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              تحديث البيانات
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default EditAnimalPage;
