const { z } = require('zod');
const { parseWithSchema } = require('./validationHelpers');

const moneySchema = z.coerce.number().positive('Amount must be greater than 0.');

const createBookingSchema = z.object({
  listingId: z.string().uuid('listingId is required.'),
  ownerId: z.string().uuid('ownerId is required.'),
  startDate: z.coerce.date({ errorMap: () => ({ message: 'startDate is required.' }) }),
  endDate: z.coerce.date({ errorMap: () => ({ message: 'endDate is required.' }) }),
  subtotal: moneySchema,
  serviceFee: z.coerce.number().min(0, 'serviceFee must be zero or greater.'),
  totalAmount: moneySchema,
  agreementAccepted: z.preprocess((value) => value === true || value === 'true', z.literal(true, {
    errorMap: () => ({ message: 'Rental agreement must be accepted.' }),
  })),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'endDate must be after startDate.',
  path: ['endDate'],
});

module.exports = {
  validateCreateBooking: (req, res, next) => parseWithSchema(createBookingSchema, req, res, next),
};