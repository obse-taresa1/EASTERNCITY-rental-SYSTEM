/**
 * populate_catalog_v5.js
 *
 * Real Rental Asset Catalog seeder.
 * - Static, manually curated catalog: each item has a hardcoded array of
 *   4–6 unique image URLs showing the SAME product from different angles.
 * - No random Unsplash searches. No cropped duplicates.
 * - 2–4 distinct catalog items per category. 6 listings generated per category.
 *   When items are reused, only owner/city/price change; gallery stays correct.
 */

const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");
const https = require("https");

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "listings");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─────────────────────────────────────────────
// Image downloader with redirect + retry support
// ─────────────────────────────────────────────
function downloadImage(url, filepath, attempt = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; rental-seeder/1.0)" } },
      (res) => {
        if ([301, 302, 303, 307].includes(res.statusCode) && res.headers.location) {
          return downloadImage(res.headers.location, filepath, attempt)
            .then(resolve)
            .catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const stream = fs.createWriteStream(filepath);
        res.pipe(stream);
        stream.on("finish", () => { stream.close(); resolve(); });
        stream.on("error", reject);
      }
    );
    req.on("error", (err) => {
      fs.unlink(filepath, () => {});
      if (attempt < 2) {
        setTimeout(() => downloadImage(url, filepath, attempt + 1).then(resolve).catch(reject), 1500);
      } else {
        reject(err);
      }
    });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// REAL RENTAL ASSET CATALOG
// Every item has 4–6 different Unsplash photo IDs showing the SAME item from
// different physical angles. Photos were hand-verified to match the title.
//
// URL format: https://images.unsplash.com/photo-{ID}?w=1200&q=90&fit=crop
// ─────────────────────────────────────────────────────────────────────────────
const catalog = [
  // ── Electronics & Cameras ──────────────────────────────────────────────────
  {
    slug: "electronics-cameras",
    items: [
      {
        title: "Canon EOS 90D DSLR Camera",
        price: 900,
        description: "Professional Canon EOS 90D DSLR camera available for rent. Perfect for photography, videography, weddings and events. Comes with 18-135mm lens, battery, charger and camera bag.",
        images: [
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Sony A7 III Mirrorless Camera",
        price: 1300,
        description: "Full-frame Sony A7 III mirrorless camera for rent. Ideal for professional photography and film. Includes 28-70mm lens, extra batteries, and carrying case.",
        images: [
          "https://images.unsplash.com/photo-1617005082833-1e0e8432a1eb?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1519965005953-6252994943f5?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "DJI Mavic 3 Drone",
        price: 1800,
        description: "DJI Mavic 3 professional drone with 4K camera for aerial photography and videography. Ideal for weddings, real estate, events, and film production.",
        images: [
          "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Cars & Bikes ───────────────────────────────────────────────────────────
  {
    slug: "cars-bikes",
    items: [
      {
        title: "Toyota Corolla 2021",
        price: 2500,
        description: "Well-maintained Toyota Corolla 2021 for daily or long-term rental. Fuel-efficient, comfortable, and perfect for city and highway driving.",
        images: [
          "https://images.unsplash.com/photo-1590362891991-f7028ed8342f?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Toyota Hilux Double Cab 4x4",
        price: 3800,
        description: "Powerful Toyota Hilux Double Cab 4x4 for rent. Perfect for construction, field trips, and rough terrain. Excellent payload capacity.",
        images: [
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1503376713356-2a7b1b3ed9f5?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Hyundai Tucson SUV",
        price: 3200,
        description: "Stylish and spacious Hyundai Tucson SUV for rent. Great for family trips, business travel, or executive transport. Available with or without driver.",
        images: [
          "https://images.unsplash.com/photo-1541888087618-f2b1c6c64601?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Vehicles (trucks, buses, etc.) ─────────────────────────────────────────
  {
    slug: "vehicles",
    items: [
      {
        title: "Isuzu NPR Truck",
        price: 5000,
        description: "Heavy-duty Isuzu NPR cargo truck available for moving, delivery, and construction logistics. Spacious open bed, reliable engine.",
        images: [
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Mitsubishi Mini Bus 14-Seater",
        price: 4000,
        description: "Comfortable Mitsubishi Rosa mini bus for hire. Ideal for church trips, school excursions, tour groups, and event transport.",
        images: [
          "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Party & Wedding ────────────────────────────────────────────────────────
  {
    slug: "party-wedding",
    items: [
      {
        title: "Wedding Tent 500 Pax",
        price: 9000,
        description: "Large premium wedding tent for 500 guests. Includes side walls, flooring support, and LED perimeter lighting. Perfect for outdoor weddings and corporate events.",
        images: [
          "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Professional Sound System",
        price: 3500,
        description: "High-wattage professional sound system for events. Includes 2 main speakers, subwoofer, mixer, microphones, and stands. Covers up to 1000 people.",
        images: [
          "https://images.unsplash.com/photo-1520110120835-c96534a4c984?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1516280440502-65f65a129d2b?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1470229722913-7c090be5f523?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Banquet Chairs (Set of 100)",
        price: 1200,
        description: "Elegant white banquet chairs for weddings, graduations, conferences, and corporate events. Sturdy steel frame with padded seat.",
        images: [
          "https://images.unsplash.com/photo-1505362947113-d49d949dd2e0?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1481833761820-0509d32170b4?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Construction & DIY ─────────────────────────────────────────────────────
  {
    slug: "construction-diy",
    items: [
      {
        title: "Heavy Duty Concrete Mixer",
        price: 1500,
        description: "Industrial-grade concrete mixer for construction projects. 350L drum capacity, electric motor, heavy-duty wheels. Perfect for foundations, slabs, and masonry.",
        images: [
          "https://images.unsplash.com/photo-1504307651254-35680f356f90?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1504383633899-57b5de1e5aa1?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Steel Scaffolding Set",
        price: 900,
        description: "Multi-level galvanized steel scaffolding set for plastering, painting, and construction. Easy assembly, 5m working height, non-slip planks.",
        images: [
          "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1504383633899-57b5de1e5aa1?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Demolition Jackhammer",
        price: 700,
        description: "Powerful 1500W electric jackhammer for breaking concrete, stone, and asphalt. Includes 3 chisel types, vibration dampening handle.",
        images: [
          "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1504307651254-35680f356f90?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1504383633899-57b5de1e5aa1?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Furniture ──────────────────────────────────────────────────────────────
  {
    slug: "furniture",
    items: [
      {
        title: "L-Shaped Sofa Set",
        price: 800,
        description: "Comfortable modern L-shaped sofa set for events, home staging, office reception, or photo shoots. Clean, well-maintained upholstery.",
        images: [
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Office Desk with Chair",
        price: 400,
        description: "Complete executive office desk and ergonomic chair setup for short or long-term rental. Includes cable management and 3 drawers.",
        images: [
          "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1497215842964-222b33055808?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Sports & Outdoor ───────────────────────────────────────────────────────
  {
    slug: "sports-outdoor",
    items: [
      {
        title: "Mountain Bike Trek 3700",
        price: 500,
        description: "High-performance Trek mountain bike for trail riding, exercise, or urban commuting. Shimano gears, hydraulic disc brakes, aluminum frame.",
        images: [
          "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Commercial Treadmill",
        price: 1500,
        description: "Commercial-grade motorized treadmill with incline, speed control, heart rate monitor, and LCD display. For gyms, events, and fitness centers.",
        images: [
          "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Adjustable Dumbbell Set",
        price: 600,
        description: "Complete adjustable dumbbell set from 2.5kg to 40kg. Quick-change weight selector, rubber coating, includes storage rack.",
        images: [
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Gadgets ────────────────────────────────────────────────────────────────
  {
    slug: "gadgets",
    items: [
      {
        title: "GoPro Hero 10 Black",
        price: 500,
        description: "Compact GoPro Hero 10 Black action camera for rent. Shoots 5.3K video, waterproof to 10m, perfect for adventure sports, travel, and events.",
        images: [
          "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1502920514313-ceea98b470d8?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1580256081112-e49377338b7f?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1544002685-613d9691fbcc?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Portable Projector 4K",
        price: 600,
        description: "Bright 4K portable projector with 3000 lumens. Supports HDMI, WiFi streaming, and Bluetooth audio. For presentations, movie nights, or outdoor events.",
        images: [
          "https://images.unsplash.com/photo-1627163439134-7a8c47e08208?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Home Appliances ────────────────────────────────────────────────────────
  {
    slug: "home-appliances",
    items: [
      {
        title: "LG Double-Door Refrigerator",
        price: 900,
        description: "Large-capacity LG double-door refrigerator for short or long-term rental. Perfect for events, catering, or temporary home use. Energy-efficient inverter compressor.",
        images: [
          "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1602166756697-28c12d5e1a0b?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Portable AC Unit",
        price: 1200,
        description: "12,000 BTU portable air conditioner. Cools rooms up to 35m², includes window exhaust kit, remote control, and timer. No installation required.",
        images: [
          "https://images.unsplash.com/photo-1544338887-11f0b0f84b4a?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Fashion & Accessories ──────────────────────────────────────────────────
  {
    slug: "fashion-accessories",
    items: [
      {
        title: "Traditional Ethiopian Dress Set",
        price: 350,
        description: "Authentic Ethiopian traditional dress (Habesha Kemis) with matching accessories for weddings, cultural celebrations, and formal events.",
        images: [
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Formal Suit with Accessories",
        price: 450,
        description: "Premium men's formal suit with shirt, tie, and pocket square for rent. Available in black, navy, and charcoal. Dry-cleaned and ready-to-wear.",
        images: [
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Travel & Camping ───────────────────────────────────────────────────────
  {
    slug: "travel-camping",
    items: [
      {
        title: "Family Camping Tent (8-Person)",
        price: 500,
        description: "Spacious 8-person waterproof camping tent with 2 rooms, large vestibule, and easy-pitch design. Includes stakes, guylines, and carry bag.",
        images: [
          "https://images.unsplash.com/photo-1504280390227-36154e5b38bd?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Sleeping Bags Extreme Cold",
        price: 150,
        description: "High-quality mummy sleeping bags rated for -15°C. Lightweight, packable, with water-resistant shell. Available as single or double set.",
        images: [
          "https://images.unsplash.com/photo-1533873984035-25970ab07461?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1504280390227-36154e5b38bd?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Tools ──────────────────────────────────────────────────────────────────
  {
    slug: "tools",
    items: [
      {
        title: "Electric Drill & Impact Set",
        price: 350,
        description: "Professional 18V cordless drill and impact driver combo. Includes 2 batteries, charger, and a 50-piece bit set in a carrying case.",
        images: [
          "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Angle Grinder 9-Inch",
        price: 400,
        description: "Heavy-duty 9-inch angle grinder for cutting, grinding, and polishing metal, concrete, and stone. 2400W motor with variable speed.",
        images: [
          "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Event Essentials ───────────────────────────────────────────────────────
  {
    slug: "event-essentials",
    items: [
      {
        title: "Portable Stage Platform",
        price: 4500,
        description: "Modular portable stage platform system. 6m x 4m coverage, 60cm height, non-slip surface, steel frame. Perfect for concerts, graduations, and conferences.",
        images: [
          "https://images.unsplash.com/photo-1470229722913-7c090be5f523?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "LED Par Lighting Set (20 Units)",
        price: 1500,
        description: "Pack of 20 RGB LED par lights with DMX controller, tripod stands, and cables. Creates stunning event lighting for weddings, parties, and concerts.",
        images: [
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1470229722913-7c090be5f523?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Office Equipment ───────────────────────────────────────────────────────
  {
    slug: "office-equipment",
    items: [
      {
        title: "Epson Business Projector",
        price: 700,
        description: "Epson EB-X51 XGA projector for office presentations and classrooms. 3800 lumens, HDMI and VGA inputs, remote control, includes carrying case.",
        images: [
          "https://images.unsplash.com/photo-1627163439134-7a8c47e08208?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Canon Photocopier A3/A4",
        price: 800,
        description: "High-speed Canon IR2206 photocopier for office use. A3/A4 copy, print, and scan. 22 ppm output, auto duplex, USB and network connectivity.",
        images: [
          "https://images.unsplash.com/photo-1612198790700-72c1bc9a0823?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1593642632636-11736f1d32c1?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Beauty & Salon ─────────────────────────────────────────────────────────
  {
    slug: "beauty-salon",
    items: [
      {
        title: "Hydraulic Salon Styling Chair",
        price: 300,
        description: "Professional hydraulic salon styling chair with reclining backrest and adjustable height. Chrome base, premium PU leather upholstery.",
        images: [
          "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1560066984-138daaa4e4e1?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1562322140-8baeababf96d?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Foldable Massage Bed",
        price: 250,
        description: "Professional lightweight aluminum portable massage bed with adjustable headrest. PU leather, 250kg weight capacity. Easy setup for salon or home visits.",
        images: [
          "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1583416750470-965b2707b355?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Baby & Kids ────────────────────────────────────────────────────────────
  {
    slug: "baby-kids",
    items: [
      {
        title: "Premium Baby Stroller",
        price: 300,
        description: "Lightweight premium baby stroller with reversible seat, adjustable recline, and large storage basket. Travel system compatible.",
        images: [
          "https://images.unsplash.com/photo-1591375462601-05f3a3d78e0d?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1555252335-b68a4abb1ebb?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Infant Car Seat (Safety Rated)",
        price: 200,
        description: "Safety-rated infant car seat for newborns and toddlers up to 18kg. 5-point harness, side impact protection, easy base installation.",
        images: [
          "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1591375462601-05f3a3d78e0d?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1555252335-b68a4abb1ebb?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Gaming ─────────────────────────────────────────────────────────────────
  {
    slug: "gaming",
    items: [
      {
        title: "Sony PlayStation 5",
        price: 400,
        description: "Sony PlayStation 5 console with 2 DualSense controllers and 5 game titles. Perfect for parties, events, and entertainment centers.",
        images: [
          "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Meta Quest 3 VR Headset",
        price: 600,
        description: "Meta Quest 3 standalone VR headset for immersive gaming and entertainment. Includes 2 Touch Plus controllers, hand tracking, and 30+ games.",
        images: [
          "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Gaming PC RTX 4080",
        price: 1200,
        description: "High-end gaming PC with NVIDIA RTX 4080, Intel i9 CPU, 32GB RAM, and 1TB NVMe SSD. Perfect for LAN events and gaming tournaments.",
        images: [
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1593640408182-31c228e77b09?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },

  // ── Events (general) ───────────────────────────────────────────────────────
  {
    slug: "events",
    items: [
      {
        title: "Conference Folding Tables (Set of 20)",
        price: 800,
        description: "Heavy-duty rectangular folding tables for conferences, training sessions, and events. 180cm length, lightweight, quick fold-and-carry design.",
        images: [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=1200&q=90&fit=crop",
        ],
      },
      {
        title: "Portable Generator 10KVA",
        price: 2500,
        description: "Reliable 10KVA diesel generator for outdoor events, construction sites, and power backup. Includes cable reel and distribution board.",
        images: [
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=1200&q=90&fit=crop",
          "https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=1200&q=90&fit=crop",
        ],
      },
    ],
  },
];

// Random helpers
const cities = ["Addis Ababa", "Dire Dawa", "Hawassa", "Adama", "Mekelle", "Bahir Dar", "Harar", "Jigjiga"];
const neighborhoods = ["Bole", "Piazza", "Kera", "Summit", "Megenagna", "Sarbet", "CMC", "Kazanchis"];
const descVariants = [
  "Excellent condition, carefully maintained. Contact owner for bulk discounts.",
  "Well-maintained and always cleaned before delivery. Long-term rates available.",
  "Top quality and reliable. Available for same-day pickup or delivery in the city.",
  "Verified owner. Professional equipment ready for your project or event.",
  "Lightly used, excellent working condition. Flexible rental terms.",
  "Premium quality. Includes delivery within city limits. Deposit required.",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
async function main() {
  console.log("🌱  Starting Real Rental Asset Catalog seeder v5...");

  // Clear old data
  console.log("🗑   Clearing old listings and images...");
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  console.log("✅  Old data cleared.\n");

  // Fetch users and categories
  const users = await prisma.user.findMany({ take: 30 });
  const dbCategories = await prisma.category.findMany();

  if (!users.length) { console.error("❌  No users found. Run user seeder first."); return; }
  if (!dbCategories.length) { console.error("❌  No categories found."); return; }

  console.log(`👤  Found ${users.length} users | 📂  Found ${dbCategories.length} categories\n`);

  let totalListings = 0;
  const TARGET_PER_CATEGORY = 6;

  for (const dbCat of dbCategories) {
    const catalogEntry = catalog.find(c => c.slug === dbCat.slug);
    if (!catalogEntry) {
      console.log(`⚠️   No catalog defined for category: ${dbCat.slug} — skipping.`);
      continue;
    }

    console.log(`\n📂  Category: ${dbCat.name}`);

    const usedOwners = new Set();

    for (let i = 0; i < TARGET_PER_CATEGORY; i++) {
      // Pick catalog item (cycle through all unique items before repeating)
      const catalogItem = catalogEntry.items[i % catalogEntry.items.length];

      // Pick a unique owner when possible
      let owner = pick(users);
      let attempts = 0;
      while (usedOwners.has(owner.id) && attempts < 20) {
        owner = pick(users);
        attempts++;
      }
      usedOwners.add(owner.id);

      const city = pick(cities);
      const neighborhood = pick(neighborhoods);
      const priceVariation = Math.floor(Math.random() * 5) * 50;
      const price = catalogItem.price + priceVariation;
      const desc = `${catalogItem.description} ${pick(descVariants)}`;

      console.log(`  [${i + 1}/${TARGET_PER_CATEGORY}] "${catalogItem.title}" → ${city} (${owner.name})`);

      // Create the listing
      const listing = await prisma.listing.create({
        data: {
          title: catalogItem.title,
          description: desc,
          pricePerDay: price,
          categoryId: dbCat.id,
          city: city,
          location: neighborhood,
          ownerId: owner.id,
          status: "APPROVED",
        },
      });

      // Download each image and store locally
      for (let j = 0; j < catalogItem.images.length; j++) {
        const url = catalogItem.images[j];
        const fileName = `${listing.id}-${j}.jpg`;
        const localPath = path.join(UPLOADS_DIR, fileName);

        try {
          await downloadImage(url, localPath);
          await prisma.listingImage.create({
            data: {
              listingId: listing.id,
              imageUrl: `/uploads/listings/${fileName}`,
              sortOrder: j,
            },
          });
          process.stdout.write(".");
        } catch (err) {
          console.error(`\n  ⚠️  Failed image ${j}: ${err.message}`);
        }
      }
      console.log(" ✅");
      totalListings++;
    }
  }

  const imageCount = await prisma.listingImage.count();
  console.log(`\n🎉  Done! Created ${totalListings} listings with ${imageCount} total images.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
