import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { getInitials } from "../../utils/user.js";
import {
  isVerificationApproved,
  normalizeVerificationStatus,
} from "../../utils/verificationStatus.js";

export default function ProfilePanel({ user, open, onClose, onLogout, dashboardPath = "/dashboard" }) {
  const { t } = useLanguage();
  const [showImage, setShowImage] = useState(false);
  if (!open) return null;

  const isAdminOrSuperAdmin = ["ADMIN", "SUPER_ADMIN"].includes(String(user?.role || "").toUpperCase());

  const PANEL_ITEMS = isAdminOrSuperAdmin
    ? [
        { to: dashboardPath, labelKey: "dashboard", icon: "bi-speedometer2" },
      ]
    : [
        { to: dashboardPath, labelKey: "dashboard", icon: "bi-speedometer2" },
        { to: "/my-listings", labelKey: "myListings", icon: "bi-card-checklist" },
        { to: "/my-bookings", labelKey: "myBookings", icon: "bi-calendar-check" },
        { to: "/messages", labelKey: "messages", icon: "bi-chat-dots" },
        { to: "/notifications", labelKey: "notifications", icon: "bi-bell" },
        { to: "/dashboard-settings", labelKey: "settings", icon: "bi-gear" },
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
          <div 
            className="profile-panel-avatar" 
            style={{ padding: user?.avatar ? 0 : undefined, overflow: "hidden", cursor: user?.avatar ? "pointer" : "default" }}
            onClick={() => user?.avatar && setShowImage(true)}
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Profile" 
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} 
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <strong>{user?.name || t("user")}</strong>
            <span>{user?.email || t("emailNotAvailable")}</span>
          </div>
        </div>

        {!isAdminOrSuperAdmin && (
          <div className="profile-panel-verification">
            <i className={`bi ${isVerified ? "bi-shield-check text-success" : "bi-shield-exclamation text-warning"}`} />
            <div>
              <strong>{verificationStatus}</strong>
              <span>{t("nationalIdReviewNote")}</span>
            </div>
          </div>
        )}

        <nav className="profile-panel-nav">
          {PANEL_ITEMS.map((item) => (
            <Link
              to={item.to}
              key={item.labelKey}
              onClick={onClose}
            >
              <i className={`bi ${item.icon}`} />
              <span>{t(item.labelKey)}</span>
            </Link>
          ))}
          <button type="button" onClick={onLogout}>
            <i className="bi bi-box-arrow-right" />
            <span>{t("logOut")}</span>
          </button>
        </nav>
      </aside>

      {/* Image Popup Modal */}
      {showImage && user?.avatar && (
        <div 
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowImage(false);
          }}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <button 
              onClick={() => setShowImage(false)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "2rem",
                cursor: "pointer"
              }}
            >
              &times;
            </button>
            <img 
              src={user.avatar} 
              alt="Profile Full" 
              style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "12px", objectFit: "contain", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}


