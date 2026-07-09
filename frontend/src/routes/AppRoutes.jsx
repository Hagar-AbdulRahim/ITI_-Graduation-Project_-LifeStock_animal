import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'

// Auth Pages
import Login from '../pages/Auth/Login'
import Register from '../pages/Auth/Register'
import VerifyEmail from '../pages/Auth/VerifyEmail'
import ForgotPassword from '../pages/Auth/ForgotPassword'
import ResetPassword from '../pages/Auth/ResetPassword'
import VerifyOtp from '../pages/Auth/VerifyOtp'

// Feature Pages
import FarmsPage from '../pages/Farms/FarmsPage'
// import FarmDetailsPage removed; details page merged into farm card
import AddFarmPage from '../pages/Farms/AddFarmPage'
import AnimalsListPage from '../pages/Animals/AnimalsListPage'
import AnimalProfilePage from '../pages/AnimalProfilePage'
import AddAnimalPage from '../pages/Animals/AddAnimalPage'
import OnboardingChatPage from '../pages/Animals/OnboardingChatPage'
import EditAnimalPage from '../pages/Animals/EditAnimalPage'
import AddVaccinationPage from '../pages/Animals/AddVaccinationPage'
import AddMedicalRecordPage from '../pages/Animals/AddMedicalRecordPage'
import AnimalMedicalRecordsPage from '../pages/Animals/AnimalMedicalRecordsPage'
import AnimalVaccinationsPage from '../pages/Animals/AnimalVaccinationsPage'
import EditVaccinationPage from '../pages/Animals/EditVaccinationPage'
import NotificationsPage from '../pages/NotificationsPage'
import VaccineAgentPage from '../pages/VaccineAgentPage'
import AnimalHealthCasesPage from '../pages/Animals/AnimalHealthCasesPage'
import HealthCaseDetailPage from '../pages/Animals/HealthCaseDetailPage'
import ReviewsPage from '../pages/Reviews/ReviewsPage'
import ContactUsPage from '../pages/ContactUs/ContactUsPage'

import ServicesPage from '../pages/ServicesPage'



// Dashboard & Layout Pages
import MainLayout from '../layout/MainLayout'
import LandingPage from '../pages/Home/LandingPage'
import AiAssistantPage from '../pages/AiAssistantPage'

// Admin Portal
import AdminLayout from '../layout/AdminLayout'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminUserDetailPage from '../pages/admin/AdminUserDetailPage'
import AdminConsultationsPage from '../pages/admin/AdminConsultationsPage'
import AdminKnowledgePage from '../pages/admin/AdminKnowledgePage'
import AdminOutbreaksPage from '../pages/admin/AdminOutbreaksPage'
import AdminOutbreakAnalyticsPage from '../pages/admin/AdminOutbreakAnalyticsPage'
import AdminFarmsPage from '../pages/admin/AdminFarmsPage'
import AdminAnimalsPage from '../pages/admin/AdminAnimalsPage'

// Emergency
import EmergencyPage from '../pages/EmergencyPage'

// ComingSoon component for placeholder pages in the dashboard flow
const ComingSoon = ({ title }) => (
  <div
    dir="rtl"
    className="flex flex-col items-center justify-center h-[60vh] text-stone-400 font-cairo"
  >
    <div className="text-5xl mb-4">🚧</div>
    <p className="text-xl font-bold text-stone-600">{title}</p>
    <p className="text-sm mt-2">هذه الصفحة قيد التطوير</p>
  </div>
)

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root route renders LandingPage */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/contact" element={<ContactUsPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/services" element={<ServicesPage />} />
     

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
        {/* Farm overview dashboard removed; redirect to animals list */}
        <Route index element={<Navigate to="animals" replace />} />

        {/* Animals list within the farm dashboard */}
        <Route path="animals" element={<AnimalsListPage />} />

        {/* Mock/ComingSoon subpages inside the dashboard */}
        <Route path="ai-assistant" element={<AiAssistantPage />} />
        <Route path="emergencies" element={<EmergencyPage />} />

        
      </Route>

      {/* Standalone Animal subpages (with their own custom headers & back buttons) */}
      <Route
        path="/farms/:farmId/animals/add"
        element={
          <ProtectedRoute>
            <AddAnimalPage />
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
        path="/animals/:animalId/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingChatPage />
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
      <Route
        path="/animals/:id/medical-records"
        element={
          <ProtectedRoute>
            <AnimalMedicalRecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/animals/:animalId/health-record"
        element={
          <ProtectedRoute>
            <AnimalHealthCasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/health-record/:caseId"
        element={
          <ProtectedRoute>
            <HealthCaseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/animals/:id/vaccinations"
        element={
          <ProtectedRoute>
            <AnimalVaccinationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/animals/:id/vaccinations/edit/:vacId"
        element={
          <ProtectedRoute>
            <EditVaccinationPage />
          </ProtectedRoute>
        }
      />
      <Route
      path="/notifications"
      element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<NotificationsPage />} />
    </Route>

      <Route
  path="/vaccine-agent"
  element={
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<VaccineAgentPage />} />
  </Route>

  <Route
    path="/ai-assistant"
    element={
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<AiAssistantPage />} />
  </Route>
      {/* Public: accessible without login */}
      <Route path="/emergencies" element={<MainLayout />}>
        <Route index element={<EmergencyPage />} />
      </Route>

     
      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={['admin', 'sub_admin']}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:id" element={<AdminUserDetailPage />} />
        <Route path="consultations" element={<AdminConsultationsPage />} />
        <Route path="knowledge" element={<AdminKnowledgePage />} />
        <Route path="outbreaks" element={<AdminOutbreaksPage />} />
        <Route path="outbreak-analytics" element={<AdminOutbreakAnalyticsPage />} />
        <Route path="farms" element={<AdminFarmsPage />} />
        <Route path="animals" element={<AdminAnimalsPage />} />
      </Route>

      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/services" element={<ServicesPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/farms" replace />} />
    </Routes>
  )
}

export default AppRoutes
