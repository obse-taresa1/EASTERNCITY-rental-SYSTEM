import SimplePublicPage from "./SimplePublicPage.jsx";

export default function HowItWorksPage() {
  return (
    <SimplePublicPage title="How It Works">
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card card-custom p-4 h-100">
            <i className="bi bi-search text-accent-custom fs-2"></i>
            <h5 className="mt-3">Browse</h5>
            <p className="text-muted mb-0">
              Search categories and find the item you need.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card card-custom p-4 h-100">
            <i className="bi bi-calendar-check text-accent-custom fs-2"></i>
            <h5 className="mt-3">Book</h5>
            <p className="text-muted mb-0">
              Select dates and confirm your rental.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card card-custom p-4 h-100">
            <i className="bi bi-box-seam text-accent-custom fs-2"></i>
            <h5 className="mt-3">Pickup</h5>
            <p className="text-muted mb-0">
              Meet the owner and enjoy your rental.
            </p>
          </div>
        </div>
      </div>
    </SimplePublicPage>
  );
}
