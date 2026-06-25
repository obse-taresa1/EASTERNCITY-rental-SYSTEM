import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { dashboardForRole } from '../../services/authService.js';
import ThemeToggle from '../common/ThemeToggle.jsx';
import LanguageSwitcher from '../common/LanguageSwitcher.jsx';
import ProfilePanel from '../common/ProfilePanel.jsx';
import { getInitials } from '../../utils/user.js';

export default function DashboardTopbar() {
  const { currentUser, user, logout } = useAuth();
  const activeUser = user || currentUser;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar-inner">
        <div className="topbar-left">
          <span className="dashboard-topbar-title">EasternCities</span>
        </div>

        <div className="topbar-right">
          <LanguageSwitcher />
          <ThemeToggle />

          <button
            className="topbar-avatar-btn"
            onClick={() => setOpen(!open)}
            type="button"
            aria-expanded={open}
          >
            <div className="topbar-avatar premium-avatar">
              <span>{getInitials(activeUser?.name)}</span>
            </div>
            <div className="topbar-user-info">
              <strong>{activeUser?.name || 'User'}</strong>
              <span>{activeUser?.role || 'member'}</span>
            </div>
            <i className={`bi bi-chevron-${open ? 'up' : 'down'}`}></i>
          </button>

          <ProfilePanel
            user={activeUser}
            open={open}
            onClose={() => setOpen(false)}
            onLogout={handleLogout}
            dashboardPath={dashboardForRole(activeUser?.role)}
          />
        </div>
      </div>
    </header>
  );
}
