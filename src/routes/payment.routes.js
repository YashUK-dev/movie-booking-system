import express from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { createPaymentSchema, paymentIdSchema } from '../validators/payment.validator.js';

const router = express.Router();

router.use(protect); // All payment routes require authentication

router.post('/', validate(createPaymentSchema), PaymentController.processPayment);
router.get('/:paymentId', validate(paymentIdSchema), PaymentController.getPaymentDetails);

export default router;
