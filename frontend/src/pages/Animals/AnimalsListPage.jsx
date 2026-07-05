import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Plus, Upload, Filter,
  ChevronRight, ChevronLeft, Loader2, MoreVertical,
  PawPrint, Syringe, HeartPulse, AlertTriangle,
  CalendarDays, Weight, Dna, Thermometer, X
} from 'lucide-react';
import { fetchFarmById, fetchFarmAnimals } from '../../redux/farmSlice';

// ─── TOP NAVBAR (Same as FarmDetailsPage) ──────────────────────────────────────
const TopNavbar = () => (
  <header className="bg-white h-20 border-b border-gray-100 px-8 flex items-center sticky top-0 z-20 font-cairo">
    <div className="w-full max-w-xl mx-auto">
      <div className="relative flex items-center w-full">
        <Search className="w-4 h-4 text-gray-400 absolute right-4" />
        <input
          type="text"
          placeholder="البحث برقم التعريف أو الاسم / السلالة..."
          className="w-full bg-gray-50 border border-gray-100 rounded-full py-2.5 pr-11 pl-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#2a5c2a]/20 focus:border-[#2a5c2a] transition-all"
        />
      </div>
    </div>
  </header>
);

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const SPECIES_MAP = {
  cattle: 'أبقار',
  sheep: 'أغنام',
  goat: 'ماعز',

};

const GENDER_MAP = { male: 'ذكر', female: 'أنثى' };

/**
 * Supports both legacy birth_date and the API's age_value + age_unit fields.
 */
const formatAge = (animal) => {
  // Prefer direct age_value / age_unit from the API
  if (animal?.age_value != null && animal?.age_unit) {
    const unitMap = { days: 'يوم', months: 'شهر', years: 'سنة' };
    return `${animal.age_value} ${unitMap[animal.age_unit] || animal.age_unit}`;
  }
  // Fallback: calculate from birth_date
  if (!animal?.birth_date) return '—';
  const diffMs = Date.now() - new Date(animal.birth_date);
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  if (months < 1) return `${Math.floor(diffMs / (1000 * 60 * 60 * 24))} يوم`;
  if (months < 12) return `${months} شهر`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}.${rem} سنة` : `${years} سنة`;
};

/**
 * Convert age_value+age_unit to months for filter comparison.
 */
const ageToMonths = (animal) => {
  if (animal?.age_value != null && animal?.age_unit) {
    if (animal.age_unit === 'days') return animal.age_value / 30;
    if (animal.age_unit === 'months') return animal.age_value;
    if (animal.age_unit === 'years') return animal.age_value * 12;
  }
  if (animal?.birth_date) {
    return Math.floor((Date.now() - new Date(animal.birth_date)) / (1000 * 60 * 60 * 24 * 30));
  }
  return null;
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

// ─── STATS BANNER ─────────────────────────────────────────────────────────────
const StatsBanner = ({ animals }) => {
  const total = animals.length;
  const healthy = animals.filter(a => a.health_status === 'healthy').length;
  const sick = animals.filter(a => a.health_status === 'sick').length;
  const critical = animals.filter(a => a.health_status === 'critical').length;

  const stats = [
    { label: 'إجمالي الحيوانات', value: total, color: 'text-[#2a5c2a]', bg: 'bg-[#eaf5eb]', icon: '🐾' },
    { label: 'سليم', value: healthy, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: '✅' },
    { label: 'مراقبة', value: sick, color: 'text-amber-700', bg: 'bg-amber-50', icon: '⚠️' },
    { label: 'حالة حرجة', value: critical, color: 'text-red-700', bg: 'bg-red-50', icon: '🚨' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 flex items-center gap-3 border border-white shadow-sm`}>
          <span className="text-2xl">{s.icon}</span>
          <div className="text-right flex-1">
            <p className="text-[11px] text-gray-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── SPECIES EMOJI MAP ──────────────────────────────────────────────────────────────
const SPECIES_EMOJI = { cattle: '🐄', sheep: '🐑', goat: '🐐', horse: '🐎', pig: '🐷' };
const SPECIES_GRADIENT = {
  cattle: 'from-amber-100 to-amber-50',
  sheep: 'from-sky-100 to-sky-50',
  goat: 'from-emerald-100 to-emerald-50',
  horse: 'from-orange-100 to-orange-50',
  pig: 'from-pink-100 to-pink-50',
};

// ─── ANIMAL CARD ──────────────────────────────────────────────────────────────
const AnimalCard = ({ animal, onClick }) => {
  const h = getHealthStyle(animal?.health_status);
  const speciesLabel = SPECIES_MAP[animal?.species] || animal?.species || 'غير محدد';
  const genderLabel = GENDER_MAP[animal?.gender] || '—';
  const ageLabel = formatAge(animal);
  const gradient = SPECIES_GRADIENT[animal?.species] || 'from-gray-100 to-gray-50';
  const emoji = SPECIES_EMOJI[animal?.species] || '🐾';

  return (
    <div
      className="bg-white border border-gray-200 rounded-[20px] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col font-cairo cursor-pointer group"
      onClick={onClick}
    >
      {/* Emblem area without animal image */}
      <div className={`relative h-[160px] w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <div className="text-center">
          <span className="text-6xl select-none">{emoji}</span>
          <p className="text-[12px] font-bold text-gray-700 mt-2">{speciesLabel}</p>
        </div>
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold shadow-sm ${h.badgeBg} ${h.badgeText}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${h.dot}`} />
          {h.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Tag number header */}
        <div className="flex items-center justify-between mb-4">
          <button
            className="text-gray-300 hover:text-gray-500 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          <div className="text-right">
            <p className="text-[11px] text-gray-400 font-medium">رقم التعريف</p>
            <h3 className="font-extrabold text-[#2a5c2a] text-[18px] tracking-wide leading-tight">
              {animal?.tag_number || '---'}
            </h3>
          </div>
        </div>

        {/* Key stats — 3 highlighted cells */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Weight */}
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <Weight className="w-4 h-4 text-[#2a5c2a] mx-auto mb-1" />
            <p className="text-[10px] text-gray-400 font-medium">الوزن</p>
            <p className="font-extrabold text-gray-900 text-[13px]">
              {animal?.weight_kg != null ? `${animal.weight_kg} كجم` : '—'}
            </p>
          </div>
          {/* Age */}
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <CalendarDays className="w-4 h-4 text-[#2a5c2a] mx-auto mb-1" />
            <p className="text-[10px] text-gray-400 font-medium">العمر</p>
            <p className="font-extrabold text-gray-900 text-[13px]">{ageLabel}</p>
          </div>
          {/* Gender */}
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <Dna className="w-4 h-4 text-[#2a5c2a] mx-auto mb-1" />
            <p className="text-[10px] text-gray-400 font-medium">الجنس</p>
            <p className={`font-extrabold text-[13px] ${animal?.gender === 'female' ? 'text-pink-500' : 'text-blue-500'}`}>
              {genderLabel}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          className="w-full py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 mt-auto bg-[#2a5c2a] text-white hover:bg-[#1e4520] hover:shadow-md flex items-center justify-center gap-2"
          onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
        >
          <HeartPulse className="w-4 h-4" />
          انتقل إلى تفاصيل الحيوان
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

  const { farmAnimals, loading, error } = useSelector((state) => state.farm);

  const [filterSpecies, setFilterSpecies] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAge, setFilterAge] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (farmId) {
      dispatch(fetchFarmById(farmId));
      dispatch(fetchFarmAnimals(farmId));
    }
  }, [dispatch, farmId]);

  // Show real data from API only
  const rawAnimals = farmAnimals || [];

  const displayAnimals = rawAnimals.filter((a) => {
    const matchSpecies = filterSpecies === 'all' || a.species === filterSpecies;
    const matchStatus = filterStatus === 'all' || a.health_status === filterStatus;
    const matchSearch = !searchTerm ||
      (a.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (a.tag_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (a.breed?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    let matchAge = true;
    if (filterAge !== 'all') {
      const months = ageToMonths(a);
      if (months !== null) {
        if (filterAge === 'young') matchAge = months < 12;
        else if (filterAge === 'mid') matchAge = months >= 12 && months < 36;
        else if (filterAge === 'adult') matchAge = months >= 36;
      }
    }
    return matchSpecies && matchStatus && matchSearch && matchAge;
  });

  const hasFilters = filterSpecies !== 'all' || filterStatus !== 'all' || filterAge !== 'all' || !!searchTerm;

  if (loading.animals) {
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

        {/* ── Stats Banner ───────────────────────────────────────────── */}
        <StatsBanner animals={rawAnimals} />

        {/* ── Animals Grid ──────────────────────────────────────────── */}
        {loading.animals ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#2a5c2a] animate-spin mb-4" />
            <p className="text-gray-400 font-medium text-sm">جاري تحميل الحيوانات...</p>
          </div>
        ) : rawAnimals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <PawPrint className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold text-lg">لم يتم العثور على حيوانات (No animals found)</p>
            <p className="text-gray-400 text-sm mt-1">قم بإضافة حيوان للمزرعة للبدء</p>
          </div>
        ) : displayAnimals.length === 0 ? (
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
