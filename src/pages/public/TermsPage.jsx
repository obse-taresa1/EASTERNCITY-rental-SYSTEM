import { useLanguage } from "../../context/LanguageContext.jsx";
import { Link } from "react-router-dom";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <main className="container page-header pb-5">
      <div className="text-center mb-5">
        <span className="section-label">CITYRENT LEGAL</span>
        <h1 className="h2 mb-3">{t("terms") || "Terms & Conditions"}</h1>
        <p className="text-muted">Last updated: June 2026</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <section className="card card-custom p-4 p-lg-5 mb-4">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-file-earmark-text fs-3 text-primary-custom me-3"></i>
              <h2 className="h4 mb-0">1. Acceptance of Terms</h2>
            </div>
            <p>
              By accessing and using EasternCity Rental System, you agree to comply with and be bound by the following terms and conditions. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section className="card card-custom p-4 p-lg-5 mb-4">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-box-seam fs-3 text-primary-custom me-3"></i>
              <h2 className="h4 mb-0">2. Rental Rules & Policies</h2>
            </div>
            <p>Users participating in rental agreements must abide by the following:</p>
            <ul className="legal-list">
              <li><strong>Item Condition:</strong> Items must be returned in the exact condition they were rented in.</li>
              <li><strong>Late Returns:</strong> Late returns are subject to penalties equivalent to an extra day's rent.</li>
              <li><strong>Damage Liability:</strong> Renters are financially responsible for any damages or loss incurred during the rental period.</li>
              <li><strong>Verification:</strong> High-value item rentals may require National ID verification.</li>
            </ul>
          </section>

          <section className="card card-custom p-4 p-lg-5 mb-4">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-credit-card fs-3 text-primary-custom me-3"></i>
              <h2 className="h4 mb-0">3. Payments & Cancellations</h2>
            </div>
            <p>Our payment and cancellation policies ensure fair compensation for owners and flexibility for renters:</p>
            <ul className="legal-list">
              <li>Payments are held securely and released to the owner 24 hours after the rental begins successfully.</li>
              <li>Cancellations made 48 hours before the start date receive a full refund.</li>
              <li>Cancellations made within 48 hours are subject to a 20% cancellation fee.</li>
            </ul>
          </section>

          <div className="text-center mt-5">
            <p className="mb-3">Need clarification on any of our terms?</p>
            <Link to="/contact" className="btn btn-primary-custom px-4 py-2">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
