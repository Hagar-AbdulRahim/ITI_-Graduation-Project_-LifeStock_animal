import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Loader2, Search, Bell, Home, LayoutGrid, Leaf, Map, Edit3, Trash2 } from 'lucide-react'; import toast from 'react-hot-toast';
import FarmForm from '../../components/FarmForm';
import { fetchMyFarms } from '../../redux/farmSlice';
import { updateFarm, deleteFarm } from '../../services/farmService';

const TopNavbar = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  return (
    <header className="bg-[#1b4d2c] h-16 sm:h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 font-cairo   mb-4 shadow-sm">
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute right-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث عن مزرعة..."
            className="w-full bg-white border border-white/10 rounded-full py-2.5 pr-11 pl-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-white/40 focus:border-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 text-white/80">
          <button
            onClick={() => navigate('/notifications')}
            className="hover:text-white transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full"></span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="hover:text-white transition-colors hidden sm:block"
            title="الصفحة الرئيسية"
          >
            <Home className="w-5 h-5" />
          </button>

        </div>
        <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
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
    <div
      onClick={() => navigate(`/farms/${farm._id}`)}
      className="bg-white border border-stone-200/80 border-t-4 border-t-[#1b4d2c] rounded-[32px] 
                 shadow-[0_2px_8px_-2px_rgba(27,77,44,0.08)] 
                 hover:shadow-[0_12px_35px_-8px_rgba(27,77,44,0.25)] 
                 hover:-translate-y-2
                 transition-all duration-500 ease-out
                 overflow-hidden flex flex-col font-cairo cursor-pointer h-full relative group p-6"
    >
      {/* Top Section: Icon & Actions */}
      <div className="flex items-center justify-between mb-4">
        {/* Farm Icon with soft green tint */}
        <div className="w-11 h-11 rounded-2xl bg-[#1b4d2c]/5 flex items-center justify-center border border-[#1b4d2c]/10 text-[#1b4d2c] group-hover:scale-110 transition-all duration-500 shadow-sm">
          <Map className="w-5 h-5" />
        </div>

        {/* Edit / Delete Buttons */}
        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(true); }}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            title="حذف المزرعة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setEditMode(true); }}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-stone-50 text-stone-500 hover:bg-[#1b4d2c] hover:text-white transition-colors"
            title="تعديل المزرعة"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Farm Name */}
      <div className="text-right">
        <h3 className="font-black text-stone-900 text-lg transition-colors duration-500">{farm.name}</h3>
      </div>

      {/* Modern Grid Statistics with styled backgrounds */}
      <div className="grid grid-cols-1 gap-3 py-4 my-2">
        {/* Location Box */}
        <div className="flex items-center justify-start gap-3 bg-stone-50/70 rounded-2xl p-3 border border-stone-200/20 transition-colors duration-500">
          <div className="w-8 h-8 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-[#1b4d2c] flex-shrink-0 shadow-sm transition-colors duration-500">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-stone-400 font-bold block mb-0.5 transition-colors duration-500">الموقع والجغرافيا</span>
            <span className="font-bold text-stone-800 text-[13px] transition-colors duration-500">{farm.governorate || 'غير محدد'}</span>
          </div>
        </div>

        {/* Animals Box */}
        <div className="flex items-center justify-start gap-3 bg-stone-50/70 rounded-2xl p-3 border border-stone-200/20 transition-colors duration-500">
          <div className="w-8 h-8 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-[#1b4d2c] flex-shrink-0 shadow-sm transition-colors duration-500">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-stone-400 font-bold block mb-0.5 transition-colors duration-500">إحصاء القطيع</span>
            <span className="font-bold text-stone-800 text-[13px] transition-colors duration-500">{farm.total_animals || 0} رأس من الماشية</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {farm.description ? (
        <div className="text-right mb-6 h-9 overflow-hidden">
          <p className="text-stone-500 text-xs leading-relaxed line-clamp-2 transition-colors duration-500">{farm.description}</p>
        </div>
      ) : (
        <div className="text-right mb-6 h-9 flex items-center">
          <p className="text-stone-300 text-xs italic transition-colors duration-500">لا يوجد وصف للمزرعة</p>
        </div>
      )}

      {/* Manage Button */}
      <div className="mt-auto">
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/farms/${farm._id}`); }}
          className="w-full py-3 bg-[#1b4d2c] text-white font-black text-xs rounded-xl shadow-sm group-hover:shadow-[0_8px_20px_-6px_rgba(27,77,44,0.3)] transition-all duration-500 active:scale-[0.98]"
        >
          إدارة المزرعة
        </button>
      </div>

      {/* Edit Modal using shared FarmForm */}
      {editMode && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]"
          onClick={() => setEditMode(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full max-h-[80vh] overflow-y-auto border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4 text-stone-900 text-right">تعديل المزرعة</h3>
            <FarmForm
              defaultValues={{ name: farm.name, governorate: farm.governorate, description: farm.description || '' }}
              onSubmit={handleUpdate}
              loading={loading?.farms}
              error={error?.farms}
              onCancel={() => setEditMode(false)}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-stone-900 text-right">هل أنت متأكد من حذف المزرعة؟</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-300 text-stone-900 rounded">إلغاء</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">حذف</button>
            </div>
          </div>
        </div>,
        document.body
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
    <div className="min-h-screen bg-white flex flex-col font-cairo" dir="rtl">
      <TopNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="flex-1 flex flex-col">
        {/* Page Banner / Header */}
        {/* Page Banner / Header */}
        <div className="bg-[#1b4d2c] py-4 sm:py-5 lg:py-6 px-4 sm:px-6 lg:px-8 shadow-sm rounded-[28px] mx-4 sm:mx-6 lg:mx-8">
          <div className="max-w-[1400px] mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="text-right">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">المزارع الخاصة بي</h1>
              <p className="text-[13px] sm:text-[14px] text-stone-200 font-medium">
                إدارة منشآتك الزراعية، متابعة الإنتاج، والتحكم في القطاعات بصورة احترافية.
              </p>
            </div>
            <button
              onClick={() => navigate('/farms/add')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#1b4d2c] hover:bg-stone-50 rounded-xl text-[14px] font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md active:scale-95 self-start sm:self-center"
            >
              <Plus className="w-5 h-5" />
              إضافة مزرعة
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex-1 flex flex-col">
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

      <footer className="px-4 sm:px-8 py-5 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-[12px] font-semibold text-gray-500 mt-4 gap-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 justify-center sm:justify-start">
          <button className="hover:text-gray-800 transition-colors">دعمي</button>
          <button className="hover:text-gray-800 transition-colors hidden sm:inline">توثيق API</button>
          <button className="hover:text-gray-800 transition-colors">شروط الخدمة</button>
          <button className="hover:text-gray-800 transition-colors hidden sm:inline">سياسة الخصوصية</button>
        </div>
        <div className="flex flex-col items-center sm:items-end gap-0.5 text-center sm:text-right">
          <span className="text-gray-900 font-bold">رعاية الماشية AI</span>
          <span className="hidden sm:inline">© 2024 رعاية الماشية AI، ذكاء بيطري لزراعة مستدامة.</span>
        </div>
      </footer>
    </div>
  );
};

export default FarmsPage;
