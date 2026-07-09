const fs = require('fs');

const filePath = 'c:\\Users\\obse\\Desktop\\EASTERNCITY-rental-SYSTEM-develop\\EASTERNCITY-rental-SYSTEM-develop\\src\\data\\items.js';

let content = fs.readFileSync(filePath, 'utf8');

// 1. Add listings to the items array
const newListings = `
  // ───────────── EVENT ESSENTIALS (ADDED) ─────────────
  {
    id: "vip-red-carpet",
    title: "VIP Red Carpet (10m x 2m)",
    category: "event-essentials",
    location: "Sabian, Dire Dawa",
    city: "Dire Dawa",
    sefar: "Sabian",
    pricePerDay: 800,
    image: canonImage,
    rating: 4.8,
    owner: "Event Star Rentals",
    description: "Premium thick red carpet for VIP arrivals, weddings, and formal ceremonies.",
    features: ["10m Length", "Thick Velvet Feel", "Cleaned & Rolled", "Non-Slip Backing"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 12,
    messages: 4,
    expiresAt: "2026-08-01",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "1 Day",
      age: "18+",
      conditions: "Dry usage only. Must be returned rolled and free of heavy mud stains.",
    },
  },
  {
    id: "chrome-stanchions-velvet-ropes",
    title: "Chrome Stanchions & Velvet Ropes Set",
    category: "event-essentials",
    location: "Sheedaha, Jigjiga",
    city: "Jigjiga",
    sefar: "Sheedaha",
    pricePerDay: 400,
    image: chairImage,
    rating: 4.7,
    owner: "Jigjiga Decor",
    description: "4 chrome queue barrier posts with 3 red velvet ropes. Adds elegance to entries.",
    features: ["4 Chrome Posts", "3 Red Velvet Ropes", "Weighted Bases", "Easy Hook System"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 6,
    messages: 1,
    expiresAt: "2026-07-28",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "1 Day",
      age: "18+",
      conditions: "Avoid scratching chrome surfaces. Pack in protective wraps.",
    },
  },
  {
    id: "fog-smoke-machine-1500w",
    title: "Professional 1500W Fog/Smoke Machine",
    category: "event-essentials",
    location: "Aboker, Harar",
    city: "Harar",
    sefar: "Aboker",
    pricePerDay: 600,
    image: projectorImage,
    rating: 4.9,
    owner: "Harar Stage Effects",
    description: "High output smoke machine with wireless remote. Great for concerts, DJs, and parties.",
    features: ["1500W High Power", "Wireless Remote", "Fast Heat-Up", "Safety Auto-Off"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 15,
    messages: 7,
    expiresAt: "2026-08-05",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "1 Day",
      age: "18+",
      conditions: "Use provided premium fog fluid only. Do not run empty.",
    },
  },
  {
    id: "led-par-stage-lights",
    title: "8-Pack LED Par Stage Uplights",
    category: "event-essentials",
    location: "Kefira, Dire Dawa",
    city: "Dire Dawa",
    sefar: "Kefira",
    pricePerDay: 1200,
    image: pcImage,
    rating: 4.9,
    owner: "Dire Dawa Audio-Visual",
    description: "8 compact LED lights with remote controls. Multi-color, voice activation, and DMX mode.",
    features: ["8 Light Cans", "RGBW Colors", "Remote Included", "Carrying Case"],
    available: true,
    featured: true,
    status: "published",
    inquiries: 24,
    messages: 9,
    expiresAt: "2026-08-12",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "1 Day",
      age: "18+",
      conditions: "Indoor use only unless protected from weather. Return in carrying case.",
    },
  },
  {
    id: "portable-outdoor-movie-screen",
    title: "120-Inch Portable Outdoor Movie Screen",
    category: "event-essentials",
    location: "Jugal, Harar",
    city: "Harar",
    sefar: "Jugal",
    pricePerDay: 500,
    image: projectorImage,
    rating: 4.8,
    owner: "Harar Entertainment",
    description: "120-inch foldable projector screen with aluminum stand and stakes for outdoor cinema nights.",
    features: ["120-Inch Diag", "Wrinkle-Free Polyester", "Aluminum Frame", "Stakes & Ropes"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 9,
    messages: 3,
    expiresAt: "2026-08-08",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "1 Day",
      age: "18+",
      conditions: "Must be completely dried and cleaned before packing back.",
    },
  },
`;

// Insert listings inside items array (which closes right before "export const categories = [")
const insertIndex = content.indexOf('export const categories = [');
if (insertIndex === -1) {
  console.error('Could not find insert index for listings.');
  process.exit(1);
}

// Locate the last closing bracket of items array before export const categories
const itemsPart = content.slice(0, insertIndex);
const closingBracketIndex = itemsPart.lastIndexOf('];');
if (closingBracketIndex === -1) {
  console.error('Could not find closing bracket of items.');
  process.exit(1);
}

content = content.slice(0, closingBracketIndex) + newListings + content.slice(closingBracketIndex);

// 2. Add the Event Essentials category to categories array
const newCategory = `  {
    id: "event-essentials",
    name: "Event Essentials",
    icon: "bi-calendar-event",
    description: "Stage, sound, smoke machines, carpets, and decoration rentals for gatherings",
  },
`;

// Find where categories array contents start
const catStartIndex = content.indexOf('export const categories = [');
const catArrayOpenIndex = content.indexOf('[', catStartIndex);
if (catArrayOpenIndex === -1) {
  console.error('Could not find categories array start [');
  process.exit(1);
}

content = content.slice(0, catArrayOpenIndex + 1) + '\n' + newCategory + content.slice(catArrayOpenIndex + 1);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully added Event Essentials category and 5 listings to items.js!');
