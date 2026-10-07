import { z } from 'zod';

export const createScreenSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    screenNumber: z.number().min(1, 'Screen number is required'),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    theatreId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid theatre ID'),
  }),
});

export const updateScreenSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    screenNumber: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    screenId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid screen ID'),
  }),
});

export const screenIdSchema = z.object({
  params: z.object({
    screenId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid screen ID'),
  }),
});
