import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Bell, HelpCircle, Plus, Upload, Filter,
  ChevronRight, ChevronLeft, Loader2, MoreVertical,
  PawPrint, Syringe, HeartPulse, AlertTriangle,
  CalendarDays, Weight, Dna, Thermometer, X
} from 'lucide-react';
import { fetchFarmById, fetchFarmAnimals, fetchMyFarms } from '../../redux/farmSlice';

// ─── TOP NAVBAR (Same as FarmDetailsPage) ──────────────────────────────────────
const TopNavbar = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <header className="bg-white h-20 border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-20 font-cairo">
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute right-4" />
          <input
            type="text"
            placeholder="البحث برقم التعريف أو الاسم / السلالة..."
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
            <p className="text-sm font-bold text-gray-900">{user?.name || 'د. سارة ميار'}</p>
            <p className="text-[11px] text-gray-500 font-medium">طبيبة بيطرية أولى</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-indigo-600 font-bold">{user?.name?.charAt(0) || 'س'}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const SPECIES_MAP = {
  cattle: 'أبقار',
  sheep:  'أغنام',
  goat:   'ماعز',
  // horse and pig are NOT in the backend enum — kept as display-only fallbacks
  horse:  'خيل',
  pig:    'خنازير',
};

const GENDER_MAP = { male: 'ذكر', female: 'أنثى' };

const calculateAge = (animal) => {
  if (!animal || animal.age_value === undefined) return '—';
  const val = animal.age_value;
  const unit = animal.age_unit;
  if (unit === 'years') {
    return `${val} سنة`;
  }
  return `${val} شهر`;
};

const getHealthStyle = (status) => {
  switch (status) {
    case 'critical': return {
      badgeBg: 'bg-[#fce8e8]', badgeText: 'text-[#b91c1c]', dot: 'bg-[#b91c1c]',
      label: 'حالة حرجة', btnBg: 'bg-[#fce8e8] text-[#b91c1c] hover:bg-[#fad1d1]', btnText: 'إجراء طارئ'
    };
    case 'sick': return {
      badgeBg: 'bg-[#fef9c3]', badgeText: 'text-[#a16207]', dot: 'bg-[#ca8a04]',
      label: 'مراقبة', btnBg: 'bg-[#fef9c3] text-[#a16207] hover:bg-[#fef08a]', btnText: 'تحديث السجل'
    };
    case 'deceased': return {
      badgeBg: 'bg-gray-100', badgeText: 'text-gray-500', dot: 'bg-gray-400',
      label: 'متوفى', btnBg: 'bg-gray-100 text-gray-500', btnText: 'عرض السجل'
    };
    default: return {
      badgeBg: 'bg-[#eaf5eb]', badgeText: 'text-[#2a5c2a]', dot: 'bg-[#2a5c2a]',
      label: 'سليم', btnBg: 'bg-[#eaf5eb] text-[#2a5c2a] hover:bg-[#d5ebd5]', btnText: 'عرض السجل الصحي'
    };
  }
};

// ─── ANIMAL CARD (Matching design exactly) ─────────────────────────────────────
const AnimalCard = ({ animal, onClick }) => {
  const h = getHealthStyle(animal?.health_status);
  const speciesLabel = SPECIES_MAP[animal?.species] || animal?.species || 'غير محدد';
  const genderLabel = GENDER_MAP[animal?.gender] || '—';

  const defaultImages = {
    cattle: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=500&h=280',
    sheep:  'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=500&h=280',
    goat:   'https://images.unsplash.com/photo-1501706362039-c06b2d715385?auto=format&fit=crop&q=80&w=500&h=280',
    horse:  'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=500&h=280',
    pig:    'https://images.unsplash.com/photo-1604848698030-c434ba08ece1?auto=format&fit=crop&q=80&w=500&h=280',
  };
  const imageUrl = animal?.imageUrl || defaultImages[animal?.species] || defaultImages.cattle;

  return (
    <div
      className="bg-white border border-gray-200 rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col font-cairo cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-[195px] w-full overflow-hidden bg-gray-100">
        <img
          src={animal.image ? `http://localhost:5000${animal.image}` : imageUrl}
          alt={animal?.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          onError={(e) => { e.target.src = defaultImages.cattle; }}
        />
        {/* Health Badge — top LEFT of image */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold shadow-sm ${h.badgeBg} ${h.badgeText}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${h.dot}`} />
          {h.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Header row: name on right, dots on left */}
        <div className="flex items-start justify-between mb-1">
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          <div className="text-right">
            <h3 className="font-bold text-gray-900 text-[17px] leading-tight">{animal?.name || 'بدون اسم'}</h3>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">رقم التعريف: {animal?.tag_number || '---'}</p>
          </div>
        </div>

        {/* Stats Grid — 2 columns, 3 rows */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-3 my-4 text-[12px]">
          {/* النوع */}
          <div className="flex items-center gap-2 flex-row-reverse justify-end">
            <div className="text-right">
              <p className="text-gray-400 font-medium">النوع</p>
              <p className="font-bold text-gray-900">{speciesLabel}</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Dna className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>

          {/* العمر */}
          <div className="flex items-center gap-2 flex-row-reverse justify-end">
            <div className="text-right">
              <p className="text-gray-400 font-medium">العمر</p>
              <p className="font-bold text-gray-900">{calculateAge(animal)}</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>

          {/* الوزن */}
          <div className="flex items-center gap-2 flex-row-reverse justify-end">
            <div className="text-right">
              <p className="text-gray-400 font-medium">الوزن</p>
              <p className="font-bold text-gray-900">{animal?.weight_kg ? `${animal.weight_kg} كجم` : '—'}</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Weight className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>

          {/* الجنس */}
          <div className="flex items-center gap-2 flex-row-reverse justify-end">
            <div className="text-right">
              <p className="text-gray-400 font-medium">الجنس</p>
              <p className={`font-bold ${animal?.gender === 'female' ? 'text-pink-500' : 'text-blue-500'}`}>
                {genderLabel}
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Thermometer className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          className={`w-full py-2.5 rounded-xl text-[13px] font-bold transition-colors mt-auto ${h.btnBg}`}
          onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
        >
          {h.btnText}
        </button>
      </div>
    </div>
  );
};




// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const AnimalsListPage = () => {
  const { farmId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { farmAnimals, loading, error, farms } = useSelector((state) => state.farm);

  const [filterSpecies, setFilterSpecies] = useState('all');
  const [filterStatus, setFilterStatus]   = useState('all');
  const [filterAge, setFilterAge]         = useState('all');
  const [searchTerm, setSearchTerm]       = useState('');

  useEffect(() => {
    dispatch(fetchMyFarms());
  }, [dispatch]);

  useEffect(() => {
    let actualFarmId = farmId;
    if (farmId === 'dummy' || !farmId) {
      if (farms && farms.length > 0) {
        actualFarmId = farms[0]._id;
      } else {
        actualFarmId = null;
      }
    }
    
    if (actualFarmId) {
      dispatch(fetchFarmById(actualFarmId));
      dispatch(fetchFarmAnimals(actualFarmId));
    }
  }, [dispatch, farmId, farms]);

  const rawAnimals = Array.isArray(farmAnimals) ? farmAnimals : (farmAnimals?.data || []);
  console.log("Debug farmAnimals:", farmAnimals, rawAnimals);

  const displayAnimals = rawAnimals.filter((a) => {
    const matchSpecies = filterSpecies === 'all' || a.species === filterSpecies;
    const matchStatus  = filterStatus === 'all'  || a.health_status === filterStatus;
    const matchSearch  = !searchTerm ||
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tag_number?.toLowerCase().includes(searchTerm.toLowerCase());
    let matchAge = true;
    if (filterAge !== 'all' && a.age_value !== undefined) {
      const months = a.age_unit === 'years' ? a.age_value * 12 : a.age_value;
      if (filterAge === 'young') matchAge = months < 12;
      else if (filterAge === 'mid') matchAge = months >= 12 && months < 36;
      else if (filterAge === 'adult') matchAge = months >= 36;
    }
    return matchSpecies && matchStatus && matchSearch && matchAge;
  });

  const hasFilters = filterSpecies !== 'all' || filterStatus !== 'all' || filterAge !== 'all' || !!searchTerm;

  if (loading.animals && !farmAnimals?.length) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center font-cairo">
        <Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col font-cairo" dir="rtl">
      <TopNavbar />

      <main className="max-w-[1400px] w-full mx-auto px-8 py-8 flex-1 flex flex-col">

        {/* ── Page Header ───────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/animals/add`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2a5c2a] text-white rounded-xl text-sm font-bold hover:bg-[#1e4520] transition-colors shadow-sm shadow-green-900/10"
            >
              <Plus className="w-4 h-4" />
              إضافة حيوان
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <Upload className="w-4 h-4" />
              استيراد CSV
            </button>
          </div>
          <div className="text-right">
            <h1 className="text-[26px] font-bold text-gray-900 leading-tight">جرد الحيوانات</h1>
            <p className="text-[13px] text-gray-500 font-medium mt-0.5">
              إدارة ومراقبة السجلات الصحية لجميع الماشية عبر القطاعات.
            </p>
          </div>
        </div>

        {/* ── Filter Bar ────────────────────────────────────────────── */}
        <div className="bg-white rounded-[20px] px-6 py-4 border border-gray-200 shadow-sm flex items-end justify-between gap-4 mb-7">
          {/* Left: More Filters button */}
          <div className="flex items-end gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white">
              <Filter className="w-4 h-4" />
              المزيد من الفلاتر
            </button>
            {hasFilters && (
              <button
                onClick={() => { setFilterSpecies('all'); setFilterStatus('all'); setFilterAge('all'); setSearchTerm(''); }}
                className="flex items-center gap-1.5 px-3 py-2.5 border border-red-100 rounded-xl text-sm font-bold text-red-400 hover:bg-red-50 transition-colors bg-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Filter dropdowns */}
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-[11px] text-gray-400 font-bold mb-1.5 text-right">الحالة الصحية</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 outline-none focus:border-[#2a5c2a] min-w-[150px]"
              >
                <option value="all">جميع الحالات</option>
                <option value="healthy">سليم</option>
                <option value="sick">مراقبة</option>
                <option value="critical">حالة حرجة</option>
                <option value="deceased">متوفى</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 font-bold mb-1.5 text-right">الفئة العمرية</label>
              <select
                value={filterAge}
                onChange={(e) => setFilterAge(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 outline-none focus:border-[#2a5c2a] min-w-[150px]"
              >
                <option value="all">جميع الأعمار</option>
                <option value="young">أقل من سنة</option>
                <option value="mid">1 - 3 سنوات</option>
                <option value="adult">أكثر من 3 سنوات</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 font-bold mb-1.5 text-right">نوع السلالة</label>
              <select
                value={filterSpecies}
                onChange={(e) => setFilterSpecies(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 outline-none focus:border-[#2a5c2a] min-w-[150px]"
              >
                <option value="all">جميع الأنواع</option>
                <option value="cattle">أبقار</option>
                <option value="sheep">أغنام</option>
                <option value="goat">ماعز</option>
                <option value="horse">خيل</option>
                <option value="pig">خنازير</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Animals Grid ──────────────────────────────────────────── */}
        {displayAnimals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <PawPrint className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold text-lg">لا توجد حيوانات تطابق الفلاتر</p>
            <p className="text-gray-400 text-sm mt-1">جرب تغيير معايير البحث</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 items-start content-start">
            {displayAnimals.map((animal) => (
              <AnimalCard
                key={animal._id}
                animal={animal}
                onClick={() => navigate(`/animals/${animal._id}`)}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-10 pt-6">
          <div className="text-[12px] text-gray-500 font-medium">
            عرض 1-{Math.min(12, displayAnimals.length)} من أصل {rawAnimals.length} حيوان
          </div>
          <div className="flex items-center gap-2" dir="ltr">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#2a5c2a] bg-[#1e4520] text-white font-bold text-sm shadow-sm">
              1
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm bg-white transition-colors">
              2
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm bg-white transition-colors">
              3
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </main>

      {/* ── Footer (Same as FarmDetailsPage) ────────────────────────── */}
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

export default AnimalsListPage;
