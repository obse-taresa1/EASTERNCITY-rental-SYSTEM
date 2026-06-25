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
    location: "Downtown, Jigjiga",
    city: "Jigjiga",
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
    category: "electronics-cameras",
    location: "Central, Dire Dawa",
    city: "Dire Dawa",
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
    category: "construction-diy",
    location: "Old Town, Harar",
    city: "Harar",
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
    category: "electronics-cameras",
    location: "University Road, Jigjiga",
    city: "Jigjiga",
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
    location: "Kebele 02, Dire Dawa",
    city: "Dire Dawa",
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
    category: "sports-outdoor",
    location: "Market Area, Harar",
    city: "Harar",
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
    id: "electronics-cameras",
    name: "Electronics & Cameras",
    icon: "bi-camera",
    description: "Cameras, projectors, drones, and electronic devices for rent.",
  },
  {
    id: "cars-bikes",
    name: "Cars & Bikes",
    icon: "bi-car-front",
    description: "Cars, motorcycles, and bikes available for daily and weekly rental.",
  },
  {
    id: "party-wedding",
    name: "Party & Wedding",
    icon: "bi-balloon",
    description: "Wedding chairs, tents, decorations, sound systems, and event lighting.",
  },
  {
    id: "event-essentials",
    name: "Event Essentials",
    icon: "bi-calendar-event",
    description: "Generators, stage platforms, tables, cables, and lighting towers for events.",
  },
  {
    id: "vehicles",
    name: "Vehicles",
    icon: "bi-truck",
    description: "Pickup trucks, minibuses, SUVs, delivery vans, and cargo trucks.",
  },
  {
    id: "gadgets",
    name: "Gadgets",
    icon: "bi-controller",
    description: "PlayStation, VR headsets, power banks, smart watches, and tablets.",
  },
  {
    id: "construction-diy",
    name: "Construction & DIY",
    icon: "bi-tools",
    description: "Cement mixers, drills, scaffolding, ladders, and tile cutters.",
  },
  {
    id: "furniture",
    name: "Furniture",
    icon: "bi-house-heart",
    description: "Sofa sets, dining tables, office chairs, coffee tables, and wardrobes.",
  },
  {
    id: "home-appliances",
    name: "Home Appliances",
    icon: "bi-house-gear",
    description: "Refrigerators, washing machines, microwaves, vacuum cleaners, and blenders.",
  },
  {
    id: "sports-outdoor",
    name: "Sports & Outdoor",
    icon: "bi-bicycle",
    description: "Bicycles, camping tents, treadmills, football kits, and fitness equipment.",
  },
  {
    id: "travel-camping",
    name: "Travel & Camping",
    icon: "bi-compass",
    description: "Sleeping bags, camping stoves, travel backpacks, cooler boxes, and hiking gear.",
  },
  {
    id: "fashion-accessories",
    name: "Fashion & Accessories",
    icon: "bi-handbag",
    description: "Traditional dresses, wedding jewelry, designer handbags, suits, and evening gowns.",
  },
  {
    id: "music-audio",
    name: "Music & Audio Equipment",
    icon: "bi-music-note-beamed",
    description: "DJ controllers, keyboards, drum sets, microphones, and guitar amplifiers.",
  },
  {
    id: "office-equipment",
    name: "Office Equipment",
    icon: "bi-printer",
    description: "Projector screens, printers, photocopiers, office desks, and conference chairs.",
  },
  {
    id: "beauty-salon",
    name: "Beauty & Salon Equipment",
    icon: "bi-scissors",
    description: "Hair dryers, makeup chairs, facial steamers, nail equipment, and salon mirrors.",
  },
  {
    id: "baby-kids",
    name: "Baby & Kids Essentials",
    icon: "bi-balloon-heart",
    description: "Baby strollers, cribs, kids bicycles, car seats, and baby walkers.",
  },
  {
    id: "gaming-equipment",
    name: "Gaming Equipment",
    icon: "bi-joystick",
    description: "Xbox consoles, gaming chairs, gaming monitors, racing wheels, and Nintendo Switch.",
  },
];

