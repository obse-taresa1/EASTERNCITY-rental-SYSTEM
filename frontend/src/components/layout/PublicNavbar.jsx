import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { dashboardForRole } from "../../services/authService.js";
import LanguageSwitcher from "../common/LanguageSwitcher.jsx";
import ProfilePanel from "../common/ProfilePanel.jsx";
import ThemeToggle from "../common/ThemeToggle.jsx";
import { getInitials } from "../../utils/user.js";
import MobileDrawerMenu from "./MobileDrawerMenu.jsx";
import logo from "../../assets/images/eastern-cities-header-logo-transparent.png";

export default function PublicNavbar() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    setPanelOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header id="top" className="motorx-header app-public-header">
      <div className="container">
        <div className="motorx-nav-flex">
          <Link className="motorx-logo" to="/">
            <img src={logo} alt="Eastern Cities" />
          </Link>

          {/* Desktop hamburger toggle (hidden on mobile via mobile-ui.css) */}
          <input
            type="checkbox"
            id="nav-toggle"
            className="nav-check"
            aria-label={t("openMenu")}
          />
          <label htmlFor="nav-toggle" className="nav-toggler-label">
            <i className="bi bi-list"></i>
          </label>

          {/* Mobile three-dot menu trigger (hidden on desktop via mobile-ui.css) */}
          <button
            className="mobile-menu-trigger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            type="button"
          >
            <i className="bi bi-three-dots-vertical"></i>
          </button>

          <nav className="motorx-nav-menu">
            <ul className="motorx-nav-links">
              <li>
                <NavLink to="/">{t("home")}</NavLink>
              </li>
              <li className="nav-category-shell">
                <NavLink to="/categories" className="nav-category-trigger">
                  {t("categories")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/about">About Us</NavLink>
              </li>
              <li>
                <NavLink to="/contact">{t("contactUs")}</NavLink>
              </li>
            </ul>

            <div className="motorx-nav-actions">
              <LanguageSwitcher />
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  <button
                    className="profile-avatar-btn premium-avatar"
                    onClick={() => setPanelOpen(true)}
                    aria-expanded={panelOpen}
                    aria-haspopup="true"
                    type="button"
                  >
                    {currentUser?.avatar ? (
                      <img 
                        src={currentUser.avatar} 
                        alt="Profile" 
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
                      />
                    ) : (
                      <span className="avatar-initials">
                        {getInitials(currentUser?.name)}
                      </span>
                    )}
                  </button>
                  <ProfilePanel
                    user={currentUser}
                    open={panelOpen}
                    onClose={() => setPanelOpen(false)}
                    onLogout={handleLogout}
                    dashboardPath={dashboardForRole(currentUser?.role)}
                  />
                </>
              ) : (
                <Link to="/login" className="nav-login">
                  {t("registerLogin")}
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile drawer (hidden on desktop via mobile-ui.css) */}
      <MobileDrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
