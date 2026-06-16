import { BrowserRouter, Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import SuperAdminLayout from "../layouts/SuperAdminLayout.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";

import PlaceholderPage from "../pages/PlaceholderPage.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PlaceholderPage title="Home" />} />
          <Route path="/items" element={<PlaceholderPage title="Items" />} />
          <Route
            path="/item-details/:id?"
            element={<PlaceholderPage title="Item Details" />}
          />
          <Route
            path="/category/cameras"
            element={<PlaceholderPage title="Cameras" />}
          />
          <Route
            path="/category/electronics"
            element={<PlaceholderPage title="Electronics" />}
          />
          <Route
            path="/category/furniture"
            element={<PlaceholderPage title="Furniture" />}
          />
          <Route
            path="/category/sports"
            element={<PlaceholderPage title="Sports" />}
          />
          <Route
            path="/category/tools"
            element={<PlaceholderPage title="Tools" />}
          />
          <Route
            path="/category/vehicles"
            element={<PlaceholderPage title="Vehicles" />}
          />
          <Route
            path="/our-story"
            element={<PlaceholderPage title="Our Story" />}
          />
          <Route
            path="/careers"
            element={<PlaceholderPage title="Careers" />}
          />
          <Route
            path="/contact"
            element={<PlaceholderPage title="Contact" />}
          />
          <Route
            path="/how-it-works"
            element={<PlaceholderPage title="How It Works" />}
          />
          <Route
            path="/privacy-policy"
            element={<PlaceholderPage title="Privacy Policy" />}
          />
          <Route path="/terms" element={<PlaceholderPage title="Terms" />} />
          <Route path="/login" element={<PlaceholderPage title="Login" />} />
          <Route
            path="/register"
            element={<PlaceholderPage title="Register" />}
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={<PlaceholderPage title="Dashboard" />}
            />
            <Route
              path="/renter-dashboard"
              element={<PlaceholderPage title="Renter Dashboard" />}
            />
            <Route
              path="/lessor-dashboard"
              element={<PlaceholderPage title="Lessor Dashboard" />}
            />
            <Route
              path="/both-dashboard"
              element={<PlaceholderPage title="Both Dashboard" />}
            />
            <Route
              path="/booking"
              element={<PlaceholderPage title="Booking" />}
            />
            <Route
              path="/list-item"
              element={<PlaceholderPage title="List Item" />}
            />
            <Route
              path="/profile"
              element={<PlaceholderPage title="Profile" />}
            />
            <Route
              path="/messages"
              element={<PlaceholderPage title="Messages" />}
            />
            <Route
              path="/notifications"
              element={<PlaceholderPage title="Notifications" />}
            />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={["admin", "supervisor"]} />}>
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
      </Routes>
    </BrowserRouter>
  );
}
