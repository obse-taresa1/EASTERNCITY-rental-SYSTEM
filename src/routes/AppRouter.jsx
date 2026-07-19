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
import MyListingsPage from "../pages/dashboard/MyListingsPage.jsx";
import SavedItemsPage from "../pages/dashboard/SavedItemsPage.jsx";
import DashboardSettingsPage from "../pages/dashboard/DashboardSettingsPage.jsx";
import ReviewsPage from "../pages/dashboard/ReviewsPage.jsx";
import VerificationPage from "../pages/dashboard/VerificationPage.jsx";
import HelpCenterPage from "../pages/dashboard/HelpCenterPage.jsx";

import ProfilePage from "../pages/profile/ProfilePage.jsx";
import MessagesPage from "../pages/profile/MessagesPage.jsx";
import NotificationsPage from "../pages/profile/NotificationsPage.jsx";

import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage.jsx";

import AdminPaymentsPage from "../pages/admin/AdminPaymentsPage.jsx";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage.jsx";
import FeaturedListingsPage from "../pages/admin/FeaturedListingsPage.jsx";
import PromotionHistoryPage from "../pages/admin/PromotionHistoryPage.jsx";
import AdminVerificationPage from "../pages/admin/AdminVerificationPage.jsx";
import AdminAnalyticsPage from "../pages/admin/AdminAnalyticsPage.jsx";
import AdminSupportTicketsPage from "../pages/admin/AdminSupportTicketsPage.jsx";
import AdminNotificationsPage from "../pages/admin/AdminNotificationsPage.jsx";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage.jsx";
import AdminReviewsPage from "../pages/admin/AdminReviewsPage.jsx";

// Inside Admin Layout routes block (after existing admin routes)

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
import PlatformOverviewPage from "../pages/super-admin/PlatformOverviewPage.jsx";
import SuperPaymentsRevenuePage from "../pages/super-admin/SuperPaymentsRevenuePage.jsx";
import SuperVerificationCenterPage from "../pages/super-admin/SuperVerificationCenterPage.jsx";
import SecurityCenterPage from "../pages/super-admin/SecurityCenterPage.jsx";
import SuperReportsComplaintsPage from "../pages/super-admin/SuperReportsComplaintsPage.jsx";
import SuperSupportCenterPage from "../pages/super-admin/SuperSupportCenterPage.jsx";
import SuperCategoriesManagementPage from "../pages/super-admin/SuperCategoriesManagementPage.jsx";
import SuperPlatformMonitoringPage from "../pages/super-admin/SuperPlatformMonitoringPage.jsx";
import SuperPromotionManagementPage from "../pages/super-admin/SuperPromotionManagementPage.jsx";

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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={
                <RoleRoute allowedRoles={["USER"]}>
                  <BothDashboardPage />
                </RoleRoute>
              }
            />

            <Route
              path="/list-item"
              element={
                <RoleRoute allowedRoles={["USER"]}>
                  <ListItemPage />
                </RoleRoute>
              }
            />

            <Route
              path="/my-listings"
              element={
                <RoleRoute allowedRoles={["USER"]}>
                  <MyListingsPage />
                </RoleRoute>
              }
            />

            <Route
              path="/saved-items"
              element={
                <RoleRoute allowedRoles={["USER"]}>
                  <SavedItemsPage />
                </RoleRoute>
              }
            />

            <Route
              path="/reviews"
              element={
                <RoleRoute allowedRoles={["USER"]}>
                  <ReviewsPage />
                </RoleRoute>
              }
            />

            <Route
              path="/verification"
              element={
                <RoleRoute allowedRoles={["USER"]}>
                  <VerificationPage />
                </RoleRoute>
              }
            />

            <Route
              path="/dashboard-settings"
              element={
                <RoleRoute allowedRoles={["USER"]}>
                  <DashboardSettingsPage />
                </RoleRoute>
              }
            />

            <Route
              path="/help-center"
              element={
                <RoleRoute allowedRoles={["USER"]}>
                  <HelpCenterPage />
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
            <Route path="/saved-items" element={<SavedItemsPage />} />
            <Route
              path="/dashboard-settings"
              element={<DashboardSettingsPage />}
            />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/verification" element={<VerificationPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
              <Route
                path="/admin-dashboard/categories"
                element={<AdminCategoriesPage />}
              />
              <Route
                path="/admin-dashboard/payments"
                element={<AdminPaymentsPage />}
              />
              <Route
                path="/admin-dashboard/promotion-management"
                element={<SuperPromotionManagementPage scope="admin" />}
              />
              <Route
                path="/admin-dashboard/featured-listings"
                element={<FeaturedListingsPage />}
              />
              <Route
                path="/admin-dashboard/promotion-history"
                element={<PromotionHistoryPage />}
              />
              <Route
                path="/admin-dashboard/verification-requests"
                element={<AdminVerificationPage />}
              />
              <Route
                path="/admin-dashboard/analytics"
                element={<AdminAnalyticsPage />}
              />
              <Route
                path="/admin-dashboard/support-tickets"
                element={<AdminSupportTicketsPage />}
              />
              <Route
                path="/admin-dashboard/contact-messages"
                element={<ContactMessagesPage />}
              />
              <Route
                path="/admin-dashboard/notifications"
                element={<AdminNotificationsPage />}
              />
              <Route
                path="/admin-dashboard/bookings"
                element={<AdminBookingsPage />}
              />
              <Route
                path="/admin-dashboard/reviews"
                element={<AdminReviewsPage />}
              />
              <Route
                path="/admin-dashboard/users"
                element={<UserManagementPage />}
              />
              <Route
                path="/admin-dashboard/listings"
                element={<AdminListingManagementPage />}
              />
              <Route
                path="/admin-dashboard/reports"
                element={<AdminReportsPage />}
              />
              <Route
                path="/admin-dashboard/statistics"
                element={<AdminStatisticsPage />}
              />
              <Route
                path="/admin-dashboard/settings"
                element={<AdminSettingsPage />}
              />
            </Route>
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={["SUPER_ADMIN"]} />}>
            <Route element={<SuperAdminLayout />}>
              <Route
                path="/super-admin-dashboard"
                element={<SuperAdminDashboardPage />}
              />
              <Route
                path="/super-admin-dashboard/admin-management"
                element={<AdminManagementPage />}
              />
              <Route
                path="/super-admin-dashboard/user-management"
                element={<SuperUserManagementPage />}
              />
              <Route
                path="/super-admin-dashboard/listing-management"
                element={<SuperListingManagementPage />}
              />
              <Route
                path="/super-admin-dashboard/contact-messages"
                element={<ContactMessagesPage />}
              />
              <Route
                path="/super-admin-dashboard/role-requests"
                element={<RoleRequestsPage />}
              />
              <Route
                path="/super-admin-dashboard/notifications"
                element={<AdminNotificationsPage />}
              />
              <Route
                path="/super-admin-dashboard/analytics"
                element={<AnalyticsPage />}
              />
              <Route
                path="/super-admin-dashboard/activity-logs"
                element={<ActivityLogsPage />}
              />
              <Route
                path="/super-admin-dashboard/platform-overview"
                element={<PlatformOverviewPage />}
              />
              <Route
                path="/super-admin-dashboard/payments-revenue"
                element={<SuperPaymentsRevenuePage />}
              />
              <Route
                path="/super-admin-dashboard/verification-center"
                element={<SuperVerificationCenterPage />}
              />
              <Route
                path="/super-admin-dashboard/security-center"
                element={<SecurityCenterPage />}
              />
              <Route
                path="/super-admin-dashboard/reports-complaints"
                element={<SuperReportsComplaintsPage />}
              />
              <Route
                path="/super-admin-dashboard/support-center"
                element={<SuperSupportCenterPage />}
              />
              <Route
                path="/super-admin-dashboard/categories-management"
                element={<SuperCategoriesManagementPage />}
              />
              <Route
                path="/super-admin-dashboard/platform-monitoring"
                element={<SuperPlatformMonitoringPage />}
              />
              <Route
                path="/super-admin-dashboard/promotion-management"
                element={<SuperPromotionManagementPage />}
              />
              <Route
                path="/super-admin-dashboard/system-settings"
                element={<SystemSettingsPage />}
              />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
