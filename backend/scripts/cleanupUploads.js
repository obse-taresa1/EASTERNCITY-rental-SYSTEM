const fs = require("fs");
const path = require("path");

// Delete files older than thresholdDays in backend/uploads/* subfolders
const uploadsDir = path.join(process.cwd(), "uploads");
const thresholdDays = Number(process.env.UPLOAD_CLEANUP_DAYS || 7);
const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;

function removeOldFiles(folder) {
  if (!fs.existsSync(folder)) return;
  const entries = fs.readdirSync(folder, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      removeOldFiles(fullPath);
      continue;
    }

    try {
      const stats = fs.statSync(fullPath);
      const age = Date.now() - stats.mtimeMs;
      if (age > thresholdMs) {
        fs.unlinkSync(fullPath);
        console.log("Removed old upload:", fullPath);
      }
    } catch (err) {
      console.error("Error checking file:", fullPath, err.message);
    }
  }
}

removeOldFiles(uploadsDir);
console.log("Upload cleanup complete.");
