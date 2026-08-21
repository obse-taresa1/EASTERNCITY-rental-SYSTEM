const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/prepare-curated-generator-assets.js <generated-contact-sheet.png>');
const itemSlug = process.argv[3] || 'portable-generator';
const outputDir = path.resolve(__dirname, `../uploads/listings/curated/${itemSlug}`);
fs.mkdirSync(outputDir, { recursive: true });

// The generated sheet is a 2x2 gallery of the same physical generator.
sharp(source).metadata()
  .then(({ width, height }) => {
    const panelWidth = Math.floor(width / 2);
    const panelHeight = Math.floor(height / 2);
    const panels = [
      ['front.jpg', 0, 0],
      ['side.jpg', panelWidth, 0],
      ['control-panel.jpg', 0, panelHeight],
      ['rear.jpg', panelWidth, panelHeight],
    ];
    return Promise.all(panels.map(([name, left, top]) => sharp(source).extract({ left, top, width: panelWidth, height: panelHeight }).jpeg({ quality: 88 }).toFile(path.join(outputDir, name))));
  })
  .then(() => console.log(`Prepared 4 curated images in ${outputDir}`))
  .catch((error) => { console.error(error); process.exitCode = 1; });
