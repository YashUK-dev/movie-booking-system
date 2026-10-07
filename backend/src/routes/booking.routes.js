import express from 'express';
import { BookingController } from '../controllers/booking.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { createBookingSchema, bookingIdSchema } from '../validators/booking.validator.js';

const router = express.Router();

router.use(protect); // All booking routes require authentication

router.post('/', validate(createBookingSchema), BookingController.createBooking);
router.get('/', BookingController.getBookings);
router.get('/:bookingId', validate(bookingIdSchema), BookingController.getBookingById);
router.post('/:bookingId/cancel', validate(bookingIdSchema), BookingController.cancelBooking);

export default router;
