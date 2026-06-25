import { useLanguage } from "../../context/LanguageContext.jsx";

export default function AboutSection() {
  const { t } = useLanguage();

  return (
    <section className="about-section py-5 bg-white">
      <div className="container">
        <div className="text-center mb-5">
          <span className="section-label" style={{ color: 'var(--motorx-red)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {t("about")}
          </span>
          <h2 className="fw-bold mt-2">Connecting Communities Through Trust</h2>
        </div>
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="premium-glass-card p-4 h-100 bg-light border-0 shadow-sm" style={{ borderRadius: '20px' }}>
              <div className="mb-3">
                <i className="bi bi-bullseye text-danger" style={{ fontSize: '2rem' }}></i>
              </div>
              <h3 className="fw-bold mb-3">Our Mission</h3>
              <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
                To make renting as easy and trusted as borrowing from a friend. We believe every item sitting unused in your home could be earning money — and every renter deserves access to quality items without buying them outright.
              </p>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="premium-glass-card p-4 h-100 bg-light border-0 shadow-sm" style={{ borderRadius: '20px' }}>
              <div className="mb-3">
                <i className="bi bi-people-fill text-danger" style={{ fontSize: '2rem' }}></i>
              </div>
              <h3 className="fw-bold mb-3">Who We Are</h3>
              <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
                EasternCities was founded with a simple idea: the sharing economy should work for Eastern Ethiopia. We're a team of local technologists, community leaders, and entrepreneurs building trust-based infrastructure for peer-to-peer rental in Jigjiga, Dire Dawa, and Harar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
