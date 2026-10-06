import express from 'express';
import { MovieController } from '../controllers/movie.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { createMovieSchema, updateMovieSchema, movieIdSchema } from '../validators/movie.validator.js';

const router = express.Router();

// Public routes
router.get('/', MovieController.getMovies);
router.get('/:movieId', validate(movieIdSchema), MovieController.getMovieById);

// Admin only routes
router.use(protect, authorize('ADMIN'));
router.post('/', validate(createMovieSchema), MovieController.createMovie);
router.patch('/:movieId', validate(updateMovieSchema), MovieController.updateMovie);
router.delete('/:movieId', validate(movieIdSchema), MovieController.deleteMovie);

export default router;
