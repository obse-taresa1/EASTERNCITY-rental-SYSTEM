const { z } = require('zod');
const { VERIFICATION_STATUSES } = require('../utils/constants');
const { parseWithSchema } = require('./validationHelpers');

const verificationSubmissionSchema = z.object({
  city: z.string().trim().min(1, 'City is required.'),
  sefer: z.string().trim().min(1, 'Sefer is required.'),
  address: z.string().trim().optional().default(''),
});

const verificationDecisionSchema = z.object({
  status: z.enum([VERIFICATION_STATUSES.APPROVED, VERIFICATION_STATUSES.REJECTED], {
    errorMap: () => ({ message: 'Verification status must be APPROVED or REJECTED.' }),
  }),
  reason: z.string().optional().default(''),
}).refine(
  (data) => data.status !== VERIFICATION_STATUSES.REJECTED || data.reason.trim().length > 0,
  { message: 'Rejection reason is required.', path: ['reason'] },
);

module.exports = {
  validateVerificationSubmission: (req, res, next) => parseWithSchema(verificationSubmissionSchema, req, res, next),
  validateVerificationDecision: (req, res, next) => parseWithSchema(verificationDecisionSchema, req, res, next),
};
