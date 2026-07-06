import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Loader2, AlertCircle, Search, Bell, HelpCircle, ChevronRight, LayoutGrid, Leaf, Map, Settings, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import FarmForm from '../../components/FarmForm';
import { fetchMyFarms } from '../../redux/farmSlice';
import { updateFarm, deleteFarm } from '../../services/farmService';

// ─── TOP NAVBAR ──────────────────────────────────────
const TopNavbar = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  return (
  <header className="bg-white h-20 border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-20 font-cairo">
    <div className="flex-1 max-w-xl">
      <div className="relative flex items-center w-full max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute right-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="البحث عن مزرعة بالاسم أو الموقع..."
          className="w-full bg-[#fbf9f6] border border-gray-200 rounded-full py-2.5 pr-11 pl-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#154b23]/20 focus:border-[#154b23] transition-all"
        />
      </div>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex items-center gap-4 text-gray-400">
        <button 
          onClick={() => navigate('/notifications')}
          className="hover:text-gray-600 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="hover:text-gray-600 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      <div className="h-8 w-px bg-gray-200"></div>

    </div>
  </header>
  );
};

const FarmCard = ({ farm }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [editMode, setEditMode] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const { loading, error } = useSelector((state) => state.farm);

  const handleUpdate = async (data) => {
    try {
      await updateFarm(farm._id, data);
      toast.success('تم تحديث المزرعة بنجاح');
      dispatch(fetchMyFarms());
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في تحديث المزرعة');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFarm(farm._id);
      toast.success('تم حذف المزرعة بنجاح');
      dispatch(fetchMyFarms());
      setShowDeleteConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في حذف المزرعة');
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white border border-stone-100 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col font-cairo cursor-pointer h-full">
      
      {/* Green Header Area */}
      <div className="relative bg-[#1b4d2c] pt-5 pb-6 px-5" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }}>
        {/* Top actions */}
        <div className="flex items-center justify-between mb-4">
          {/* Icon on the right (first in RTL) */}
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <Map className="w-5 h-5 text-white" />
          </div>

          {/* Edit / Delete Buttons on the left (last in RTL) */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(true); }}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
              title="حذف المزرعة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setEditMode(true); }}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-stone-600 hover:bg-stone-100 transition-colors shadow-sm"
              title="تعديل المزرعة"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Farm Name */}
        <div className="text-right mt-2">
          <h3 className="font-bold text-white text-xl">{farm.name}</h3>
        </div>
      </div>

      {/* White Body Area */}
      <div className="p-5 flex flex-col flex-grow bg-white">
        
        {/* Info Cards Stack */}
        <div className="flex flex-col gap-3">
          {/* Location */}
          <div className="bg-stone-50 rounded-2xl p-4 flex items-center justify-start gap-4 border border-stone-100/60">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-stone-100 text-stone-500 flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-right">
              <p className="text-stone-400 text-xs font-medium mb-1">الموقع</p>
              <p className="font-bold text-stone-800 text-sm">{farm.governorate || 'غير محدد'}</p>
            </div>
          </div>

          {/* Animals Count */}
          <div className="bg-stone-50 rounded-2xl p-4 flex items-center justify-start gap-4 border border-stone-100/60">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-stone-100 text-stone-500 flex-shrink-0">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div className="text-right">
              <p className="text-stone-400 text-xs font-medium mb-1">الحيوانات</p>
              <p className="font-bold text-stone-800 text-sm">{farm.total_animals || 0} رأس</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {farm.description && (
          <div className="mt-4 text-right">
            <p className="text-stone-500 text-xs leading-relaxed line-clamp-1">{farm.description}</p>
          </div>
        )}

        {/* Manage Button */}
        <div className="mt-auto pt-5">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/farms/${farm._id}`); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1b4d2c] text-white font-bold rounded-2xl hover:bg-[#153e23] transition-colors shadow-md shadow-green-900/10 active:scale-[0.98]"
          >
            إدارة المزرعة
            <span className="text-lg leading-none" style={{ transform: 'scaleX(-1)' }}>➔</span>
          </button>
        </div>

      </div>

      {/* Edit Modal using shared FarmForm */}
      {editMode && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setEditMode(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full max-h-[80vh] overflow-y-auto border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">تعديل المزرعة</h3>
            <FarmForm
              defaultValues={{ name: farm.name, governorate: farm.governorate, description: farm.description || '' }}
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
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
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
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    dispatch(fetchMyFarms());
  }, [dispatch]);

  const displayFarms = (farms || []).filter(farm => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (farm.name && farm.name.toLowerCase().includes(query)) ||
      (farm.governorate && farm.governorate.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-[#f5f2eb] flex flex-col font-cairo" dir="rtl">
      <TopNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="flex-1 flex flex-col">
        {/* Page Banner / Header */}
        <div className="bg-white border-b border-stone-200/60 py-10 px-8 shadow-sm">
          <div className="max-w-[1400px] mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="text-right">
            <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-1.5">المزارع الخاصة بي</h1>
            <p className="text-[14px] text-stone-500 font-medium mt-5">
              إدارة منشآتك الزراعية، متابعة الإنتاج، والتحكم في القطاعات بصورة احترافية.
            </p>
          </div>
          <button
            onClick={() => navigate('/farms/add')}
            className="flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#1b4d2c] to-[#2a7543] text-white rounded-xl text-[14px] font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md shadow-green-900/10 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            إضافة مزرعة
          </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-[1400px] mx-auto w-full px-8 py-10 flex-1 flex flex-col">
        {/* Alerts / Loading */}
        {loading.farms && displayFarms.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#154b23] animate-spin" />
          </div>
        )}

        {/* Content */}
        {!loading.farms && displayFarms.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-white rounded-[32px] border border-gray-100 shadow-sm mt-4">
            <div className="w-24 h-24 rounded-full bg-[#154b23]/5 flex items-center justify-center mb-6">
              <Leaf className="w-12 h-12 text-[#154b23]" />
            </div>
            <p className="text-gray-900 font-bold text-2xl mb-3">لا تمتلك أي مزارع بعد</p>
            <p className="text-gray-500 text-sm font-medium mb-8 max-w-md">قم بإضافة مزرعتك الأولى للبدء في إدارة النظام والحيوانات والاستفادة من الذكاء الاصطناعي في المراقبة.</p>
            <button
              onClick={() => navigate('/farms/add')}
              className="bg-[#154b23] hover:bg-[#0f3619] text-white px-8 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-md shadow-[#154b23]/20 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة مزرعتك الأولى
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 items-start content-start mt-4">
            {displayFarms.map((farm) => (
              <FarmCard
                key={farm._id}
                farm={farm}
              />
            ))}
            

          </div>
        )}
        </div>
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
