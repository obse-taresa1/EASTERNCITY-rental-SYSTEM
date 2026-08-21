const { z } = require("zod");
const { parseWithSchema } = require("./validationHelpers");

const campaignTypes = ["HOMEPAGE_BANNER", "CATEGORY_SPONSOR", "HERO_BUSINESS_CAMPAIGN", "CUSTOM_CAMPAIGN"];

const schema = z.object({
  companyName: z.string().trim().min(2, "Company name is required."),
  contactPerson: z.string().trim().min(2, "Contact person is required."),
  email: z.string().trim().email("A valid email is required."),
  phone: z.string().trim().min(6, "Phone number is required."),
  businessCategory: z.string().trim().min(2, "Business category is required."),
  campaignType: z.enum(campaignTypes, { errorMap: () => ({ message: "Choose a valid campaign type." }) }),
  website: z.string().trim().url("Website must be a valid URL.").optional().or(z.literal("")),
  socialMedia: z.string().trim().max(250).optional(),
  campaignGoal: z.string().trim().max(250).optional(),
  campaignMessage: z.string().trim().min(10, "Campaign message must contain at least 10 characters."),
  preferredStartDate: z.string().trim().optional(),
  preferredEndDate: z.string().trim().optional(),
  termsAccepted: z.union([z.literal("true"), z.literal(true)]),
});

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONTACTED", "WAITING_PAYMENT", "PAID", "APPROVED", "REJECTED", "COMPLETED"]),
  adminNote: z.string().trim().max(2000).optional(),
});

module.exports = {
  validateAdvertisingRequest: (req, res, next) => parseWithSchema(schema, req, res, next),
  validateAdvertisingRequestUpdate: (req, res, next) => parseWithSchema(updateSchema, req, res, next),
};
