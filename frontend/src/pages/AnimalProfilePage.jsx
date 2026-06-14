// ─── Animal Profile Page ──────────────────────────────────────────────────────
// Entry point for the Animal Profile feature.
// Fetches all animal data sections in parallel on mount.
// Uses Redux animalSlice; falls back to mock data when backend is unavailable.
// Route: /animals/:id  (registered in AppRoutes.jsx)

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, AlertTriangle } from 'lucide-react';

import {
  fetchAnimalById,
  fetchAnimalVaccinations,
  fetchAnimalMedicalHistory,
  fetchAnimalDiagnosisHistory,
  fetchAnimalWeightHistory,
  clearAnimalState,
} from '../redux/animalSlice';

import AnimalProfileHeader from '../features/animals/components/AnimalProfileHeader';
import VaccinationTable from '../features/animals/components/VaccinationTable';
import MedicalHistorySection from '../features/animals/components/MedicalHistorySection';
import DiagnosisHistorySection from '../features/animals/components/DiagnosisHistorySection';
import WeightTrackingSection from '../features/animals/components/WeightTrackingSection';
import NotesSection from '../features/animals/components/NotesSection';

const AnimalProfilePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    animal,
    vaccinations,
    medicalHistory,
    diagnosisHistory,
    weightHistory,
    notes,
    loading,
    error,
  } = useSelector((state) => state.animal);

  // ── Fetch all sections in parallel on mount ────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const animalId = id;

    dispatch(fetchAnimalById(animalId));
    dispatch(fetchAnimalVaccinations(animalId));
    dispatch(fetchAnimalMedicalHistory(animalId));
    dispatch(fetchAnimalDiagnosisHistory(animalId));
    dispatch(fetchAnimalWeightHistory(animalId));

    return () => {
      dispatch(clearAnimalState());
    };
  }, [id, dispatch]);

  // ── Full-page loading ──────────────────────────────────────────────────────
  if (loading.animal && !animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm">جارٍ تحميل بيانات الحيوان…</p>
        </div>
      </div>
    );
  }

  // ── Full-page error (animal not found) ────────────────────────────────────
  if (error.animal && !animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="font-semibold text-gray-800 mb-1">تعذّر تحميل البيانات</h2>
          <p className="text-sm text-gray-500 mb-4">{error.animal}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mx-auto"
          >
            <ArrowRight className="w-4 h-4" />
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* ── Sticky top bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            id="btn-back-to-animals"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-sm font-medium text-gray-700 truncate">
            ملف الحيوان
            {animal?.name && <span className="text-gray-400"> — {animal.name}</span>}
          </h1>
        </div>
      </div>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 1 · Header */}
        {animal && <AnimalProfileHeader animal={animal} />}

        {/* 2 · Vaccination History */}
        <VaccinationTable
          vaccinations={vaccinations}
          loading={loading.vaccinations}
          error={error.vaccinations}
        />

        {/* 3 · Medical History */}
        <MedicalHistorySection
          medicalHistory={medicalHistory}
          loading={loading.medicalHistory}
          error={error.medicalHistory}
        />

        {/* 4 · AI Diagnosis History */}
        <DiagnosisHistorySection
          diagnosisHistory={diagnosisHistory}
          loading={loading.diagnosisHistory}
          error={error.diagnosisHistory}
        />

        {/* 5 · Weight Tracking */}
        <WeightTrackingSection
          weightHistory={weightHistory}
          loading={loading.weightHistory}
          error={error.weightHistory}
        />

        {/* 6 · Notes */}
        <NotesSection notes={notes} />
      </main>
    </div>
  );
};

export default AnimalProfilePage;
