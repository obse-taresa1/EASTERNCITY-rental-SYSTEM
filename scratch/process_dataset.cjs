const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\obse\\Desktop\\EASTERNCITY-rental-SYSTEM-develop\\EASTERNCITY-rental-SYSTEM-develop\\src\\data\\items.js';

let code = fs.readFileSync(filePath, 'utf8');

// Extract all import statements to write them back later
const importStatements = [];
const lines = code.split('\n');
const dataLines = [];

lines.forEach(line => {
  if (line.trim().startsWith('import ')) {
    importStatements.push(line);
  } else {
    dataLines.push(line);
  }
});

let dataCode = dataLines.join('\n');

// Build mock imports code for evaluation
const importNames = [];
const importRegex = /import\s+(\w+)\s+from/g;
let match;
const importCodeText = importStatements.join('\n');
while ((match = importRegex.exec(importCodeText)) !== null) {
  importNames.push(match[1]);
}

let mockImportsCode = importNames.map(name => `const ${name} = "${name}";`).join('\n') + '\n';

// Convert exports to CommonJS for dynamic load
dataCode = dataCode.replace('export const items =', 'const items =');
dataCode = dataCode.replace('export const categories =', 'const categories =');

const tempFileCode = `
${mockImportsCode}
${dataCode}
module.exports = { items, categories };
`;

const tempPath = path.join(__dirname, 'temp_items.js');
fs.writeFileSync(tempPath, tempFileCode, 'utf8');

const { items, categories } = require(tempPath);
fs.unlinkSync(tempPath);

// Define Sefar mapping logic
function getNewSefar(oldLoc, city) {
  const loc = oldLoc || '';
  
  if (city === 'Jigjiga') {
    if (loc.includes('Sheedaha')) return 'Sheedaha';
    if (loc.includes('Kebele 01') || loc.includes('Taiwan')) return 'Kebele 01';
    if (loc.includes('Kebele 02') || loc.includes('Fafen')) return 'Kebele 02';
    if (loc.includes('Kebele 03') || loc.includes('Stadium')) return 'Kebele 03';
    if (loc.includes('Kebele 04') || loc.includes('University')) return 'Kebele 04';
    if (loc.includes('Kebele 05')) return 'Kebele 05';
    return 'Sheedaha';
  }
  
  if (city === 'Dire Dawa') {
    if (loc.includes('Sabian') || loc.includes('Kebele 02')) return 'Sabian';
    if (loc.includes('Kezira') || loc.includes('Kefira') || loc.includes('City Center')) return 'Kefira';
    if (loc.includes('Gende Kore') || loc.includes('Addis Ketema')) return 'Gende Kore';
    if (loc.includes('Megala') || loc.includes('Ashewa')) return 'Megala';
    if (loc.includes('Dechatu') || loc.includes('Airport')) return 'Dechatu';
    if (loc.includes('Legehare') || loc.includes('Goro')) return 'Legehare';
    return 'Sabian';
  }
  
  if (city === 'Harar') {
    if (loc.includes('Aboker') || loc.includes('Market')) return 'Aboker';
    if (loc.includes('Amir Nur') || loc.includes('University')) return 'Amir Nur';
    if (loc.includes('Jugal') || loc.includes('Shewa Ber') || loc.includes('Old Town')) return 'Jugal';
    if (loc.includes('Arategna') || loc.includes('Hakim') || loc.includes('Kebele 05')) return 'Arategna';
    if (loc.includes('Jenella') || loc.includes('Genela')) return 'Jenella';
    if (loc.includes('Shenkor') || loc.includes('Sofi')) return 'Shenkor';
    return 'Aboker';
  }
  
  return 'Sheedaha';
}

// 1. Process all existing items
items.forEach(item => {
  item.sefar = getNewSefar(item.location, item.city);
  // Standardize location: Sefar, City
  item.location = `${item.sefar}, ${item.city}`;
});

// 2. Add listings to sparse categories to reach 5+ each
const extraListings = [
  // Fashion & Accessories
  {
    id: "premium-wedding-gown",
    title: "Premium Wedding Gown",
    category: "fashion-accessories",
    location: "Sabian, Dire Dawa",
    city: "Dire Dawa",
    sefar: "Sabian",
    pricePerDay: 2500,
    image: "canonImage",
    rating: 4.9,
    owner: "Bride's Dream",
    description: "Elegant silk and lace wedding gown. Professionally dry-cleaned after every rental.",
    features: ["Silk & Lace", "Dry Cleaned", "Size M/L", "Veil Included"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 14,
    messages: 5,
    expiresAt: "2026-08-01",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "2 Days",
      age: "18+",
      conditions: "Dry cleaning cost is covered. Damage deposit required.",
    },
  },
  {
    id: "designer-handbag",
    title: "Luxury Designer Handbag",
    category: "fashion-accessories",
    location: "Aboker, Harar",
    city: "Harar",
    sefar: "Aboker",
    pricePerDay: 600,
    image: "bikeImage",
    rating: 4.7,
    owner: "Chic Accessories",
    description: "Authentic designer leather handbag for evening dinners and ceremonies.",
    features: ["Genuine Leather", "Dust Bag", "Medium Size", "Gold Details"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 5,
    messages: 1,
    expiresAt: "2026-07-28",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "1 Day",
      age: "18+",
      conditions: "Return in original dust bag. No liquid stains allowed.",
    },
  },
  {
    id: "classic-tuxedo-suit",
    title: "Classic Black Tuxedo Set",
    category: "fashion-accessories",
    location: "Sheedaha, Jigjiga",
    city: "Jigjiga",
    sefar: "Sheedaha",
    pricePerDay: 1200,
    image: "canonImage",
    rating: 4.8,
    owner: "Gentlemen Wear",
    description: "Modern fit black tuxedo with bow tie and cuffs. Perfect for weddings and formal dinners.",
    features: ["Modern Fit", "Complete Set", "Size L", "Premium Wool"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 9,
    messages: 3,
    expiresAt: "2026-07-31",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "1 Day",
      age: "18+",
      conditions: "Late return penalty applies. Ironing not required upon return.",
    },
  },
  {
    id: "gold-jewelry-set",
    title: "Traditional Bridal Jewelry Set",
    category: "fashion-accessories",
    location: "Jugal, Harar",
    city: "Harar",
    sefar: "Jugal",
    pricePerDay: 1500,
    image: "catagCanonImage",
    rating: 4.9,
    owner: "Heritage Jewels",
    description: "Stunning gold-plated traditional jewelry set for cultural wedding celebrations.",
    features: ["Gold Plated", "Bridal Design", "Necklace & Earrings", "Storage Case"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 18,
    messages: 6,
    expiresAt: "2026-08-10",
    requirements: {
      documents: ["National ID", "Passport Copy"],
      minimumPeriod: "1 Day",
      age: "21+",
      conditions: "Refundable security deposit is mandatory.",
    },
  },

  // Baby & Kids Essentials
  {
    id: "infant-car-seat",
    title: "Infant Car Safety Seat",
    category: "baby-kids",
    location: "Sabian, Dire Dawa",
    city: "Dire Dawa",
    sefar: "Sabian",
    pricePerDay: 400,
    image: "bikeImage",
    rating: 4.8,
    owner: "Little Safety",
    description: "Highly rated infant car seat with impact protection and easy install base.",
    features: ["Side Impact Protection", "5-Point Harness", "Easy Install", "Washable Cover"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 6,
    messages: 2,
    expiresAt: "2026-07-29",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "3 Days",
      age: "No Restriction",
      conditions: "Must be returned clean. No food stains.",
    },
  },
  {
    id: "toddler-playpen",
    title: "Portable Toddler Playpen",
    category: "baby-kids",
    location: "Kebele 02, Jigjiga",
    city: "Jigjiga",
    sefar: "Kebele 02",
    pricePerDay: 300,
    image: "bikeImage",
    rating: 4.6,
    owner: "Kids World",
    description: "Spacious and portable playpen with breathable mesh walls and folding travel bag.",
    features: ["Breathable Mesh", "Foldable", "Travel Bag", "Toy Pocket"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 8,
    messages: 3,
    expiresAt: "2026-07-22",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "2 Days",
      age: "No Restriction",
      conditions: "Cleaned before handover.",
    },
  },
  {
    id: "wooden-baby-crib",
    title: "Wooden Baby Crib & Mattress",
    category: "baby-kids",
    location: "Amir Nur, Harar",
    city: "Harar",
    sefar: "Amir Nur",
    pricePerDay: 650,
    image: "sofaImage",
    rating: 4.7,
    owner: "Sweet Dreams",
    description: "Sturdy wooden crib with height-adjustable mattress settings. Sanitized for safety.",
    features: ["Adjustable Height", "Teething Rails", "Foam Mattress", "Non-Toxic Paint"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 12,
    messages: 4,
    expiresAt: "2026-08-03",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "5 Days",
      age: "No Restriction",
      conditions: "Assembly tools included. Delivery can be arranged.",
    },
  },
  {
    id: "adjustable-high-chair",
    title: "Adjustable Baby High Chair",
    category: "baby-kids",
    location: "Megala, Dire Dawa",
    city: "Dire Dawa",
    sefar: "Megala",
    pricePerDay: 200,
    image: "chairImage",
    rating: 4.5,
    owner: "Baby Diners",
    description: "Height adjustable high chair with double tray and seat pad for easy feeding.",
    features: ["Double Tray", "Adjustable Height", "Wheels with Locks", "Wipeable Pad"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 4,
    messages: 1,
    expiresAt: "2026-07-19",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "2 Days",
      age: "No Restriction",
      conditions: "Sanitized before return.",
    },
  },

  // Beauty & Salon Equipment
  {
    id: "makeup-station-led",
    title: "Portable LED Makeup Mirror & Station",
    category: "beauty-salon",
    location: "Sheedaha, Jigjiga",
    city: "Jigjiga",
    sefar: "Sheedaha",
    pricePerDay: 800,
    image: "pcImage",
    rating: 4.8,
    owner: "Glamour Rental",
    description: "Compact makeup station with adjustable stand, LED bulbs, and outlets for styling tools.",
    features: ["Dimmable LED Bulbs", "Adjustable Stand", "Outlets", "Mirror Included"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 10,
    messages: 4,
    expiresAt: "2026-07-31",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "1 Day",
      age: "18+",
      conditions: "Bring your own makeup tools. Clean mirrors before return.",
    },
  },
  {
    id: "foldable-massage-table",
    title: "Foldable Massage Table",
    category: "beauty-salon",
    location: "Jugal, Harar",
    city: "Harar",
    sefar: "Jugal",
    pricePerDay: 500,
    image: "sofaImage",
    rating: 4.7,
    owner: "Zen Spa Rentals",
    description: "Lightweight foldable massage table with carrying bag. Ideal for home spa services.",
    features: ["Foldable", "Carrying Bag", "Height Adjustable", "Padded Leather"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 11,
    messages: 3,
    expiresAt: "2026-08-04",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "1 Day",
      age: "18+",
      conditions: "Use protective sheets to prevent oil stains on the leather.",
    },
  },
  {
    id: "hair-steamer-pro",
    title: "Professional Salon Hair Steamer",
    category: "beauty-salon",
    location: "Kefira, Dire Dawa",
    city: "Dire Dawa",
    sefar: "Kefira",
    pricePerDay: 900,
    image: "projectorImage",
    rating: 4.6,
    owner: "Salon Equip Co",
    description: "Professional ionic hair steamer on wheels. Ideal for deep hair conditioning treatments.",
    features: ["Ionic Steam", "Hood Adjustable", "Timer", "Rolling Base"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 7,
    messages: 2,
    expiresAt: "2026-07-27",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "2 Days",
      age: "18+",
      conditions: "Use distilled water only to prevent mineral build-up.",
    },
  },
  {
    id: "shampoo-bowl-portable",
    title: "Portable Hair Shampoo Bowl",
    category: "beauty-salon",
    location: "Arategna, Harar",
    city: "Harar",
    sefar: "Arategna",
    pricePerDay: 350,
    image: "bikeImage",
    rating: 4.5,
    owner: "Stylist Supply",
    description: "Adjustable height shampoo basin with drain hose for mobile hairdressers and home styling.",
    features: ["Adjustable Height", "Drain Hose", "Lightweight", "Tilt Mechanism"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 5,
    messages: 1,
    expiresAt: "2026-07-23",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "1 Day",
      age: "18+",
      conditions: "Ensure hoses are thoroughly drained and dried before return.",
    },
  },

  // Music & Audio Equipment
  {
    id: "acoustic-guitar-fender",
    title: "Fender Acoustic Guitar",
    category: "music-audio",
    location: "Amir Nur, Harar",
    city: "Harar",
    sefar: "Amir Nur",
    pricePerDay: 300,
    image: "bikeImage",
    rating: 4.7,
    owner: "Melody Rent",
    description: "Rich sounding Fender acoustic guitar. Includes protective gig bag and picks.",
    features: ["Fender Brand", "Gig Bag Included", "Picks Included", "Steel Strings"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 12,
    messages: 5,
    expiresAt: "2026-08-05",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "2 Days",
      age: "18+",
      conditions: "Refundable deposit of 500 ETB. Do not replace strings yourself.",
    },
  },
  {
    id: "studio-mic-set",
    title: "Shure Studio Microphone Set",
    category: "music-audio",
    location: "Legehare, Dire Dawa",
    city: "Dire Dawa",
    sefar: "Legehare",
    pricePerDay: 450,
    image: "speakerImage",
    rating: 4.8,
    owner: "Podcast Pro",
    description: "High quality Shure cardioid microphone with shock mount, pop filter, and XLR cable.",
    features: ["Cardioid Pickup", "Shock Mount", "Pop Filter", "XLR Cable"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 9,
    messages: 3,
    expiresAt: "2026-07-30",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "1 Day",
      age: "18+",
      conditions: "Protect from high moisture. Return inside padded case.",
    },
  },
  {
    id: "digital-keyboard-yamaha",
    title: "Yamaha 61-Key Digital Keyboard",
    category: "music-audio",
    location: "Kebele 01, Jigjiga",
    city: "Jigjiga",
    sefar: "Kebele 01",
    pricePerDay: 700,
    image: "pcImage",
    rating: 4.8,
    owner: "Keynotes",
    description: "Yamaha keyboard with built-in speakers, headphone output, and adapter. Perfect for practice.",
    features: ["61 Keys", "Power Adapter", "Music Stand", "Headphone Jack"],
    available: true,
    featured: false,
    status: "published",
    inquiries: 15,
    messages: 6,
    expiresAt: "2026-08-02",
    requirements: {
      documents: ["National ID"],
      minimumPeriod: "2 Days",
      age: "18+",
      conditions: "Use clean dry hands. Keep away from water.",
    },
  },
  {
    id: "dj-controller-pioneer",
    title: "Pioneer DJ Controller Set",
    category: "music-audio",
    location: "Sabian, Dire Dawa",
    city: "Dire Dawa",
    sefar: "Sabian",
    pricePerDay: 1500,
    image: "pcImage",
    rating: 4.9,
    owner: "Beats Event Sound",
    description: "Pioneer DJ controller deck with headphone, audio cables, and software access keys.",
    features: ["4-Channel", "USB Plug-in", "Headphone Out", "DJ software sync"],
    available: true,
    featured: true,
    status: "published",
    inquiries: 22,
    messages: 8,
    expiresAt: "2026-08-07",
    requirements: {
      documents: ["National ID", "Company Work ID"],
      minimumPeriod: "1 Day",
      age: "21+",
      conditions: "Damage replacement value agreement must be signed before rental.",
    },
  },

  // Event Essentials
  {
    id: "vip-red-carpet",
    title: "VIP Red Carpet (10m x 2m)",
    category: "event-essentials",
    location: "Sabian, Dire Dawa",
    city: "Dire Dawa",
    sefar: "Sabian",
    pricePerDay: 800,
    image: "canonImage",
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
    image: "chairImage",
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
    image: "projectorImage",
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
    image: "pcImage",
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
    image: "projectorImage",
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
];

// Append them to the items array
items.push(...extraListings);

// 3. Inject Event Essentials into categories array at index 3 (after Party & Wedding or similar)
const eventEssentialsCat = {
  id: "event-essentials",
  name: "Event Essentials",
  icon: "bi-calendar-event",
  description: "Stage, sound, smoke machines, carpets, and decoration rentals for gatherings",
};

// Check if already exists in categories, otherwise insert it
if (!categories.some(c => c.id === 'event-essentials')) {
  // Insert at index 4 (or just push)
  categories.splice(3, 0, eventEssentialsCat);
}

// Custom Stringifier to write back JavaScript with unquoted image variables
function customStringify(obj, indent = 2) {
  const spaces = ' '.repeat(indent);
  if (Array.isArray(obj)) {
    return '[\n' + obj.map(item => spaces + customStringify(item, indent + 2)).join(',\n') + '\n' + ' '.repeat(indent - 2) + ']';
  }
  if (typeof obj === 'object' && obj !== null) {
    let parts = [];
    for (let key in obj) {
      let val = obj[key];
      let valStr = '';
      if (key === 'image' && typeof val === 'string' && importNames.includes(val)) {
        // Leave unquoted
        valStr = val;
      } else {
        valStr = customStringify(val, indent + 2);
      }
      // Check if valid identifier for object key
      const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
      parts.push(`${' '.repeat(indent)}${keyStr}: ${valStr}`);
    }
    return '{\n' + parts.join(',\n') + '\n' + ' '.repeat(indent - 2) + '}';
  }
  return JSON.stringify(obj);
}

// Generate the new file content
const outputCode = `
${importStatements.join('\n')}

export const items = ${customStringify(items, 2)};

export const categories = ${customStringify(categories, 2)};
`;

fs.writeFileSync(filePath, outputCode, 'utf8');
console.log('Successfully completed full items.js processing!');
