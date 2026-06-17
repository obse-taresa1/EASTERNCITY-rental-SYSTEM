import { useTheme } from "../../context/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle-btn"
      type="button"
      data-theme-toggle
      aria-label="Switch theme"
      aria-pressed={theme === "dark"}
      onClick={toggleTheme}
    >
      <i className="bi bi-moon-fill theme-icon-dark"></i>
      <i className="bi bi-sun-fill theme-icon-light"></i>
    </button>
  );
}
