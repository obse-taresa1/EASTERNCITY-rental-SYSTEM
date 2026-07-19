import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import logo from "../../assets/images/eastern-cities-header-logo-transparent.png";

function NavItem({ link }) {
  const hasChevron = /Management|Center|Monitoring|Reports|Users|Listings|Categories|Promotion|Verification|Support|Settings/.test(link.label);

  return (
    <NavLink key={link.to} to={link.to} className="admin-nav-item">
      <i className={`bi ${link.icon}`} />
      <span>{link.label}</span>
      {hasChevron && <i className="bi bi-chevron-down admin-nav-chevron" />}
    </NavLink>
  );
}

export default function AdminSidebar({ variant = "admin" }) {
  const { logout } = useAuth();
  const isSuperAdmin = variant === "superadmin";
  const links = isSuperAdmin ? superAdminLinks : adminLinks;

  return (
    <aside className="admin-sidebar admin-red-sidebar">
      <div className="admin-sidebar-header">
        <NavLink to={isSuperAdmin ? "/super-admin-dashboard" : "/admin-dashboard"} className="admin-brand admin-brand-logo" aria-label="Eastern Cities dashboard home">
          <img src={logo} alt="Eastern Cities" className="admin-brand-logo-img" />
        </NavLink>
        <button className="admin-sidebar-menu" type="button" aria-label="Collapse menu">
          <i className="bi bi-list" />
        </button>
      </div>

      <nav className="admin-nav mt-3">
        {links.map((link) => (
          <NavItem key={link.to} link={link} />
        ))}
      </nav>

      <button type="button" className="admin-logout mt-auto mb-3" onClick={logout}>
        <i className="bi bi-box-arrow-right" />
        <span>Logout</span>
      </button>
    </aside>
  );
}

const adminLinks = [
  { to: "/admin-dashboard", label: "Dashboard", icon: "bi-house-door" },
  { to: "/admin-dashboard/users", label: "Users Management", icon: "bi-people" },
  { to: "/admin-dashboard/listings", label: "Listing Management", icon: "bi-card-checklist" },
  { to: "/admin-dashboard/categories", label: "Categories Management", icon: "bi-grid-3x3-gap" },
  { to: "/admin-dashboard/bookings", label: "Bookings Management", icon: "bi-calendar-check" },
  { to: "/admin-dashboard/payments", label: "Payments & Revenue", icon: "bi-wallet2" },
  { to: "/admin-dashboard/promotion-management", label: "Promotion Management", icon: "bi-patch-check" },
  { to: "/admin-dashboard/featured-listings", label: "Featured Listings", icon: "bi-star" },
  { to: "/admin-dashboard/promotion-history", label: "Promotion History", icon: "bi-clock-history" },
  { to: "/admin-dashboard/verification-requests", label: "Verification Center", icon: "bi-shield-check" },
  { to: "/admin-dashboard/reviews", label: "Reviews & Ratings", icon: "bi-star-half" },
  { to: "/admin-dashboard/reports", label: "Reports & Complaints", icon: "bi-file-earmark-text" },
  { to: "/admin-dashboard/support-tickets", label: "Support Center", icon: "bi-chat-dots" },
  { to: "/admin-dashboard/contact-messages", label: "Contact Messages", icon: "bi-envelope-paper" },
  { to: "/admin-dashboard/notifications", label: "Notifications", icon: "bi-bell" },
  { to: "/admin-dashboard/analytics", label: "Analytics", icon: "bi-graph-up" },
  { to: "/admin-dashboard/settings", label: "Settings", icon: "bi-gear" },
];

const superAdminLinks = [
  { to: "/super-admin-dashboard", label: "Dashboard", icon: "bi-house-door" },
  { to: "/super-admin-dashboard/platform-overview", label: "Platform Overview", icon: "bi-globe" },
  { to: "/super-admin-dashboard/admin-management", label: "Admin Management", icon: "bi-people" },
  { to: "/super-admin-dashboard/user-management", label: "User Management", icon: "bi-person-lines-fill" },
  { to: "/super-admin-dashboard/listing-management", label: "Listing Management", icon: "bi-card-checklist" },
  { to: "/super-admin-dashboard/categories-management", label: "Categories Management", icon: "bi-grid-3x3-gap" },
  { to: "/super-admin-dashboard/promotion-management", label: "Promotion Management", icon: "bi-patch-check" },
  { to: "/super-admin-dashboard/verification-center", label: "Verification Center", icon: "bi-shield-check" },
  { to: "/super-admin-dashboard/payments-revenue", label: "Payments & Revenue", icon: "bi-wallet2" },
  { to: "/super-admin-dashboard/reports-complaints", label: "Reports & Complaints", icon: "bi-file-earmark-text" },
  { to: "/super-admin-dashboard/platform-monitoring", label: "Platform Monitoring", icon: "bi-check-circle" },
  { to: "/super-admin-dashboard/security-center", label: "Security Center", icon: "bi-shield" },
  { to: "/super-admin-dashboard/support-center", label: "Support Center", icon: "bi-chat-dots" },
  { to: "/super-admin-dashboard/contact-messages", label: "Contact Messages", icon: "bi-envelope-paper" },
  { to: "/super-admin-dashboard/notifications", label: "Notifications", icon: "bi-bell" },
  { to: "/super-admin-dashboard/analytics", label: "Platform Analytics", icon: "bi-graph-up" },
  { to: "/super-admin-dashboard/activity-logs", label: "Activity Logs", icon: "bi-file-earmark" },
  { to: "/super-admin-dashboard/system-settings", label: "Settings", icon: "bi-gear" },
];

