import { z } from 'zod';

export const createMovieSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    language: z.string().min(1, 'Language is required'),
    genres: z.array(z.string()).min(1, 'At least one genre is required'),
    duration: z.number().min(1, 'Duration must be positive'),
    releaseDate: z.string().datetime({ offset: true }).or(z.string()),
    certificate: z.string().min(1, 'Certificate is required'),
    posterUrl: z.string().url().optional(),
    trailerUrl: z.string().url().optional(),
    rating: z.number().min(0).max(10).optional(),
    status: z.enum(['UPCOMING', 'NOW_SHOWING', 'ENDED', 'INACTIVE']).optional(),
  }),
});

export const updateMovieSchema = z.object({
  body: createMovieSchema.shape.body.partial(),
  params: z.object({
    movieId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid movie ID'),
  }),
});

export const movieIdSchema = z.object({
  params: z.object({
    movieId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid movie ID'),
  }),
});
