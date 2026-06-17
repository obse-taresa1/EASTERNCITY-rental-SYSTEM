import { useEffect, useState } from "react";
import heroCanon from "../../assets/images/canon.png";
import heroDrill from "../../assets/images/dewalt.png";
import heroPc from "../../assets/images/pc.png";
import heroSofa from "../../assets/images/furnsofa.png";
import heroBike from "../../assets/images/sportbick.png";
import heroToyota from "../../assets/images/Toyota RAV4.jpg";
import HomeSearchForm from "../forms/HomeSearchForm.jsx";

const slides = [
  {
    title: "Rent Cars & Vehicles Near You",
    subtitle: "Browse trusted vehicle rentals from local owners.",
    image: heroToyota,
    cardTitle: "Toyota RAV4 2023",
    cardPrice: "ETB 8,500",
    cardLocation: "Downtown",
  },
  {
    title: "Rent Electronics For Any Occasion",
    subtitle: "Find laptops, speakers, projectors, gaming devices, and more.",
    image: heroPc,
    cardTitle: "Gaming Laptop RTX 4070",
    cardPrice: "ETB 4,500",
    cardLocation: "Midtown",
  },
  {
    title: "Professional Tools On Demand",
    subtitle: "Rent tools and equipment without the cost of ownership.",
    image: heroDrill,
    cardTitle: "DeWalt Power Drill Set",
    cardPrice: "ETB 2,300",
    cardLocation: "Westside",
  },
  {
    title: "Camera Rentals For Every Shoot",
    subtitle:
      "Book cameras, lenses, and kits for events, content, and creative work.",
    image: heroCanon,
    cardTitle: "Canon EOS DSLR Kit",
    cardPrice: "ETB 6,000",
    cardLocation: "Downtown",
  },
  {
    title: "Furniture Rentals Made Easy",
    subtitle: "Affordable furniture rentals for homes and events.",
    image: heroSofa,
    cardTitle: "Modern Sectional Sofa",
    cardPrice: "ETB 7,200",
    cardLocation: "Uptown",
  },
  {
    title: "Sports Gear Ready When You Are",
    subtitle:
      "Rent bikes, golf sets, kayaks, climbing gear, and outdoor equipment.",
    image: heroBike,
    cardTitle: "Mountain Bike Pro",
    cardPrice: "ETB 2,000",
    cardLocation: "Park",
  },
];

export default function HomeHeroSlider() {
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
            key={slide.title}
            className={`hero-slide ${index === activeIndex ? "is-active" : ""}`}
            style={{ backgroundImage: `url("${slide.image}")` }}
          ></div>
        ))}
      </div>

      <div className="container motorx-hero-inner">
        <div className="hero-layout">
          <div className="hero-text">
            <span className="hero-tag">TRUSTED DEALER, RENTAL</span>
            <h1>{activeSlide.title}</h1>
            <p>{activeSlide.subtitle}</p>

            <div className="hero-cta">
              <a href="#featured-listings" className="btn-hero-primary">
                Go To Listing
              </a>
            </div>

            <HomeSearchForm />
          </div>

          <div className="hero-side">
            <div className="hero-discount-badge">
              <span className="discount-pct">40%</span>
              <span className="discount-off">OFF</span>
            </div>

            <div className="hero-float-card">
              <img src={activeSlide.image} alt="Featured rental item" />
              <div>
                <strong>{activeSlide.cardTitle}</strong>
                <span className="float-price">
                  {activeSlide.cardPrice} <small>/ day</small>
                </span>
                <span className="float-loc">
                  <i className="bi bi-geo-alt"></i> {activeSlide.cardLocation}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-slider-controls" aria-label="Hero slider controls">
          <button
            type="button"
            className="hero-slider-arrow"
            onClick={previousSlide}
            aria-label="Previous hero slide"
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <div className="hero-slider-dots" aria-label="Hero slides">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={`hero-slider-dot ${
                  index === activeIndex ? "is-active" : ""
                }`}
                aria-label={`Show hero slide ${index + 1}`}
                onClick={() => setActiveIndex(index)}
              ></button>
            ))}
          </div>

          <button
            type="button"
            className="hero-slider-arrow"
            onClick={nextSlide}
            aria-label="Next hero slide"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
}
