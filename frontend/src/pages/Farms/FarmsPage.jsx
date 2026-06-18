import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Loader2, AlertCircle, Search, Bell, HelpCircle, ChevronRight, LayoutGrid, Leaf, Map, Settings } from 'lucide-react';
import FarmForm from '../../components/FarmForm';
import { fetchMyFarms } from '../../redux/farmSlice';
import { updateFarm, deleteFarm } from '../../services/farmService';

// ─── TOP NAVBAR ──────────────────────────────────────
const TopNavbar = () => (
  <header className="bg-white h-20 border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-20 font-cairo">
    <div className="flex-1 max-w-xl">
      <div className="relative flex items-center w-full max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute right-4" />
        <input
          type="text"
          placeholder="البحث عن مزرعة بالاسم أو الموقع..."
          className="w-full bg-gray-50 border border-gray-100 rounded-full py-2.5 pr-11 pl-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#2a5c2a]/20 focus:border-[#2a5c2a] transition-all"
        />
      </div>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex items-center gap-4 text-gray-400">
        <button className="hover:text-gray-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="hover:text-gray-600 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      <div className="h-8 w-px bg-gray-200"></div>
      <div className="flex items-center gap-3">
        <div className="text-left" dir="ltr">
          <p className="text-sm font-bold text-gray-900">د. سارة ميار</p>
          <p className="text-[11px] text-gray-500 font-medium">طبيبة بيطرية أولى</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
          <img src="https://i.pravatar.cc/150?u=sarah" alt="Dr Sarah" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  </header>
);

const FarmCard = ({ farm }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [editMode, setEditMode] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const { loading, error } = useSelector((state) => state.farm);

  const handleUpdate = async (data) => {
    await updateFarm(farm._id, data);
    dispatch(fetchMyFarms());
    setEditMode(false);
  };

  const handleDelete = async () => {
    await deleteFarm(farm._id);
    dispatch(fetchMyFarms());
    setShowDeleteConfirm(false);
  };

  return (
    <div

      className="bg-white border border-gray-200 rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col font-cairo cursor-pointer group relative"
    >
      {/* Management button positioned at top */}
      <div className="absolute top-2 left-2 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/farms/${farm._id}`); }}
          className="text-xs py-0.5 px-1 rounded bg-[var(--user-primary-green)] text-white hover:bg-[#1e4520]"
        >
          إدارة المزرعة
        </button>
      </div>

      <div className="relative h-[160px] w-full overflow-hidden bg-[#eaf5eb] flex items-center justify-center">
        {/* Placeholder decorative pattern instead of an image for farms */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#2a5c2a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <Map className="w-16 h-16 text-[#2a5c2a] opacity-30" />

        {/* Farm Name Badge centered over pattern */}
        <div className="z-10 bg-white/90 backdrop-blur-sm px-6 py-2.5 rounded-full shadow-sm border border-white/50 text-center transform group-hover:-translate-y-1 transition-transform duration-500">
          <h3 className="font-bold text-[#1e4520] text-[15px]">{farm.name}</h3>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow bg-white">

        <div className="grid grid-cols-1 gap-y-3 my-2 text-[13px]">
          <div className="flex items-center gap-2 flex-row-reverse justify-end">
            <div className="text-right">
              <p className="text-gray-400 font-medium">الموقع</p>
              <p className="font-bold text-gray-900">{farm.governorate || 'غير محدد'}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#f5f7f5] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-[#2a5c2a]" />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-row-reverse justify-end">
            <div className="text-right">
              <p className="text-gray-400 font-medium">إجمالي الحيوانات</p>
              <p className="font-bold text-gray-900">{farm.total_animals || 0} رأس</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <LayoutGrid className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>

        {farm.description && (
          <p className="text-gray-500 text-[11px] mt-3 line-clamp-2 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            {farm.description}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={(e) => { e.stopPropagation(); setEditMode(true); }}
            className="text-xs py-0.5 px-1 bg-[#2a5c2a] text-white rounded hover:bg-[#1e4520]"
          >
            تعديل
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(true); }}
            className="text-xs py-0.5 px-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            حذف
          </button>
        </div>
      </div>

      {/* Edit Modal using shared FarmForm */}
      {editMode && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full max-h-[80vh] overflow-y-auto border border-gray-200">
            <h3 className="text-lg font-bold mb-4">تعديل المزرعة</h3>
            <FarmForm
              defaultValues={{ name: farm.name, governorate: farm.governorate, description: farm.description || '', lng: farm.location?.coordinates?.[0] || 31.2357, lat: farm.location?.coordinates?.[1] || 30.0444 }}
              onSubmit={handleUpdate}
              loading={loading?.farms}
              error={error?.farms}
              onCancel={() => setEditMode(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
            <p className="mb-4">هل أنت متأكد من حذف المزرعة؟</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-300 rounded">إلغاء</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FarmsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { farms, loading, error } = useSelector((state) => state.farm);

  useEffect(() => {
    dispatch(fetchMyFarms());
  }, [dispatch]);

  const displayFarms = farms.length > 0 ? farms : (error.farms ? [{ _id: 'dummy', name: 'مزرعة Green Pastures', governorate: 'الشرقية', description: 'مزرعة نموذجية لتربية الأبقار الحلوب وتسمين العجول باستخدام أحدث تقنيات الذكاء الاصطناعي.', total_animals: 1240 }] : []);

  return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col font-cairo" dir="rtl">
      <TopNavbar />

      <main className="max-w-[1400px] w-full mx-auto px-8 py-8 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="text-right">
            <h1 className="text-[26px] font-bold text-gray-900 leading-tight">المزارع الخاصة بي</h1>
            <p className="text-[13px] text-gray-500 font-medium mt-1">
              إدارة منشآتك الزراعية، متابعة الإنتاج، والتحكم في القطاعات.
            </p>
          </div>
          <button
            onClick={() => navigate('/farms/add')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2a5c2a] text-white rounded-xl text-sm font-bold hover:bg-[#1e4520] transition-colors shadow-sm shadow-green-900/10"
          >
            <Plus className="w-4 h-4" />
            إضافة مزرعة جديدة
          </button>
        </div>

        {/* Alerts / Loading */}
        {loading.farms && displayFarms.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin" />
          </div>
        ) : error.farms && farms.length === 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-800 mb-1">توضيح بخصوص قاعدة البيانات</h3>
              <p className="text-xs text-red-600 leading-relaxed font-medium">
                بما أنه لا يوجد اتصال بقاعدة البيانات حالياً، قمنا بإنشاء مزرعة تجريبية (وهمية) بالأسفل لتتمكن من معاينة التصميم والتفاعل معه.
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading.farms && displayFarms.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-white rounded-[20px] border border-gray-200 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#eaf5eb] flex items-center justify-center mb-5">
              <Leaf className="w-10 h-10 text-[#2a5c2a]" />
            </div>
            <p className="text-gray-900 font-bold text-xl mb-2">لا تمتلك أي مزارع بعد</p>
            <p className="text-gray-500 text-sm font-medium mb-6">قم بإضافة مزرعتك الأولى للبدء في إدارة النظام والحيوانات.</p>
            <button
              onClick={() => navigate('/farms/add')}
              className="bg-[#2a5c2a] hover:bg-[#1e4520] text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-green-900/10"
            >
              إضافة مزرعة الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 items-start content-start">
            {displayFarms.map((farm) => (
              <FarmCard
                key={farm._id}
                farm={farm}

              />
            ))}
          </div>
        )}
      </main>

      <footer className="px-8 py-5 bg-white border-t border-gray-200 flex items-center justify-between text-[12px] font-semibold text-gray-500 mt-4">
        <div className="flex items-center gap-6">
          <button className="hover:text-gray-800 transition-colors">دعمي</button>
          <button className="hover:text-gray-800 transition-colors">توثيق API</button>
          <button className="hover:text-gray-800 transition-colors">شروط الخدمة</button>
          <button className="hover:text-gray-800 transition-colors">سياسة الخصوصية</button>
        </div>
        <div className="flex flex-col items-end gap-0.5 text-right">
          <span className="text-gray-900 font-bold">رعاية الماشية AI</span>
          <span>© 2024 رعاية الماشية AI، ذكاء بيطري لزراعة مستدامة.</span>
        </div>
      </footer>
    </div>
  );
};

export default FarmsPage;
