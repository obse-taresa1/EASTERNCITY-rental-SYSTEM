import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { getInitials } from "../../utils/user.js";
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
            <div className="mobile-drawer-profile">
              <div className="drawer-avatar">
                <span className="avatar-initials">
                  {getInitials(currentUser?.name)}
                </span>
              </div>
              <div className="drawer-user-info">
                <span className="drawer-user-name">{currentUser?.name}</span>
                <span className="drawer-user-email">{currentUser?.email}</span>
              </div>
            </div>
          ) : (
            <div className="mobile-drawer-profile guest-profile">
              <div className="drawer-avatar">
                <i className="bi bi-person-circle"></i>
              </div>
              <div className="drawer-user-info">
                <span className="drawer-user-name">Guest User</span>
                <span className="drawer-user-email">Please login to continue</span>
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
                  <span>Login / Register</span>
                </Link>
              </li>
            )}
            
            <li className="drawer-menu-item-interactive">
              <div className="drawer-menu-link-wrapper">
                <i className="bi bi-globe"></i>
                <span>Language</span>
                <div className="drawer-control-inline">
                  <LanguageSwitcher />
                </div>
              </div>
            </li>
            
            <li className="drawer-menu-item-interactive">
              <div className="drawer-menu-link-wrapper">
                <i className="bi bi-moon"></i>
                <span>Dark Mode</span>
                <div className="drawer-control-inline">
                  <ThemeToggle />
                </div>
              </div>
            </li>

            {isAuthenticated && (
              <>
                <li className="drawer-divider"></li>
                <li>
                  <Link to="/profile" onClick={onClose} className="drawer-menu-link">
                    <i className="bi bi-person"></i>
                    <span>Profile Info</span>
                  </Link>
                </li>
                <li>
                  <Link to="/notifications" onClick={onClose} className="drawer-menu-link">
                    <i className="bi bi-bell"></i>
                    <span>Notifications</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard-settings" onClick={onClose} className="drawer-menu-link">
                    <i className="bi bi-gear"></i>
                    <span>Settings</span>
                  </Link>
                </li>
                <li className="drawer-divider"></li>
                <li>
                  <button onClick={handleLogout} className="drawer-menu-link text-danger w-100 text-start bg-transparent border-0">
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
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
