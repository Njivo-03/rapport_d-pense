// src/routes/expenseRoutes.js
const express        = require('express');
const router         = express.Router();
const controller     = require('../controllers/expenseController');
const { authenticate } = require('../middlewares/authMiddleware'); // ton middleware JWT existant
const { handleUpload } = require('../middlewares/uploadMiddleware');

// ── Toutes les routes nécessitent d'être authentifié ──
router.use(authenticate);

// GET  /api/expenses/stats   → statistiques de l'utilisateur connecté
router.get('/stats', controller.getExpenseStats);

// GET  /api/expenses         → liste (employee = les siennes, manager/admin = toutes)
router.get('/', controller.getExpenses);

// POST /api/expenses         → créer une dépense (avec justificatif optionnel)
router.post('/', handleUpload, controller.createExpense);

// GET  /api/expenses/:id     → détail d'une dépense
router.get('/:id', controller.getExpenseById);

// PUT  /api/expenses/:id     → modifier une dépense
router.put('/:id', handleUpload, controller.updateExpense);

// PATCH /api/expenses/:id/status → approuver / rejeter (manager/admin)
router.patch('/:id/status', controller.updateExpenseStatus);

// DELETE /api/expenses/:id   → supprimer
router.delete('/:id', controller.deleteExpense);

module.exports = router;
