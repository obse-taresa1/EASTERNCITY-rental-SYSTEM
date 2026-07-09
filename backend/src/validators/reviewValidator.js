const { z } = require('zod');
const { parseWithSchema } = require('./validationHelpers');

const reviewSchema = z.object({
  listingId: z.string().uuid('listingId is required.'),
  bookingId: z.string().uuid('bookingId is required.'),
  rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5.').max(5, 'Rating must be between 1 and 5.'),
  comment: z.string().optional().default(''),
});

module.exports = {
  validateReview: (req, res, next) => parseWithSchema(reviewSchema, req, res, next),
};