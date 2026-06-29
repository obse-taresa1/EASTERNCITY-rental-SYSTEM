import { useState } from "react";

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState("EasternCity Rental");
  const [currency, setCurrency] = useState("ETB");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">System Settings</h1>
          <p className="text-muted mb-0">Configure system variables and general configurations.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-gear text-primary-custom" /> General Configurations
            </h2>
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label" htmlFor="platformName">
                  Platform Display Name
                </label>
                <input
                  id="platformName"
                  className="form-control"
                  value={platformName}
                  onChange={e => setPlatformName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="currency">
                  System Default Currency
                </label>
                <input
                  id="currency"
                  className="form-control"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  required
                />
              </div>

              <hr className="my-4" />

              <h3 className="h6 mb-3">Feature Flags</h3>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="maintenanceMode"
                  checked={maintenanceMode}
                  onChange={e => setMaintenanceMode(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="maintenanceMode">
                  Enable Maintenance Mode (Stops new listings uploads)
                </label>
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="emailAlerts"
                  checked={emailAlerts}
                  onChange={e => setEmailAlerts(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="emailAlerts">
                  Send system notification alerts to admin emails
                </label>
              </div>

              <button type="submit" className="btn btn-accent-custom mt-2">
                Save System Settings
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
