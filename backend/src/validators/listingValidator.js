const { z } = require('zod');
const { cleanupUploadedFiles } = require('../utils/uploadCleanup');
const { firstZodMessage } = require('./validationHelpers');

function rejectWithCleanup(req, res, message) {
  cleanupUploadedFiles(req);
  return res.status(400).json({ success: false, message });
}

const createListingSchema = z.object({
  title: z.string().trim().min(1, 'title is required.'),
  description: z.string().trim().min(1, 'description is required.'),
  categoryId: z.string().uuid('categoryId must be a valid category id.').optional(),
  categorySlug: z.string().trim().min(1).optional(),
  categoryName: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1, 'city is required.'),
  location: z.string().trim().min(1, 'location is required.'),
  pricePerDay: z.coerce.number().positive('pricePerDay must be greater than 0.'),
  status: z.string().optional().default('PENDING'),
  paymentMethod: z.string().optional(),
  paymentProofUrl: z.string().optional(),
  paymentStatus: z.string().optional(),
});

const updateListingSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  location: z.string().trim().min(1).optional(),
  pricePerDay: z.coerce.number().positive('pricePerDay must be greater than 0.').optional(),
});

function validateCreateListing(req, res, next) {
  const result = createListingSchema.safeParse(req.body);
  if (!result.success) {
    return rejectWithCleanup(req, res, firstZodMessage(result.error));
  }

  req.body = result.data;

  if (!req.body.categoryId && !req.body.categorySlug) {
    return rejectWithCleanup(req, res, 'category is required.');
  }

  const status = String(req.body.status || 'PENDING').toUpperCase();
  const paymentFiles = req.files?.paymentProof || [];
  const hasPaymentProof = paymentFiles.length > 0 || Boolean(req.body.paymentProofUrl);
  const hasPaymentMethod = Boolean(req.body.paymentMethod);

  if (status !== 'DRAFT' && !hasPaymentMethod) {
    return rejectWithCleanup(req, res, 'paymentMethod is required.');
  }

  if (status !== 'DRAFT' && !hasPaymentProof) {
    return rejectWithCleanup(req, res, 'paymentProof is required.');
  }

  next();
}

function validateUpdateListing(req, res, next) {
  const result = updateListingSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, message: firstZodMessage(result.error) });
  }

  req.body = result.data;
  next();
}

module.exports = {
  validateCreateListing,
  validateUpdateListing,
};
