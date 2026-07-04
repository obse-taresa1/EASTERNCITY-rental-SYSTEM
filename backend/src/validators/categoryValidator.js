const { z } = require('zod');
const { parseWithSchema } = require('./validationHelpers');

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name and slug are required.'),
  slug: z.string().trim().min(1, 'Category name and slug are required.'),
  description: z.string().optional().default(''),
});

module.exports = {
  validateCategory: (req, res, next) => parseWithSchema(categorySchema, req, res, next),
};