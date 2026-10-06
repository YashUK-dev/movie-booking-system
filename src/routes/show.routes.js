import express from 'express';
import { ShowController } from '../controllers/show.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { createShowSchema, updateShowSchema, showIdSchema, seatLockSchema } from '../validators/show.validator.js';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', ShowController.getShows);
router.get('/:showId', validate(showIdSchema), ShowController.getShowDetails);
router.get('/:showId/seats', validate(showIdSchema), ShowController.getShowSeats);

// Protected routes (User)
router.post('/:showId/seats/lock', protect, validate(seatLockSchema), ShowController.lockSeats);

// Admin only routes
router.use(protect, authorize('ADMIN'));
router.post('/', validate(createShowSchema), ShowController.createShow);
router.patch('/:showId', validate(updateShowSchema), ShowController.updateShow);

export default router;
