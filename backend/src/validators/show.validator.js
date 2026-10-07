import { z } from 'zod';

export const createShowSchema = z.object({
  body: z.object({
    movieId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid movie ID'),
    screenId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid screen ID'),
    startTime: z.string().datetime({ offset: true }).or(z.string()),
    endTime: z.string().datetime({ offset: true }).or(z.string()),
    language: z.string().min(1, 'Language is required'),
    format: z.enum(['2D', '3D', 'IMAX', '4DX']).optional(),
    basePrice: z.number().min(0, 'Base price must be positive'),
  }),
});

export const updateShowSchema = z.object({
  body: z.object({
    status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']),
  }),
  params: z.object({
    showId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid show ID'),
  }),
});

export const showIdSchema = z.object({
  params: z.object({
    showId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid show ID'),
  }),
});

export const seatLockSchema = z.object({
  body: z.object({
    seatIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid seat ID')).min(1, 'At least one seat is required'),
  }),
  params: z.object({
    showId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid show ID'),
  }),
});
