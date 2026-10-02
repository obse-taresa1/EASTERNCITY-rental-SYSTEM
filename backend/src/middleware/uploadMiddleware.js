const multer = require("multer");
const { destroyAsset, privateReference, uploadBuffer } = require('../config/cloudinary');

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const PAYMENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

function imageFilter(req, file, cb) {
  if (!IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, and WEBP images are allowed."));
  }
  cb(null, true);
}

function paymentFilter(req, file, cb) {
  if (!PAYMENT_TYPES.includes(file.mimetype)) {
    return cb(new Error("Payment proof must be JPG, PNG, WEBP, or PDF."));
  }
  cb(null, true);
}

function communityFilter(req, file, cb) {
  if (!IMAGE_TYPES.includes(file.mimetype) && !['video/mp4', 'video/webm'].includes(file.mimetype)) {
    return cb(new Error('Community media must be an image, MP4, or WEBM video.'));
  }
  cb(null, true);
}

function requestFiles(req) {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === 'object') return Object.values(req.files).flat();
  return [];
}

function cloudUpload(options) {
  return async (req, res, next) => {
    const files = requestFiles(req);
    const uploaded = [];

    try {
      for (const file of files) {
        const uploadOptions = typeof options === 'function' ? options(file) : options;
        const asset = await uploadBuffer(file, `eastern-cities/${uploadOptions.folder}`, uploadOptions);
        Object.assign(file, {
          cloudinaryPublicId: asset.publicId,
          cloudinaryResourceType: asset.resourceType,
          cloudinaryDeliveryType: asset.deliveryType,
          cloudinaryUrl: asset.deliveryType === 'authenticated' ? privateReference(asset) : asset.url,
          path: asset.url,
          filename: asset.publicId.split('/').pop(),
        });
        uploaded.push(file);
      }
      next();
    } catch (error) {
      await Promise.all(uploaded.map((file) => destroyAsset(file)));
      next(error);
    }
  };
}

function createUploader(options, fileFilter, limits = {}) {
  const parser = multer({ storage: multer.memoryStorage(), fileFilter, limits });
  const withCloudinary = (handler) => [handler, cloudUpload(options)];
  return {
    array: (field, maxCount) => withCloudinary(parser.array(field, maxCount)),
    fields: (fields) => withCloudinary(parser.fields(fields)),
    single: (field) => withCloudinary(parser.single(field)),
  };
}

const imageLimits = { fileSize: 5 * 1024 * 1024 };
const listingUpload = createUploader(
  (file) => file.fieldname === 'paymentProof'
    ? { folder: 'payments', deliveryType: 'authenticated' }
    : { folder: 'listings' },
  imageFilter,
  imageLimits,
);
const paymentUpload = createUploader({ folder: 'payments', deliveryType: 'authenticated' }, paymentFilter, imageLimits);
const verificationUpload = createUploader({ folder: 'verification', deliveryType: 'authenticated' }, imageFilter, imageLimits);
const profileUpload = createUploader({ folder: 'profiles' }, imageFilter, imageLimits);
const bannerUpload = createUploader({ folder: 'banners' }, imageFilter, imageLimits);
const advertisingUpload = createUploader({ folder: 'advertising-requests' }, imageFilter, imageLimits);
const communityUpload = createUploader({ folder: 'community' }, communityFilter, { fileSize: 8 * 1024 * 1024, files: 5 });

module.exports = {
  listingImages: listingUpload.fields([
    { name: "images", maxCount: 8 },
    { name: "paymentProof", maxCount: 1 },
  ]),
  paymentProof: paymentUpload.single("paymentProof"),
  profileImage: profileUpload.single("profileImage"),
  bannerImage: bannerUpload.single("bannerImage"),
  advertisingBanner: advertisingUpload.single("banner"),
  advertisingReceipt: paymentUpload.single("paymentProof"),
  communityMedia: communityUpload.array('media', 5),
  verificationDocuments: verificationUpload.fields([
    { name: "nationalIdFront", maxCount: 1 },
    { name: "nationalIdBack", maxCount: 1 },
  ]),
};
