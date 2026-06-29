import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './auth.routes.js';
import reportRoutes from './reportRoutes.js';
import expenseRoutes from './expenseRoutes.js';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/expenses', expenseRoutes);

export default router;