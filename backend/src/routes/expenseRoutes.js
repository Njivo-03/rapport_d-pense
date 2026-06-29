import { Router } from 'express';
import * as controller from '../controllers/expenseController.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { handleUpload } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/stats', controller.getExpenseStats);
router.get('/', controller.getExpenses);
router.post('/', handleUpload, controller.createExpense);
router.get('/:id', controller.getExpenseById);
router.put('/:id', handleUpload, controller.updateExpense);
router.patch('/:id/status', controller.updateExpenseStatus);
router.delete('/:id', controller.deleteExpense);

export default router;