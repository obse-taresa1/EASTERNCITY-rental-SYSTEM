import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import HomeSearchForm from "../forms/HomeSearchForm";
import { fetchActivePromotions } from "../../services/promotionApiService";
import heroCanon from "../../assets/images/hero_camera.png";
import heroDrill from "../../assets/images/dewalt.png";
import heroPc from "../../assets/images/hero_electronics.png";
import heroSofa from "../../assets/images/furnsofa.png";
import heroBike from "../../assets/images/sportbick.png";
import heroToyota from "../../assets/images/hero_vehicles.png";

// Default static slides
const defaultSlides = [
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
  {
    titleKey: "heroEventTitle",
    subtitleKey: "heroEventSubtitle",
    image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1200&h=800&fit=crop",
    cardTitle: "Wedding Tent 20x30m",
    cardPrice: "ETB 8,000",
    cardLocation: "Dire Dawa",
    categoryId: "party-wedding",
    categoryKey: "party",
    icon: "bi-tent",
    itemId: "",
    rating: "4.9",
    reviewsCount: 24,
    specs: ["200 Capacity", "Lighting", "Setup"],
  },
  {
    titleKey: "heroToolsTitle",
    subtitleKey: "heroToolsSubtitle",
    image: heroDrill,
    cardTitle: "DeWalt Drill Set",
    cardPrice: "ETB 500",
    cardLocation: "Harar",
    categoryId: "tools",
    categoryKey: "tools",
    icon: "bi-tools",
    itemId: "",
    rating: "4.8",
    reviewsCount: 10,
    specs: ["Cordless", "20V", "Brushless"],
  },
  {
    titleKey: "heroEventTitle",
    subtitleKey: "heroEventSubtitle",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&h=800&fit=crop",
    cardTitle: "Wedding Chairs (Set of 50)",
    cardPrice: "ETB 1,500",
    cardLocation: "Jigjiga",
    categoryId: "party-wedding",
    categoryKey: "party",
    icon: "bi-shop",
    itemId: "",
    rating: "4.9",
    reviewsCount: 15,
    specs: ["Plastic", "White", "Stackable"],
  },
];

export default function HomeHeroSlider() {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);

  // Helper to determine category icon
  function getCategoryIcon(cat) {
    const c = String(cat || "").toLowerCase();
    if (c.includes("vehicle") || c.includes("car")) return "bi-car-front";
    if (c.includes("game") || c.includes("electronic") || c.includes("pc") || c.includes("laptop")) return "bi-controller";
    if (c.includes("camera")) return "bi-camera-video";
    if (c.includes("tool") || c.includes("drill")) return "bi-tools";
    if (c.includes("furniture") || c.includes("sofa")) return "bi-house-heart";
    if (c.includes("sport") || c.includes("bike")) return "bi-bicycle";
    if (c.includes("party") || c.includes("wedding") || c.includes("event")) return "bi-tent";
    return "bi-star-fill";
  }

  // Load featured promotions and merge/fallback with default slides
  useEffect(() => {
    async function loadFeatured() {
      try {
        const promos = await fetchActivePromotions();
        const promoSlides = promos.map((p) => {
          const itemImage = p.listing?.image || p.screenshotUrl || "";
          const itemSpecs = p.listing?.features || [];
          return {
            titleKey: "",
            subtitleKey: "",
            image: itemImage,
            cardTitle: p.listing?.title || p.listingTitle || "Featured Listing",
            cardPrice: p.listing?.pricePerDay ? `ETB ${Number(p.listing.pricePerDay).toLocaleString()}` : (p.amount ? `ETB ${p.amount}` : ""),
            cardLocation: p.listing?.city || p.ownerName || "",
            categoryId: p.listing?.categoryId || "",
            categoryKey: p.listing?.category || "",
            icon: getCategoryIcon(p.listing?.category || p.listing?.categoryData?.name || ""),
            itemId: p.listingId || "",
            rating: p.listing?.rating || "5.0",
            reviewsCount: p.listing?.reviewsCount || 0,
            specs: Array.isArray(itemSpecs) ? itemSpecs.slice(0, 3) : [],
          };
        });

        if (promoSlides.length > 0) {
          setSlides(promoSlides);
        } else {
          setSlides(defaultSlides);
        }
      } catch (e) {
        console.error("Failed to load featured promotions", e);
        setSlides(defaultSlides);
      }
    }
    loadFeatured();
  }, []);

  const activeSlide = slides[activeIndex];

  // Autoplay effect
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setActiveIndex((cur) => (cur + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isPlaying, slides.length]);

  function previousSlide() {
    setIsPlaying(false);
    setActiveIndex((cur) => (cur === 0 ? slides.length - 1 : cur - 1));
  }

  function nextSlide() {
    setIsPlaying(false);
    setActiveIndex((cur) => (cur + 1) % slides.length);
  }

  return (
    <section className="motorx-hero" data-hero-slider>
      <div className="motorx-hero-bg" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            key={`${slide.titleKey || slide.cardTitle}-${index}`}
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
              {t(activeSlide.titleKey) || activeSlide.cardTitle}
            </h1>
            <p className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              {t(activeSlide.subtitleKey) || ""}
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
                <img src={activeSlide.image} alt={t("heroFeaturedAlt")} className="rounded-3" style={{ width: "90px", height: "70px", objectFit: "cover" }} />
                <div className="flex-grow-1">
                  <div className="hero-float-card-rating">
                    {activeSlide.icon && <i className={`bi ${activeSlide.icon}`}></i>}
                    <span>{activeSlide.rating}</span>
                    <span className="text-muted" style={{ fontSize: "0.65rem" }}>({activeSlide.reviewsCount})</span>
                  </div>
                  <h6 className="m-0 fw-bold text-start">{activeSlide.cardTitle}</h6>
                </div>
              </div>

              <div className="hero-float-card-specs text-start">
                {activeSlide.specs.map((spec) => (
                  <span key={spec} className="hero-float-card-spec-tag me-1">{spec}</span>
                ))}
              </div>

              <div className="d-flex justify-content-between align-items-center mt-2 border-top pt-2">
                <div className="text-start">
                  <span className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 600 }}>{t("perDay")}:{" "}</span>
                  <span className="fw-bold text-danger ms-1" style={{ fontSize: "1.1rem" }}>{activeSlide.cardPrice}</span>
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

        {/* Platform Stats Banner (currently hidden) */}
        <div className="hero-stats-banner animate-fade-in-up d-none" style={{ animationDelay: "450ms" }}>
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

        {/* Slider controls */}
        <div className="hero-slider-controls mt-4" aria-label={t("heroSlides")}>
          <button type="button" className="hero-slider-arrow" onClick={previousSlide} aria-label={t("heroPrevious")}>
            <i className="bi bi-chevron-left"></i>
          </button>

          <div className="hero-slider-dots" aria-label="Hero slides">
            {slides.map((slide, index) => (
              <button
                key={`${slide.titleKey || slide.cardTitle}-${index}`}
                type="button"
                className={`hero-slider-dot ${index === activeIndex ? "is-active" : ""}`}
                aria-label={`${t("heroShowSlide")} ${index + 1}`}
                onClick={() => {
                  setActiveIndex(index);
                  setIsPlaying(false);
                }}
              ></button>
            ))}
          </div>

          <button type="button" className="hero-slider-arrow" onClick={nextSlide} aria-label={t("heroNext")}>
            <i className="bi bi-chevron-right"></i>
          </button>

          {/* Autoplay toggle */}
          <button type="button" className="hero-autoplay-btn ms-3" onClick={() => setIsPlaying(!isPlaying)} aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"} title={isPlaying ? "Pause Autoplay" : "Play Autoplay"}>
            <i className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"}`}></i>
          </button>
        </div>
      </div>
    </section>
  );
}
