import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../services/adminManagementService.js";
import { useAuth } from "../../context/AuthContext.jsx";

function toBool(v) { return v === "true" || v === true; }

function SectionCard({ icon, title, children }) {
  return (
    <div className="admin-table-container mb-4">
      <h2 className="h5 mb-1 d-flex align-items-center gap-2">
        <i className={`bi ${icon} text-primary-custom`} /> {title}
      </h2>
      <hr className="mt-2 mb-4" />
      {children}
    </div>
  );
}

function Notice({ msg, type }) {
  if (!msg) return null;
  return <div className={`alert alert-${type} py-2`}>{msg}</div>;
}

function SaveBtn({ saving, text = "Save Settings" }) {
  return (
    <button type="submit" className="btn btn-accent-custom" disabled={saving}>
      {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : text}
    </button>
  );
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const activeUser = user;

  /* ── state: general prefs ── */
  const [gen, setGen] = useState({
    language: "en",
    emailNotifications: true,
    systemNotifications: true,
  });

  /* ── state: notif prefs ── */
  const [notifs, setNotifs] = useState({
    notifyNewListings: true,
    notifyNewPromotions: true,
    notifyNewReports: true,
    notifyNewMessages: true,
  });

  const [loading, setLoading] = useState(true);
  const [savingGen, setSavingGen] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [noticeGen, setNoticeGen] = useState({ msg: "", type: "success" });
  const [noticeNotifs, setNoticeNotifs] = useState({ msg: "", type: "success" });

  const applySettings = useCallback((s) => {
    setGen({
      language: s.language || "en",
      emailNotifications: s.emailNotifications === undefined ? true : toBool(s.emailNotifications),
      systemNotifications: s.systemNotifications === undefined ? true : toBool(s.systemNotifications),
    });
    setNotifs({
      notifyNewListings: s.notifyNewListings === undefined ? true : toBool(s.notifyNewListings),
      notifyNewPromotions: s.notifyNewPromotions === undefined ? true : toBool(s.notifyNewPromotions),
      notifyNewReports: s.notifyNewReports === undefined ? true : toBool(s.notifyNewReports),
      notifyNewMessages: s.notifyNewMessages === undefined ? true : toBool(s.notifyNewMessages),
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    adminApi.settings()
      .then(applySettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [applySettings]);

  /* ── save general ── */
  async function saveGeneral(e) {
    e.preventDefault();
    setSavingGen(true);
    setNoticeGen({ msg: "", type: "success" });
    try {
      const updated = await adminApi.saveAdminPreferences({
        language: gen.language,
        emailNotifications: String(gen.emailNotifications),
        systemNotifications: String(gen.systemNotifications),
      });
      applySettings(updated?.data ?? updated ?? {});
      setNoticeGen({ msg: "General preferences saved.", type: "success" });
    } catch (err) {
      setNoticeGen({ msg: err?.response?.data?.message || err?.message || "Failed to save.", type: "danger" });
    } finally { setSavingGen(false); }
  }

  /* ── save notifications ── */
  async function saveNotifications(e) {
    e.preventDefault();
    setSavingNotifs(true);
    setNoticeNotifs({ msg: "", type: "success" });
    try {
      const updated = await adminApi.saveAdminPreferences({
        notifyNewListings: String(notifs.notifyNewListings),
        notifyNewPromotions: String(notifs.notifyNewPromotions),
        notifyNewReports: String(notifs.notifyNewReports),
        notifyNewMessages: String(notifs.notifyNewMessages),
      });
      applySettings(updated?.data ?? updated ?? {});
      setNoticeNotifs({ msg: "Notification preferences saved.", type: "success" });
    } catch (err) {
      setNoticeNotifs({ msg: err?.response?.data?.message || err?.message || "Failed to save.", type: "danger" });
    } finally { setSavingNotifs(false); }
  }

  if (loading) {
    return (
      <main className="dashboard-content d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
        <div className="spinner-border text-danger" />
      </main>
    );
  }

  return (
    <main className="dashboard-content">
      <div className="mb-4">
        <span className="section-label">ADMIN</span>
        <h1 className="h3 mb-0">Personal Settings</h1>
        <p className="text-muted mb-0">Configure your personal admin dashboard preferences.</p>
      </div>

      <div className="row">
        <div className="col-lg-8">

          {/* ── General ── */}
          <SectionCard icon="bi-person" title="General Preferences">
            <Notice msg={noticeGen.msg} type={noticeGen.type} />
            <form onSubmit={saveGeneral}>
              <div className="mb-3">
                <label className="form-label fw-semibold" htmlFor="admin-lang">Dashboard Language</label>
                <select id="admin-lang" className="form-select" value={gen.language}
                  onChange={e => setGen(p => ({ ...p, language: e.target.value }))}>
                  <option value="en">English</option>
                  <option value="am">Amharic</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" id="admin-emailNotif" checked={gen.emailNotifications}
                  onChange={e => setGen(p => ({ ...p, emailNotifications: e.target.checked }))} />
                <label className="form-check-label" htmlFor="admin-emailNotif">
                  <span className="fw-semibold">Email Notifications</span>
                  <span className="d-block text-muted small">Receive emails for important system events.</span>
                </label>
              </div>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="admin-sysNotif" checked={gen.systemNotifications}
                  onChange={e => setGen(p => ({ ...p, systemNotifications: e.target.checked }))} />
                <label className="form-check-label" htmlFor="admin-sysNotif">
                  <span className="fw-semibold">System Notifications</span>
                  <span className="d-block text-muted small">Receive in-app notifications in the dashboard.</span>
                </label>
              </div>
              <SaveBtn saving={savingGen} />
            </form>
          </SectionCard>

          {/* ── Notifications ── */}
          <SectionCard icon="bi-bell" title="Notification Preferences">
            <Notice msg={noticeNotifs.msg} type={noticeNotifs.type} />
            <form onSubmit={saveNotifications}>
              <p className="text-muted small mb-3">
                Choose which events trigger an alert in your notification panel.
              </p>
              <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" id="admin-notifListings" checked={notifs.notifyNewListings}
                  onChange={e => setNotifs(p => ({ ...p, notifyNewListings: e.target.checked }))} />
                <label className="form-check-label fw-semibold" htmlFor="admin-notifListings">New Listings</label>
              </div>
              <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" id="admin-notifPromo" checked={notifs.notifyNewPromotions}
                  onChange={e => setNotifs(p => ({ ...p, notifyNewPromotions: e.target.checked }))} />
                <label className="form-check-label fw-semibold" htmlFor="admin-notifPromo">Promotion Requests</label>
              </div>
              <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" id="admin-notifReports" checked={notifs.notifyNewReports}
                  onChange={e => setNotifs(p => ({ ...p, notifyNewReports: e.target.checked }))} />
                <label className="form-check-label fw-semibold" htmlFor="admin-notifReports">User Reports</label>
              </div>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="admin-notifMessages" checked={notifs.notifyNewMessages}
                  onChange={e => setNotifs(p => ({ ...p, notifyNewMessages: e.target.checked }))} />
                <label className="form-check-label fw-semibold" htmlFor="admin-notifMessages">Contact Messages</label>
              </div>
              <SaveBtn saving={savingNotifs} />
            </form>
          </SectionCard>

        </div>
      </div>
    </main>
  );
}
