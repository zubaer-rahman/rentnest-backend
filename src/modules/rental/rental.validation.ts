import { z } from 'zod';

const createRentalRequestValidationSchema = z.object({
  body: z.object({
    propertyId: z.string({ message: 'Property ID is required' }),
    message: z.string({ message: 'Message is required' }),
  }),
});

const updateRentalStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED'], {
      message: 'Status must be APPROVED or REJECTED',
    }),
  }),
});

export const RentalValidation = {
  createRentalRequestValidationSchema,
  updateRentalStatusValidationSchema,
};
