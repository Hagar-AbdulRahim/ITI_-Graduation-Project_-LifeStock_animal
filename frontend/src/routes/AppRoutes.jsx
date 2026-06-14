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
// import FarmDetailsPage from '../pages/Farms/FarmDetailsPage';
import AddFarmPage from '../pages/Farms/AddFarmPage';
import AnimalsListPage from '../pages/Animals/AnimalsListPage';
import AnimalProfilePage from '../pages/AnimalProfilePage';
import AddAnimalPage from '../pages/Animals/AddAnimalPage';
import EditAnimalPage from '../pages/Animals/EditAnimalPage';
import AddVaccinationPage from '../pages/Animals/AddVaccinationPage';
import AddMedicalRecordPage from '../pages/Animals/AddMedicalRecordPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/farms" replace />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Feature Routes */}
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
      {/* FarmDetailsPage Route Removed to avoid conflicts, teammate will add it */}
      <Route 
        path="/farms/:farmId/animals" 
        element={
          <ProtectedRoute>
            <AnimalsListPage />
          </ProtectedRoute>
        } 
      />
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