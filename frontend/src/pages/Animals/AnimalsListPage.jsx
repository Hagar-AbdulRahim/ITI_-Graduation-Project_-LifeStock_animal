import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useInView } from 'framer-motion';
import {
  Search, Plus, ArrowRight, Upload,
  ChevronRight, ChevronLeft, ChevronDown, Loader2, MoreVertical,
  PawPrint, Syringe, AlertTriangle, CheckCircle,
  CalendarDays, Weight, User, HeartPulse, X
} from 'lucide-react';

import { animalService } from '../../features/animals/services/animalService';

import cowImg from '../../assets/images/Profile/cow.png';
import goatImg from '../../assets/images/Profile/goat.png';
import sheepImg from '../../assets/images/Profile/sheep.png';
import { fetchFarmById, fetchFarmAnimals } from '../../redux/farmSlice';

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const SPECIES_MAP = { cattle: 'أبقار', sheep: 'أغنام', goat: 'ماعز' };
const GENDER_MAP = { male: 'ذكر', female: 'أنثى' };
const SPECIES_IMAGE = { cattle: cowImg, sheep: sheepImg, goat: goatImg };
const SPECIES_EMOJI = { cattle: '🐄', sheep: '🐑', goat: '🐐' };

const formatAge = (animal) => {
  if (animal?.age_value != null && animal?.age_unit) {
    const unitMap = { days: 'يوم', months: 'شهر', years: 'سنة' };
    return `${animal.age_value} ${unitMap[animal.age_unit] || animal.age_unit}`;
  }
  if (!animal?.birth_date) return '—';
  const diffMs = Date.now() - new Date(animal.birth_date);
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  if (months < 1) return `${Math.floor(diffMs / (1000 * 60 * 60 * 24))} يوم`;
  if (months < 12) return `${months} شهر`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}.${rem} سنة` : `${years} سنة`;
};

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
    case 'critical': return { badgeBg: 'bg-red-50', badgeText: 'text-red-700', dot: 'bg-red-500', label: 'حالة حرجة', borderAccent: 'border-red-200' };
    case 'sick': return { badgeBg: 'bg-amber-50', badgeText: 'text-amber-700', dot: 'bg-amber-500', label: 'مراقبة', borderAccent: 'border-amber-200' };
    case 'deceased': return { badgeBg: 'bg-gray-100', badgeText: 'text-gray-500', dot: 'bg-gray-400', label: 'متوفى', borderAccent: 'border-gray-200' };
    default: return { badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', dot: 'bg-emerald-500', label: 'سليم', borderAccent: 'border-emerald-200' };
  }
};

// ─── ANIMAL CARD (with scroll animation via useInView) ─────────────────────────
const AnimalCard = ({ animal, onClick, index, onEdit, onDelete }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const h = getHealthStyle(animal?.health_status);
  const speciesLabel = SPECIES_MAP[animal?.species] || animal?.species || 'غير محدد';
  const genderLabel = GENDER_MAP[animal?.gender] || '—';
  const ageLabel = formatAge(animal);
  const emoji = SPECIES_EMOJI[animal?.species] || '🐾';
  const imgSrc = SPECIES_IMAGE[animal?.species];

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08, ease: 'easeOut' }}
      onClick={onClick}
      className={`bg-white border ${h.borderAccent} rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group relative min-w-0`}
    >
      {/* ── Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#2a5c2a] to-emerald-400" />

      {/* ── Three-dot menu */}
      <div ref={menuRef} className="absolute top-3.5 left-3.5 z-20">
        <button
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 ${menuOpen ? 'bg-gray-100 text-gray-700' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
            }`}
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          title="خيارات"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-9 left-0 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <button
              className="w-full text-right px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit && onEdit(animal); }}
            >
              تعديل
            </button>
            <div className="h-px bg-gray-100 mx-3" />
            <button
              className="w-full text-right px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete && onDelete(animal); }}
            >
              حذف
            </button>
          </motion.div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-grow gap-3 sm:gap-4">
        {/* ── Header row */}
        <div className="flex items-center justify-between">
          {/* Avatar + tag */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#2a5c2a] flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              {imgSrc
                ? <img src={imgSrc} alt={speciesLabel} className="w-10 h-10 object-contain select-none" />
                : <span className="text-2xl select-none">{emoji}</span>}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 leading-none mb-0.5">{speciesLabel}</p>
              <h3 className="font-extrabold text-[#2a5c2a] text-xl tracking-wide leading-tight">
                {animal?.tag_number || '---'}
              </h3>
            </div>
          </div>

          {/* Health badge */}
          <div className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold ${h.badgeBg} ${h.badgeText}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${h.dot}`} />
            {h.label}
          </div>
        </div>

        {/* ── Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { Icon: Weight, label: 'الوزن', value: animal?.weight_kg != null ? `${animal.weight_kg} كجم` : '—' },
            { Icon: CalendarDays, label: 'العمر', value: ageLabel },
            { Icon: User, label: 'الجنس', value: genderLabel, colored: true, gender: animal?.gender },
          ].map(({ Icon, label, value, colored, gender }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100 hover:bg-gray-100 transition-colors">
              <Icon className="w-3.5 h-3.5 text-[#2a5c2a] mx-auto mb-1" />
              <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
              <p className={`font-extrabold text-sm ${colored ? (gender === 'female' ? 'text-pink-500' : 'text-blue-500') : 'text-gray-900'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── CTA button */}
        <button
          className="w-full py-2.5 rounded-xl text-[13px] font-bold bg-[#2a5c2a] text-white hover:bg-[#1e4520] hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 transition-all duration-200 mt-auto"
          onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
        >
          انتقل إلى تفاصيل الحيوان
        </button>
      </div>
    </motion.div>
  );
};

// ─── STATS BANNER ──────────────────────────────────────────────────────────────
const StatsBanner = ({ animals }) => {
  const total = animals.length;
  const healthy = animals.filter(a => a.health_status === 'healthy').length;
  const sick = animals.filter(a => a.health_status === 'sick').length;
  const critical = animals.filter(a => a.health_status === 'critical').length;

  const stats = [
    { label: 'إجمالي الحيوانات', value: total, accent: 'text-[#2a5c2a]', iconBg: 'bg-emerald-50', icon: <PawPrint className="w-5 h-5" /> },
    { label: 'سليم', value: healthy, accent: 'text-emerald-600', iconBg: 'bg-emerald-50', icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'مراقبة', value: sick, accent: 'text-amber-600', iconBg: 'bg-amber-50', icon: <Syringe className="w-5 h-5" /> },
    { label: 'حالة حرجة', value: critical, accent: 'text-red-600', iconBg: 'bg-red-50', icon: <AlertTriangle className="w-5 h-5" /> },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-7">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.07 }}
          className="bg-white rounded-2xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-default"
        >
          <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl ${s.iconBg} ${s.accent} flex items-center justify-center flex-shrink-0`}>
            {React.cloneElement(s.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
          </div>
          <div className="text-right flex-1 min-w-0">
            <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold truncate">{s.label}</p>
            <p className={`text-base sm:text-[26px] font-extrabold leading-tight ${s.accent}`}>{s.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ─── FILTER SELECT ─────────────────────────────────────────────────────────────
const FilterSelect = ({ value, onChange, options }) => {
  const isActive = value !== 'all';
  return (
    <div className="relative w-full min-w-0 lg:flex-1 lg:min-w-[140px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none w-full pr-6 sm:pr-8 pl-6 sm:pl-8 py-2.5 rounded-xl text-[11px] sm:text-sm font-bold text-right outline-none cursor-pointer transition-colors border
          ${isActive ? 'bg-white border-white text-[#1b4d2c]' : 'bg-white/95 border-white text-gray-700 hover:bg-white'}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
    </div>
  );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
const AnimalsListPage = () => {
  const { farmId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { farmAnimals, loading } = useSelector((state) => state.farm);
  const userRole = useSelector((state) => state.auth?.user?.role);
  const canManageAnimals = userRole !== 'admin' && userRole !== 'sub_admin';

  const [filterSpecies, setFilterSpecies] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAge, setFilterAge] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    if (farmId) {
      dispatch(fetchFarmById(farmId));
      dispatch(fetchFarmAnimals(farmId));
    }
  }, [dispatch, farmId]);

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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const targetFarmId = farmId || (rawAnimals.length > 0 ? (rawAnimals[0].farm_id?._id || rawAnimals[0].farm_id) : null);

    if (!targetFarmId) {
      alert("تعذر تحديد المزرعة. الرجاء المحاولة من صفحة المزرعة.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('farm_id', targetFarmId);

    try {
      setIsUploading(true);
      const res = await animalService.bulkImportAnimals(formData);
      alert(res.message || "تم استيراد الحيوانات بنجاح!");
      if (targetFarmId) {
        dispatch(fetchFarmAnimals(targetFarmId));
        dispatch(fetchFarmById(targetFarmId));
      }
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء استيراد الملف");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const hasFilters = filterSpecies !== 'all' || filterStatus !== 'all' || filterAge !== 'all' || !!searchTerm;
  const totalPages = Math.max(1, Math.ceil(displayAnimals.length / ITEMS_PER_PAGE));
  const paginatedAnimals = displayAnimals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [filterSpecies, filterStatus, filterAge, searchTerm]);

  if (loading.animals && rawAnimals.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center font-cairo">
        <Loader2 className="w-8 h-8 text-[#2a5c2a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col font-cairo overflow-x-hidden" dir="rtl">

      {/* ══════════════════════ GREEN HERO HEADER ══════════════════════ */}
      <div className="bg-[#1b4d2c] w-full">
        {/* Back button row */}
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-3 sm:pb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm transition-colors group"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            رجوع
          </button>
        </div>

        {/* Filter Bar inside the green header */}
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 pb-4 sm:pb-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* Add & Upload buttons */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2">
              {canManageAnimals && (
                <>
                  <button
                    onClick={() => navigate(farmId ? `/farms/${farmId}/animals/add` : '/animals/add')}
                    className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#1b4d2c] rounded-xl text-sm font-bold hover:bg-stone-50 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة حيوان
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2a5c2a] text-white border border-[#2a5c2a] rounded-xl text-sm font-bold hover:bg-[#1e4520] hover:border-[#1e4520] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    استيراد شيت
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Search */}
            <div className="w-full lg:flex-1 lg:max-w-xl lg:mx-4">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 sm:right-3.5 top-2.5 sm:top-3" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                  placeholder="البحث برقم التعريف أو الاسم..."
                  className="w-full bg-white rounded-full py-2 sm:py-2.5 pr-9 sm:pr-10 pl-3 sm:pl-4 text-xs sm:text-sm text-gray-700 outline-none focus:ring-2 focus:ring-white/40 transition-all border border-white"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2 w-full lg:w-auto lg:items-center">
              {hasFilters && (
                <button
                  onClick={() => { setFilterSpecies('all'); setFilterStatus('all'); setFilterAge('all'); setSearchTerm(''); }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-white/30 rounded-xl text-sm font-bold text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  مسح
                </button>
              )}
              <FilterSelect value={filterStatus} onChange={setFilterStatus} options={[
                { value: 'all', label: 'جميع الحالات' },
                { value: 'healthy', label: 'سليم' },
                { value: 'sick', label: 'مراقبة' },
                { value: 'critical', label: 'حالة حرجة' },
              ]} />
              <FilterSelect value={filterAge} onChange={setFilterAge} options={[
                { value: 'all', label: 'جميع الأعمار' },
                { value: 'young', label: 'أقل من سنة' },
                { value: 'mid', label: '1 - 3 سنوات' },
                { value: 'adult', label: 'أكثر من 3 سنوات' },
              ]} />
              <FilterSelect value={filterSpecies} onChange={setFilterSpecies} options={[
                { value: 'all', label: 'جميع الأنواع' },
                { value: 'cattle', label: 'أبقار' },
                { value: 'sheep', label: 'أغنام' },
                { value: 'goat', label: 'ماعز' },
                
              ]} />
            </div>
          </div>
        </div>
      </div>
      {/* ══════════════════════════════════════════════════════════════ */}

      <main className="max-w-[1400px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">

        {/* Stats Banner */}
        <StatsBanner animals={rawAnimals} />

        {/* Animals Grid */}
        {rawAnimals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <PawPrint className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold text-lg">لم يتم العثور على حيوانات</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 flex-1 items-start content-start">
            {paginatedAnimals.map((animal, index) => (
              <AnimalCard
                key={animal._id}
                animal={animal}
                index={index}
                onClick={() => navigate(`/animals/${animal._id}`)}
                onEdit={(a) => navigate(`/animals/${a._id}/edit`)}
                onDelete={(a) => {
                  if (window.confirm(`هل أنت متأكد من حذف الحيوان "${a.tag_number}"؟`)) {
                    // TODO: dispatch delete action
                    console.log('delete', a._id);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
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
                  className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${page === currentPage
                      ? 'bg-[#1e4520] text-white shadow-sm border border-[#2a5c2a]'
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
          </div>
        )}
      </main>
    </div>
  );
};

export default AnimalsListPage;
