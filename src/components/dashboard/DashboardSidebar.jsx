import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DashboardSidebar() {
  const { currentUser, user, logout } = useAuth();
  const activeUser = user || currentUser;
  const role = String(activeUser?.role || "").toLowerCase();

  const links = getDashboardLinks(role);

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

function getDashboardLinks(role) {
  const commonLinks = [
    { to: "/profile", label: "Profile", icon: "bi-person" },
    { to: "/messages", label: "Messages", icon: "bi-chat-dots" },
    { to: "/notifications", label: "Notifications", icon: "bi-bell" },
  ];

  if (role === "lessor") {
    return [
      { to: "/lessor-dashboard", label: "Dashboard", icon: "bi-speedometer2" },
      { to: "/list-item", label: "Add Listing", icon: "bi-plus-circle" },
      ...commonLinks,
    ];
  }

  if (role === "both") {
    return [
      { to: "/both-dashboard", label: "Dashboard", icon: "bi-speedometer2" },
      { to: "/items", label: "Rent Items", icon: "bi-search" },
      { to: "/list-item", label: "Add Listing", icon: "bi-plus-circle" },
      { to: "/my-bookings", label: "My Bookings", icon: "bi-calendar-check" },
      ...commonLinks,
    ];
  }

  return [
    { to: "/renter-dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { to: "/items", label: "Browse Items", icon: "bi-search" },
    { to: "/my-bookings", label: "My Bookings", icon: "bi-calendar-check" },
    ...commonLinks,
  ];
}
