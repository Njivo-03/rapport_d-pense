import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './auth.routes.js';
import reportRoutes from './reportRoutes.js';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);

export default router;