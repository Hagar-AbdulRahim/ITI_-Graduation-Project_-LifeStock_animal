import React from 'react';
import { Activity, Thermometer, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HealthCases = ({ animals, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-48 animate-pulse"></div>
    );
  }

  // Derive recent health cases from sick animals for presentation
  const sickAnimals = animals?.filter(a => a.health_status === 'sick' || a.health_status === 'critical') || [];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-red-500" />
          </div>
          الحالات الصحية الأخيرة
        </h3>
      </div>

      {sickAnimals.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Thermometer className="w-6 h-6" />
          </div>
          <p className="text-gray-500 text-sm font-medium">لا توجد حالات مرضية مسجلة حالياً</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sickAnimals.slice(0, 5).map(animal => (
            <div 
              key={animal._id} 
              onClick={() => navigate(`/animals/${animal._id}`)}
              className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${animal.health_status === 'critical' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                  {animal.species === 'cattle' ? '🐄' : animal.species === 'sheep' ? '🐑' : animal.species === 'goat' ? '🐐' : '🐾'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{animal.name}</h4>
                  <p className="text-xs text-gray-500">رقم التعريف: {animal.tag_number || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${animal.health_status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {animal.health_status === 'critical' ? 'حالة حرجة' : 'مريض'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1">منذ يومين</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-indigo-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthCases;
