/*
 * One-time migration for legacy local uploads.
 *
 * Dry run:
 *   node scripts/migrateLocalUploadsToCloudinary.js
 *
 * Execute:
 *   node scripts/migrateLocalUploadsToCloudinary.js --execute
 *
 * The migration never deletes files from backend/uploads. It uploads an asset
 * first and updates database references only after the upload succeeds.
 */
require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const prisma = require('../src/config/db');
const { uploadBuffer } = require('../src/config/cloudinary');

const uploadsRoot = path.join(__dirname, '..', 'uploads');
const execute = process.argv.includes('--execute');
const progressFile = path.join(__dirname, '..', 'data', 'cloudinary-upload-migration.json');
const supportedExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.pdf', '.png', '.webp', '.mp4', '.webm']);

const databaseColumns = [
  ['ListingImage', 'imageUrl'],
  ['Listing', 'paymentProofUrl'],
  ['User', 'profileImageUrl'],
  ['User', 'nationalIdFrontUrl'],
  ['User', 'nationalIdBackUrl'],
  ['VerificationRequest', 'nationalIdFrontUrl'],
  ['VerificationRequest', 'nationalIdBackUrl'],
  ['Promotion', 'paymentProofUrl'],
  ['AdvertisingRequest', 'bannerUrl'],
  ['AdvertisingRequest', 'paymentProofUrl'],
  ['Media', 'url'],
];

function contentType(filePath) {
  const typeByExtension = {
    '.avif': 'image/avif',
    '.gif': 'image/gif',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
  };
  return typeByExtension[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function listFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...await listFiles(target));
    else if (entry.isFile() && (await fs.stat(target)).size > 0 && supportedExtensions.has(path.extname(entry.name).toLowerCase())) results.push(target);
  }

  return results;
}

async function readProgress() {
  try {
    const data = JSON.parse(await fs.readFile(progressFile, 'utf8'));
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

async function saveProgress(progress) {
  await fs.mkdir(path.dirname(progressFile), { recursive: true });
  await fs.writeFile(progressFile, `${JSON.stringify(progress, null, 2)}\n`);
}

function legacyUrl(filePath) {
  const relative = path.relative(uploadsRoot, filePath).split(path.sep).map(encodeURIComponent).join('/');
  return `/uploads/${relative}`;
}

function cloudPublicId(filePath) {
  const relative = path.relative(uploadsRoot, filePath).split(path.sep).join('/');
  return relative.slice(0, -path.extname(relative).length).replace(/[^a-zA-Z0-9/_-]/g, '-');
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function uploadWithRetry(filePath) {
  const buffer = await fs.readFile(filePath);
  const file = { buffer, mimetype: contentType(filePath), originalname: path.basename(filePath) };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await uploadBuffer(file, 'eastern-cities/legacy', {
        publicId: cloudPublicId(filePath),
        overwrite: true,
      });
    } catch (error) {
      const retryable = !error.statusCode || [420, 429, 500, 502, 503, 504].includes(error.statusCode);
      if (!retryable || attempt === 4) throw error;
      const delay = 1500 * (2 ** attempt);
      console.warn(`Cloudinary upload retry ${attempt + 1}/4 for ${path.basename(filePath)} in ${delay}ms.`);
      await wait(delay);
    }
  }
}

async function updateReferences(oldUrl, newUrl) {
  // One short statement avoids both long interactive transactions and repeated
  // connection checkout through Neon/PgBouncer for every database column.
  const updates = databaseColumns.map(([table, column], index) => `
    update_${index} AS (
      UPDATE "${table}"
      SET "${column}" = $1
      WHERE "${column}" = $2
      RETURNING 1
    )`).join(',');
  const counters = databaseColumns.map((_, index) => `(SELECT count(*) FROM update_${index})`).join(' + ');

  const query = () => prisma.$queryRawUnsafe(`
    WITH${updates},
    update_settings AS (
      UPDATE "SystemSetting"
      SET "value" = replace("value", $2, $1)
      WHERE "value" LIKE '%' || $2 || '%'
      RETURNING 1
    )
    SELECT ${counters} + (SELECT count(*) FROM update_settings) AS "updates"
  `, newUrl, oldUrl);
  const [result] = await prisma.$withRetry(query);

  return Number(result?.updates || 0);
}

async function main() {
  const files = (await listFiles(uploadsRoot)).sort();
  const totalBytes = (await Promise.all(files.map((file) => fs.stat(file)))).reduce((total, stat) => total + stat.size, 0);

  console.log(`Found ${files.length} supported files (${(totalBytes / 1024 / 1024).toFixed(2)} MB).`);
  if (!execute) {
    console.log('Dry run only. Re-run with --execute to upload and update database URLs.');
    return;
  }

  const progress = await readProgress();
  let migrated = 0;
  let skipped = 0;
  let invalid = 0;
  let referencesUpdated = 0;

  for (const [index, filePath] of files.entries()) {
    const oldUrl = legacyUrl(filePath);
    const key = path.relative(uploadsRoot, filePath).split(path.sep).join('/');
    const existing = progress[key];

    try {
      if (existing?.url) {
        skipped += 1;
        referencesUpdated += await updateReferences(oldUrl, existing.url);
      } else if (existing?.error) {
        invalid += 1;
      } else {
        const asset = await uploadWithRetry(filePath);
        progress[key] = { url: asset.url, publicId: asset.publicId, migratedAt: new Date().toISOString() };
        await saveProgress(progress);
        referencesUpdated += await updateReferences(oldUrl, asset.url);
        migrated += 1;
        await wait(120);
      }

      if ((index + 1) % 25 === 0 || index === files.length - 1) {
        console.log(`${index + 1}/${files.length} processed; ${migrated} uploaded, ${skipped} resumed, ${invalid} invalid, ${referencesUpdated} database references updated.`);
      }
    } catch (error) {
      if (
        error.statusCode === 400
        && /(resource is invalid|invalid image file|invalid video file|unsupported image type)/i.test(error.message)
      ) {
        progress[key] = { error: error.message, failedAt: new Date().toISOString() };
        invalid += 1;
        await saveProgress(progress);
        console.warn(`Skipped invalid legacy file: ${key}`);
        continue;
      }

      console.error(`Failed: ${key}\n${error.message}`);
      await saveProgress(progress);
      throw error;
    }
  }

  console.log(`Migration complete. ${migrated} uploaded, ${skipped} resumed, ${invalid} invalid, ${referencesUpdated} database references updated.`);
  console.log(`Local backup retained at ${uploadsRoot}`);
}

main()
  .catch((error) => {
    console.error('Migration stopped. Re-run with --execute to resume from the progress file.');
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
