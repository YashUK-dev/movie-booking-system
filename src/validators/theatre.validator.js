import { z } from 'zod';

export const createTheatreSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().min(1, 'Pincode is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    facilities: z.array(z.enum(['PARKING', 'FOOD', 'WIFI', 'RECLINER', 'DOLBY', 'ACCESSIBILITY'])).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateTheatreSchema = z.object({
  body: createTheatreSchema.shape.body.partial(),
  params: z.object({
    theatreId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid theatre ID'),
  }),
});

export const theatreIdSchema = z.object({
  params: z.object({
    theatreId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid theatre ID'),
  }),
});
