// ─── Animal Profile Header ─────────────────────────────────────────────────
// Displays animal emblem, name, tag, species badge, health status, and key stats.

import React from 'react';
import { Tag, MapPin, Edit, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  SPECIES_MAP,
  GENDER_MAP,
  HEALTH_STATUS_MAP,
} from '../utils/formatters';

const AnimalProfileHeader = ({ animal }) => {
  const navigate = useNavigate();
  const species = SPECIES_MAP[animal?.species] || { label: animal?.species || 'غير محدد' };
  const gender = GENDER_MAP[animal?.gender] || { label: animal?.gender, symbol: '', color: 'text-gray-600' };
  const healthStatus = HEALTH_STATUS_MAP[animal?.health_status] || HEALTH_STATUS_MAP.healthy;
  const displayName = animal?.tag_number || 'بدون وسم';
  const speciesEmoji = {
    cattle: '🐄',
    sheep: '🐑',
    goat: '🐐',
    horse: '🐎',
    pig: '🐷',
  };
  const emoji = speciesEmoji[animal?.species] || '🐾';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Emblem */}
        <div className="w-32 h-32 rounded-2xl flex-shrink-0 bg-gradient-to-br from-[#f0f7ef] to-[#ffffff] ring-4 ring-gray-50 shadow-sm relative flex items-center justify-center text-5xl">
          <span>{emoji}</span>
          <div className={`absolute top-0 right-0 w-full h-1 ${healthStatus.badgeColor}`}></div>
        </div>

        {/* Main Info */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${healthStatus.badgeColor}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${healthStatus.dot} ml-1.5 align-middle`} />
                  {healthStatus.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5" dir="ltr">
                  #{animal?.tag_number || '---'}
                  <Tag className="w-4 h-4 ml-1" />
                </span>
                {animal?.farm_id?.name && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {animal.farm_id.name}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button 
                onClick={() => navigate(`/animals/edit/${animal?._id}`)}
                className="flex-1 md:flex-none px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit className="w-4 h-4" />
                تعديل
              </button>
              <button 
                disabled
                title="هذه الميزة غير متاحة حاليًا"
                className="flex-1 md:flex-none px-3 py-2 bg-gray-100 text-gray-400 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 border border-gray-200 cursor-not-allowed"
              >
                <Plus className="w-4 h-4 opacity-50" />
                سجل طبي
              </button>
              <button 
                onClick={() => navigate(`/animals/${animal?._id}/vaccinations/add`)}
                className="flex-1 md:flex-none px-3 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-green-200"
              >
                <Plus className="w-4 h-4" />
                تطعيم
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 border-t border-gray-100 pt-4">
            <DetailItem label="النوع" value={species.label} />
            <DetailItem label="السلالة" value={animal?.breed || '—'} />
            <DetailItem label="العمر" value={animal?.age_value != null ? `${animal.age_value} ${animal.age_unit === 'years' ? 'سنة' : 'شهر'}` : '—'} />
            <DetailItem label="الوزن" value={animal?.weight_kg ? `${animal.weight_kg} كجم` : '—'} />
            <DetailItem label="الجنس" value={`${gender.symbol} ${gender.label}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-500 mb-0.5">{label}</span>
    <span className="font-semibold text-gray-900 text-sm">{value}</span>
  </div>
);

export default AnimalProfileHeader;
