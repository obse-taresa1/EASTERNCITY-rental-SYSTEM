export default function AdminSettingsPage() {
  return (
    <main className="dashboard-content">
      <span className="section-label">ADMIN</span>
      <h1>Settings</h1>

      <section className="dashboard-section mt-4">
        <form className="dashboard-form">
          <div className="mb-3">
            <label className="form-label" htmlFor="platformName">
              Platform Name
            </label>
            <input
              id="platformName"
              className="form-control"
              defaultValue="CityRent"
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="currency">
              Currency
            </label>
            <input id="currency" className="form-control" defaultValue="ETB" />
          </div>

          <button type="button" className="btn btn-accent-custom">
            Save Settings
          </button>
        </form>
      </section>
    </main>
  );
}
