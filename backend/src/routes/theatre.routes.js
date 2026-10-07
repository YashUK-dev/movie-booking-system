import express from 'express';
import { TheatreController } from '../controllers/theatre.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { createTheatreSchema, updateTheatreSchema, theatreIdSchema } from '../validators/theatre.validator.js';

const router = express.Router();

// Public routes
router.get('/', TheatreController.getTheatres);
router.get('/:theatreId', validate(theatreIdSchema), TheatreController.getTheatreById);

// Admin only routes
router.use(protect, authorize('ADMIN'));
router.post('/', validate(createTheatreSchema), TheatreController.createTheatre);
router.patch('/:theatreId', validate(updateTheatreSchema), TheatreController.updateTheatre);
router.delete('/:theatreId', validate(theatreIdSchema), TheatreController.deleteTheatre);

export default router;
