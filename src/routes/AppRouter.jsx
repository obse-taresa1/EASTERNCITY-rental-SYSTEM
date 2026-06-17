import { BrowserRouter, Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import SuperAdminLayout from "../layouts/SuperAdminLayout.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";

import PlaceholderPage from "../pages/PlaceholderPage.jsx";

import HomePage from "../pages/public/HomePage.jsx";
import OurStoryPage from "../pages/public/OurStoryPage.jsx";
import CareersPage from "../pages/public/CareersPage.jsx";
import ContactPage from "../pages/public/ContactPage.jsx";
import HowItWorksPage from "../pages/public/HowItWorksPage.jsx";
import PrivacyPolicyPage from "../pages/public/PrivacyPolicyPage.jsx";
import TermsPage from "../pages/public/TermsPage.jsx";

import ItemsPage from "../pages/listings/ItemsPage.jsx";
import CategoryPage from "../pages/listings/CategoryPage.jsx";
import ItemDetailsPage from "../pages/listings/ItemDetailsPage.jsx";

import BookingPage from "../pages/booking/BookingPage.jsx";
import BookingSuccessPage from "../pages/booking/BookingSuccessPage.jsx";
import MyBookingsPage from "../pages/booking/MyBookingsPage.jsx";

import RenterDashboardPage from "../pages/dashboard/RenterDashboardPage.jsx";
import LessorDashboardPage from "../pages/dashboard/LessorDashboardPage.jsx";
import BothDashboardPage from "../pages/dashboard/BothDashboardPage.jsx";
import ListItemPage from "../pages/dashboard/ListItemPage.jsx";

import ProfilePage from "../pages/profile/ProfilePage.jsx";
import MessagesPage from "../pages/profile/MessagesPage.jsx";
import NotificationsPage from "../pages/profile/NotificationsPage.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route path="/items" element={<ItemsPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/items/:itemId" element={<ItemDetailsPage />} />

          <Route path="/our-story" element={<OurStoryPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          <Route path="/login" element={<PlaceholderPage title="Login" />} />
          <Route
            path="/register"
            element={<PlaceholderPage title="Register" />}
          />
        </Route>

        {/* Protected Routes - Error 1 & 2: Fixed structure */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={
                <RoleRoute allowedRoles={["renter", "lessor", "both"]}>
                  <RenterDashboardPage />
                </RoleRoute>
              }
            />

            <Route
              path="/renter-dashboard"
              element={
                <RoleRoute allowedRoles={["renter"]}>
                  <RenterDashboardPage />
                </RoleRoute>
              }
            />

            <Route
              path="/lessor-dashboard"
              element={
                <RoleRoute allowedRoles={["lessor"]}>
                  <LessorDashboardPage />
                </RoleRoute>
              }
            />

            <Route
              path="/both-dashboard"
              element={
                <RoleRoute allowedRoles={["both"]}>
                  <BothDashboardPage />
                </RoleRoute>
              }
            />

            <Route
              path="/list-item"
              element={
                <RoleRoute allowedRoles={["lessor", "both"]}>
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

        {/* Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route
                path="/admin"
                element={<PlaceholderPage title="Admin Dashboard" />}
              />
              <Route
                path="/admin/users"
                element={<PlaceholderPage title="Users" />}
              />
              <Route
                path="/admin/listings"
                element={<PlaceholderPage title="Listings" />}
              />
              <Route
                path="/admin/reports"
                element={<PlaceholderPage title="Reports" />}
              />
              <Route
                path="/admin/statistics"
                element={<PlaceholderPage title="Statistics" />}
              />
              <Route
                path="/admin/settings"
                element={<PlaceholderPage title="Settings" />}
              />
            </Route>
          </Route>
        </Route>

        {/* Super Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={["superadmin"]} />}>
            <Route element={<SuperAdminLayout />}>
              <Route
                path="/super-admin"
                element={<PlaceholderPage title="Super Admin Dashboard" />}
              />
              <Route
                path="/super-admin/admin-management"
                element={<PlaceholderPage title="Admin Management" />}
              />
              <Route
                path="/super-admin/user-management"
                element={<PlaceholderPage title="User Management" />}
              />
              <Route
                path="/super-admin/listing-management"
                element={<PlaceholderPage title="Listing Management" />}
              />
              <Route
                path="/super-admin/contact-messages"
                element={<PlaceholderPage title="Contact Messages" />}
              />
              <Route
                path="/super-admin/role-requests"
                element={<PlaceholderPage title="Role Requests" />}
              />
              <Route
                path="/super-admin/analytics"
                element={<PlaceholderPage title="Analytics" />}
              />
              <Route
                path="/super-admin/activity-logs"
                element={<PlaceholderPage title="Activity Logs" />}
              />
              <Route
                path="/super-admin/system-settings"
                element={<PlaceholderPage title="System Settings" />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}