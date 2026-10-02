/*
 * One-time privacy upgrade for legacy National ID documents and payment proofs.
 *
 * Preview:
 *   node scripts/secureLegacySensitiveUploads.js
 *
 * Execute:
 *   node scripts/secureLegacySensitiveUploads.js --execute
 *
 * This script re-uploads only sensitive files as Cloudinary authenticated assets,
 * updates the exact database fields that reference them, and retains all files in
 * backend/uploads as the local backup.
 */
require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const prisma = require('../src/config/db');
const { privateReference, uploadBuffer } = require('../src/config/cloudinary');

const execute = process.argv.includes('--execute');
const backendRoot = path.join(__dirname, '..');
const uploadsRoot = path.join(backendRoot, 'uploads');
const sourceProgressFile = path.join(backendRoot, 'data', 'cloudinary-upload-migration.json');
const progressFile = path.join(backendRoot, 'data', 'cloudinary-private-upload-migration.json');

const sensitiveSources = [
  { model: 'listing', field: 'paymentProofUrl', folder: 'payments' },
  { model: 'promotion', field: 'paymentProofUrl', folder: 'payments' },
  { model: 'advertisingRequest', field: 'paymentProofUrl', folder: 'payments' },
  { model: 'user', field: 'nationalIdFrontUrl', folder: 'verification' },
  { model: 'user', field: 'nationalIdBackUrl', folder: 'verification' },
  { model: 'verificationRequest', field: 'nationalIdFrontUrl', folder: 'verification' },
  { model: 'verificationRequest', field: 'nationalIdBackUrl', folder: 'verification' },
];

function contentType(filePath) {
  const types = {
    '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.pdf': 'application/pdf',
  };
  return types[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function progressKey(sourceUrl) {
  return Buffer.from(sourceUrl).toString('base64url');
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8')) || {};
  } catch {
    return {};
  }
}

async function saveProgress(progress) {
  await fs.writeFile(progressFile, `${JSON.stringify(progress, null, 2)}\n`);
}

function privateAssetId(localPath) {
  const relative = path.relative(uploadsRoot, localPath).split(path.sep).join('/');
  return relative.slice(0, -path.extname(relative).length).replace(/[^a-zA-Z0-9/_-]/g, '-');
}

async function getReferences() {
  const records = [];
  for (const source of sensitiveSources) {
    const rows = await prisma.$withRetry(() => prisma[source.model].findMany({
      select: { id: true, [source.field]: true },
    }));
    for (const row of rows) {
      const value = row[source.field];
      if (value && !String(value).startsWith('cloudinary-private:')) {
        records.push({ ...source, id: row.id, sourceUrl: value });
      }
    }
  }
  return records;
}

async function applyReference(reference, value) {
  await prisma.$withRetry(() => prisma[reference.model].update({
    where: { id: reference.id },
    data: { [reference.field]: value },
  }));
}

async function main() {
  const sourceProgress = await readJson(sourceProgressFile);
  const oldUrlToFile = new Map();
  for (const [relativePath, asset] of Object.entries(sourceProgress)) {
    if (!asset?.url) continue;
    const localPath = path.join(uploadsRoot, ...relativePath.split('/'));
    oldUrlToFile.set(asset.url, localPath);
    oldUrlToFile.set(`/uploads/${relativePath}`, localPath);

    // A few early records omitted the upload subfolder in their stored URL.
    const rootStyleUrl = `/uploads/${path.basename(relativePath)}`;
    if (!oldUrlToFile.has(rootStyleUrl)) oldUrlToFile.set(rootStyleUrl, localPath);
  }
  const references = await getReferences();
  const grouped = new Map();

  for (const reference of references) {
    const list = grouped.get(reference.sourceUrl) || [];
    list.push(reference);
    grouped.set(reference.sourceUrl, list);
  }

  const unresolved = [...grouped.keys()].filter((url) => !oldUrlToFile.has(url));
  console.log(`Found ${references.length} legacy sensitive database references across ${grouped.size} files.`);
  console.log(`${unresolved.length} reference URL(s) do not have a matching local migration record.`);
  for (const sourceUrl of unresolved) {
    const reference = grouped.get(sourceUrl)?.[0];
    console.warn(`Unmatched reference: ${reference?.model}.${reference?.field} (${reference?.id}) -> ${sourceUrl}`);
  }
  if (!execute) {
    console.log('Dry run only. Re-run with --execute to secure matching files and update database references.');
    return;
  }

  const progress = await readJson(progressFile);
  let uploaded = 0;
  let resumed = 0;
  let updated = 0;
  let skipped = unresolved.length;
  const groups = [...grouped.entries()];

  for (const [index, [sourceUrl, group]] of groups.entries()) {
    const localPath = oldUrlToFile.get(sourceUrl);
    if (!localPath) continue;

    const key = progressKey(sourceUrl);
    let secureReference = progress[key]?.reference;
    if (secureReference) {
      resumed += 1;
    } else {
      const buffer = await fs.readFile(localPath);
      const asset = await uploadBuffer(
        { buffer, mimetype: contentType(localPath), originalname: path.basename(localPath) },
        `eastern-cities/${group[0].folder}`,
        { deliveryType: 'authenticated', publicId: privateAssetId(localPath), overwrite: true },
      );
      secureReference = privateReference(asset);
      progress[key] = {
        reference: secureReference,
        sourceUrl,
        localPath: path.relative(uploadsRoot, localPath).split(path.sep).join('/'),
        securedAt: new Date().toISOString(),
      };
      await saveProgress(progress);
      uploaded += 1;
    }

    for (const reference of group) {
      await applyReference(reference, secureReference);
      updated += 1;
    }

    if ((index + 1) % 10 === 0 || index === groups.length - 1) {
      console.log(`${index + 1}/${groups.length} files processed; ${uploaded} uploaded, ${resumed} resumed, ${updated} database references secured, ${skipped} skipped.`);
    }
  }

  console.log(`Privacy upgrade complete. ${uploaded} uploaded, ${resumed} resumed, ${updated} database references secured, ${skipped} skipped.`);
  console.log(`Local backup retained at ${uploadsRoot}`);
}

main()
  .catch((error) => {
    console.error(`Privacy upgrade stopped. ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
