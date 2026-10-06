import express from 'express';
import { SeatController } from '../controllers/seat.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { createSeatSchema, updateSeatSchema, seatIdSchema, bulkCreateSeatSchema } from '../validators/seat.validator.js';

const router = express.Router({ mergeParams: true }); // Important for nested routes

router.use(protect, authorize('ADMIN'));

router.post('/', validate(createSeatSchema), SeatController.createSeat);
router.post('/bulk', validate(bulkCreateSeatSchema), SeatController.bulkCreateSeats);
router.get('/', SeatController.getSeatsByScreen);
router.patch('/:seatId', validate(updateSeatSchema), SeatController.updateSeat);
router.delete('/:seatId', validate(seatIdSchema), SeatController.deleteSeat);

export default router;
