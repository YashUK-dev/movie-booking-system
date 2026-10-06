import express from 'express';
import { ScreenController } from '../controllers/screen.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { createScreenSchema, updateScreenSchema, screenIdSchema } from '../validators/screen.validator.js';

const router = express.Router({ mergeParams: true }); // Important for nested routes like /theatres/:theatreId/screens

router.use(protect, authorize('ADMIN'));

router.post('/', validate(createScreenSchema), ScreenController.createScreen);
router.get('/', ScreenController.getScreensByTheatre);
router.patch('/:screenId', validate(updateScreenSchema), ScreenController.updateScreen);
router.delete('/:screenId', validate(screenIdSchema), ScreenController.deleteScreen);

export default router;
