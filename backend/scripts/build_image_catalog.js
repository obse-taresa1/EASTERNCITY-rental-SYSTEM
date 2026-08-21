const { image_search } = require('duckduckgo-images-api');
const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'data', 'imageCatalog.json');

const itemsToSearch = [
  { key: 'toyota-corolla', name: 'Toyota Corolla 2021 silver', category: 'Cars & Bikes', angles: ['front view', 'rear view', 'left side profile', 'interior dashboard', 'steering wheel', 'trunk open', 'driving', 'headlight'] },
  { key: 'canon-eos-90d', name: 'Canon EOS 90D DSLR', category: 'Electronics & Cameras', angles: ['front body', 'rear screen', 'lens attached', 'side profile', 'in use photographer', 'buttons close up', 'top display', 'battery compartment'] },
  { key: 'ps5', name: 'Sony PlayStation 5 console', category: 'Gaming', angles: ['front standing', 'back ports', 'dualsense controller', 'laying horizontal', 'box packaging', 'disc drive', 'glowing lights', 'connected to tv'] },
  { key: 'wedding-tent', name: 'Large white event wedding tent', category: 'Party & Wedding', angles: ['exterior daytime', 'interior empty', 'setup tables chairs', 'night lighting', 'entrance', 'side view', 'ceiling draping', 'dance floor inside'] },
  { key: 'concrete-mixer', name: 'Heavy duty concrete mixer machine orange', category: 'Construction & DIY', angles: ['front', 'side profile', 'engine close up', 'drum inside', 'wheels', 'in use construction site', 'loading sand', 'back view'] }
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function buildCatalog() {
  const catalog = {};
  
  for (const item of itemsToSearch) {
    console.log(`Processing: ${item.name}`);
    catalog[item.key] = {
      name: item.name,
      category: item.category,
      images: []
    };
    
    for (const angle of item.angles) {
      const query = `${item.name} ${angle}`;
      try {
        console.log(`  Searching: ${query}`);
        const results = await image_search({ query: query, moderate: true });
        if (results && results.length > 0) {
          // Take the first valid result
          catalog[item.key].images.push({
            file: results[0].image,
            angle: angle
          });
        } else {
           console.log(`  No results for ${query}`);
        }
        await delay(1000); // Rate limit protection
      } catch (err) {
        console.error(`  Error searching ${query}:`, err.message);
      }
    }
  }
  
  // Ensure the data directory exists
  const dataDir = path.dirname(catalogPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  console.log('✅ Catalog saved to', catalogPath);
}

buildCatalog();
