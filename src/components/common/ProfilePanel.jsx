import { Link } from "react-router-dom";
import { getInitials } from "../../utils/user.js";

export default function ProfilePanel({ user, open, onClose, onLogout, dashboardPath = "/dashboard" }) {
  if (!open) return null;

  const initials = getInitials(user?.name);
  const items = [
    { to: dashboardPath, label: "My shop", icon: "bi-grid" },
    { to: "/messages", label: "Messages", icon: "bi-chat-dots" },
    { to: "/profile/performance", label: "Performance", icon: "bi-bar-chart" },
    { to: "/profile/feedback", label: "Feedback", icon: "bi-emoji-smile" },
    { to: "/notifications", label: "Notifications", icon: "bi-bell" },
    { to: "/profile/settings", label: "Settings", icon: "bi-gear" },
  ];

  return (
    <div className="profile-panel-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="profile-panel premium-glass-card"
        role="dialog"
        aria-modal="true"
        aria-label="Profile panel"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="profile-panel-close" aria-label="Close profile panel" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>

        <div className="profile-panel-header">
          <div className="profile-panel-avatar">{initials}</div>
          <div>
            <strong>{user?.name || "EasternCity Member"}</strong>
            <span>{user?.email || "member@easterncity.com"}</span>
          </div>
        </div>

        <div className="profile-panel-verification">
          <i className="bi bi-shield-check"></i>
          <div>
            <strong>{user?.verificationStatus || "Pending Verification"}</strong>
            <span>National ID review protects renters and owners.</span>
          </div>
        </div>

        <nav className="profile-panel-nav">
          {items.map((item) => (
            <Link to={item.to} key={item.label} onClick={onClose}>
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
          <button type="button" onClick={onLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Log out</span>
          </button>
        </nav>
      </aside>
    </div>
  );
}
