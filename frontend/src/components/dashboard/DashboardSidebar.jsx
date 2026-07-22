import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { getMyBookings } from "../../services/bookingApiService.js";
import { getMyReviews } from "../../services/reviewApiService.js";
import { getStorageItem } from "../../services/storageService.js";
import {
  isVerificationApproved,
  normalizeVerificationStatus,
} from "../../utils/verificationStatus.js";

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

const NAV_SECTIONS = [
  {
    label: "OVERVIEW",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: "bi-speedometer2", end: true },
    ],
  },
  {
    label: "LISTINGS",
    items: [
      { to: "/my-listings", label: "My Listings", icon: "bi-card-checklist" },
      { to: "/list-item", label: "Add New Listing", icon: "bi-plus-circle-fill", accent: true },
    ],
  },
  {
    label: "ACTIVITY",
    items: [
      { to: "/my-bookings", label: "My Bookings", icon: "bi-calendar-check" },
      { to: "/messages", label: "Messages", icon: "bi-chat-dots" },
      { to: "/saved-items", label: "Saved Items", icon: "bi-heart" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { to: "/reviews", label: "Reviews & Ratings", icon: "bi-star" },
      { to: "/verification", label: "Verification Center", icon: "bi-shield-check" },
      { to: "/dashboard-settings", label: "Settings", icon: "bi-gear" },
      { to: "/help-center", label: "Help Center", icon: "bi-question-circle" },
    ],
  },
];

export default function DashboardSidebar() {
  const { currentUser, user, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const activeUser = user || currentUser;

  const memberSince = activeUser?.createdAt
    ? new Date(activeUser.createdAt).getFullYear()
    : "N/A";

  const [activeBookings, setActiveBookings] = useState(0);
  const [reviews, setReviews] = useState(0);
  const [savedItems, setSavedItems] = useState(
    () =>
      getStorageItem("saved_items", []).filter(
        (item) => String(item.userId || "") === String(activeUser?.id || ""),
      ).length,
  );

  useEffect(() => {
    function refreshSavedCount() {
      setSavedItems(
        getStorageItem("saved_items", []).filter(
          (item) => String(item.userId || "") === String(activeUser?.id || ""),
        ).length,
      );
    }

    refreshSavedCount();
    window.addEventListener("easterncity:saved-items-updated", refreshSavedCount);
    return () => {
      window.removeEventListener(
        "easterncity:saved-items-updated",
        refreshSavedCount,
      );
    };
  }, [activeUser?.id]);

  useEffect(() => {
    let active = true;

    async function loadUserStats() {
      if (!activeUser?.id) {
        setActiveBookings(0);
        setReviews(0);
        return;
      }

      const [bookingData, reviewData] = await Promise.all([
        getMyBookings().catch(() => []),
        getMyReviews().catch(() => []),
      ]);

      if (!active) return;

      setActiveBookings(
        bookingData.filter((booking) =>
          ["PENDING", "ACCEPTED", "ACTIVE"].includes(
            String(booking.status || "").toUpperCase(),
          ),
        ).length,
      );
      setReviews(reviewData.length);
    }

    loadUserStats();

    return () => {
      active = false;
    };
  }, [activeUser?.id]);

  const verificationStatus = normalizeVerificationStatus(
    activeUser?.verificationStatus,
  );
  const isVerified = isVerificationApproved(verificationStatus);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="ud-sidebar">
      {/* Profile Card */}
      <div className="ud-sidebar-profile">
        <div className="ud-sidebar-avatar">
          {activeUser?.profileImage ? (
            <img src={activeUser.profileImage} alt="Profile" />
          ) : (
            <span>{getInitials(activeUser?.name)}</span>
          )}
          <span
            className={`ud-avatar-badge ${isVerified ? "ud-badge-verified" : "ud-badge-pending"}`}
            title={verificationStatus}
          >
            <i className={`bi ${isVerified ? "bi-check-lg" : "bi-clock"}`} />
          </span>
        </div>

        <div className="ud-sidebar-user-info">
          <h5 className="ud-sidebar-name">{activeUser?.name || "User"}</h5>
          <span className={`ud-verification-tag ${isVerified ? "verified" : "pending"}`}> 
            <i className={`bi ${isVerified ? "bi-shield-check" : "bi-shield-exclamation"}`} />
            {verificationStatus}
          </span>
          <div className="ud-sidebar-meta">
            <span>
              <i className="bi bi-geo-alt" />
              {activeUser?.city || "Location not set"}
            </span>
            <span>
              <i className="bi bi-calendar3" />
              Since {memberSince}
            </span>
          </div>
        </div>

        <div className="ud-sidebar-mini-stats">
          <div className="ud-mini-stat">
            <strong>{activeBookings}</strong>
            <span>Bookings</span>
          </div>
          <div className="ud-mini-stat">
            <strong>{savedItems}</strong>
            <span>Saved</span>
          </div>
          <div className="ud-mini-stat">
            <strong>{reviews}</strong>
            <span>Reviews</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="ud-sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div className="ud-nav-section" key={section.label}>
            <span className="ud-nav-section-label">{section.label}</span>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `ud-nav-link${isActive ? " ud-nav-link--active" : ""}${item.accent ? " ud-nav-link--accent" : ""}`
                }
              >
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="ud-sidebar-footer">
        <button type="button" className="ud-logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

