const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, 'uploads', 'listings', 'generated');

async function processDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.webp')) {
      const stats = fs.statSync(fullPath);
      if (stats.size > 80000) { // Only process images larger than ~80KB
        try {
          const tempPath = fullPath + '.tmp';
          await sharp(fullPath)
            .resize({ width: 800, height: 600, fit: 'cover', withoutEnlargement: true })
            .webp({ quality: 75 })
            .toFile(tempPath);
          
          // Ensure the target file can be overwritten on Windows
          try { fs.unlinkSync(fullPath); } catch (e) { /* ignore if not exists */ }
          fs.renameSync(tempPath, fullPath);

          const newStats = fs.statSync(fullPath);
          console.log(`Resized: ${entry.name} (${Math.round(stats.size/1024)}KB -> ${Math.round(newStats.size/1024)}KB)`);
        } catch (err) {
          console.error(`Failed to resize ${fullPath}:`, err);
        }
      }
    }
  }
}

console.log('Starting image resize for generated listings...');
processDirectory(dir).then(() => console.log('Done.')).catch(console.error);
