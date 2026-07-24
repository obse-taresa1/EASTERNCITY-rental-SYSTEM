import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { dashboardForRole } from "../../services/authService.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function MobileBottomNav() {
  const { isAuthenticated, currentUser } = useAuth();
  const { t } = useLanguage();

  return (
    <nav className="mobile-bottom-nav">
      <ul className="mobile-bottom-nav-list">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `mobile-nav-item ${isActive ? "active" : ""}`
            }
          >
            <i className="bi bi-house-door"></i>
            <span>{t("home")}</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `mobile-nav-item ${isActive ? "active" : ""}`
            }
          >
            <i className="bi bi-grid"></i>
            <span>{t("categories")}</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `mobile-nav-item ${isActive ? "active" : ""}`
            }
          >
            <i className="bi bi-info-circle"></i>
            <span>About Us</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `mobile-nav-item ${isActive ? "active" : ""}`
            }
          >
            <i className="bi bi-envelope"></i>
            <span>{t("contactUs") || "Contact"}</span>
          </NavLink>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <NavLink
                to={dashboardForRole(currentUser?.role)}
                className={({ isActive }) =>
                  `mobile-nav-item ${isActive ? "active" : ""}`
                }
              >
                <i className="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/messages"
                className={({ isActive }) =>
                  `mobile-nav-item ${isActive ? "active" : ""}`
                }
              >
                <i className="bi bi-chat-dots"></i>
                <span>Messages</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `mobile-nav-item ${isActive ? "active" : ""}`
                }
              >
                <i className="bi bi-person"></i>
                <span>Profile</span>
              </NavLink>
            </li>
          </>
        ) : null}
      </ul>
    </nav>
  );
}
