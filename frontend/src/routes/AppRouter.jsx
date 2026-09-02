import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { lazy } from "react";

import PublicLayout from "../layouts/PublicLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import SuperAdminLayout from "../layouts/SuperAdminLayout.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";

const HomePage = lazy(() => import("../pages/public/HomePage.jsx"));
const AboutPage = lazy(() => import("../pages/public/AboutPage.jsx"));
const CareersPage = lazy(() => import("../pages/public/CareersPage.jsx"));
const ContactPage = lazy(() => import("../pages/public/ContactPage.jsx"));
const AdvertiseWithUsPage = lazy(() => import("../pages/public/AdvertiseWithUsPage.jsx"));
const HowItWorksPage = lazy(() => import("../pages/public/HowItWorksPage.jsx"));
const PrivacyPolicyPage = lazy(() => import("../pages/public/PrivacyPolicyPage.jsx"));
const TermsPage = lazy(() => import("../pages/public/TermsPage.jsx"));
const CommunityPage = lazy(() => import("../pages/public/CommunityPage.jsx"));
const CommunityRequestDetailsPage = lazy(() => import("../pages/public/CommunityRequestDetailsPage.jsx"));

const ItemsPage = lazy(() => import("../pages/listings/ItemsPage.jsx"));
const CategoryPage = lazy(() => import("../pages/listings/CategoryPage.jsx"));
const ItemDetailsPage = lazy(() => import("../pages/listings/ItemDetailsPage.jsx"));
const CategoriesPage = lazy(() => import("../pages/listings/CategoriesPage.jsx"));
const FeaturedListingsPublicPage = lazy(() => import("../pages/public/FeaturedListingsPublicPage.jsx"));

const BookingPage = lazy(() => import("../pages/booking/BookingPage.jsx"));
const BookingSuccessPage = lazy(() => import("../pages/booking/BookingSuccessPage.jsx"));
const MyBookingsPage = lazy(() => import("../pages/booking/MyBookingsPage.jsx"));

const BothDashboardPage = lazy(() => import("../pages/dashboard/BothDashboardPage.jsx"));
const ListItemPage = lazy(() => import("../pages/dashboard/ListItemPage.jsx"));
const MyListingsPage = lazy(() => import("../pages/dashboard/MyListingsPage.jsx"));
const SavedItemsPage = lazy(() => import("../pages/dashboard/SavedItemsPage.jsx"));
const DashboardSettingsPage = lazy(() => import("../pages/dashboard/DashboardSettingsPage.jsx"));
const ReviewsPage = lazy(() => import("../pages/dashboard/ReviewsPage.jsx"));
const VerificationPage = lazy(() => import("../pages/dashboard/VerificationPage.jsx"));
const HelpCenterPage = lazy(() => import("../pages/dashboard/HelpCenterPage.jsx"));

const ProfilePage = lazy(() => import("../pages/profile/ProfilePage.jsx"));
const MessagesPage = lazy(() => import("../pages/profile/MessagesPage.jsx"));
const NotificationsPage = lazy(() => import("../pages/profile/NotificationsPage.jsx"));

const LoginPage = lazy(() => import("../pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage.jsx"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage.jsx"));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage.jsx"));

const AdminPaymentsPage = lazy(() => import("../pages/admin/AdminPaymentsPage.jsx"));
const AdminCategoriesPage = lazy(() => import("../pages/admin/AdminCategoriesPage.jsx"));
const FeaturedListingsPage = lazy(() => import("../pages/admin/FeaturedListingsPage.jsx"));
const PromotionHistoryPage = lazy(() => import("../pages/admin/PromotionHistoryPage.jsx"));
const AdminVerificationPage = lazy(() => import("../pages/admin/AdminVerificationPage.jsx"));
const AdminAnalyticsPage = lazy(() => import("../pages/admin/AdminAnalyticsPage.jsx"));
const AdminSupportTicketsPage = lazy(() => import("../pages/admin/AdminSupportTicketsPage.jsx"));
const AdminNotificationsPage = lazy(() => import("../pages/admin/AdminNotificationsPage.jsx"));
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage.jsx"));
const AdminBookingsPage = lazy(() => import("../pages/admin/AdminBookingsPage.jsx"));
const AdminReviewsPage = lazy(() => import("../pages/admin/AdminReviewsPage.jsx"));
const AdminProfilePage = lazy(() => import("../pages/admin/AdminProfilePage.jsx"));
const BannerAdsManagementPage = lazy(() => import("../pages/admin/BannerAdsManagementPage.jsx"));
const AdvertisingManagementPage = lazy(() => import("../pages/admin/AdvertisingManagementPage.jsx"));

// Inside Admin Layout routes block (after existing admin routes)

const UserManagementPage = lazy(() => import("../pages/admin/UserManagementPage.jsx"));
const AdminListingManagementPage = lazy(() => import("../pages/admin/AdminListingManagementPage.jsx"));
const AdminReportsPage = lazy(() => import("../pages/admin/AdminReportsPage.jsx"));
const AdminStatisticsPage = lazy(() => import("../pages/admin/AdminStatisticsPage.jsx"));
const AdminSettingsPage = lazy(() => import("../pages/admin/AdminSettingsPage.jsx"));
const AdminCommunityPostsPage = lazy(() => import("../pages/admin/AdminCommunityPostsPage.jsx"));

const SuperAdminDashboardPage = lazy(() => import("../pages/super-admin/SuperAdminDashboardPage.jsx"));
const AdminManagementPage = lazy(() => import("../pages/super-admin/AdminManagementPage.jsx"));
const SuperUserManagementPage = lazy(() => import("../pages/super-admin/SuperUserManagementPage.jsx"));
const SuperListingManagementPage = lazy(() => import("../pages/super-admin/SuperListingManagementPage.jsx"));
const ContactMessagesPage = lazy(() => import("../pages/super-admin/ContactMessagesPage.jsx"));
const RoleRequestsPage = lazy(() => import("../pages/super-admin/RoleRequestsPage.jsx"));
const ActivityLogsPage = lazy(() => import("../pages/super-admin/ActivityLogsPage.jsx"));
const SystemSettingsPage = lazy(() => import("../pages/super-admin/SystemSettingsPage.jsx"));
const PlatformOverviewPage = lazy(() => import("../pages/super-admin/PlatformOverviewPage.jsx"));
const SuperPaymentsRevenuePage = lazy(() => import("../pages/super-admin/SuperPaymentsRevenuePage.jsx"));
const SuperVerificationCenterPage = lazy(() => import("../pages/super-admin/SuperVerificationCenterPage.jsx"));
const SecurityCenterPage = lazy(() => import("../pages/super-admin/SecurityCenterPage.jsx"));
const SuperReportsComplaintsPage = lazy(() => import("../pages/super-admin/SuperReportsComplaintsPage.jsx"));
const SuperSupportCenterPage = lazy(() => import("../pages/super-admin/SuperSupportCenterPage.jsx"));
const SuperCategoriesManagementPage = lazy(() => import("../pages/super-admin/SuperCategoriesManagementPage.jsx"));
const SuperPlatformMonitoringPage = lazy(() => import("../pages/super-admin/SuperPlatformMonitoringPage.jsx"));
const SuperPromotionManagementPage = lazy(() => import("../pages/super-admin/SuperPromotionManagementPage.jsx"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
      <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/featured" element={<FeaturedListingsPublicPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:categoryId" element={<CategoryPage />} />
          <Route path="/items/:itemId" element={<ItemDetailsPage />} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/our-story" element={<AboutPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/advertise-with-us" element={<AdvertiseWithUsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/request/:postId" element={<CommunityRequestDetailsPage />} />
          <Route path="/community/:postId" element={<CommunityRequestDetailsPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={["USER"]} />}>
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
            </Route>
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
              <Route path="/admin-dashboard/banner-ads" element={<BannerAdsManagementPage />} />
              <Route path="/admin-dashboard/advertising-management" element={<AdvertisingManagementPage />} />
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
                path="/admin-dashboard/community-posts"
                element={<AdminCommunityPostsPage />}
              />
              <Route
                path="/admin-dashboard/notifications"
                element={<AdminNotificationsPage />}
              />
              <Route
                path="/admin-dashboard/profile"
                element={<AdminProfilePage />}
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
                path="/super-admin-dashboard/community-posts"
                element={<AdminCommunityPostsPage />}
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
                path="/super-admin-dashboard/profile"
                element={<AdminProfilePage />}
              />
              <Route
                path="/super-admin-dashboard/analytics"
                element={<AdminAnalyticsPage scope="superadmin" />}
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
              <Route path="/super-admin-dashboard/banner-ads" element={<BannerAdsManagementPage scope="superadmin" />} />
              <Route path="/super-admin-dashboard/advertising-management" element={<AdvertisingManagementPage scope="superadmin" />} />
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
