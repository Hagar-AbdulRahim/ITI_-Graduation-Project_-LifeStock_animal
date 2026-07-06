import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Plus, Upload, Filter,
  ChevronRight, ChevronLeft, ChevronDown, Loader2, MoreVertical,
  PawPrint, Syringe, HeartPulse, AlertTriangle, CheckCircle,
  CalendarDays, Weight, Dna, Thermometer, X
} from 'lucide-react';

import cowImg from '../../assets/images/Profile/cow.png';
import goatImg from '../../assets/images/Profile/goat.png';
import sheepImg from '../../assets/images/Profile/sheep.png';
import { fetchFarmById, fetchFarmAnimals } from '../../redux/farmSlice';

// ─── TOP NAVBAR (Same as FarmDetailsPage) ──────────────────────────────────────
const TopNavbar = () => (
  <header className="bg-white h-16 border-b border-gray-100 px-8 flex items-center sticky top-0 z-20 font-cairo">
    <div className="w-full max-w-xl mx-auto" />
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
    {
      label: 'إجمالي الحيوانات',
      value: total,
      accent: 'text-[#2a5c2a]',
      iconBg: 'bg-[#eaf5eb]',
      icon: <PawPrint className="w-5 h-5" />,
    },
    {
      label: 'سليم',
      value: healthy,
      accent: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      label: 'مراقبة',
      value: sick,
      accent: 'text-amber-600',
      iconBg: 'bg-amber-50',
      icon: <Syringe className="w-5 h-5" />,
    },
    {
      label: 'حالة حرجة',
      value: critical,
      accent: 'text-red-600',
      iconBg: 'bg-red-50',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
      {stats.map((s) => (
        <div
          key={s.label}
          title={`${s.label}: ${s.value}`}
          className="group bg-white rounded-2xl px-5 py-4 flex items-center gap-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
          <div className={`w-11 h-11 rounded-xl ${s.iconBg} ${s.accent} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}>
            {s.icon}
          </div>
          <div className="text-right flex-1 min-w-0">
            <p className="text-[12px] text-gray-400 font-semibold truncate">{s.label}</p>
            <p className={`text-[26px] font-extrabold leading-tight ${s.accent}`}>{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── SPECIES EMOJI MAP ──────────────────────────────────────────────────────────────
const SPECIES_IMAGE = { cattle: cowImg, sheep: sheepImg, goat: goatImg };

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
  const emoji = SPECIES_EMOJI[animal?.species] || '🐾';
  const imgSrc = SPECIES_IMAGE[animal?.species];

  return (
    <div
      className="bg-white border border-gray-200 rounded-[20px] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col font-cairo cursor-pointer group relative"
      onClick={onClick}
    >
      {/* زرار القائمة (تلات نقط) في الزاوية */}
      <button
        className="absolute top-3 left-3 text-gray-300 hover:text-gray-500 transition-colors z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Content - القسم الوحيد دلوقتي */}
      <div className="p-5 flex flex-col flex-grow">
        {/* الصف العلوي: الصورة + رقم التعريف في الشمال، والنوع والحالة في اليمين */}
        <div className="flex items-start justify-between mb-4">
          {/* صورة/إيموجي الحيوان + رقم التعريف بجانبها */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#2a5c2a] flex items-center justify-center p-1 shadow-md flex-shrink-0">
              {imgSrc ? (
                <img src={imgSrc} alt={speciesLabel} className="w-11 h-11 object-contain select-none" />
              ) : (
                <span className="text-2xl select-none">{emoji}</span>
              )}
            </div>
            <h3 className="font-extrabold text-[#2a5c2a] text-2xl tracking-wide leading-tight">
              {animal?.tag_number || '---'}
            </h3>
          </div>

          {/* النوع + شارة الحالة الصحية */}
          <div className="text-right flex flex-col items-end gap-1.5">
            <div className={`px-2 py-0.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold shadow-sm ${h.badgeBg} ${h.badgeText}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${h.dot}`} />
              {h.label}
            </div>
            <p className="text-sm text-gray-400 font-medium">{speciesLabel}</p>
          </div>
        </div>

        {/* Key stats — 3 highlighted cells */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <Weight className="w-4 h-4 text-[#2a5c2a] mx-auto mb-1" />
            <p className="text-sm text-gray-400 font-medium">الوزن</p>
            <p className="font-extrabold text-gray-900 text-lg">
              {animal?.weight_kg != null ? `${animal.weight_kg} كجم` : '—'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <CalendarDays className="w-4 h-4 text-[#2a5c2a] mx-auto mb-1" />
            <p className="text-sm text-gray-400 font-medium">العمر</p>
            <p className="font-extrabold text-gray-900 text-lg">{ageLabel}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <Dna className="w-4 h-4 text-[#2a5c2a] mx-auto mb-1" />
            <p className="text-sm text-gray-400 font-medium">الجنس</p>
            <p className={`font-extrabold text-base ${animal?.gender === 'female' ? 'text-pink-500' : 'text-blue-500'}`}>
              {genderLabel}
            </p>
          </div>
        </div>

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
// ─── FILTER SELECT ────────────────────────────────────────────────────────────
const FilterSelect = ({ label, value, onChange, options }) => {
  const isActive = value !== 'all';

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-400 text-right px-1">
        {label}
      </label>
      <div className="relative">
        
       
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`appearance-none w-full min-w-[160px] pr-9 pl-8 py-2.5 rounded-xl text-sm font-bold text-right outline-none cursor-pointer transition-colors border
            ${isActive
              ? 'bg-[#2a5c2a]/5 border-[#2a5c2a]/30 text-[#2a5c2a]'
              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            } focus:border-[#2a5c2a]`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
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
   const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 12;

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
const totalPages = Math.max(1, Math.ceil(displayAnimals.length / ITEMS_PER_PAGE));
const paginatedAnimals = displayAnimals.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);  
useEffect(() => {
  setCurrentPage(1);
}, [filterSpecies, filterStatus, filterAge, searchTerm]);


  if (loading.animals) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center font-cairo">
        <Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col font-cairo" dir="rtl">
      <TopNavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <main className="max-w-[1400px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex-1 flex flex-col">

        {/* Page header removed; controls moved into filter bar */}

        {/* ── Filter Bar ────────────────────────────────────────────── */}
        <div className="bg-white rounded-[20px] px-4 sm:px-6 py-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7">
          {/* Left: Add / Import buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/animals/add`)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a5c2a] text-white rounded-xl text-sm font-bold hover:bg-[#1e4520] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              إضافة حيوان
            </button>
           
          </div>

          {/* Center: Search bar */}
          <div className="flex-1 sm:max-w-xl sm:mx-6">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute right-4 top-3" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder="البحث برقم التعريف أو الاسم / السلالة..."
                className="w-full bg-gray-50 border border-gray-100 rounded-full py-2.5 pr-11 pl-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#2a5c2a]/20 focus:border-[#2a5c2a] transition-all"
              />
            </div>
          </div>

          {/* Right: Filter dropdowns + clear */}
         <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {hasFilters && (
              <button
                onClick={() => { setFilterSpecies('all'); setFilterStatus('all'); setFilterAge('all'); setSearchTerm(''); }}
                className="flex items-center gap-1.5 px-3 py-2.5 border border-red-100 rounded-xl text-sm font-bold text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors bg-white self-end"
              >
                <X className="w-3.5 h-3.5" />
                مسح الفلاتر
              </button>
            )}

            <FilterSelect
  label="الحالة الصحية"
  value={filterStatus}
  onChange={setFilterStatus}
  options={[
    { value: 'all', label: 'جميع الحالات' },
    { value: 'healthy', label: 'سليم' },
    { value: 'sick', label: 'مراقبة' },
    { value: 'critical', label: 'حالة حرجة' },
  ]}
/>

<FilterSelect
  label="الفئة العمرية"
  value={filterAge}
  onChange={setFilterAge}
  options={[
    { value: 'all', label: 'جميع الأعمار' },
    { value: 'young', label: 'أقل من سنة' },
    { value: 'mid', label: '1 - 3 سنوات' },
    { value: 'adult', label: 'أكثر من 3 سنوات' },
  ]}
/>

<FilterSelect
  label="نوع السلالة"
  value={filterSpecies}
  onChange={setFilterSpecies}
  options={[
    { value: 'all', label: 'جميع الأنواع' },
    { value: 'cattle', label: 'أبقار' },
    { value: 'sheep', label: 'أغنام' },
    { value: 'goat', label: 'ماعز' },
    { value: 'horse', label: 'خيل' },
    { value: 'pig', label: 'خنازير' },
  ]}
/>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 flex-1 items-start content-start">
  {paginatedAnimals.map((animal) => (
    <AnimalCard
      key={animal._id}
      animal={animal}
      onClick={() => navigate(`/animals/${animal._id}`)}
    />
  ))}
</div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
{displayAnimals.length > 0 && (
  <div className="flex items-center justify-between mt-10 pt-6">
    <div className="flex items-center gap-2" dir="ltr">
      <button
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${
            page === currentPage
              ? 'border border-[#2a5c2a] bg-[#1e4520] text-white shadow-sm'
              : 'border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>

    <div className="text-[12px] text-gray-500 font-medium">
      عرض {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, displayAnimals.length)} من أصل {displayAnimals.length} حيوان
    </div>
  </div>
)}

      </main>

      {/* Footer intentionally removed from this page */}
    </div>
  );
};

export default AnimalsListPage;
