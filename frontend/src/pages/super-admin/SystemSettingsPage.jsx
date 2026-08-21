import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../services/adminManagementService.js";
import { apiClient } from "../../services/apiClient.js";

/* ─── Platform keys that SUPER_ADMIN manages ─── */
const PLATFORM_DEFAULTS = {
  platformName: "EasternCity Rental",
  currency: "ETB",
  defaultLanguage: "en",
  maintenanceMode: "false",
  allowNewListings: "true",
  allowNewRegistrations: "true",
  emailAlerts: "true",
  featuredListingPricePerDay: "100",
  homepagePromotionPricePerDay: "400",
  minPromotionDays: "1",
  maxPromotionDays: "30",
  requirePaymentVerification: "true",
  requireAdminApproval: "true",
};

function toBool(v) { return v === "true" || v === true; }
function toNum(v, fallback) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }

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

export default function SystemSettingsPage() {
  /* ── state: general ── */
  const [gen, setGen] = useState({
    platformName: PLATFORM_DEFAULTS.platformName,
    currency: PLATFORM_DEFAULTS.currency,
    defaultLanguage: PLATFORM_DEFAULTS.defaultLanguage,
    maintenanceMode: false,
    allowNewListings: true,
    allowNewRegistrations: true,
  });

  /* ── state: notifications ── */
  const [notif, setNotif] = useState({ emailAlerts: true });

  /* ── state: promotion ── */
  const [promo, setPromo] = useState({
    featuredListingPricePerDay: 100,
    homepagePromotionPricePerDay: 400,
    minPromotionDays: 1,
    maxPromotionDays: 30,
    requirePaymentVerification: true,
    requireAdminApproval: true,
  });

  const [loading, setLoading] = useState(true);
  const [savingGen, setSavingGen] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);
  const [noticeGen, setNoticeGen] = useState({ msg: "", type: "success" });
  const [noticeNotif, setNoticeNotif] = useState({ msg: "", type: "success" });
  const [noticePromo, setNoticePromo] = useState({ msg: "", type: "success" });

  const applySettings = useCallback((s) => {
    const d = { ...PLATFORM_DEFAULTS, ...s };
    setGen({
      platformName: d.platformName,
      currency: d.currency,
      defaultLanguage: d.defaultLanguage,
      maintenanceMode: toBool(d.maintenanceMode),
      allowNewListings: toBool(d.allowNewListings),
      allowNewRegistrations: toBool(d.allowNewRegistrations),
    });
    setNotif({ emailAlerts: toBool(d.emailAlerts) });
    setPromo({
      featuredListingPricePerDay: toNum(d.featuredListingPricePerDay, 100),
      homepagePromotionPricePerDay: toNum(d.homepagePromotionPricePerDay, 400),
      minPromotionDays: toNum(d.minPromotionDays, 1),
      maxPromotionDays: toNum(d.maxPromotionDays, 30),
      requirePaymentVerification: toBool(d.requirePaymentVerification),
      requireAdminApproval: toBool(d.requireAdminApproval),
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
      const updated = await apiClient.put("/api/admin-management/settings/platform", {
        platformName: gen.platformName.trim(),
        currency: gen.currency.trim(),
        defaultLanguage: gen.defaultLanguage,
        maintenanceMode: String(gen.maintenanceMode),
        allowNewListings: String(gen.allowNewListings),
        allowNewRegistrations: String(gen.allowNewRegistrations),
      });
      applySettings(updated?.data ?? updated ?? {});
      setNoticeGen({ msg: "General settings saved successfully.", type: "success" });
    } catch (err) {
      setNoticeGen({ msg: err?.response?.data?.message || err?.message || "Failed to save.", type: "danger" });
    } finally { setSavingGen(false); }
  }

  /* ── save notifications ── */
  async function saveNotifications(e) {
    e.preventDefault();
    setSavingNotif(true);
    setNoticeNotif({ msg: "", type: "success" });
    try {
      const updated = await apiClient.put("/api/admin-management/settings/platform", {
        emailAlerts: String(notif.emailAlerts),
      });
      applySettings(updated?.data ?? updated ?? {});
      setNoticeNotif({ msg: "Notification settings saved.", type: "success" });
    } catch (err) {
      setNoticeNotif({ msg: err?.response?.data?.message || err?.message || "Failed to save.", type: "danger" });
    } finally { setSavingNotif(false); }
  }

  /* ── save promotion ── */
  async function savePromotion(e) {
    e.preventDefault();
    setNoticePromo({ msg: "", type: "success" });
    /* validation */
    if (promo.featuredListingPricePerDay < 0) return setNoticePromo({ msg: "Featured price cannot be negative.", type: "danger" });
    if (promo.homepagePromotionPricePerDay < 0) return setNoticePromo({ msg: "Homepage price cannot be negative.", type: "danger" });
    if (promo.minPromotionDays < 1) return setNoticePromo({ msg: "Minimum duration must be at least 1 day.", type: "danger" });
    if (promo.maxPromotionDays < promo.minPromotionDays) return setNoticePromo({ msg: "Maximum duration cannot be less than minimum duration.", type: "danger" });
    setSavingPromo(true);
    try {
      const updated = await apiClient.put("/api/admin-management/settings/platform", {
        featuredListingPricePerDay: String(promo.featuredListingPricePerDay),
        homepagePromotionPricePerDay: String(promo.homepagePromotionPricePerDay),
        minPromotionDays: String(promo.minPromotionDays),
        maxPromotionDays: String(promo.maxPromotionDays),
        requirePaymentVerification: String(promo.requirePaymentVerification),
        requireAdminApproval: String(promo.requireAdminApproval),
      });
      applySettings(updated?.data ?? updated ?? {});
      setNoticePromo({ msg: "Promotion settings saved. Promotion forms will now use the updated prices.", type: "success" });
    } catch (err) {
      setNoticePromo({ msg: err?.response?.data?.message || err?.message || "Failed to save.", type: "danger" });
    } finally { setSavingPromo(false); }
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
        <span className="section-label">SUPER ADMIN</span>
        <h1 className="h3 mb-0">System Settings</h1>
        <p className="text-muted mb-0">Configure platform-wide settings and promotion pricing.</p>
      </div>

      <div className="row">
        <div className="col-lg-8">

          {/* ── General ── */}
          <SectionCard icon="bi-gear" title="General Configuration">
            <Notice msg={noticeGen.msg} type={noticeGen.type} />
            <form onSubmit={saveGeneral}>
              <div className="mb-3">
                <label className="form-label fw-semibold" htmlFor="sa-platformName">Platform Display Name</label>
                <input id="sa-platformName" className="form-control" value={gen.platformName}
                  onChange={e => setGen(p => ({ ...p, platformName: e.target.value }))} required />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label fw-semibold" htmlFor="sa-currency">Default Currency</label>
                  <input id="sa-currency" className="form-control" value={gen.currency}
                    onChange={e => setGen(p => ({ ...p, currency: e.target.value }))} required />
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-semibold" htmlFor="sa-lang">Default Language</label>
                  <select id="sa-lang" className="form-select" value={gen.defaultLanguage}
                    onChange={e => setGen(p => ({ ...p, defaultLanguage: e.target.value }))}>
                    <option value="en">English</option>
                    <option value="am">Amharic</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
              <div className="mb-2">
                <div className="form-check form-switch mb-2">
                  <input className="form-check-input" type="checkbox" id="sa-maintenance" checked={gen.maintenanceMode}
                    onChange={e => setGen(p => ({ ...p, maintenanceMode: e.target.checked }))} />
                  <label className="form-check-label" htmlFor="sa-maintenance">
                    <span className="fw-semibold">Maintenance Mode</span>
                    <span className="d-block text-muted small">Disables the site for regular users while admins work on it.</span>
                  </label>
                </div>
                <div className="form-check form-switch mb-2">
                  <input className="form-check-input" type="checkbox" id="sa-allowListings" checked={gen.allowNewListings}
                    onChange={e => setGen(p => ({ ...p, allowNewListings: e.target.checked }))} />
                  <label className="form-check-label" htmlFor="sa-allowListings">
                    <span className="fw-semibold">Allow New Listings</span>
                    <span className="d-block text-muted small">Users can create new property listings.</span>
                  </label>
                </div>
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" id="sa-allowReg" checked={gen.allowNewRegistrations}
                    onChange={e => setGen(p => ({ ...p, allowNewRegistrations: e.target.checked }))} />
                  <label className="form-check-label" htmlFor="sa-allowReg">
                    <span className="fw-semibold">Allow New User Registrations</span>
                    <span className="d-block text-muted small">New users can sign up for an account.</span>
                  </label>
                </div>
              </div>
              <SaveBtn saving={savingGen} />
            </form>
          </SectionCard>

          {/* ── Notifications ── */}
          <SectionCard icon="bi-bell" title="Notification Settings">
            <Notice msg={noticeNotif.msg} type={noticeNotif.type} />
            <form onSubmit={saveNotifications}>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="sa-emailAlerts" checked={notif.emailAlerts}
                  onChange={e => setNotif({ emailAlerts: e.target.checked })} />
                <label className="form-check-label" htmlFor="sa-emailAlerts">
                  <span className="fw-semibold">System Notification Alerts to Admin Emails</span>
                  <span className="d-block text-muted small">Send email notifications to all admins for critical system events.</span>
                </label>
              </div>
              <SaveBtn saving={savingNotif} />
            </form>
          </SectionCard>

          {/* ── Promotion ── */}
          <SectionCard icon="bi-megaphone" title="Promotion Settings">
            <Notice msg={noticePromo.msg} type={noticePromo.type} />
            <form onSubmit={savePromotion}>
              <p className="text-muted small mb-3">
                These prices are used live in the promotion request form. Changes take effect immediately for new requests.
              </p>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label fw-semibold" htmlFor="sa-featuredPrice">
                    Featured Listing — Price / Day
                  </label>
                  <div className="input-group">
                    <input id="sa-featuredPrice" type="number" className="form-control" min="0" step="1"
                      value={promo.featuredListingPricePerDay}
                      onChange={e => setPromo(p => ({ ...p, featuredListingPricePerDay: Number(e.target.value) }))} />
                    <span className="input-group-text">ETB</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-semibold" htmlFor="sa-homepagePrice">
                    Homepage Promotion — Price / Day
                  </label>
                  <div className="input-group">
                    <input id="sa-homepagePrice" type="number" className="form-control" min="0" step="1"
                      value={promo.homepagePromotionPricePerDay}
                      onChange={e => setPromo(p => ({ ...p, homepagePromotionPricePerDay: Number(e.target.value) }))} />
                    <span className="input-group-text">ETB</span>
                  </div>
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label fw-semibold" htmlFor="sa-minDays">Minimum Promotion Duration</label>
                  <div className="input-group">
                    <input id="sa-minDays" type="number" className="form-control" min="1"
                      value={promo.minPromotionDays}
                      onChange={e => setPromo(p => ({ ...p, minPromotionDays: Number(e.target.value) }))} />
                    <span className="input-group-text">days</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-semibold" htmlFor="sa-maxDays">Maximum Promotion Duration</label>
                  <div className="input-group">
                    <input id="sa-maxDays" type="number" className="form-control" min="1"
                      value={promo.maxPromotionDays}
                      onChange={e => setPromo(p => ({ ...p, maxPromotionDays: Number(e.target.value) }))} />
                    <span className="input-group-text">days</span>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <div className="form-check form-switch mb-2">
                  <input className="form-check-input" type="checkbox" id="sa-reqPayment" checked={promo.requirePaymentVerification}
                    onChange={e => setPromo(p => ({ ...p, requirePaymentVerification: e.target.checked }))} />
                  <label className="form-check-label" htmlFor="sa-reqPayment">
                    <span className="fw-semibold">Require Payment Verification</span>
                    <span className="d-block text-muted small">Users must upload a payment receipt screenshot to submit a promotion request.</span>
                  </label>
                </div>
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" id="sa-reqApproval" checked={promo.requireAdminApproval}
                    onChange={e => setPromo(p => ({ ...p, requireAdminApproval: e.target.checked }))} />
                  <label className="form-check-label" htmlFor="sa-reqApproval">
                    <span className="fw-semibold">Require Admin Approval</span>
                    <span className="d-block text-muted small">Promotion requests must be reviewed and approved by an admin before going live.</span>
                  </label>
                </div>
              </div>
              <SaveBtn saving={savingPromo} />
            </form>
          </SectionCard>

        </div>
      </div>
    </main>
  );
}
