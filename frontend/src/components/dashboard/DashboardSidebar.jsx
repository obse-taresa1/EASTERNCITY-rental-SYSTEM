import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useRefreshToken } from "../../context/RefreshContext.jsx";
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
    labelKey: "overview",
    items: [
      { to: "/dashboard", labelKey: "dashboard", icon: "bi-speedometer2", end: true },
    ],
  },
  {
    labelKey: "listingsSection",
    items: [
      { to: "/my-listings", labelKey: "myListings", icon: "bi-card-checklist" },
      { to: "/list-item", labelKey: "addNewListing", icon: "bi-plus-circle-fill", accent: true },
    ],
  },
  {
    labelKey: "activity",
    items: [
      { to: "/my-bookings", labelKey: "myBookings", icon: "bi-calendar-check" },
      { to: "/messages", labelKey: "messages", icon: "bi-chat-dots" },
      { to: "/saved-items", labelKey: "savedItems", icon: "bi-heart" },
    ],
  },
  {
    labelKey: "account",
    items: [
      { to: "/reviews", labelKey: "reviewsRatings", icon: "bi-star" },
      { to: "/verification", labelKey: "verificationCenter", icon: "bi-shield-check" },
      { to: "/dashboard-settings", labelKey: "settings", icon: "bi-gear" },
      { to: "/help-center", labelKey: "helpCenter", icon: "bi-question-circle" },
    ],
  },
];

export default function DashboardSidebar() {
  const { currentUser, user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const activeUser = user || currentUser;
  const savedItemsRefreshToken = useRefreshToken("savedItems");
  const statsRefreshToken = useRefreshToken(["bookings", "reviews"]);

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
    setSavedItems(
      getStorageItem("saved_items", []).filter(
        (item) => String(item.userId || "") === String(activeUser?.id || ""),
      ).length,
    );
  }, [activeUser?.id, savedItemsRefreshToken]);

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
  }, [activeUser?.id, statsRefreshToken]);

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
          {activeUser?.avatar || activeUser?.profileImage ? (
            <img src={activeUser.avatar || activeUser.profileImage} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <span>{getInitials(activeUser?.name)}</span>
          )}
        </div>

        <div className="ud-sidebar-user-info">
          <h5 className="ud-sidebar-name">{activeUser?.name || t("user")}</h5>
          <span className={`ud-verification-tag ${isVerified ? "verified" : "pending"}`}> 
            <i className={`bi ${isVerified ? "bi-shield-check" : "bi-shield-exclamation"}`} />
            {verificationStatus}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="ud-sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div className="ud-nav-section" key={section.labelKey}>
            <span className="ud-nav-section-label">{t(section.labelKey).toUpperCase()}</span>
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
                <span>{t(item.labelKey)}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="ud-sidebar-footer">
        <button type="button" className="ud-logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" />
          <span>{t("logOut")}</span>
        </button>
      </div>
    </aside>
  );
}

