import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { getInitials } from "../../utils/user.js";
import { dashboardForRole } from "../../services/authService.js";
import LanguageSwitcher from "../common/LanguageSwitcher.jsx";
import ThemeToggle from "../common/ThemeToggle.jsx";

export default function MobileDrawerMenu({ open, onClose }) {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <>
      {/* Overlay */}
      {open && <div className="mobile-drawer-overlay" onClick={onClose}></div>}

      {/* Drawer */}
      <div className={`mobile-drawer ${open ? "open" : ""}`}>
        <div className="mobile-drawer-header">
          {isAuthenticated ? (
            <Link to="/dashboard-settings" onClick={onClose} className="mobile-drawer-profile" style={{ textDecoration: 'none', display: 'flex', color: 'inherit' }}>
              <div className="drawer-avatar" style={{ padding: currentUser?.avatar ? 0 : undefined, overflow: 'hidden' }}>
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt="Profile" 
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} 
                  />
                ) : (
                  <span className="avatar-initials">
                    {getInitials(currentUser?.name)}
                  </span>
                )}
              </div>
              <div className="drawer-user-info">
                <span className="drawer-user-name">{currentUser?.name}</span>
                <span className="drawer-user-email">{currentUser?.email}</span>
              </div>
            </Link>
          ) : (
            <div className="mobile-drawer-profile guest-profile">
              <div className="drawer-avatar">
                <i className="bi bi-person-circle"></i>
              </div>
              <div className="drawer-user-info">
                <span className="drawer-user-name">{t("user")}</span>
                <span className="drawer-user-email">{t("loginRegister")}</span>
              </div>
            </div>
          )}
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close menu">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="mobile-drawer-content">
          <ul className="drawer-menu-list">
            {!isAuthenticated && (
              <li>
                <Link to="/login" onClick={onClose} className="drawer-menu-link">
                  <i className="bi bi-box-arrow-in-right"></i>
                  <span>{t("loginRegister")}</span>
                </Link>
              </li>
            )}
            
            <li className="drawer-menu-item-interactive">
              <div className="drawer-menu-link-wrapper">
                <i className="bi bi-globe"></i>
                <span>{t("language")}</span>
                <div className="drawer-control-inline">
                  <LanguageSwitcher />
                </div>
              </div>
            </li>
            
            <li className="drawer-menu-item-interactive">
              <div className="drawer-menu-link-wrapper">
                <i className="bi bi-moon"></i>
                <span>{t("settings")}</span>
                <div className="drawer-control-inline">
                  <ThemeToggle />
                </div>
              </div>
            </li>


            {isAuthenticated && (
              <>
                <li className="drawer-divider"></li>
                <li>
                  <Link to={dashboardForRole(currentUser?.role)} onClick={onClose} className="drawer-menu-link">
                    <i className="bi bi-speedometer2"></i>
                    <span>{t("dashboard")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard-settings" onClick={onClose} className="drawer-menu-link">
                    <i className="bi bi-person"></i>
                    <span>{t("profile")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/notifications" onClick={onClose} className="drawer-menu-link">
                    <i className="bi bi-bell"></i>
                    <span>{t("notifications")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard-settings" onClick={onClose} className="drawer-menu-link">
                    <i className="bi bi-gear"></i>
                    <span>{t("settings")}</span>
                  </Link>
                </li>
                <li className="drawer-divider"></li>
                <li>
                  <button onClick={handleLogout} className="drawer-menu-link text-danger w-100 text-start bg-transparent border-0">
                    <i className="bi bi-box-arrow-right"></i>
                    <span>{t("logout")}</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
