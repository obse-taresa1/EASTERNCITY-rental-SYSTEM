import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  fetchNotifications,
  markNotificationRead,
} from "../../services/notificationService.js";
import { getInitials } from "../../utils/user.js";

const LANGUAGES = [
  { code: "en", abbr: "EN", label: "English" },
  { code: "am", abbr: "AM", label: "Amharic" },
  { code: "om", abbr: "OM", label: "Afaan Oromo" },
  { code: "so", abbr: "SO", label: "Somali" },
];

const ADMIN_SEARCH_ROUTES = [
  {
    label: "Dashboard",
    to: "/admin-dashboard",
    keywords: ["home", "overview"],
  },
  {
    label: "Users Management",
    to: "/admin-dashboard/users",
    keywords: ["user", "users"],
  },
  {
    label: "Listing Management",
    to: "/admin-dashboard/listings",
    keywords: ["listing", "listings", "items"],
  },
  {
    label: "Categories Management",
    to: "/admin-dashboard/categories",
    keywords: ["category", "categories"],
  },
  {
    label: "Bookings Management",
    to: "/admin-dashboard/bookings",
    keywords: ["booking", "bookings"],
  },
  {
    label: "Payments & Revenue",
    to: "/admin-dashboard/payments",
    keywords: ["payment", "payments", "revenue"],
  },
  {
    label: "Promotion Management",
    to: "/admin-dashboard/promotion-management",
    keywords: ["promotion", "promote"],
  },
  {
    label: "Featured Listings",
    to: "/admin-dashboard/featured-listings",
    keywords: ["featured", "top listing"],
  },
  {
    label: "Verification Center",
    to: "/admin-dashboard/verification-requests",
    keywords: ["verification", "verify"],
  },
  {
    label: "Reports & Complaints",
    to: "/admin-dashboard/reports",
    keywords: ["report", "complaint"],
  },
  {
    label: "Support Center",
    to: "/admin-dashboard/support-tickets",
    keywords: ["support", "ticket"],
  },
  {
    label: "Contact Messages",
    to: "/admin-dashboard/contact-messages",
    keywords: ["contact", "message"],
  },
  {
    label: "Notifications",
    to: "/admin-dashboard/notifications",
    keywords: ["notification", "alert"],
  },
  {
    label: "Analytics",
    to: "/admin-dashboard/analytics",
    keywords: ["analytics", "stats", "statistics"],
  },
  {
    label: "Settings",
    to: "/admin-dashboard/settings",
    keywords: ["setting", "settings"],
  },
];

const SUPER_ADMIN_SEARCH_ROUTES = [
  {
    label: "Dashboard",
    to: "/super-admin-dashboard",
    keywords: ["home", "overview"],
  },
  {
    label: "Platform Overview",
    to: "/super-admin-dashboard/platform-overview",
    keywords: ["platform", "overview"],
  },
  {
    label: "Admin Management",
    to: "/super-admin-dashboard/admin-management",
    keywords: ["admin", "admins"],
  },
  {
    label: "User Management",
    to: "/super-admin-dashboard/user-management",
    keywords: ["user", "users"],
  },
  {
    label: "Listing Management",
    to: "/super-admin-dashboard/listing-management",
    keywords: ["listing", "listings", "items"],
  },
  {
    label: "Categories Management",
    to: "/super-admin-dashboard/categories-management",
    keywords: ["category", "categories"],
  },
  {
    label: "Promotion Management",
    to: "/super-admin-dashboard/promotion-management",
    keywords: ["promotion", "promote"],
  },
  {
    label: "Verification Center",
    to: "/super-admin-dashboard/verification-center",
    keywords: ["verification", "verify"],
  },
  {
    label: "Payments & Revenue",
    to: "/super-admin-dashboard/payments-revenue",
    keywords: ["payment", "payments", "revenue"],
  },
  {
    label: "Reports & Complaints",
    to: "/super-admin-dashboard/reports-complaints",
    keywords: ["report", "complaint"],
  },
  {
    label: "Platform Monitoring",
    to: "/super-admin-dashboard/platform-monitoring",
    keywords: ["monitoring", "monitor"],
  },
  {
    label: "Security Center",
    to: "/super-admin-dashboard/security-center",
    keywords: ["security"],
  },
  {
    label: "Support Center",
    to: "/super-admin-dashboard/support-center",
    keywords: ["support", "ticket"],
  },
  {
    label: "Contact Messages",
    to: "/super-admin-dashboard/contact-messages",
    keywords: ["contact", "message"],
  },
  {
    label: "Notifications",
    to: "/super-admin-dashboard/notifications",
    keywords: ["notification", "alert"],
  },
  {
    label: "Platform Analytics",
    to: "/super-admin-dashboard/analytics",
    keywords: ["analytics", "stats", "statistics"],
  },
  {
    label: "Activity Logs",
    to: "/super-admin-dashboard/activity-logs",
    keywords: ["activity", "logs"],
  },
  {
    label: "Settings",
    to: "/super-admin-dashboard/system-settings",
    keywords: ["setting", "settings"],
  },
];

function findSearchRoute(query, routes) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return null;

  return routes.find((route) => {
    const label = route.label.toLowerCase();
    return (
      label.includes(normalizedQuery) ||
      route.keywords.some(
        (keyword) =>
          keyword.includes(normalizedQuery) ||
          normalizedQuery.includes(keyword),
      )
    );
  });
}

export default function AdminTopbar({ title }) {
  const { currentUser, user, logout } = useAuth();
  const activeUser = user || currentUser;
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const isSuperAdmin = location.pathname.startsWith("/super-admin-dashboard");
  const routes = isSuperAdmin ? SUPER_ADMIN_SEARCH_ROUTES : ADMIN_SEARCH_ROUTES;
  const notificationsPath = isSuperAdmin
    ? "/super-admin-dashboard/notifications"
    : "/admin-dashboard/notifications";
  const fallbackPath = isSuperAdmin
    ? "/super-admin-dashboard"
    : "/admin-dashboard";

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);

  const currentLanguage = useMemo(
    () => LANGUAGES.find((option) => option.code === language) || LANGUAGES[0],
    [language],
  );

  useEffect(() => {
    let active = true;

    async function updateNotifications() {
      const notifications = await fetchNotifications(activeUser?.id).catch(
        () => [],
      );
      if (!active) return;
      setNotifications((notifications || []).slice(0, 5));
      setUnreadCount(
        (notifications || []).filter((notification) => !notification.isRead)
          .length,
      );
    }

    updateNotifications();
    window.addEventListener(
      "easterncity:notifications-updated",
      updateNotifications,
    );
    window.addEventListener("storage", updateNotifications);

    return () => {
      active = false;
      window.removeEventListener(
        "easterncity:notifications-updated",
        updateNotifications,
      );
      window.removeEventListener("storage", updateNotifications);
    };
  }, [activeUser?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setNotificationMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;
    setLanguage(nextLanguage);
    window.dispatchEvent(
      new CustomEvent("easterncity:language-changed", { detail: nextLanguage }),
    );
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const match = findSearchRoute(searchQuery, routes);

    if (match) {
      navigate(match.to);
      setSearchQuery("");
      return;
    }

    if (searchQuery.trim()) {
      navigate(
        `${fallbackPath}?search=${encodeURIComponent(searchQuery.trim())}`,
      );
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markNotificationRead(notification.id).catch(() => null);
    }
    setNotificationMenuOpen(false);
    navigate(notificationsPath);
  };

  return (
    <header className="admin-topbar admin-red-topbar">
      <div className="admin-welcome-block">
        <button
          className="admin-menu-button"
          type="button"
          aria-label="Open menu"
        >
          <i className="bi bi-list" />
        </button>
        <button
          className="admin-avatar-photo"
          type="button"
          onClick={handleProfileClick}
          title="View profile"
        >
          <span>{getInitials(activeUser?.name)}</span>
        </button>
        <div className="admin-topbar-title">
          <p>Welcome back,</p>
          <h1>{title || activeUser?.role || "Admin"}</h1>
        </div>
      </div>

      <div className="admin-topbar-actions" ref={menuRef}>
        <label
          className="admin-language-pill"
          title={`Language: ${currentLanguage.label}`}
        >
          <span className="admin-flag">{currentLanguage.abbr}</span>
          <select
            value={language}
            onChange={handleLanguageChange}
            title="Language"
          >
            {LANGUAGES.map((option) => (
              <option value={option.code} key={option.code}>
                {option.label}
              </option>
            ))}
          </select>
          <i className="bi bi-chevron-down" />
        </label>

        <button
          className={`admin-theme-switch ${theme === "dark" ? "is-dark" : ""}`}
          onClick={toggleTheme}
          title="Toggle theme"
          type="button"
        >
          <i className="bi bi-sun" />
          <span />
          <i className="bi bi-moon-fill" />
        </button>

        <form
          className="admin-search-pill"
          onSubmit={handleSearchSubmit}
          role="search"
        >
          <input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            list={
              isSuperAdmin ? "super-admin-search-routes" : "admin-search-routes"
            }
          />
          <button type="submit" aria-label="Search">
            <i className="bi bi-search" />
          </button>
          <datalist
            id={
              isSuperAdmin ? "super-admin-search-routes" : "admin-search-routes"
            }
          >
            {routes.map((route) => (
              <option key={route.to} value={route.label} />
            ))}
          </datalist>
        </form>

        <button
          className="admin-icon-button admin-notification-button"
          type="button"
          title="Notifications"
          onClick={() => {
            setMenuOpen(false);
            setNotificationMenuOpen((open) => !open);
          }}
        >
          <i className="bi bi-bell" />
          {unreadCount > 0 && (
            <span>{unreadCount > 99 ? "99+" : unreadCount}</span>
          )}
        </button>

        {notificationMenuOpen && (
          <div
            className="admin-profile-menu"
            style={{ minWidth: "340px", maxWidth: "420px", right: "140px" }}
          >
            <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
              <strong>Notifications</strong>
              <span className="text-muted small">{unreadCount} unread</span>
            </div>
            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div className="px-3 py-4 text-center text-muted">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={`dropdown-item text-start py-3 ${notification.isRead ? "" : "fw-bold"}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="d-flex justify-content-between gap-3">
                      <span>{notification.title}</span>
                      <small className="text-muted">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="text-muted small mt-1">
                      {notification.body}
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="px-3 py-2 border-top">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger w-100"
                onClick={() => {
                  setNotificationMenuOpen(false);
                  navigate(notificationsPath);
                }}
              >
                View all notifications
              </button>
            </div>
          </div>
        )}

        <button
          className="admin-profile-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          type="button"
          title="Profile menu"
        >
          <i className="bi bi-person" />
        </button>

        {menuOpen && (
          <div className="admin-profile-menu">
            <button
              className="dropdown-item d-flex align-items-center gap-2 py-2"
              onClick={handleProfileClick}
              type="button"
            >
              <i className="bi bi-person-circle" />
              <span>View Profile</span>
            </button>
            <button
              className="dropdown-item text-danger d-flex align-items-center gap-2 py-2"
              onClick={handleLogout}
              type="button"
            >
              <i className="bi bi-box-arrow-right" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
