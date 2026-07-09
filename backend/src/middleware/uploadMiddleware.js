const path = require("path");
const multer = require("multer");

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const PAYMENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

function safeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "-");
}

function createStorage(folder) {
  return multer.diskStorage({
    destination(req, file, cb) {
      cb(null, path.join(process.cwd(), "uploads", folder));
    },
    filename(req, file, cb) {
      cb(null, `${Date.now()}-${safeFilename(file.originalname)}`);
    },
  });
}

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

const listingUpload = multer({
  storage: createStorage("listings"),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

const paymentUpload = multer({
  storage: createStorage("payments"),
  fileFilter: paymentFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

module.exports = {
  listingImages: listingUpload.fields([
    { name: "images", maxCount: 8 },
    { name: "paymentProof", maxCount: 1 },
  ]),
  paymentProof: paymentUpload.single("paymentProof"),
};
