import { useEffect, useState } from "react";
import heroToyota from "../../assets/images/Toyota RAV4.jpg";
import heroPc from "../../assets/images/pc.png";
import heroDrill from "../../assets/images/dewalt.png";
import heroCanon from "../../assets/images/canon.png";
import heroSofa from "../../assets/images/furnsofa.png";
import heroBike from "../../assets/images/sportbick.png";

const slides = [
  {
    title: "Rent Cars & Vehicles Near You",
    subtitle: "Browse trusted vehicle rentals from local owners.",
    image: heroToyota,
    cardTitle: "Toyota RAV4 2023",
    cardPrice: "ETB 8,500",
    cardLocation: "Addis Ababa",
  },
  {
    title: "Rent Electronics For Any Occasion",
    subtitle: "Find laptops, speakers, projectors, gaming devices, and more.",
    image: heroPc,
    cardTitle: "Gaming Laptop RTX 4070",
    cardPrice: "ETB 4,500",
    cardLocation: "Kazanchis",
  },
  {
    title: "Professional Tools On Demand",
    subtitle: "Rent tools and equipment without the cost of ownership.",
    image: heroDrill,
    cardTitle: "DeWalt Power Drill Set",
    cardPrice: "ETB 2,300",
    cardLocation: "Bole",
  },
  {
    title: "Camera Rentals For Every Shoot",
    subtitle:
      "Book cameras, lenses, and kits for events, content, and creative work.",
    image: heroCanon,
    cardTitle: "Canon EOS DSLR Kit",
    cardPrice: "ETB 6,000",
    cardLocation: "Addis Ababa",
  },
  {
    title: "Furniture Rentals Made Easy",
    subtitle: "Affordable furniture rentals for homes and events.",
    image: heroSofa,
    cardTitle: "Modern Sectional Sofa",
    cardPrice: "ETB 7,200",
    cardLocation: "Addis Ababa",
  },
  {
    title: "Sports Gear Ready When You Are",
    subtitle:
      "Rent bikes, golf sets, kayaks, climbing gear, and outdoor equipment.",
    image: heroBike,
    cardTitle: "Mountain Bike Pro",
    cardPrice: "ETB 2,000",
    cardLocation: "Entoto",
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
    <section className="hero-section motorx-hero" data-hero-slider>
      <div className="hero-bg">
        {slides.map((slide, index) => (
          <img
            key={slide.title}
            src={slide.image}
            alt=""
            className={`hero-slide ${index === activeIndex ? "is-active" : ""}`}
          />
        ))}
      </div>

      <div className="container hero-content">
        <span className="section-label">CITYWIDE RENTALS</span>
        <h1>{activeSlide.title}</h1>
        <p>{activeSlide.subtitle}</p>

        <div className="hero-buttons">
          <a href="#featured-listings" className="btn-accent-custom">
            Explore All Items
          </a>
          <a href="#home-search" className="btn btn-outline-light">
            Search Rentals
          </a>
        </div>

        <div className="hero-rental-card">
          <img src={activeSlide.image} alt={activeSlide.cardTitle} />
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

        <div className="hero-controls">
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous slide"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          [6/16/2026 11:47 PM] Obsi:{" "}
          <div className="hero-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={`hero-dot ${index === activeIndex ? "active" : ""}`}
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setActiveIndex(index)}
              ></button>
            ))}
          </div>
          <button type="button" onClick={nextSlide} aria-label="Next slide">
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
}
