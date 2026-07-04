const { z } = require('zod');
const { cleanupUploadedFiles } = require('../utils/uploadCleanup');
const { firstZodMessage } = require('./validationHelpers');

const ALLOWED_PLACEMENTS = ['FEATURED', 'TOP_LISTING', 'HOME_BANNER'];

function rejectWithCleanup(req, res, message) {
  cleanupUploadedFiles(req);
  return res.status(400).json({ success: false, message });
}

const promotionSchema = z.object({
  listingId: z.string().uuid('listingId is required.'),
  packageType: z.string().trim().min(1, 'packageType is required.'),
  placement: z.enum(ALLOWED_PLACEMENTS, {
    errorMap: () => ({ message: 'Invalid promotion placement.' }),
  }),
  amount: z.coerce.number().positive('Amount must be greater than 0.'),
});

function validatePromotionRequest(req, res, next) {
  const result = promotionSchema.safeParse(req.body);
  if (!result.success) {
    return rejectWithCleanup(req, res, firstZodMessage(result.error));
  }

  req.body = result.data;
  next();
}

module.exports = {
  validatePromotionRequest,
};