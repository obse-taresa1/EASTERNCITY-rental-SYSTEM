const { z } = require('zod');
const { VERIFICATION_STATUSES } = require('../utils/constants');
const { parseWithSchema } = require('./validationHelpers');

const fileUrlSchema = (fieldName) =>
  z.string().trim().min(1, `${fieldName} file URL is required.`).refine(
    (value) => !value.startsWith('data:'),
    `${fieldName} must be a file path or URL, not base64 data.`,
  );

const verificationSubmissionSchema = z.object({
  nationalIdFrontUrl: fileUrlSchema('nationalIdFrontUrl'),
  nationalIdBackUrl: fileUrlSchema('nationalIdBackUrl'),
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