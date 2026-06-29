import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminSidebar({ variant = "admin" }) {
  const { logout } = useAuth();
  const isSuperAdmin = variant === "superadmin";
  const links = isSuperAdmin ? superAdminLinks : adminLinks;

  return (
    <aside className="admin-sidebar">
      <NavLink to={isSuperAdmin ? "/super-admin-dashboard" : "/admin-dashboard"} className="admin-brand">
        <i className="bi bi-shield-lock-fill"></i>
        <span>CITY<span>RENT</span></span>
      </NavLink>

      <nav className="admin-nav mt-3">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className="admin-nav-item">
            <i className={`bi ${link.icon}`} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button type="button" className="admin-logout mt-auto mb-3" onClick={logout}>
        <i className="bi bi-box-arrow-right" />
        <span>Sign Out</span>
      </button>
    </aside>
  );
}

const adminLinks = [
  { to: "/admin-dashboard", label: "Dashboard", icon: "bi-grid-1x2" },
  { to: "/admin-dashboard/users", label: "Users Management", icon: "bi-people" },
  { to: "/admin-dashboard/owners", label: "Owners Management", icon: "bi-person-badge" },
  { to: "/admin-dashboard/renters", label: "Renters Management", icon: "bi-person-check" },
  { to: "/admin-dashboard/listings", label: "Listings Management", icon: "bi-box-seam" },
  { to: "/admin-dashboard/categories", label: "Categories Management", icon: "bi-tags" },
  { to: "/admin-dashboard/bookings", label: "Bookings Management", icon: "bi-calendar-check" },
  // Payment verification (listing fees + promotion fees)
  { to: "/admin-dashboard/payments", label: "Payment Management", icon: "bi-cash-stack" },
  { to: "/admin-dashboard/promotion-management", label: "Promotion Management", icon: "bi-award" },
  { to: "/admin-dashboard/featured-listings", label: "Featured Listings", icon: "bi-star-fill" },
  { to: "/admin-dashboard/promotion-history", label: "Promotion History", icon: "bi-clock-history" },
  { to: "/admin-dashboard/verification-requests", label: "Verification Requests", icon: "bi-shield-check" },
  { to: "/admin-dashboard/reviews", label: "Reviews & Ratings", icon: "bi-star" },
  { to: "/admin-dashboard/reports", label: "Reports & Complaints", icon: "bi-flag" },
  { to: "/admin-dashboard/support-tickets", label: "Support Tickets", icon: "bi-headset" },
  { to: "/admin-dashboard/notifications", label: "Notifications", icon: "bi-bell" },
  { to: "/admin-dashboard/analytics", label: "Analytics", icon: "bi-graph-up" },
  { to: "/admin-dashboard/settings", label: "Settings", icon: "bi-gear" },
];

const superAdminLinks = [
  { to: "/super-admin-dashboard", label: "Dashboard", icon: "bi-grid-1x2" },
  { to: "/super-admin-dashboard/platform-overview", label: "Platform Overview", icon: "bi-globe" },
  { to: "/super-admin-dashboard/admin-management", label: "Admin Management", icon: "bi-shield-lock" },
  { to: "/super-admin-dashboard/user-management", label: "Users Management", icon: "bi-people" },
  { to: "/super-admin-dashboard/listing-management", label: "Listings Management", icon: "bi-box-seam" },
  { to: "/super-admin-dashboard/categories-management", label: "Categories Management", icon: "bi-tags" },
  { to: "/super-admin-dashboard/promotion-management", label: "Promotion Management", icon: "bi-award" },
  { to: "/super-admin-dashboard/payments-revenue", label: "Payments & Revenue", icon: "bi-cash-stack" },
  { to: "/super-admin-dashboard/analytics", label: "Platform Analytics", icon: "bi-graph-up" },
  { to: "/super-admin-dashboard/verification-center", label: "Verification Center", icon: "bi-patch-check" },
  { to: "/super-admin-dashboard/reports-complaints", label: "Reports & Complaints", icon: "bi-flag" },
  { to: "/super-admin-dashboard/support-center", label: "Support Center", icon: "bi-headset" },
  { to: "/super-admin-dashboard/activity-logs", label: "Activity Logs", icon: "bi-clock-history" },
  { to: "/super-admin-dashboard/platform-monitoring", label: "Platform Monitoring", icon: "bi-activity" },
  { to: "/super-admin-dashboard/security-center", label: "Security Center", icon: "bi-shield-shaded" },
  { to: "/super-admin-dashboard/system-settings", label: "System Settings", icon: "bi-sliders" },
];
