const crypto = require('crypto');

const REQUIRED_ENVIRONMENT_VARIABLES = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

function assertCloudinaryConfigured() {
  const missing = REQUIRED_ENVIRONMENT_VARIABLES.filter((key) => !process.env[key]);
  if (missing.length) {
    const error = new Error(`Cloudinary is not configured. Missing: ${missing.join(', ')}`);
    error.statusCode = 503;
    throw error;
  }
}

function signUploadParameters(parameters) {
  const payload = Object.entries(parameters)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(`${payload}${process.env.CLOUDINARY_API_SECRET}`)
    .digest('hex');
}

function resourceTypeFor(file) {
  if (file.mimetype === 'application/pdf') return 'raw';
  if (file.mimetype?.startsWith('video/')) return 'video';
  return 'image';
}

async function uploadBuffer(file, folder, options = {}) {
  assertCloudinaryConfigured();

  if (!file?.buffer?.length) {
    throw new Error('The uploaded file could not be read.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const resourceType = resourceTypeFor(file);
  const uploadParameters = {
    folder,
    timestamp,
    ...(options.deliveryType && options.deliveryType !== 'upload' ? { type: options.deliveryType } : {}),
    ...(options.publicId ? { public_id: options.publicId } : {}),
    ...(options.overwrite ? { overwrite: 'true' } : {}),
  };
  const signature = signUploadParameters(uploadParameters);
  const form = new FormData();

  form.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname || 'upload');
  form.append('api_key', process.env.CLOUDINARY_API_KEY);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  if (options.deliveryType && options.deliveryType !== 'upload') form.append('type', options.deliveryType);
  if (options.publicId) form.append('public_id', options.publicId);
  if (options.overwrite) form.append('overwrite', 'true');
  form.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: 'POST', body: form },
  );
  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.secure_url || !result.public_id) {
    const error = new Error(result?.error?.message || 'Cloudinary could not store the uploaded file.');
    error.statusCode = response.status || 502;
    throw error;
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType,
    format: result.format,
    deliveryType: options.deliveryType || 'upload',
  };
}

function privateReference(asset) {
  return `cloudinary-private:${Buffer.from(JSON.stringify({
    publicId: asset.publicId,
    resourceType: asset.resourceType,
    format: asset.format,
    deliveryType: asset.deliveryType || 'authenticated',
  })).toString('base64url')}`;
}

function parsePrivateReference(value) {
  if (typeof value !== 'string' || !value.startsWith('cloudinary-private:')) return null;
  try {
    const details = JSON.parse(Buffer.from(value.slice('cloudinary-private:'.length), 'base64url').toString('utf8'));
    if (!details.publicId || !details.resourceType || !details.format) return null;
    return details;
  } catch {
    return null;
  }
}

function privateDownloadUrl(value, lifetimeSeconds = 300) {
  const details = parsePrivateReference(value);
  if (!details) return value || null;

  assertCloudinaryConfigured();
  const timestamp = Math.floor(Date.now() / 1000);
  const expiresAt = timestamp + lifetimeSeconds;
  const signature = signUploadParameters({
    attachment: 'false',
    expires_at: expiresAt,
    format: details.format,
    public_id: details.publicId,
    timestamp,
    type: details.deliveryType || 'authenticated',
  });
  const query = new URLSearchParams({
    api_key: process.env.CLOUDINARY_API_KEY,
    attachment: 'false',
    expires_at: String(expiresAt),
    format: details.format,
    public_id: details.publicId,
    signature,
    timestamp: String(timestamp),
    type: details.deliveryType || 'authenticated',
  });

  return `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${details.resourceType}/download?${query.toString()}`;
}

async function destroyAsset(asset, { suppressErrors = true } = {}) {
  if (!asset?.cloudinaryPublicId || !asset?.cloudinaryResourceType) return;

  try {
    assertCloudinaryConfigured();
    const timestamp = Math.floor(Date.now() / 1000);
    const parameters = {
      public_id: asset.cloudinaryPublicId,
      timestamp,
      ...(asset.cloudinaryDeliveryType && asset.cloudinaryDeliveryType !== 'upload'
        ? { type: asset.cloudinaryDeliveryType }
        : {}),
    };
    const signature = signUploadParameters(parameters);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${asset.cloudinaryResourceType}/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          public_id: asset.cloudinaryPublicId,
          api_key: process.env.CLOUDINARY_API_KEY,
          timestamp: String(timestamp),
          signature,
          ...(parameters.type ? { type: parameters.type } : {}),
        }),
      },
    );
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !['ok', 'not found'].includes(result.result)) {
      throw new Error(result?.error?.message || 'Cloudinary could not delete the asset.');
    }
    return result.result;
  } catch (error) {
    if (!suppressErrors) throw error;
    // Do not mask the original request failure if cleanup cannot complete.
    return null;
  }
}

module.exports = {
  destroyAsset,
  parsePrivateReference,
  privateDownloadUrl,
  privateReference,
  uploadBuffer,
};
