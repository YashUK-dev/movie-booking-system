import { z } from 'zod';

export const createSeatSchema = z.object({
  body: z.object({
    row: z.string().min(1, 'Row is required'),
    seatNumber: z.number().min(1, 'Seat number is required'),
    seatType: z.enum(['REGULAR', 'PREMIUM', 'RECLINER']).optional(),
    priceMultiplier: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    screenId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid screen ID'),
  }),
});

export const updateSeatSchema = z.object({
  body: createSeatSchema.shape.body.partial(),
  params: z.object({
    seatId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid seat ID'),
  }),
});

export const seatIdSchema = z.object({
  params: z.object({
    seatId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid seat ID'),
  }),
});

// For bulk seat creation
export const bulkCreateSeatSchema = z.object({
  body: z.object({
    seats: z.array(z.object({
      row: z.string().min(1),
      seatNumber: z.number().min(1),
      seatType: z.enum(['REGULAR', 'PREMIUM', 'RECLINER']).optional(),
      priceMultiplier: z.number().min(0).optional(),
    })).min(1, 'At least one seat is required'),
  }),
  params: z.object({
    screenId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid screen ID'),
  }),
});
