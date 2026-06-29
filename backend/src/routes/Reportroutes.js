import { Router } from 'express';
import {
  approveReport,
  createReport,
  deleteReport,
  getReport,
  getReports,
  reimburseReport,
  rejectReport,
  submitReport,
  updateReport,
} from '../controllers/reportController.js';
import { protect as authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Toutes les routes de reports nécessitent une authentification
router.use(authenticate);

// ─── CRUD de base ─────────────────────────────────────────────────────────────
router.get('/', getReports);           // Liste des rapports (filtre par rôle)
router.post('/', createReport);        // Créer un rapport
router.get('/:id', getReport);         // Détail d'un rapport
router.put('/:id', updateReport);      // Modifier un rapport (DRAFT / REJECTED seulement)
router.delete('/:id', deleteReport);   // Supprimer un rapport (DRAFT / REJECTED seulement)

// ─── Actions de statut ────────────────────────────────────────────────────────
router.post('/:id/submit', submitReport);       // Employé soumet
router.post('/:id/approve', approveReport);     // Manager approuve
router.post('/:id/reject', rejectReport);       // Manager refuse
router.post('/:id/reimburse', reimburseReport); // Manager rembourse

export default router;