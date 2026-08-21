import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import HomeSearchForm from "../forms/HomeSearchForm";
import { getPublicListings } from "../../services/listingApiService.js";
import { fetchHeroPromotions } from "../../services/promotionApiService.js";
import { resolveAssetUrl } from "../../services/apiClient.js";
import { getCategoryIcon } from "../../utils/categoryIcons.js";
import heroCanon from "../../assets/images/hero_camera.png";
import heroDrill from "../../assets/images/dewalt.png";
import heroPc from "../../assets/images/hero_electronics.png";
import heroSofa from "../../assets/images/furnsofa.png";
import heroBike from "../../assets/images/sportbick.png";
import heroToyota from "../../assets/images/hero_vehicles.png";

function getPriceValue(price) {
  const numeric = Number(String(price ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function formatPrice(value) {
  return `ETB ${Number(value).toLocaleString()}`;
}

function normalizeTitle(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Duplicate getCategoryIcon removed; using imported version

// Default static slides
const defaultSlides = [
  {
    customTitle: "Premium Car Rentals",
    customSubtitle: "Find the perfect vehicle for your journey across Eastern City.",
    image: heroToyota,
    cardTitle: "Toyota RAV4 2023",
    cardPrice: "ETB 8,500",
    cardLocation: "Jigjiga",
    categoryId: "vehicles",
    categoryKey: "vehicles",
    icon: "bi-car-front",
    itemId: "",
    rating: "4.9",
    reviewsCount: 12,
    specs: ["Automatic", "Petrol", "5 Seats"],
    discountPercent: 10,
  },
  {
    customTitle: "Reliable Vans for Hire",
    customSubtitle: "Spacious and comfortable transport for your group.",
    image: heroToyota,
    cardTitle: "Toyota Hiace Van",
    cardPrice: "ETB 7,000",
    cardLocation: "Dire Dawa",
    categoryId: "vehicles",
    categoryKey: "vehicles",
    icon: "bi-car-front",
    itemId: "",
    rating: "4.7",
    reviewsCount: 8,
    specs: ["Van", "Diesel", "12 Seats"],
    discountPercent: 5,
  },
  {
    customTitle: "Professional Cameras",
    customSubtitle: "Capture every moment with high-quality gear.",
    image: heroCanon,
    cardTitle: "Canon EOS DSLR Kit",
    cardPrice: "ETB 6,000",
    cardLocation: "Jigjiga",
    categoryId: "electronics-cameras",
    categoryKey: "cameras",
    icon: "bi-camera-video",
    itemId: "",
    rating: "4.9",
    reviewsCount: 20,
    specs: ["24.2 MP", "18-55mm Lens", "1080p"],
    discountPercent: 30,
  },
  {
    customTitle: "Elegant Furniture Rentals",
    customSubtitle: "Elevate your living space with our premium furniture.",
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
    discountPercent: 20,
  },
  {
    customTitle: "Outdoor Adventure Gear",
    customSubtitle: "Explore the outdoors with top-quality equipment.",
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
    customTitle: "Event & Party Supplies",
    customSubtitle: "Everything you need to host a memorable event.",
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
    discountPercent: 45,
  },
  {
    customTitle: "Power Tools Rental",
    customSubtitle: "Get the job done right with our professional tools.",
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
    customTitle: "Large Event Tents",
    customSubtitle: "Spacious tents for weddings and outdoor gatherings.",
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
    discountPercent: 15,
  },
];

import { Link } from "react-router-dom";

/** Returns true if id is a valid UUID */
function isValidUUID(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id || "");
}

export default function HomeHeroSlider() {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load featured promotions / match static slides to real listings
  useEffect(() => {
    async function loadFeatured() {
      try {
        const [promos, listings] = await Promise.all([
          fetchHeroPromotions(),
          getPublicListings(),
        ]);

        // Convert DB hero promotions into slide objects, resolving image URLs
        const promoSlides = promos.map((p) => {
          const rawImage = p.heroImage || p.cardImage || "";
          // resolveAssetUrl handles both absolute http:// URLs and relative /uploads/... paths
          const resolvedImage = resolveAssetUrl(rawImage);
          const hasDiscount = p.discountPercent && Number(p.discountPercent) > 0;
          const discountedVal = p.discountedPrice !== null && p.discountedPrice !== undefined ? Number(p.discountedPrice) : null;
          const originalVal = Number(p.originalPrice || 0);
          return {
            titleKey: "",
            customTitle: p.title || "",
            customSubtitle: p.description || "",
            image: resolvedImage,
            cardTitle: p.title || "",
            cardPrice: discountedVal !== null
              ? `ETB ${discountedVal.toLocaleString()}`
              : originalVal ? `ETB ${originalVal.toLocaleString()}` : "",
            cardPriceValue: discountedVal !== null ? discountedVal : originalVal,
            originalPriceValue: hasDiscount ? originalVal : null,
            cardLocation: p.location || "",
            categoryId: "",
            categoryKey: "",
            icon: "bi-star-fill",
            itemId: p.ctaLink && p.ctaLink.includes("/items/") ? p.ctaLink.split("/items/")[1] : "",
            rating: p.rating || "5.0",
            reviewsCount: 0,
            discountPercent: hasDiscount ? Number(p.discountPercent) : null,
            discountedPrice: discountedVal,
            specs: p.specs ? p.specs.split(",").map(s => s.trim()).filter(Boolean) : [],
            ctaText: p.ctaText || t("viewDetails"),
            ctaLink: p.ctaLink || "#",
            cardImage: resolvedImage,
            isPromotion: true,
          };
        });

        // Use both promoSlides and defaultSlides
        const baseSlides = [...promoSlides, ...defaultSlides];

        // For every slide without a valid itemId, try to find a matching listing by title
        const enriched = baseSlides.map((slide) => {
          if (slide.itemId) return slide;
          const match = listings.find(
            (l) => normalizeTitle(l.title) === normalizeTitle(slide.cardTitle)
          );
          return match ? { ...slide, itemId: match.id } : slide;
        });

        setSlides(enriched);
        setActiveIndex(0);
      } catch (e) {
        console.error("Failed to load featured promotions", e);
        setSlides(defaultSlides);
        setActiveIndex(0);
      } finally {
        setIsLoaded(true);
      }
    }
    loadFeatured();
  }, []);

  const activeSlide = slides[activeIndex];

  // Navigate to the item detail page if we have a valid listing id,
  // otherwise fall back to the category page.
  const activeSlideHref = activeSlide?.itemId
    ? `/items/${activeSlide.itemId}`
    : `/categories/${activeSlide?.categoryId || ""}`;

  // Determine the current price value (numeric) for calculations
  const currentPriceValue = activeSlide?.cardPriceValue ?? getPriceValue(activeSlide.cardPrice);

  // Use the original price we preserved only if there is a discount, or calculate if missing but we have discount
  const originalPriceValue = (activeSlide?.discountPercent > 0)
    ? (activeSlide?.originalPriceValue || (currentPriceValue
        ? Math.round((currentPriceValue / (1 - activeSlide.discountPercent / 100)) / 50) * 50
        : null))
    : null;

  // Autoplay
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
            <h1 key={`title-${activeIndex}`} className="animate-fade-in-up">
              {activeSlide.customTitle || t(activeSlide.titleKey) || activeSlide.cardTitle}
            </h1>
            <p className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              {activeSlide.customSubtitle
                ? activeSlide.customSubtitle.length > 120
                  ? activeSlide.customSubtitle.slice(0, 117) + "..."
                  : activeSlide.customSubtitle
                : t(activeSlide.subtitleKey) || ""}
            </p>
          </div>

          <div className="hero-side">
            <Link
              className="hero-float-card hero-product-card d-flex flex-column animate-fade-in-up"
              style={{ animationDelay: "300ms", cursor: isLoaded ? "pointer" : "wait" }}
              key={`card-${activeIndex}`}
              to={activeSlideHref}
              onClick={(e) => {
                if (!isLoaded) e.preventDefault();
              }}
              aria-label={`View details for ${activeSlide.cardTitle}`}
            >
              {activeSlide.discountPercent ? (
                <span className="hero-discount-badge" aria-label={`${activeSlide.discountPercent}% off`}>
                  <span className="discount-pct">{activeSlide.discountPercent}%</span>
                  <span className="discount-off">{t("heroDiscountOff")}</span>
                </span>
              ) : null}

              <div className="hero-card-main d-flex align-items-center">
                <img 
                  src={activeSlide.cardImage || activeSlide.image} 
                  alt={t("heroFeaturedAlt")} 
                  className="hero-product-image"
                  onError={(event) => {
                      const fallback = activeSlide.image;
                    if (event.currentTarget.src !== fallback && !event.currentTarget.src.includes(fallback)) {
                      event.currentTarget.src = fallback;
                    }
                  }}
                />
                <div className="flex-grow-1">
                  <div className="hero-float-card-rating">
                    {activeSlide.icon && <i className={`bi ${activeSlide.icon}`}></i>}
                    <span>{activeSlide.rating}</span>
                    <span className="text-muted" style={{ fontSize: "0.65rem" }}>({activeSlide.reviewsCount})</span>
                  </div>
                  <h6 className="hero-product-title m-0 fw-bold text-start">{activeSlide.cardTitle}</h6>
                </div>
              </div>

              <div className="hero-float-card-specs text-start">
                {(activeSlide.specs || []).map((spec) => (
                  <span key={spec} className="hero-float-card-spec-tag me-1">{spec}</span>
                ))}
              </div>

              <div className="hero-card-price-row d-flex justify-content-between align-items-center mt-auto border-top pt-2">
                <div className="text-start">
                  <span className="hero-price-label">{t("perDay")}</span>
                  {originalPriceValue ? <span className="hero-original-price">{formatPrice(originalPriceValue)}</span> : null}
                  <span className="hero-current-price">
                    {currentPriceValue ? formatPrice(currentPriceValue) : activeSlide.cardPrice}
                  </span>
                </div>
                <div className="hero-card-location">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>{activeSlide.cardLocation}
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <div className="animate-fade-in-up" style={{ animationDelay: "360ms" }}>
          <HomeSearchForm />
        </div>

        {/* Platform Stats Banner (hidden) */}
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
