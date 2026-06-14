import React from 'react';
import { Syringe, Calendar, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';

const VaccinationOverview = ({ vaccinations, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Syringe className="w-5 h-5 text-indigo-500" />
          نظرة عامة على التطعيمات
        </h3>
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> مكتمل</span>;
      case 'pending':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold"><Clock className="w-3.5 h-3.5" /> قادم</span>;
      case 'overdue':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold"><AlertCircle className="w-3.5 h-3.5" /> متأخر</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{status || 'غير محدد'}</span>;
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Syringe className="w-5 h-5 text-indigo-600" />
          </div>
          نظرة عامة على التطعيمات
        </h3>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">عرض الكل</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-sm font-medium text-gray-500 w-1/3">اسم التطعيم</th>
              <th className="pb-3 text-sm font-medium text-gray-500">تاريخ التطعيم</th>
              <th className="pb-3 text-sm font-medium text-gray-500">الجرعة القادمة</th>
              <th className="pb-3 text-sm font-medium text-gray-500">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(!vaccinations || vaccinations.length === 0) ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-sm text-gray-500">
                  لا توجد تطعيمات مسجلة
                </td>
              </tr>
            ) : (
              vaccinations.map((vax) => (
                <tr key={vax._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-sm font-semibold text-gray-900">{vax.name}</td>
                  <td className="py-4 text-sm text-gray-600 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {vax.date ? new Date(vax.date).toLocaleDateString('ar-EG') : '—'}
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {vax.nextDose ? new Date(vax.nextDose).toLocaleDateString('ar-EG') : '—'}
                  </td>
                  <td className="py-4">
                    {getStatusBadge(vax.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VaccinationOverview;
