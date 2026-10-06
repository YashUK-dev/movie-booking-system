import express from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(protect, authorize('ADMIN'));

router.get('/dashboard', AdminController.getDashboard);

export default router;
