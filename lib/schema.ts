import { z } from 'zod';

export const formSchema = z.object({
  id: z.string().optional(),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters'),
  age: z.number().optional(),
  gender: z.string().optional(),
  email: z
    .union([
      z.string().email('Please enter a valid email address'),
      z.string().length(0),
    ])
    .optional(),
  phone: z
    .union([
      z
        .string()
        .regex(/^[0-9+]+$/, 'Phone number can only contain + and numbers'),
      z.string().length(0),
    ])
    .optional(),
});
