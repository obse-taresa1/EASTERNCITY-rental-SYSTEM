import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import SuperAdminLayout from "../layouts/SuperAdminLayout.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";

import HomePage from "../pages/public/HomePage.jsx";
import AboutPage from "../pages/public/AboutPage.jsx";
import CareersPage from "../pages/public/CareersPage.jsx";
import ContactPage from "../pages/public/ContactPage.jsx";
import HowItWorksPage from "../pages/public/HowItWorksPage.jsx";
import PrivacyPolicyPage from "../pages/public/PrivacyPolicyPage.jsx";
import TermsPage from "../pages/public/TermsPage.jsx";

import ItemsPage from "../pages/listings/ItemsPage.jsx";
import CategoryPage from "../pages/listings/CategoryPage.jsx";
import ItemDetailsPage from "../pages/listings/ItemDetailsPage.jsx";
import CategoriesPage from "../pages/listings/CategoriesPage.jsx";

import BookingPage from "../pages/booking/BookingPage.jsx";
import BookingSuccessPage from "../pages/booking/BookingSuccessPage.jsx";
import MyBookingsPage from "../pages/booking/MyBookingsPage.jsx";

import BothDashboardPage from "../pages/dashboard/BothDashboardPage.jsx";
import ListItemPage from "../pages/dashboard/ListItemPage.jsx";

import ProfilePage from "../pages/profile/ProfilePage.jsx";
import MessagesPage from "../pages/profile/MessagesPage.jsx";
import NotificationsPage from "../pages/profile/NotificationsPage.jsx";

import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";
import UserManagementPage from "../pages/admin/UserManagementPage.jsx";
import AdminListingManagementPage from "../pages/admin/AdminListingManagementPage.jsx";
import AdminReportsPage from "../pages/admin/AdminReportsPage.jsx";
import AdminStatisticsPage from "../pages/admin/AdminStatisticsPage.jsx";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage.jsx";

import SuperAdminDashboardPage from "../pages/super-admin/SuperAdminDashboardPage.jsx";
import AdminManagementPage from "../pages/super-admin/AdminManagementPage.jsx";
import SuperUserManagementPage from "../pages/super-admin/SuperUserManagementPage.jsx";
import SuperListingManagementPage from "../pages/super-admin/SuperListingManagementPage.jsx";
import ContactMessagesPage from "../pages/super-admin/ContactMessagesPage.jsx";
import RoleRequestsPage from "../pages/super-admin/RoleRequestsPage.jsx";
import AnalyticsPage from "../pages/super-admin/AnalyticsPage.jsx";
import ActivityLogsPage from "../pages/super-admin/ActivityLogsPage.jsx";
import SystemSettingsPage from "../pages/super-admin/SystemSettingsPage.jsx";

import { useAuth } from "../context/AuthContext.jsx";

function DashboardRedirect() {
  const { currentUser, user, dashboardForRole } = useAuth();
  const activeUser = user || currentUser;

  return <Navigate to={dashboardForRole(activeUser?.role)} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:categoryId" element={<CategoryPage />} />
          <Route path="/items/:itemId" element={<ItemDetailsPage />} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/our-story" element={<AboutPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardRedirect />} />

            <Route
              path="/renter-dashboard"
              element={
                <RoleRoute allowedRoles={["renter", "lessee"]}>
                  <BothDashboardPage />
                </RoleRoute>
              }
            />

            <Route
              path="/lessor-dashboard"
              element={
                <RoleRoute allowedRoles={["lessor", "both"]}>
                  <BothDashboardPage initialMode="owner" />
                </RoleRoute>
              }
            />

            <Route
              path="/both-dashboard"
              element={
                <RoleRoute
                  allowedRoles={["renter", "lessee", "lessor", "both"]}
                >
                  <BothDashboardPage />
                </RoleRoute>
              }
            />

            <Route
              path="/list-item"
              element={
                <RoleRoute
                  allowedRoles={["renter", "lessee", "lessor", "both"]}
                >
                  <ListItemPage />
                </RoleRoute>
              }
            />

            <Route path="/booking/:itemId" element={<BookingPage />} />
            <Route
              path="/booking/success/:bookingId"
              element={<BookingSuccessPage />}
            />
            <Route path="/my-bookings" element={<MyBookingsPage />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={["admin", "supervisor"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route
                path="/admin/listings"
                element={<AdminListingManagementPage />}
              />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route
                path="/admin/statistics"
                element={<AdminStatisticsPage />}
              />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            element={<RoleRoute allowedRoles={["superadmin", "super-admin"]} />}
          >
            <Route element={<SuperAdminLayout />}>
              <Route
                path="/super-admin"
                element={<SuperAdminDashboardPage />}
              />
              <Route
                path="/super-admin/admin-management"
                element={<AdminManagementPage />}
              />
              <Route
                path="/super-admin/user-management"
                element={<SuperUserManagementPage />}
              />
              <Route
                path="/super-admin/listing-management"
                element={<SuperListingManagementPage />}
              />
              <Route
                path="/super-admin/contact-messages"
                element={<ContactMessagesPage />}
              />
              <Route
                path="/super-admin/role-requests"
                element={<RoleRequestsPage />}
              />
              <Route
                path="/super-admin/analytics"
                element={<AnalyticsPage />}
              />
              <Route
                path="/super-admin/activity-logs"
                element={<ActivityLogsPage />}
              />
              <Route
                path="/super-admin/system-settings"
                element={<SystemSettingsPage />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
