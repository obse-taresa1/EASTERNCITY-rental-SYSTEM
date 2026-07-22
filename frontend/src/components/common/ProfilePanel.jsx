import { Link } from "react-router-dom";
import { getInitials } from "../../utils/user.js";
import {
  isVerificationApproved,
  normalizeVerificationStatus,
} from "../../utils/verificationStatus.js";

export default function ProfilePanel({ user, open, onClose, onLogout, dashboardPath = "/dashboard" }) {
  if (!open) return null;

  const isAdminOrSuperAdmin = ["ADMIN", "SUPER_ADMIN"].includes(String(user?.role || "").toUpperCase());

  const PANEL_ITEMS = isAdminOrSuperAdmin
    ? [
        { to: dashboardPath, label: "Dashboard", icon: "bi-speedometer2" },
      ]
    : [
        { to: dashboardPath, label: "Dashboard", icon: "bi-speedometer2" },
        { to: "/my-listings", label: "My Listings", icon: "bi-card-checklist" },
        { to: "/my-bookings", label: "My Bookings", icon: "bi-calendar-check" },
        { to: "/messages", label: "Messages", icon: "bi-chat-dots" },
        { to: "/notifications", label: "Notifications", icon: "bi-bell" },
        { to: "/dashboard-settings", label: "Settings", icon: "bi-gear" },
      ];

  const initials = getInitials(user?.name);
  const verificationStatus = normalizeVerificationStatus(user?.verificationStatus);
  const isVerified = isVerificationApproved(verificationStatus);

  return (
    <div
      className="profile-panel-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <aside
        className="profile-panel premium-glass-card"
        role="dialog"
        aria-modal="true"
        aria-label="Profile panel"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="profile-panel-close"
          aria-label="Close profile panel"
          onClick={onClose}
        >
          <i className="bi bi-x-lg" />
        </button>

        <div className="profile-panel-header">
          <div className="profile-panel-avatar">{initials}</div>
          <div>
            <strong>{user?.name || "User"}</strong>
            <span>{user?.email || "Email not available"}</span>
          </div>
        </div>

        {!isAdminOrSuperAdmin && (
          <div className="profile-panel-verification">
            <i className={`bi ${isVerified ? "bi-shield-check text-success" : "bi-shield-exclamation text-warning"}`} />
            <div>
              <strong>{verificationStatus}</strong>
              <span>National ID review protects renters and owners.</span>
            </div>
          </div>
        )}

        <nav className="profile-panel-nav">
          {PANEL_ITEMS.map((item) => (
            <Link
              to={item.to}
              key={item.label}
              onClick={onClose}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </Link>
          ))}
          <button type="button" onClick={onLogout}>
            <i className="bi bi-box-arrow-right" />
            <span>Log out</span>
          </button>
        </nav>
      </aside>
    </div>
  );
}


