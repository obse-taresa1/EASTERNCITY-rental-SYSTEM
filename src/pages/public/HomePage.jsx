import HomeHeroSlider from "../../components/listings/HomeHeroSlider.jsx";
import HomeSearchForm from "../../components/forms/HomeSearchForm.jsx";
import CategoryCard from "../../components/cards/CategoryCard.jsx";
import ListingCard from "../../components/cards/ListingCard.jsx";

import toyota from "../../assets/images/Toyota RAV4.jpg";
import canon from "../../assets/images/canon.png";
import dewalt from "../../assets/images/dewalt.png";
import pc from "../../assets/images/pc.png";
import projector from "../../assets/images/projector.png";
import washer from "../../assets/images/waterpp.png";

const categories = [
  {
    to: "/category/vehicles",
    icon: "bi-car-front-fill",
    title: "Vehicles",
    text: "Cars, vans, and SUVs for daily or weekend use.",
  },
  {
    to: "/category/cameras",
    icon: "bi-camera-fill",
    title: "Cameras",
    text: "Cameras, lenses, kits, and creative gear.",
  },
  {
    to: "/category/tools",
    icon: "bi-tools",
    title: "Tools",
    text: "Power tools and equipment for home projects.",
  },
  {
    to: "/category/electronics",
    icon: "bi-laptop-fill",
    title: "Electronics",
    text: "Laptops, speakers, projectors, and more.",
  },
];

const featuredListings = [
  {
    id: "toyota-rav4-2023",
    title: "Toyota RAV4 2023",
    image: toyota,
    price: "ETB 8,500",
    location: "Addis Ababa",
    category: "Vehicles",
    meta: "Automatic · SUV · 2023",
    year: "2023",
    status: "new",
  },
  {
    id: "canon-eos-dslr-kit",
    title: "Canon EOS DSLR Kit",
    image: canon,
    price: "ETB 6,000",
    location: "Addis Ababa",
    category: "Cameras",
    meta: "Lens kit · Battery · Case",
    year: "2024",
    status: "new",
  },
  {
    id: "dewalt-power-drill-set",
    title: "DeWalt Power Drill Set",
    image: dewalt,
    price: "ETB 2,300",
    location: "Bole",
    category: "Tools",
    meta: "Cordless · Bits · Charger",
    year: "2022",
    status: "used",
  },
  {
    id: "gaming-laptop-rtx-4070",
    title: "Gaming Laptop RTX 4070",
    image: pc,
    price: "ETB 4,500",
    location: "Kazanchis",
    category: "Electronics",
    meta: "RTX 4070 · 32GB RAM",
    year: "2024",
    status: "new",
  },
  {
    id: "4k-home-theater-projector",
    title: "4K Home Theater Projector",
    image: projector,
    price: "ETB 3,600",
    location: "Piassa",
    category: "Electronics",
    meta: "4K · HDMI · Remote",
    year: "2023",
    status: "new",
  },
  {
    id: "electric-pressure-washer",
    title: "Electric Pressure Washer",
    image: washer,
    price: "ETB 2,800",
    location: "Megenagna",
    category: "Tools",
    meta: "Electric · Hose · Nozzles",
    year: "2021",
    status: "used",
  },
];

export default function HomePage() {
  return (
    <>
      <HomeHeroSlider />
      <HomeSearchForm />

      <section className="section-categories">
        <div className="container">
          <div className="section-heading">
            <span className="section-label">CATEGORIES</span>
            <h2>Browse by Category</h2>
            <p>Find rental items by the type of gear or service you need.</p>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <CategoryCard key={category.to} {...category} />
            ))}
          </div>
        </div>
      </section>

      <section id="featured-listings" className="section-listings">
        <div className="container">
          <div className="section-heading">
            <span className="section-label">FEATURED RENTALS</span>
            <h2>Popular Items Near You</h2>
            <p>Browse trusted rentals from local owners.</p>
          </div>

          <div className="row g-4">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
