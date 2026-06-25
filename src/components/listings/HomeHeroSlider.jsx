import { useEffect, useState } from "react";
import heroCanon from "../../assets/images/hero_camera.png";
import heroDrill from "../../assets/images/dewalt.png";
import heroPc from "../../assets/images/hero_electronics.png";
import heroSofa from "../../assets/images/furnsofa.png";
import heroBike from "../../assets/images/sportbick.png";
import heroToyota from "../../assets/images/hero_vehicles.png";
import { useLanguage } from "../../context/LanguageContext.jsx";
import HomeSearchForm from "../forms/HomeSearchForm.jsx";

const slides = [
  {
    titleKey: "heroVehicleTitle",
    subtitleKey: "heroVehicleSubtitle",
    image: heroToyota,
    cardTitle: "Toyota RAV4 2023",
    cardPrice: "ETB 8,500",
    cardLocation: "Jigjiga",
    categoryId: "vehicles",
    categoryKey: "vehicles",
    icon: "bi-car-front",
    itemId: "toyota-rav4",
    rating: "4.9",
    reviewsCount: 12,
    specs: ["Automatic", "Petrol", "5 Seats"],
  },
  {
    titleKey: "heroElectronicsTitle",
    subtitleKey: "heroElectronicsSubtitle",
    image: heroPc,
    cardTitle: "Gaming Laptop RTX 4070",
    cardPrice: "ETB 4,500",
    cardLocation: "Dire Dawa",
    categoryId: "gaming-equipment",
    categoryKey: "electronics",
    icon: "bi-controller",
    itemId: "gaming-pc",
    rating: "4.8",
    reviewsCount: 8,
    specs: ["RTX 4070", "16GB RAM", "1TB SSD"],
  },
  {
    titleKey: "heroToolsTitle",
    subtitleKey: "heroToolsSubtitle",
    image: heroDrill,
    cardTitle: "DeWalt Power Drill Set",
    cardPrice: "ETB 2,300",
    cardLocation: "Harar",
    categoryId: "construction-diy",
    categoryKey: "tools",
    icon: "bi-hammer",
    itemId: "dewalt-drill",
    rating: "4.7",
    reviewsCount: 15,
    specs: ["20V Max", "Cordless", "2 Batteries"],
  },
  {
    titleKey: "heroCameraTitle",
    subtitleKey: "heroCameraSubtitle",
    image: heroCanon,
    cardTitle: "Canon EOS DSLR Kit",
    cardPrice: "ETB 6,000",
    cardLocation: "Jigjiga",
    categoryId: "electronics-cameras",
    categoryKey: "cameras",
    icon: "bi-camera-video",
    itemId: "canon-camera",
    rating: "4.9",
    reviewsCount: 20,
    specs: ["24.2 MP", "18-55mm Lens", "1080p"],
  },
  {
    titleKey: "heroFurnitureTitle",
    subtitleKey: "heroFurnitureSubtitle",
    image: heroSofa,
    cardTitle: "Modern Sectional Sofa",
    cardPrice: "ETB 7,200",
    cardLocation: "Dire Dawa",
    categoryId: "furniture",
    categoryKey: "furniture",
    icon: "bi-house-heart",
    itemId: "",
    rating: "4.6",
    reviewsCount: 6,
    specs: ["3-Seater", "L-Shape", "Fabric"],
  },
  {
    titleKey: "heroSportsTitle",
    subtitleKey: "heroSportsSubtitle",
    image: heroBike,
    cardTitle: "Mountain Bike Pro",
    cardPrice: "ETB 2,000",
    cardLocation: "Harar",
    categoryId: "sports-outdoor",
    categoryKey: "sports",
    icon: "bi-bicycle",
    itemId: "",
    rating: "4.8",
    reviewsCount: 11,
    specs: ["21-Speed", "Disc Brakes", "Suspension"],
  },
];

export default function HomeHeroSlider() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  function previousSlide() {
    setIsPlaying(false);
    setActiveIndex((current) =>
      current === 0 ? slides.length - 1 : current - 1,
    );
  }

  function nextSlide() {
    setIsPlaying(false);
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  return (
    <section className="motorx-hero" data-hero-slider>
      <div className="motorx-hero-bg" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            key={slide.titleKey}
            className={`hero-slide ${index === activeIndex ? "is-active kenburns-active" : ""}`}
            style={{ backgroundImage: `url("${slide.image}")` }}
          ></div>
        ))}
      </div>

      <div className="container motorx-hero-inner">
        <div className="hero-layout mb-4">
          <div className="hero-text">
            <span className="hero-tag mb-3">{t("heroEyebrow")}</span>

            <h1 key={`title-${activeIndex}`} className="animate-fade-in-up">
              {t(activeSlide.titleKey)}
            </h1>
            <p key={`desc-${activeIndex}`} className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              {t(activeSlide.subtitleKey)}
            </p>
          </div>

          <div className="hero-side">
            <div className="hero-discount-badge animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <span className="discount-pct">40%</span>
              <span className="discount-off">{t("heroDiscountOff")}</span>
            </div>

            {/* Advanced Spec Floating Card */}
            <div className="hero-float-card p-3 rounded-4 d-flex flex-column gap-2 animate-fade-in-up" style={{ animationDelay: "300ms" }} key={`card-${activeIndex}`}>
              <div className="d-flex gap-3 align-items-center">
                <img
                  src={activeSlide.image}
                  alt={t("heroFeaturedAlt")}
                  className="rounded-3"
                  style={{ width: "90px", height: "70px", objectFit: "cover" }}
                />
                <div className="flex-grow-1">
                  <div className="hero-float-card-rating">
                    <i className="bi bi-star-fill"></i>
                    <span>{activeSlide.rating}</span>
                    <span className="text-muted" style={{ fontSize: "0.65rem" }}>
                      ({activeSlide.reviewsCount})
                    </span>
                  </div>
                  <h6 className="m-0 fw-bold text-start">{activeSlide.cardTitle}</h6>
                </div>
              </div>

              <div className="hero-float-card-specs text-start">
                {activeSlide.specs.map((spec) => (
                  <span key={spec} className="hero-float-card-spec-tag me-1">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="d-flex justify-content-between align-items-center mt-2 border-top pt-2">
                <div className="text-start">
                  <span className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 600 }}>{t("perDay")}: </span>
                  <span className="fw-bold text-danger ms-1" style={{ fontSize: "1.1rem" }}>
                    {activeSlide.cardPrice}
                  </span>
                </div>
                <div className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>{activeSlide.cardLocation}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar layout wrapper */}
        <div className="animate-fade-in-up" style={{ animationDelay: "360ms" }}>
          <HomeSearchForm />
        </div>

        {/* Platform Stats Banner */}
        <div className="hero-stats-banner animate-fade-in-up" style={{ animationDelay: "450ms" }}>
          <div className="hero-stat-block">
            <i className="bi bi-check-circle-fill hero-stat-icon"></i>
            <div className="hero-stat-info text-start">
              <span className="hero-stat-number">1,200+</span>
              <span className="hero-stat-label">Verified Listings</span>
            </div>
          </div>
          <div className="hero-stat-block">
            <i className="bi bi-geo-alt-fill hero-stat-icon"></i>
            <div className="hero-stat-info text-start">
              <span className="hero-stat-number">3 Cities</span>
              <span className="hero-stat-label">Jigjiga, Dire Dawa, Harar</span>
            </div>
          </div>
          <div className="hero-stat-block">
            <i className="bi bi-shield-check hero-stat-icon"></i>
            <div className="hero-stat-info text-start">
              <span className="hero-stat-number">100% Secure</span>
              <span className="hero-stat-label">Verified Owners</span>
            </div>
          </div>
        </div>

        <div className="hero-slider-controls mt-4" aria-label={t("heroSlides")}>
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
                onClick={() => {
                  setActiveIndex(index);
                  setIsPlaying(false);
                }}
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

          {/* Autoplay play/pause toggle */}
          <button
            type="button"
            className="hero-autoplay-btn ms-3"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
            title={isPlaying ? "Pause Autoplay" : "Play Autoplay"}
          >
            <i className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"}`}></i>
          </button>
        </div>
      </div>
    </section>
  );
}
