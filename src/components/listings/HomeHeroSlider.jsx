import { useEffect, useState } from "react";
import heroCanon from "../../assets/images/canon.png";
import heroDrill from "../../assets/images/dewalt.png";
import heroPc from "../../assets/images/pc.png";
import heroSofa from "../../assets/images/furnsofa.png";
import heroBike from "../../assets/images/sportbick.png";
import heroToyota from "../../assets/images/Toyota RAV4.jpg";
import { useLanguage } from "../../context/LanguageContext.jsx";
import HomeSearchForm from "../forms/HomeSearchForm.jsx";

const slides = [
  {
    titleKey: "heroVehicleTitle",
    subtitleKey: "heroVehicleSubtitle",
    image: heroToyota,
    cardTitle: "Toyota RAV4 2023",
    cardPrice: "ETB 8,500",
    cardLocation: "Downtown",
  },
  {
    titleKey: "heroElectronicsTitle",
    subtitleKey: "heroElectronicsSubtitle",
    image: heroPc,
    cardTitle: "Gaming Laptop RTX 4070",
    cardPrice: "ETB 4,500",
    cardLocation: "Midtown",
  },
  {
    titleKey: "heroToolsTitle",
    subtitleKey: "heroToolsSubtitle",
    image: heroDrill,
    cardTitle: "DeWalt Power Drill Set",
    cardPrice: "ETB 2,300",
    cardLocation: "Westside",
  },
  {
    titleKey: "heroCameraTitle",
    subtitleKey: "heroCameraSubtitle",
    image: heroCanon,
    cardTitle: "Canon EOS DSLR Kit",
    cardPrice: "ETB 6,000",
    cardLocation: "Downtown",
  },
  {
    titleKey: "heroFurnitureTitle",
    subtitleKey: "heroFurnitureSubtitle",
    image: heroSofa,
    cardTitle: "Modern Sectional Sofa",
    cardPrice: "ETB 7,200",
    cardLocation: "Uptown",
  },
  {
    titleKey: "heroSportsTitle",
    subtitleKey: "heroSportsSubtitle",
    image: heroBike,
    cardTitle: "Mountain Bike Pro",
    cardPrice: "ETB 2,000",
    cardLocation: "Park",
  },
];

export default function HomeHeroSlider() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  function previousSlide() {
    setActiveIndex((current) =>
      current === 0 ? slides.length - 1 : current - 1,
    );
  }

  function nextSlide() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  return (
    <section className="motorx-hero" data-hero-slider>
      <div className="motorx-hero-bg" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            key={slide.titleKey}
            className={`hero-slide ${index === activeIndex ? "is-active" : ""}`}
            style={{ backgroundImage: `url("${slide.image}")` }}
          ></div>
        ))}
      </div>

      <div className="container motorx-hero-inner">
        <div className="hero-layout">
          <div className="hero-text">
            <span className="hero-tag">{t("heroEyebrow")}</span>
            <h1>{t(activeSlide.titleKey)}</h1>
            <p>{t(activeSlide.subtitleKey)}</p>

            <div className="hero-cta">
              <a href="#featured-listings" className="btn-hero-primary">
                {t("heroCta")}
              </a>
            </div>

            <HomeSearchForm />
          </div>

          <div className="hero-side">
            <div className="hero-discount-badge">
              <span className="discount-pct">40%</span>
              <span className="discount-off">{t("heroDiscountOff")}</span>
            </div>

            <div className="hero-float-card">
              <img src={activeSlide.image} alt={t("heroFeaturedAlt")} />
              <div>
                <strong>{activeSlide.cardTitle}</strong>
                <span className="float-price">
                  {activeSlide.cardPrice} <small>/ {t("perDay")}</small>
                </span>
                <span className="float-loc">
                  <i className="bi bi-geo-alt"></i> {activeSlide.cardLocation}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-slider-controls" aria-label={t("heroSlides")}>
          <button
            type="button"
            className="hero-slider-arrow"
            onClick={previousSlide}
            aria-label={t("heroPrevious")}
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <div className="hero-slider-dots" aria-label="Hero slides">
            {slides.map((slide, index) => (
              <button
                key={slide.titleKey}
                type="button"
                className={`hero-slider-dot ${
                  index === activeIndex ? "is-active" : ""
                }`}
                aria-label={`${t("heroShowSlide")} ${index + 1}`}
                onClick={() => setActiveIndex(index)}
              ></button>
            ))}
          </div>

          <button
            type="button"
            className="hero-slider-arrow"
            onClick={nextSlide}
            aria-label={t("heroNext")}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
}
