import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function AdminTopbar({ title }) {
  const { currentUser, user, logout } = useAuth();
  const activeUser = user || currentUser;
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    localStorage.setItem('language', lang);
    // In a real app, trigger i18n change here
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-title">
        <p>{title}</p>
        <h1>{activeUser?.name || "Administrator"}</h1>
      </div>

      <div className="position-relative" ref={menuRef}>
        {/* Theme Toggle */}
        <button
          className="theme-toggle btn me-2"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === "dark" ? <i className="bi bi-sun" /> : <i className="bi bi-moon" />}
        </button>

        {/* Language Selector */}
        <select
          className="language-select btn me-2"
          value={language}
          onChange={handleLanguageChange}
          title="Language"
        >
          <option value="en">English</option>
          <option value="am">Amharic</option>
          <option value="om">Afaan Oromo</option>
          <option value="so">Somali</option>
        </select>

        {/* Profile Pill */}
        <div
          className="dashboard-user-pill cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "20px",
            background: "rgba(227, 30, 36, 0.1)",
            color: "var(--primary-color)"
          }}
        >
          <i className="bi bi-shield-lock-fill" />
          <span style={{ fontWeight: 600 }}>{activeUser?.role || "admin"}</span>
          <i className={`bi bi-chevron-${menuOpen ? "up" : "down"} ms-2`} style={{ fontSize: "0.8rem" }} />
        </div>

        {menuOpen && (
          <div className="position-absolute bg-white shadow rounded p-2 mt-2" style={{ right: 0, minWidth: "150px" }}>
            <button className="dropdown-item text-danger d-flex align-items-center gap-2 py-2" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
