// src/validators/authValidator.js
const { z } = require('zod');
const { parseWithSchema } = require('./validationHelpers');

const emailSchema = z.string().email('A valid email is required.').trim().toLowerCase();
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters long.');

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  email: emailSchema,
  password: passwordSchema,
  role: z.literal('USER').optional(),
}).passthrough().superRefine((data, ctx) => {
  if (data.role && data.role !== 'USER') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Public registration only creates USER accounts.', path: ['role'] });
  }
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long.'),
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password.',
  path: ['newPassword'],
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(32, 'Reset token is required.'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirm password is required.'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

module.exports = {
  validateRegister: (req, res, next) => parseWithSchema(registerSchema, req, res, next),
  validateLogin: (req, res, next) => parseWithSchema(loginSchema, req, res, next),
  validateChangePassword: (req, res, next) => parseWithSchema(changePasswordSchema, req, res, next),
  validateForgotPassword: (req, res, next) => parseWithSchema(forgotPasswordSchema, req, res, next),
  validateResetPassword: (req, res, next) => parseWithSchema(resetPasswordSchema, req, res, next),
};
