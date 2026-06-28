import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, HeartPulse, Loader2, Calendar, AlertCircle, Plus, CheckCircle, XCircle } from 'lucide-react';
import { fetchAnimalById, fetchAnimalMedicalHistory } from '../../redux/animalSlice';

const AnimalMedicalRecordsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal, medicalHistory, loading, error } = useSelector((state) => state.animal);

  useEffect(() => {
    if (id) {
      dispatch(fetchAnimalById(id));
      dispatch(fetchAnimalMedicalHistory(id));
    }
  }, [dispatch, id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'red':
        return {
          bg: 'bg-red-50 text-red-700 border-red-100',
          dot: 'bg-red-500',
          label: 'حالة طارئة'
        };
      case 'yellow':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-100',
          dot: 'bg-amber-500',
          label: 'متابعة مستمرة'
        };
      default:
        return {
          bg: 'bg-green-50 text-green-700 border-green-100',
          dot: 'bg-green-500',
          label: 'مستقرة / بسيطة'
        };
    }
  };

  if (loading.animal || loading.medicalHistory) {
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
              <h1 className="text-[17px] font-bold text-gray-900">السجل المرضي والطبي</h1>
              <p className="text-[11px] text-gray-400 font-medium">الملف الطبي للحيوان: {animal?.name || animal?.tag_number}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/animals/${id}/medical-records/add`)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            إضافة فحص طبي
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error.medicalHistory ? (
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error.medicalHistory}
          </div>
        ) : !medicalHistory || medicalHistory.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            <HeartPulse className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-semibold text-gray-600">لا توجد سجلات طبية مسجلة بعد</p>
            <p className="text-xs text-gray-400 mt-1">يمكنك إضافة فحص طبي جديد لتتبع حالة الحيوان الصحية.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medicalHistory.map((item) => {
              const sev = getSeverityStyle(item.severity);
              return (
                <div key={item._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${sev.dot}`} />
                      <h3 className="font-extrabold text-gray-900 text-base">
                        {item.ai_diagnosis || 'فحص صحي عام'}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sev.bg}`}>
                        {sev.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
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

                  <div className="mt-4 space-y-3">
                    {/* Symptoms */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 mb-1">الأعراض الملحوظة:</h4>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                        {Array.isArray(item.symptoms) ? item.symptoms.join(' — ') : item.symptoms || '—'}
                      </p>
                    </div>

                    {/* Actions / Treatment notes */}
                    {item.suggested_actions && item.suggested_actions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 mb-1">الإجراءات الموصى بها والعلاج:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {item.suggested_actions.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
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

export default AnimalMedicalRecordsPage;
