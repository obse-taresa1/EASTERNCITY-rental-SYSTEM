import { useLanguage } from "../../context/LanguageContext.jsx";
import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();

  return (
    <main className="container page-header pb-5 legal-document-page">
      <div className="text-center mb-5">
        <span className="section-label">CITYRENT LEGAL</span>
        <h1 className="h2 mb-3">{t("privacyPolicy") || "Privacy Policy"}</h1>
        <p className="text-muted">Last updated: June 2026</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <section className="card card-custom p-4 p-lg-5 mb-4">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-shield-check fs-3 text-primary-custom me-3"></i>
              <h2 className="h4 mb-0">1. Information We Collect</h2>
            </div>
            <p>
              We collect information to provide better services to all our users. The information EasternCity collects includes:
            </p>
            <ul className="legal-list">
              <li><strong>Account Information:</strong> Name, email address, phone number, and password.</li>
              <li><strong>Verification Data:</strong> National ID documents for verified owners.</li>
              <li><strong>Usage Information:</strong> How you interact with listings, bookings, and messaging.</li>
              <li><strong>Device Data:</strong> IP addresses, browser types, and operating system information.</li>
            </ul>
          </section>

          <section className="card card-custom p-4 p-lg-5 mb-4">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-eye fs-3 text-primary-custom me-3"></i>
              <h2 className="h4 mb-0">2. How We Use Information</h2>
            </div>
            <p>We use the information we collect for various purposes, including:</p>
            <ul className="legal-list">
              <li>Facilitating secure item rentals between users.</li>
              <li>Providing customer support and resolving disputes.</li>
              <li>Sending important administrative messages and booking updates.</li>
              <li>Improving our platform, search algorithms, and user experience.</li>
            </ul>
          </section>

          <section className="card card-custom p-4 p-lg-5 mb-4">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-share fs-3 text-primary-custom me-3"></i>
              <h2 className="h4 mb-0">3. Information Sharing</h2>
            </div>
            <p>
              We do not sell your personal data. Information is only shared in the following scenarios:
            </p>
            <ul className="legal-list">
              <li>With other users when necessary to complete a booking.</li>
              <li>With third-party service providers (e.g., payment processors).</li>
              <li>When required by law or to protect the rights of our users.</li>
            </ul>
          </section>

          <div className="text-center mt-5">
            <p className="mb-3">Have questions about our privacy practices?</p>
            <Link to="/contact" className="btn btn-primary-custom px-4 py-2">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
