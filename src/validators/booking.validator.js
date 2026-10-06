import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    showId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid show ID'),
    seatIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid seat ID')).min(1, 'At least one seat is required'),
  }),
});

export const bookingIdSchema = z.object({
  params: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
  }),
});
