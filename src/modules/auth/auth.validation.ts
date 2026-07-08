import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Name is required' }),
    email: z.string({ message: 'Email is required' }).email('Invalid email address'),
    password: z.string({ message: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    phone: z.string({ message: 'Phone number is required' }),
    address: z.string({ message: 'Address is required' }),
    role: z.enum(['LANDLORD', 'TENANT']).optional(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email address'),
    password: z.string({ message: 'Password is required' }),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};
