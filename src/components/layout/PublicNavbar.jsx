import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { dashboardForRole } from "../../services/authService.js";
import LanguageSwitcher from "../common/LanguageSwitcher.jsx";
import ThemeToggle from "../common/ThemeToggle.jsx";
import logo from "../../assets/images/logo.png";

export default function PublicNavbar() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header id="top" className="motorx-header app-public-header">
      <div className="container">
        <div className="motorx-nav-flex">
          <Link className="motorx-logo" to="/">
            <img src={logo} alt="CityRent Logo" />
          </Link>

          <input
            type="checkbox"
            id="nav-toggle"
            className="nav-check"
            aria-label={t("openMenu")}
          />

          <label htmlFor="nav-toggle" className="nav-toggler-label">
            <i className="bi bi-list"></i>
          </label>

          <nav className="motorx-nav-menu">
            <ul className="motorx-nav-links">
              <li>
                <NavLink to="/">{t("home")}</NavLink>
              </li>
              <li>
                <a href="#featured-listings">{t("categories")}</a>
              </li>
              <li>
                <NavLink to="/how-it-works">{t("howItWorks")}</NavLink>
              </li>
              <li>
                <NavLink to="/contact">{t("contactUs")}</NavLink>
              </li>
            </ul>

            <div className="motorx-nav-actions">
              <LanguageSwitcher />
              <ThemeToggle />

              {isAuthenticated ? (
                <div className="public-account-actions">
                  <Link
                    to={dashboardForRole(currentUser?.role)}
                    className="nav-login"
                  >
                    {t("dashboard")}
                  </Link>
                  <button
                    className="nav-login nav-logout-btn"
                    type="button"
                    onClick={logout}
                  >
                    {t("logout")}
                  </button>
                </div>
              ) : (
                <Link to="/login" className="nav-login">
                  {t("registerLogin")}
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
