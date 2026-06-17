import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { dashboardForRole } from "../../services/authService.js";
import ThemeToggle from "../common/ThemeToggle.jsx";
import logo from "../../assets/images/logo.png";

export default function PublicNavbar() {
  const { currentUser, isAuthenticated, logout } = useAuth();

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
            aria-label="Open menu"
          />

          <label htmlFor="nav-toggle" className="nav-toggler-label">
            <i className="bi bi-list"></i>
          </label>

          <nav className="motorx-nav-menu">
            <ul className="motorx-nav-links">
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              <li>
                <a href="#featured-listings">Categories</a>
              </li>
              <li>
                <NavLink to="/how-it-works">How It Works</NavLink>
              </li>
              <li>
                <NavLink to="/contact">Contact Us</NavLink>
              </li>
            </ul>

            <div className="motorx-nav-actions">
              <ThemeToggle />

              {isAuthenticated ? (
                <div className="public-account-actions">
                  <Link
                    to={dashboardForRole(currentUser?.role)}
                    className="nav-login"
                  >
                    Dashboard
                  </Link>
                  <button
                    className="nav-login nav-logout-btn"
                    type="button"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="nav-login">
                  Register / Login
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
