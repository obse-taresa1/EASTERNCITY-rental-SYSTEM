/*
 * Removes obsolete public Cloudinary copies after secureLegacySensitiveUploads.js
 * has replaced every database reference with authenticated assets.
 *
 * Preview:
 *   node scripts/removeLegacyPublicSensitiveUploads.js
 *
 * Execute:
 *   node scripts/removeLegacyPublicSensitiveUploads.js --execute
 */
require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const prisma = require('../src/config/db');
const { destroyAsset } = require('../src/config/cloudinary');

const execute = process.argv.includes('--execute');
const backendRoot = path.join(__dirname, '..');
const privateProgressFile = path.join(backendRoot, 'data', 'cloudinary-private-upload-migration.json');
const sourceProgressFile = path.join(backendRoot, 'data', 'cloudinary-upload-migration.json');
const cleanupProgressFile = path.join(backendRoot, 'data', 'cloudinary-private-cleanup.json');

const allReferenceSources = [
  ['listingImage', 'imageUrl'],
  ['listing', 'paymentProofUrl'],
  ['user', 'profileImageUrl'],
  ['user', 'nationalIdFrontUrl'],
  ['user', 'nationalIdBackUrl'],
  ['verificationRequest', 'nationalIdFrontUrl'],
  ['verificationRequest', 'nationalIdBackUrl'],
  ['promotion', 'paymentProofUrl'],
  ['advertisingRequest', 'bannerUrl'],
  ['advertisingRequest', 'paymentProofUrl'],
  ['media', 'url'],
];

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8')) || {};
  } catch {
    return {};
  }
}

async function saveProgress(progress) {
  await fs.writeFile(cleanupProgressFile, `${JSON.stringify(progress, null, 2)}\n`);
}

function resourceTypeFor(relativePath) {
  const extension = path.extname(relativePath).toLowerCase();
  if (extension === '.pdf') return 'raw';
  if (['.mp4', '.webm'].includes(extension)) return 'video';
  return 'image';
}

async function activeReferences(urls) {
  const matches = new Map(urls.map((url) => [url, []]));
  for (const [model, field] of allReferenceSources) {
    const rows = await prisma.$withRetry(() => prisma[model].findMany({
      select: { id: true, [field]: true },
    }));
    for (const row of rows) {
      if (matches.has(row[field])) matches.get(row[field]).push(`${model}.${field}:${row.id}`);
    }
  }
  return matches;
}

async function main() {
  const [privateProgress, sourceProgress, cleanupProgress] = await Promise.all([
    readJson(privateProgressFile),
    readJson(sourceProgressFile),
    readJson(cleanupProgressFile),
  ]);
  const sourceByUrl = new Map(
    Object.entries(sourceProgress)
      .filter(([, asset]) => asset?.url && asset?.publicId)
      .map(([relativePath, asset]) => [asset.url, { relativePath, ...asset }]),
  );
  const candidates = Object.values(privateProgress)
    .map((entry) => sourceByUrl.get(entry.sourceUrl))
    .filter(Boolean);
  const referencesByUrl = await activeReferences(candidates.map((candidate) => candidate.url));

  let eligible = 0;
  let stillReferenced = 0;
  let alreadyRemoved = 0;
  let removed = 0;

  for (const candidate of candidates) {
    if (cleanupProgress[candidate.url]?.removedAt) {
      alreadyRemoved += 1;
      continue;
    }

    const references = referencesByUrl.get(candidate.url) || [];
    if (references.length) {
      stillReferenced += 1;
      console.warn(`Retained referenced public asset: ${candidate.publicId} (${references.join(', ')})`);
      continue;
    }

    eligible += 1;
    if (!execute) continue;

    await destroyAsset({
      cloudinaryPublicId: candidate.publicId,
      cloudinaryResourceType: resourceTypeFor(candidate.relativePath),
    }, { suppressErrors: false });
    cleanupProgress[candidate.url] = { removedAt: new Date().toISOString(), publicId: candidate.publicId };
    await saveProgress(cleanupProgress);
    removed += 1;
  }

  console.log(`Found ${candidates.length} obsolete public sensitive candidates.`);
  console.log(`${eligible} eligible, ${stillReferenced} retained because still referenced, ${alreadyRemoved} already removed.`);
  if (!execute) {
    console.log('Dry run only. Re-run with --execute to permanently delete only eligible public Cloudinary originals.');
  } else {
    console.log(`Cleanup complete. ${removed} public original(s) permanently removed.`);
  }
}

main()
  .catch((error) => {
    console.error(`Public sensitive cleanup stopped. ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
