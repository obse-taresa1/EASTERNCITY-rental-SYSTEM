import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminSidebar({ variant = "admin" }) {
  const { logout } = useAuth();
  const links = variant === "superadmin" ? superAdminLinks : adminLinks;

  return (
    <aside className="dashboard-sidebar">
      <NavLink to="/" className="dashboard-brand">
        CITY<span>RENT</span>
      </NavLink>

      <nav className="dashboard-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to}>
            <i className={`bi ${link.icon}`} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button type="button" className="dashboard-logout" onClick={logout}>
        <i className="bi bi-box-arrow-right" />
        <span>Logout</span>
      </button>
    </aside>
  );
}

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: "bi-speedometer2" },
  { to: "/admin/users", label: "Users", icon: "bi-people" },
  { to: "/admin/listings", label: "Listings", icon: "bi-box-seam" },
  { to: "/admin/reports", label: "Reports", icon: "bi-flag" },
  { to: "/admin/statistics", label: "Statistics", icon: "bi-bar-chart" },
  { to: "/admin/settings", label: "Settings", icon: "bi-gear" },
];

const superAdminLinks = [
  { to: "/super-admin", label: "Dashboard", icon: "bi-speedometer2" },
  {
    to: "/super-admin/admin-management",
    label: "Admins",
    icon: "bi-person-badge",
  },
  {
    to: "/super-admin/user-management",
    label: "Users",
    icon: "bi-people",
  },
  {
    to: "/super-admin/listing-management",
    label: "Listings",
    icon: "bi-box-seam",
  },
  {
    to: "/super-admin/contact-messages",
    label: "Messages",
    icon: "bi-envelope",
  },
  {
    to: "/super-admin/role-requests",
    label: "Role Requests",
    icon: "bi-person-check",
  },
  {
    to: "/super-admin/analytics",
    label: "Analytics",
    icon: "bi-graph-up",
  },
  {
    to: "/super-admin/activity-logs",
    label: "Activity Logs",
    icon: "bi-clock-history",
  },
  {
    to: "/super-admin/system-settings",
    label: "Settings",
    icon: "bi-sliders",
  },
];
