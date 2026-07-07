import React, { useState } from 'react';
import { Search, Plus, Upload, Filter, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AnimalCard from '../../animals/components/AnimalCard';

const FarmAnimalsSection = ({ animals, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { farmId } = useParams();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#fdfbf7]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">جرد الحيوانات</h2>
          <p className="text-sm text-gray-500">إدارة ومراقبة السجلات الصحية لجميع الماشية عبر القطاعات.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
            <Upload className="w-4 h-4" />
            استيراد CSV
          </button>
          <button 
            onClick={() => navigate(farmId ? `/farms/${farmId}/animals/add` : '/animals/add')}
            className="flex-1 md:flex-none px-4 py-2.5 bg-green-400 text-white rounded-xl text-sm font-medium hover:bg-green-500 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-green-200"
          >
            <Plus className="w-4 h-4" />
            إضافة حيوان
          </button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5 md:col-span-1">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors h-[42px]">
              <Filter className="w-4 h-4" />
              المزيد من الفلاتر
            </button>
          </div>
          
          <div className="flex flex-col gap-1.5 text-right">
            <label className="text-xs text-gray-500 font-medium">الحالة الصحية</label>
            <select className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-right appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:left_12px_center] bg-no-repeat pl-10 h-[42px]">
              <option value="">جميع الحالات</option>
              <option value="healthy">سليم</option>
              <option value="monitor">مراقبة</option>
              <option value="sick">مريض</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-right">
            <label className="text-xs text-gray-500 font-medium">الفئة العمرية</label>
            <select className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-right appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:left_12px_center] bg-no-repeat pl-10 h-[42px]">
              <option value="">جميع الأعمار</option>
              <option value="young">أقل من سنة</option>
              <option value="adult">1 - 3 سنوات</option>
              <option value="old">أكثر من 3 سنوات</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-right">
            <label className="text-xs text-gray-500 font-medium">نوع السلالة</label>
            <select className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-right appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:left_12px_center] bg-no-repeat pl-10 h-[42px]">
              <option value="">جميع الأنواع</option>
              <option value="cow">بقرة</option>
              <option value="sheep">خروف</option>
              <option value="goat">ماعز</option>
              <option value="horse">حصان</option>
              <option value="pig">خنزير</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {(!animals || animals.length === 0) ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center mt-6">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🐾</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">لا توجد حيوانات بعد</h2>
          <p className="text-gray-500 mb-6">لم يتم إضافة أي حيوانات إلى هذه المزرعة حتى الآن</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animals.map((animal) => (
            <AnimalCard key={animal._id} animal={animal} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {animals && animals.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            عرض <span className="font-semibold text-gray-900">1-12</span> من أصل <span className="font-semibold text-gray-900">{animals.length}</span> حيوان
          </div>
          <div className="flex items-center gap-2" dir="ltr">
            <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl bg-white text-gray-500 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-colors">
              3
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-indigo-600 rounded-xl bg-indigo-600 text-white font-medium">
              1
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl bg-white text-gray-500 hover:bg-gray-50 transition-colors" disabled>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmAnimalsSection;
