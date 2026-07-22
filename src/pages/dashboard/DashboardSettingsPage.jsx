import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getStorageItem,
  setStorageItem,
} from "../../services/storageService.js";
import { updateUser } from "../../services/userApiService.js";

const NOTIF_KEY = "ud_notification_prefs";

const TABS = [
  { id: "profile", label: "Profile", icon: "bi-person-circle" },
  { id: "password", label: "Password", icon: "bi-lock" },
  { id: "notifications", label: "Notifications", icon: "bi-bell" },
  { id: "language", label: "Language", icon: "bi-globe" },
  { id: "darkmode", label: "Dark Mode", icon: "bi-moon-stars" },
];

function ProfileSettings({ user, setCurrentUser }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
  });
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    try {
      const updated = await updateUser(user?.id, form);
      setCurrentUser({ ...user, ...updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(false);
    }
  }

  return (
    <form className="ud-settings-form" onSubmit={handleSave}>
      <h3 className="ud-settings-section-title">Profile Information</h3>
      {saved && (
        <div className="ud-alert ud-alert-success">
          <i className="bi bi-check-circle-fill" /> Profile updated
          successfully.
        </div>
      )}
      <div className="ud-form-grid">
        <div className="ud-form-group">
          <label htmlFor="sett-name">Full Name</label>
          <input
            id="sett-name"
            type="text"
            className="ud-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="ud-form-group">
          <label htmlFor="sett-email">Email Address</label>
          <input
            id="sett-email"
            type="email"
            className="ud-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="ud-form-group">
          <label htmlFor="sett-phone">Phone Number</label>
          <input
            id="sett-phone"
            type="tel"
            className="ud-input"
            value={form.phone}
            placeholder="+251 900 000 000"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="ud-form-group">
          <label htmlFor="sett-city">City</label>
          <select
            id="sett-city"
            className="ud-input"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          >
            <option value="">Select city…</option>
            {["Jigjiga", "Harar", "Dire Dawa"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className="ud-btn-red">
        <i className="bi bi-save" /> Save Changes
      </button>
    </form>
  );
}

function PasswordSettings({ user }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    if (form.next !== form.confirm) {
      setMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (form.next.length < 6) {
      setMsg({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    try {
      await updateUser(user?.id, {
        password: form.next,
      });
      setMsg({ type: "success", text: "Password changed successfully." });
      setForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setMsg(null), 4000);
    } catch {
      setMsg({ type: "error", text: "Unable to change password." });
    }
  }

  return (
    <form className="ud-settings-form" onSubmit={handleSave}>
      <h3 className="ud-settings-section-title">Change Password</h3>
      {msg && (
        <div
          className={`ud-alert ${msg.type === "success" ? "ud-alert-success" : "ud-alert-error"}`}
        >
          <i
            className={`bi ${msg.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"}`}
          />
          {msg.text}
        </div>
      )}
      <div className="ud-form-grid ud-form-grid-1">
        {[
          { id: "sett-cur-pass", label: "Current Password", field: "current" },
          { id: "sett-new-pass", label: "New Password", field: "next" },
          {
            id: "sett-conf-pass",
            label: "Confirm New Password",
            field: "confirm",
          },
        ].map(({ id, label, field }) => (
          <div className="ud-form-group" key={field}>
            <label htmlFor={id}>{label}</label>
            <input
              id={id}
              type="password"
              className="ud-input"
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              required
            />
          </div>
        ))}
      </div>
      <button type="submit" className="ud-btn-red">
        <i className="bi bi-lock" /> Update Password
      </button>
    </form>
  );
}

function NotificationSettings() {
  const defaults = {
    bookings: true,
    messages: true,
    promotions: false,
    reviews: true,
    payments: true,
  };
  const [prefs, setPrefs] = useState(() => getStorageItem(NOTIF_KEY, defaults));
  const [saved, setSaved] = useState(false);

  function toggle(key) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setStorageItem(NOTIF_KEY, updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const items = [
    {
      key: "bookings",
      label: "Booking Updates",
      desc: "Notifications about your booking status changes",
    },
    {
      key: "messages",
      label: "New Messages",
      desc: "When someone sends you a message",
    },
    {
      key: "reviews",
      label: "Review Reminders",
      desc: "Reminders to review completed rentals",
    },
    {
      key: "payments",
      label: "Payment Alerts",
      desc: "Payment confirmations and reminders",
    },
    {
      key: "promotions",
      label: "Promotions",
      desc: "Featured listings and special offers",
    },
  ];

  return (
    <div className="ud-settings-form">
      <h3 className="ud-settings-section-title">Notification Preferences</h3>
      {saved && (
        <div className="ud-alert ud-alert-success">
          <i className="bi bi-check-circle-fill" /> Preferences saved.
        </div>
      )}
      <div className="ud-toggle-list">
        {items.map((item) => (
          <div className="ud-toggle-row" key={item.key}>
            <div>
              <strong>{item.label}</strong>
              <span>{item.desc}</span>
            </div>
            <button
              type="button"
              className={`ud-toggle ${prefs[item.key] ? "ud-toggle-on" : ""}`}
              onClick={() => toggle(item.key)}
              aria-label={`Toggle ${item.label}`}
            >
              <span className="ud-toggle-knob" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguageSettings() {
  const LANGUAGES = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "am", label: "Amharic (አማርኛ)", flag: "🇪🇹" },
    { code: "so", label: "Somali (Soomaali)", flag: "🇸🇴" },
    { code: "om", label: "Oromo (Afaan Oromo)", flag: "🇪🇹" },
  ];
  const [selected, setSelected] = useState(() =>
    getStorageItem("easterncity_lang", "en"),
  );

  function handleSelect(code) {
    setSelected(code);
    setStorageItem("easterncity_lang", code);
  }

  return (
    <div className="ud-settings-form">
      <h3 className="ud-settings-section-title">Language Preferences</h3>
      <div className="ud-lang-grid">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`ud-lang-card ${selected === lang.code ? "ud-lang-card--active" : ""}`}
            onClick={() => handleSelect(lang.code)}
          >
            <span className="ud-lang-flag">{lang.flag}</span>
            <span>{lang.label}</span>
            {selected === lang.code && (
              <i className="bi bi-check-circle-fill text-danger" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function DarkModeSettings() {
  const THEME_KEY = "easterncity-theme";
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark",
  );

  function toggle() {
    const newTheme = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    setStorageItem(THEME_KEY, newTheme);
    setIsDark(!isDark);
  }

  return (
    <div className="ud-settings-form">
      <h3 className="ud-settings-section-title">Appearance</h3>
      <div className="ud-theme-selector">
        <div
          className={`ud-theme-option ${!isDark ? "active" : ""}`}
          onClick={() => isDark && toggle()}
        >
          <div className="ud-theme-preview ud-theme-light">
            <div />
            <div />
            <div />
          </div>
          <span>Light Mode</span>
          {!isDark && <i className="bi bi-check-circle-fill text-danger" />}
        </div>
        <div
          className={`ud-theme-option ${isDark ? "active" : ""}`}
          onClick={() => !isDark && toggle()}
        >
          <div className="ud-theme-preview ud-theme-dark">
            <div />
            <div />
            <div />
          </div>
          <span>Dark Mode</span>
          {isDark && <i className="bi bi-check-circle-fill text-danger" />}
        </div>
      </div>
      <p className="text-muted small mt-3">
        Your preference is saved and will be remembered on your next visit.
      </p>
    </div>
  );
}

export default function DashboardSettingsPage() {
  const { currentUser, user, setCurrentUser } = useAuth();
  const activeUser = user || currentUser;
  const [activeTab, setActiveTab] = useState("profile");

  const tabContent = {
    profile: (
      <ProfileSettings user={activeUser} setCurrentUser={setCurrentUser} />
    ),
    password: <PasswordSettings user={activeUser} />,
    notifications: <NotificationSettings />,
    language: <LanguageSettings />,
    darkmode: <DarkModeSettings />,
  };

  return (
    <div className="ud-page">
      <div className="ud-page-header">
        <div>
          <span className="ud-label">ACCOUNT</span>
          <h1 className="ud-page-title">Settings</h1>
          <p className="ud-page-sub">
            Manage your profile, security and preferences.
          </p>
        </div>
      </div>

      <div className="ud-settings-layout">
        <nav className="ud-settings-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`ud-settings-nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`bi ${tab.icon}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="ud-settings-content ud-glass-card">
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
}
