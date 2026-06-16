import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { dashboardForRole } from "../../services/authService.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import ThemeToggle from "../common/ThemeToggle.jsx";
import LanguageSwitcher from "../common/LanguageSwitcher.jsx";
import logo from "../../assets/images/logo.png";

const navLinks = [
  { to: "/", label: "home" },
  { to: "/our-story", label: "about" },
  { to: "/contact", label: "contact" },
  { to: "/items", label: "items" },
];

export default function PublicNavbar() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="motorx-header app-public-header">
      <div className="container">
        <div className="motorx-nav-flex">
          <Link className="motorx-logo" to="/">
            <img src={logo} alt="CityRent Logo" />
          </Link>

          <input
            type="checkbox"
            id="nav-toggle"
            className="nav-check"
            aria-label="Open menu"
          />

          <label htmlFor="nav-toggle" className="nav-toggler-label">
            <i className="bi bi-list"></i>
          </label>

          <nav className="motorx-nav-menu">
            <ul className="motorx-nav-links">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    {t(link.label)}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="motorx-nav-actions">
              <LanguageSwitcher />
              <ThemeToggle />

              {isAuthenticated ? (
                <div className="public-account-actions">
                  <details className="profile-menu public-profile-menu">
                    <summary aria-label="Open profile menu">
                      <img
                        src="https://i.pravatar.cc/40?img=33"
                        alt="User profile"
                      />
                      <span>{currentUser?.fullname || currentUser?.name || "User"}</span>
                      <i className="bi bi-chevron-down"></i>
                    </summary>

                    <div className="profile-menu-list">
                      <Link to="/profile">
                        <i className="bi bi-person"></i> {t("profile")}
                      </Link>

                      <Link to={dashboardForRole(currentUser?.role)}>
                        <i className="bi bi-speedometer2"></i> {t("dashboard")}
                      </Link>
                    </div>
                  </details>

                  <button
                    className="nav-login nav-logout-btn"
                    type="button"
                    onClick={logout}
                  >
                    {t("logout")}
                  </button>
                </div>
              ) : (
                <div className="public-auth-actions">
                  <Link to="/login" className="nav-login">
                    {t("loginRegister")}
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}