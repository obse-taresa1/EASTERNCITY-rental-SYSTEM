const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'data', 'imageCatalog.json');

const catalog = {
  "toyota-corolla": {
    "name": "Toyota Corolla 2021",
    "category": "Cars & Bikes",
    "images": [
      { "file": "https://picsum.photos/seed/corolla-front/1200/800", "angle": "Front View" },
      { "file": "https://picsum.photos/seed/corolla-rear/1200/800", "angle": "Rear View" },
      { "file": "https://picsum.photos/seed/corolla-left/1200/800", "angle": "Left Side" },
      { "file": "https://picsum.photos/seed/corolla-right/1200/800", "angle": "Right Side" },
      { "file": "https://picsum.photos/seed/corolla-interior/1200/800", "angle": "Interior" },
      { "file": "https://picsum.photos/seed/corolla-dash/1200/800", "angle": "Dashboard" },
      { "file": "https://picsum.photos/seed/corolla-trunk/1200/800", "angle": "Trunk" },
      { "file": "https://picsum.photos/seed/corolla-engine/1200/800", "angle": "Engine" }
    ]
  },
  "canon-eos-90d": {
    "name": "Canon EOS 90D DSLR Camera",
    "category": "Electronics & Cameras",
    "images": [
      { "file": "https://picsum.photos/seed/canon-front/1200/800", "angle": "Front Body" },
      { "file": "https://picsum.photos/seed/canon-rear/1200/800", "angle": "Rear Screen" },
      { "file": "https://picsum.photos/seed/canon-lens/1200/800", "angle": "Lens" },
      { "file": "https://picsum.photos/seed/canon-side/1200/800", "angle": "Side Profile" },
      { "file": "https://picsum.photos/seed/canon-use/1200/800", "angle": "In Use" },
      { "file": "https://picsum.photos/seed/canon-top/1200/800", "angle": "Top Display" },
      { "file": "https://picsum.photos/seed/canon-battery/1200/800", "angle": "Battery Compartment" },
      { "file": "https://picsum.photos/seed/canon-buttons/1200/800", "angle": "Buttons" }
    ]
  },
  "wedding-tent": {
    "name": "Wedding Tent 500 Pax",
    "category": "Party & Wedding",
    "images": [
      { "file": "https://picsum.photos/seed/tent-ext/1200/800", "angle": "Exterior" },
      { "file": "https://picsum.photos/seed/tent-int/1200/800", "angle": "Interior" },
      { "file": "https://picsum.photos/seed/tent-setup/1200/800", "angle": "Setup Process" },
      { "file": "https://picsum.photos/seed/tent-night/1200/800", "angle": "Night Lighting" },
      { "file": "https://picsum.photos/seed/tent-entrance/1200/800", "angle": "Entrance" },
      { "file": "https://picsum.photos/seed/tent-side/1200/800", "angle": "Side View" },
      { "file": "https://picsum.photos/seed/tent-dance/1200/800", "angle": "Dance Floor" },
      { "file": "https://picsum.photos/seed/tent-tables/1200/800", "angle": "Tables" }
    ]
  },
  "concrete-mixer": {
    "name": "Heavy Duty Concrete Mixer",
    "category": "Construction & DIY",
    "images": [
      { "file": "https://picsum.photos/seed/mixer-front/1200/800", "angle": "Front" },
      { "file": "https://picsum.photos/seed/mixer-left/1200/800", "angle": "Left Side" },
      { "file": "https://picsum.photos/seed/mixer-right/1200/800", "angle": "Right Side" },
      { "file": "https://picsum.photos/seed/mixer-drum/1200/800", "angle": "Drum Close-up" },
      { "file": "https://picsum.photos/seed/mixer-motor/1200/800", "angle": "Engine/Motor" },
      { "file": "https://picsum.photos/seed/mixer-wheels/1200/800", "angle": "Wheels" },
      { "file": "https://picsum.photos/seed/mixer-work/1200/800", "angle": "Working" },
      { "file": "https://picsum.photos/seed/mixer-load/1200/800", "angle": "Loading" }
    ]
  }
};

const dataDir = path.dirname(catalogPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('✅ Fast catalog generated at', catalogPath);
