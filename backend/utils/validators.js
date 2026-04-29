const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'must contain at least 2 characters'),
  email: z.string().email('must be a valid email'),
  password: z.string().min(6, 'must contain at least 6 characters'),
  role: z.enum(['student', 'mentor', 'alumni']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('must be a valid email'),
  password: z.string().min(6, 'must contain at least 6 characters'),
});

const createProjectSchema = z.object({
  title: z.string().min(1, 'is required'),
  description: z.string().optional(),
  github_link: z.string().url('must be a valid URL').optional(),
});

const updateProjectSchema = z.object({
  title: z.string().min(1, 'is required').optional(),
  description: z.string().optional(),
  github_link: z.string().url('must be a valid URL').optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  createProjectSchema,
  updateProjectSchema,
};
