import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowRight, Syringe, Loader2, Calendar, AlertCircle, Plus, 
  Trash2, Edit, CheckCircle, Clock 
} from 'lucide-react';
import { fetchAnimalById, fetchAnimalVaccinations, deleteVaccination } from '../../redux/animalSlice';
import toast from 'react-hot-toast';

const AnimalVaccinationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal, vaccinations, loading, error } = useSelector((state) => state.animal);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchAnimalById(id));
      dispatch(fetchAnimalVaccinations(id));
    }
  }, [dispatch, id]);

  const handleDelete = async (vacId) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا السجل بشكل نهائي؟')) {
      try {
        setDeletingId(vacId);
        await dispatch(deleteVaccination(vacId)).unwrap();
        toast.success('تم حذف سجل التطعيم بنجاح');
      } catch (err) {
        toast.error(err || 'فشل في حذف سجل التطعيم');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) > new Date();
  };

  if (loading.animal || loading.vaccinations) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center font-cairo">
        <Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5] font-cairo" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-gray-900">سجل التطعيمات</h1>
              <p className="text-[11px] text-gray-400 font-medium">التحصينات الطبية للحيوان: {animal?.name || animal?.tag_number}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/animals/${id}/vaccinations/add`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            إضافة تطعيم
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error.vaccinations ? (
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error.vaccinations}
          </div>
        ) : !vaccinations || vaccinations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            <Syringe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-semibold text-gray-600">لا توجد تطعيمات مسجلة بعد</p>
            <p className="text-xs text-gray-400 mt-1">سجل التطعيمات يساعد على حماية قطيعك من الأوبئة.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vaccinations.map((vac) => {
              const upcoming = isUpcoming(vac.next_due_date);
              return (
                <div key={vac._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
                        <Syringe className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-base">{vac.vaccine_name}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">الجرعة: {vac.dose_ml ? `${vac.dose_ml} مل` : 'غير محدد'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/animals/${id}/vaccinations/edit/${vac._id}`)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        disabled={deletingId === vac._id}
                        onClick={() => handleDelete(vac._id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                        title="حذف"
                      >
                        {deletingId === vac._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>تاريخ آخر جرعة: <strong className="text-gray-900">{formatDate(vac.last_date)}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      {upcoming ? <Clock className="w-4 h-4 text-blue-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                      <span>موعد الجرعة القادمة: <strong className="text-gray-900">{formatDate(vac.next_due_date)}</strong></span>
                    </div>

                    {vac.administered_by && (
                      <div className="sm:col-span-2">
                        <span className="text-xs text-gray-400">بواسطة الطبيب/المشرف:</span>
                        <p className="font-bold text-gray-800 text-xs mt-0.5">{vac.administered_by}</p>
                      </div>
                    )}

                    {vac.notes && (
                      <div className="sm:col-span-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-[11px] font-bold text-gray-400 block mb-1">ملاحظات:</span>
                        <p className="text-xs text-gray-600 leading-relaxed">{vac.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnimalVaccinationsPage;
