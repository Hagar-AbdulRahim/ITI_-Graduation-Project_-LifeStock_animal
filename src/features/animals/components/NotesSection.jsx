// ─── Notes Section ────────────────────────────────────────────────────────────
// Displays veterinarian notes and farmer notes in separate columns.

import React from 'react';
import { FileText, Stethoscope, Tractor } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { SectionHeader } from './VaccinationTable';

const NotesSection = ({ notes }) => {
  if (!notes) return null;

  const { vet_notes = [], farmer_notes = [] } = notes;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <SectionHeader
        title="الملاحظات"
        icon={<FileText className="w-5 h-5 text-orange-500" />}
      />

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Vet Notes */}
        <NotesColumn
          title="ملاحظات الطبيب البيطري"
          icon={<Stethoscope className="w-4 h-4 text-blue-500" />}
          notes={vet_notes}
          accentClass="border-blue-200 bg-blue-50"
          nameClass="text-blue-600"
        />

        {/* Farmer Notes */}
        <NotesColumn
          title="ملاحظات المزارع"
          icon={<Tractor className="w-4 h-4 text-amber-500" />}
          notes={farmer_notes}
          accentClass="border-amber-200 bg-amber-50"
          nameClass="text-amber-600"
        />
      </div>
    </div>
  );
};

const NotesColumn = ({ title, icon, notes, accentClass, nameClass }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
    </div>

    {notes.length === 0 ? (
      <p className="text-sm text-gray-400 py-4 text-center">لا توجد ملاحظات</p>
    ) : (
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note._id}
            className={`rounded-xl p-4 border ${accentClass} text-sm`}
          >
            <p className="text-gray-700 leading-relaxed mb-2">{note.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className={`font-medium ${nameClass}`}>{note.created_by}</span>
              <span>{formatDate(note.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default NotesSection;
