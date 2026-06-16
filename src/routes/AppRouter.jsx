import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import PublicLayout from '../layouts/PublicLayout.jsx'
import SuperAdminLayout from '../layouts/SuperAdminLayout.jsx'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx'
import LoginPage from '../pages/auth/LoginPage.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'
import BookingPage from '../pages/booking/BookingPage.jsx'
import DashboardPage from '../pages/dashboard/DashboardPage.jsx'
import ListingDetailsPage from '../pages/listings/ListingDetailsPage.jsx'
import ListingsPage from '../pages/listings/ListingsPage.jsx'
import ProfilePage from '../pages/profile/ProfilePage.jsx'
import AboutPage from '../pages/public/AboutPage.jsx'
import CareersPage from '../pages/public/CareersPage.jsx'
import ContactPage from '../pages/public/ContactPage.jsx'
import HomePage from '../pages/public/HomePage.jsx'
import HowItWorksPage from '../pages/public/HowItWorksPage.jsx'
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage.jsx'
import TermsPage from '../pages/public/TermsPage.jsx'
import SuperAdminDashboardPage from '../pages/super-admin/SuperAdminDashboardPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import RoleRoute from './RoleRoute.jsx'

function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="listings" element={<ListingsPage />} />
        <Route path="listings/:itemId" element={<ListingDetailsPage />} />
        <Route path="booking" element={<BookingPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['super-admin']} />}>
          <Route element={<SuperAdminLayout />}>
            <Route
              path="super-admin"
              element={<SuperAdminDashboardPage />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
