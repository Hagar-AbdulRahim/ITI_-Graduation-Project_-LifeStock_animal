import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Auth Pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import VerifyEmail from '../pages/Auth/VerifyEmail';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
import VerifyOtp from '../pages/Auth/VerifyOtp';

// Feature Pages
import FarmsPage from '../pages/Farms/FarmsPage';
// import FarmDetailsPage removed; details page merged into farm card
import AddFarmPage from '../pages/Farms/AddFarmPage';
import AnimalsListPage from '../pages/Animals/AnimalsListPage';
import AnimalProfilePage from '../pages/AnimalProfilePage';
import AddAnimalPage from '../pages/Animals/AddAnimalPage';
import EditAnimalPage from '../pages/Animals/EditAnimalPage';
import AddVaccinationPage from '../pages/Animals/AddVaccinationPage';
import AddMedicalRecordPage from '../pages/Animals/AddMedicalRecordPage';

// Dashboard & Layout Pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import MainLayout from '../layout/MainLayout';
import LandingPage from '../pages/Home/LandingPage';
import AiAssistantPage from '../pages/AiAssistantPage';
import DiagnosisPage from '../pages/DiagnosisPage';
import ImageAnalysisPage from '../pages/ImageAnalysis/ImageAnalysisPage';
import VaccinationsPage from '../pages/Vaccinations/VaccinationsPage';

// ComingSoon component for placeholder pages in the dashboard flow
const ComingSoon = ({ title }) => (
  <div dir="rtl" className="flex flex-col items-center justify-center h-[60vh] text-stone-400 font-cairo">
    <div className="text-5xl mb-4">🚧</div>
    <p className="text-xl font-bold text-stone-600">{title}</p>
    <p className="text-sm mt-2">هذه الصفحة قيد التطوير</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root route renders LandingPage */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Standalone Protected Farm management routes */}
      <Route
        path="/farms"
        element={
          <ProtectedRoute>
            <FarmsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farms/add"
        element={
          <ProtectedRoute>
            <AddFarmPage />
          </ProtectedRoute>
        }
      />

      {/* Nested Farm Dashboard Routes (all render inside MainLayout with Sidebar/Topbar) */}
      <Route
        path="/farms/:farmId"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Farm overview dashboard */}
        <Route index element={<DashboardPage />} />


        {/* Animals list within the farm dashboard */}
        <Route path="animals" element={<AnimalsListPage />} />

        {/* Mock/ComingSoon subpages inside the dashboard */}
        <Route path="ai-assistant" element={<AiAssistantPage />} />
        <Route path="diagnosis" element={<DiagnosisPage />} />
        <Route path="image-analysis" element={<ImageAnalysisPage />} />
        <Route path="vaccinations" element={<VaccinationsPage />} />
        <Route path="emergencies" element={<ComingSoon title="حالات الطوارئ" />} />
        <Route path="library" element={<ComingSoon title="المكتبة" />} />
        <Route path="reports" element={<ComingSoon title="التقارير" />} />
      </Route>

      {/* Standalone Animal subpages (with their own custom headers & back buttons) */}
      <Route
        path="/animals/add"
        element={
          <ProtectedRoute>
            <AddAnimalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/animals/edit/:id"
        element={
          <ProtectedRoute>
            <EditAnimalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/animals/:id"
        element={
          <ProtectedRoute>
            <AnimalProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/animals/:id/vaccinations/add"
        element={
          <ProtectedRoute>
            <AddVaccinationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/animals/:id/medical-records/add"
        element={
          <ProtectedRoute>
            <AddMedicalRecordPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/farms" replace />} />
    </Routes>
  );
};

export default AppRoutes;