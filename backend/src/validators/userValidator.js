const { z } = require('zod');
const { ROLES } = require('../utils/constants');
const { parseWithSchema } = require('./validationHelpers');

const updateUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').optional(),
  email: z.string().email('A valid email is required.').trim().toLowerCase().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long.').optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
}).strict({ message: 'Cannot update restricted fields.' });

const createAdminSchema = z.object({
  name: z.string().trim().min(1, 'Name, email, and password are required.'),
  email: z.string().email('A valid email is required.').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  role: z.enum([ROLES.ADMIN, ROLES.SUPER_ADMIN], {
    errorMap: () => ({ message: 'Admin creation role must be ADMIN or SUPER_ADMIN.' }),
  }),
});

module.exports = {
  validateUpdateUser: (req, res, next) => parseWithSchema(updateUserSchema, req, res, next),
  validateCreateAdmin: (req, res, next) => parseWithSchema(createAdminSchema, req, res, next),
};
