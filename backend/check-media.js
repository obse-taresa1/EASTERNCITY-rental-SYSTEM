const fs = require('fs');
const data = JSON.parse(fs.readFileSync('listings_dump.json', 'utf8'));

// Group by URL pattern
const patterns = {};
for (const l of data) {
  const imgs = l.images || [];
  if (imgs.length === 0) { 
    if (!patterns['NO_IMAGES']) patterns['NO_IMAGES'] = [];
    patterns['NO_IMAGES'].push(l.title);
    continue; 
  }
  const url0 = imgs[0].imageUrl || '';
  let pattern;
  if (url0.includes('/curated/')) pattern = 'curated';
  else if (url0.includes('/representative/')) pattern = 'representative';
  else if (url0.includes('/generated/')) pattern = 'generated';
  else if (url0.startsWith('http')) pattern = 'external: ' + new URL(url0).hostname;
  else pattern = 'other: ' + url0.substring(0, 60);
  
  if (!patterns[pattern]) patterns[pattern] = [];
  patterns[pattern].push({ title: l.title, url: url0.substring(0, 120), count: imgs.length });
}

for (const [pat, items] of Object.entries(patterns)) {
  console.log(`\n=== ${pat} (${items.length} listings) ===`);
  items.forEach(i => {
    if (typeof i === 'string') console.log(`  - ${i}`);
    else console.log(`  - ${i.title} [${i.count} imgs] ${i.url}`);
  });
}

// Now find the "cooler box" listing specifically
console.log('\n\n=== COOLER BOX LISTING ===');
const cooler = data.find(l => l.title.toLowerCase().includes('cooler'));
if (cooler) {
  console.log(`Title: ${cooler.title}`);
  console.log(`City: ${cooler.city}`);
  console.log(`Images: ${(cooler.images||[]).length}`);
  (cooler.images||[]).forEach((img, i) => {
    console.log(`  [${i+1}] ${img.imageUrl}`);
  });
} else {
  console.log('Not found in dump');
}
