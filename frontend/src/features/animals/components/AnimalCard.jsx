// ─── Animal Card ──────────────────────────────────────────────────────────────
// Compact card used in the Animals List page.
// Matches the provided UI design exactly.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import {
  SPECIES_MAP,
  HEALTH_STATUS_MAP,
  calculateAge,
} from '../utils/formatters';

// Icons based on the design
const BreedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" /><path d="M18 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" /><path d="M10.5 10.5 14 7l-3.5-3.5" /><path d="M14 7H3" /></svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
);
const WeightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M12 9v6" /><path d="M9 12h6" /></svg>
);
const ThermometerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" /></svg>
);

const AnimalCard = ({ animal }) => {
  const navigate = useNavigate();
  const species = SPECIES_MAP[animal?.species] || { label: animal?.species || 'غير محدد' };

  // Health badge styles — aligned with backend enum: healthy|sick|critical|deceased
  let healthStyle = {
    badgeBg: 'bg-[#eaf5eb]', badgeText: 'text-[#2a5c2a]', dot: 'bg-[#2a5c2a]',
    label: 'سليم', buttonBg: 'bg-[#eaf5eb] text-[#2a5c2a] hover:bg-[#d8ebd8]',
    buttonText: 'عرض السجل الصحي'
  };
  if (animal?.health_status === 'critical') {
    healthStyle = {
      badgeBg: 'bg-[#fce8e8]', badgeText: 'text-[#b91c1c]', dot: 'bg-[#b91c1c]',
      label: 'حالة حرجة', buttonBg: 'bg-[#fce8e8] text-[#b91c1c] hover:bg-[#fad1d1]',
      buttonText: 'إجراء طارئ'
    };
  } else if (animal?.health_status === 'sick') {
    healthStyle = {
      badgeBg: 'bg-[#fef9c3]', badgeText: 'text-[#a16207]', dot: 'bg-[#ca8a04]',
      label: 'مراقبة', buttonBg: 'bg-[#fef9c3] text-[#a16207] hover:bg-[#fef08a]',
      buttonText: 'تحديث السجل'
    };
  } else if (animal?.health_status === 'deceased') {
    healthStyle = {
      badgeBg: 'bg-gray-100', badgeText: 'text-gray-600', dot: 'bg-gray-400',
      label: 'متوفى', buttonBg: 'bg-gray-100 text-gray-500',
      buttonText: 'عرض السجل'
    };
  }

  // Default images keyed by backend species enum: cattle | sheep | goat
  const defaultImages = {
    cattle: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=400&h=250',
    sheep: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=400&h=250',
    goat: 'https://images.unsplash.com/photo-1501706362039-c06b2d715385?auto=format&fit=crop&q=80&w=400&h=250',
  };

  // const imageUrl = animal?.image || animal?.imageUrl || defaultImages[animal?.species] || defaultImages.cattle;
  const imageUrl = animal?.image
    ? `http://localhost:5000${animal.image}`
    : animal?.imageUrl || defaultImages[animal?.species] || defaultImages.cattle;
  return (
    <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col font-cairo">
      {/* Top Image Area */}
      <div className="relative h-[200px] w-full bg-gray-200">
        <img src={imageUrl} alt={animal?.name} className="w-full h-full object-cover" />
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold shadow-sm ${healthStyle.badgeBg} ${healthStyle.badgeText}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${healthStyle.dot}`} />
          {healthStyle.label}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Header: Name and Menu */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg truncate mb-0.5">
              {animal?.name || 'بدون اسم'}
            </h3>
            <p className="text-[12px] text-gray-500 font-medium truncate">
              رقم التعريف: #{animal?.tag_number || '---'}
            </p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[12px] text-gray-700 my-5 flex-grow">
          <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-1.5 text-gray-400 font-medium">
              <BreedIcon /> النوع
            </div>
            <span className="font-bold text-gray-900 pr-5">{species.label}</span>
          </div>

          <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-1.5 text-gray-400 font-medium">
              <CalendarIcon /> العمر
            </div>
            <span className="font-bold text-gray-900 pr-5">{calculateAge(animal?.birth_date) || 'غير محدد'}</span>
          </div>

          <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-1.5 text-gray-400 font-medium">
              <WeightIcon /> الوزن
            </div>
            <span className="font-bold text-gray-900 pr-5">{animal?.weight_kg ? `${animal.weight_kg} كجم` : '—'}</span>
          </div>

          <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-1.5 text-gray-400 font-medium">
              <ThermometerIcon /> الحالة
            </div>
            <span className="font-bold text-gray-900 pr-5">{healthStyle.label}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate(`/animals/${animal?._id}`)}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${healthStyle.buttonBg}`}
        >
          {healthStyle.buttonText}
        </button>
      </div>
    </div>
  );
};

export default AnimalCard;
