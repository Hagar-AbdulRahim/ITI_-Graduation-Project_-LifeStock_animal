import { MapPin, Calendar, Edit, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// Farm model fields from backend:
// name, governorate, location (GeoJSON {type, coordinates}), description, total_animals, created_at, updated_at

const FarmHeader = ({ farm }) => {
  const navigate = useNavigate();
  const { farmId } = useParams();

  // Backend stores location as GeoJSON — display governorate as primary location label
  const locationLabel = farm?.governorate || 'الموقع غير محدد';

  // Backend uses created_at (not createdAt) due to custom timestamps config
  const createdDate = farm?.created_at
    ? new Date(farm.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'تاريخ الإنشاء غير محدد';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
      {/* Farm Avatar */}
      <div className="w-24 h-24 bg-indigo-50 rounded-xl flex-shrink-0 border border-indigo-100 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-indigo-300 text-4xl">
          🏡
        </div>
      </div>

      {/* Farm Info */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{farm?.name || 'مزرعة بدون اسم'}</h2>
        {farm?.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{farm.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            {locationLabel}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            {createdDate}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">🐾</span>
            {farm?.total_animals ?? 0} رأس
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 w-full md:w-auto">
        <button className="flex-1 md:flex-none px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
          <Edit className="w-4 h-4" />
          تعديل المزرعة
        </button>
        <button
          onClick={() => navigate(farmId ? `/farms/${farmId}/animals/add` : '/animals/add')}
          className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          إضافة حيوان
        </button>
      </div>
    </div>
  );
};

export default FarmHeader;
