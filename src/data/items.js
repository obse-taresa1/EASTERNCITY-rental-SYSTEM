import rav4Image from "../assets/images/Toyota RAV4.jpg";
import pcImage from "../assets/images/pc.png";
import dewaltImage from "../assets/images/dewalt.png";
import canonImage from "../assets/images/canon.png";
import sofaImage from "../assets/images/furnsofa.png";
import bikeImage from "../assets/images/sportbick.png";

export const items = [
  {
    id: "toyota-rav4",
    title: "Toyota RAV4",
    category: "vehicles",
    location: "Addis Ababa, Ethiopia",
    pricePerDay: 6000,
    image: rav4Image,
    rating: 4.9,
    owner: "Abebe Rental",
    description:
      "Comfortable Toyota RAV4 suitable for city trips, airport pickup, and weekend travel.",
    features: ["Automatic", "Air Conditioning", "5 Seats", "Fuel Efficient"],
    available: true,
  },
  {
    id: "gaming-pc",
    title: "Gaming PC",
    category: "electronics",
    location: "Bole, Addis Ababa",
    pricePerDay: 3500,
    image: pcImage,
    rating: 4.8,
    owner: "Tech Hub Rentals",
    description:
      "High performance desktop computer for gaming, editing, and professional work.",
    features: ["16GB RAM", "RTX Graphics", "SSD Storage", "Monitor Included"],
    available: true,
  },
  {
    id: "dewalt-drill",
    title: "Dewalt Drill Kit",
    category: "tools",
    location: "Piassa, Addis Ababa",
    pricePerDay: 1300,
    image: dewaltImage,
    rating: 4.7,
    owner: "BuildRight Tools",
    description:
      "Reliable drill kit for construction, home repair, and workshop projects.",
    features: ["Cordless", "Battery Included", "Carry Case", "Multiple Bits"],
    available: true,
  },
  {
    id: "canon-camera",
    title: "Canon Camera",
    category: "cameras",
    location: "Kazanchis, Addis Ababa",
    pricePerDay: 2600,
    image: canonImage,
    rating: 4.9,
    owner: "Lens House",
    description:
      "Canon camera for events, portraits, content creation, and travel photography.",
    features: ["HD Video", "Portrait Lens", "Memory Card", "Battery Charger"],
    available: true,
  },
  {
    id: "modern-sofa",
    title: "Modern Sofa",
    category: "furniture",
    location: "Megenagna, Addis Ababa",
    pricePerDay: 1800,
    image: sofaImage,
    rating: 4.6,
    owner: "HomeStyle Rentals",
    description:
      "Clean modern sofa for temporary home setup, staging, and small events.",
    features: ["3 Seats", "Clean Fabric", "Delivery Available", "Modern Design"],
    available: true,
  },
  {
    id: "sport-bike",
    title: "Sport Bike",
    category: "sports",
    location: "CMC, Addis Ababa",
    pricePerDay: 1500,
    image: bikeImage,
    rating: 4.8,
    owner: "Active Life Rentals",
    description:
      "Sport bicycle suitable for exercise, short-distance travel, and weekend rides.",
    features: ["Lightweight", "Helmet Available", "Smooth Gear", "Good Brakes"],
    available: true,
  },
];

export const categories = [
  {
    id: "vehicles",
    name: "Vehicles",
    icon: "bi-car-front",
    description: "Cars and transport rentals",
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: "bi-laptop",
    description: "Computers and electronic devices",
  },
  {
    id: "tools",
    name: "Tools",
    icon: "bi-tools",
    description: "Construction and repair tools",
  },
  {
    id: "cameras",
    name: "Cameras",
    icon: "bi-camera",
    description: "Photography and video equipment",
  },
  {
    id: "furniture",
    name: "Furniture",
    icon: "bi-house-heart",
    description: "Home and event furniture",
  },
  {
    id: "sports",
    name: "Sports",
    icon: "bi-bicycle",
    description: "Sport and outdoor equipment",
  },
];
