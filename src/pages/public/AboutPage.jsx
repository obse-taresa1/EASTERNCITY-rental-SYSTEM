import { useLanguage } from "../../context/LanguageContext.jsx";

export default function AboutPage() {
  const { t } = useLanguage();

  const values = [
    { icon: "bi-shield-check", titleKey: "aboutTrustTitle", bodyKey: "aboutTrustBody" },
    { icon: "bi-people",       titleKey: "aboutCommunityTitle", bodyKey: "aboutCommunityBody" },
    { icon: "bi-lightning-charge", titleKey: "aboutSpeedTitle", bodyKey: "aboutSpeedBody" },
    { icon: "bi-globe2",       titleKey: "aboutMultilingualTitle", bodyKey: "aboutMultilingualBody" },
  ];

  const cities = [
    { name: "Jigjiga",    icon: "bi-building",    descKey: "aboutJigjigaDesc" },
    { name: "Dire Dawa",  icon: "bi-train-front",  descKey: "aboutDireDawaDesc" },
    { name: "Harar",      icon: "bi-geo-alt",      descKey: "aboutHararDesc" },
  ];

  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <span className="section-label">{t("aboutEyebrow")}</span>
            <h2>{t("aboutHeroTitle")}</h2>
            <p>{t("aboutHeroDesc")}</p>
          </div>
        </div>
      </section>

      {/* Mission + Who We Are */}
      <section className="about-section">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="about-glass-card">
                <div className="about-card-icon"><i className="bi bi-bullseye"></i></div>
                <h3>{t("aboutMissionTitle")}</h3>
                <p>{t("aboutMissionBody")}</p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-glass-card">
                <div className="about-card-icon"><i className="bi bi-people-fill"></i></div>
                <h3>{t("aboutWhoWeAreTitle")}</h3>
                <p>{t("aboutWhoWeAreBody")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="about-values-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-label">{t("aboutWhyChooseUs")}</span>
            <h2>{t("aboutBuiltOnValues")}</h2>
          </div>
          <div className="row g-4">
            {values.map((v, i) => (
              <div className="col-sm-6 col-lg-3" key={i}>
                <div className="about-value-card">
                  <i className={`bi ${v.icon}`}></i>
                  <h4>{t(v.titleKey)}</h4>
                  <p>{t(v.bodyKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities We Serve */}
      <section className="about-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-label">{t("aboutCoverageEyebrow")}</span>
            <h2>{t("aboutCitiesTitle")}</h2>
          </div>
          <div className="row g-4">
            {cities.map((c, i) => (
              <div className="col-md-4" key={i}>
                <div className="about-city-card">
                  <i className={`bi ${c.icon}`}></i>
                  <h4>{c.name}</h4>
                  <p>{t(c.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta-section">
        <div className="container">
          <div className="about-cta-card">
            <h2>{t("aboutCtaTitle")}</h2>
            <p>{t("aboutCtaBody")}</p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <a href="/register" className="btn-hero-primary">{t("aboutCtaGetStarted")}</a>
              <a href="/items" className="btn-hero-outline">{t("aboutCtaBrowse")}</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
