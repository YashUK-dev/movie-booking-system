import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
    method: z.enum(['CARD', 'UPI', 'NET_BANKING', 'WALLET']),
    // Mock specific fields
    mockSuccess: z.boolean().optional().default(true),
  }),
});

export const paymentIdSchema = z.object({
  params: z.object({
    paymentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payment ID'),
  }),
});
