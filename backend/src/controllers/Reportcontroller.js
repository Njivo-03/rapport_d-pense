import * as reportService from '../services/reportService.js';

// ─── GET /api/reports ─────────────────────────────────────────────────────────
export async function getReports(req, res, next) {
  try {
    const { status, search } = req.query;
    const reports = await reportService.listReports(req.user.id, req.user.role, {
      status,
      search,
    });
    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/reports/:id ─────────────────────────────────────────────────────
export async function getReport(req, res, next) {
  try {
    const report = await reportService.getReportById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    if (!report) {
      return res.status(404).json({ success: false, message: 'Rapport introuvable.' });
    }
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/reports ────────────────────────────────────────────────────────
export async function createReport(req, res, next) {
  try {
    const { title, expenseIds } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Le titre est obligatoire.' });
    }

    const report = await reportService.createReport(req.user.id, {
      title: title.trim(),
      expenseIds: expenseIds || [],
    });

    res.status(201).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/reports/:id ─────────────────────────────────────────────────────
export async function updateReport(req, res, next) {
  try {
    const report = await reportService.updateReport(
      req.params.id,
      req.user.id,
      req.body
    );
    if (!report) {
      return res.status(404).json({ success: false, message: 'Rapport introuvable.' });
    }
    res.json({ success: true, data: report });
  } catch (err) {
    if (err.message.includes('brouillon') || err.message.includes('refusés')) {
      return res.status(409).json({ success: false, message: err.message });
    }
    next(err);
  }
}

// ─── POST /api/reports/:id/submit ─────────────────────────────────────────────
export async function submitReport(req, res, next) {
  try {
    const report = await reportService.submitReport(req.params.id, req.user.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Rapport introuvable.' });
    }
    res.json({ success: true, data: report, message: 'Rapport soumis avec succès.' });
  } catch (err) {
    if (
      err.message.includes('brouillon') ||
      err.message.includes('dépense') ||
      err.message.includes('refusé')
    ) {
      return res.status(409).json({ success: false, message: err.message });
    }
    next(err);
  }
}

// ─── POST /api/reports/:id/approve ────────────────────────────────────────────
export async function approveReport(req, res, next) {
  try {
    if (req.user.role !== 'MANAGER') {
      return res.status(403).json({ success: false, message: 'Accès réservé aux managers.' });
    }
    const { comment } = req.body;
    const report = await reportService.approveReport(req.params.id, req.user.id, comment);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: 'Rapport introuvable ou non soumis.' });
    }
    res.json({ success: true, data: report, message: 'Rapport approuvé.' });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/reports/:id/reject ─────────────────────────────────────────────
export async function rejectReport(req, res, next) {
  try {
    if (req.user.role !== 'MANAGER') {
      return res.status(403).json({ success: false, message: 'Accès réservé aux managers.' });
    }
    const { comment } = req.body;
    const report = await reportService.rejectReport(req.params.id, req.user.id, comment);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: 'Rapport introuvable ou non soumis.' });
    }
    res.json({ success: true, data: report, message: 'Rapport refusé.' });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/reports/:id/reimburse ──────────────────────────────────────────
export async function reimburseReport(req, res, next) {
  try {
    if (req.user.role !== 'MANAGER') {
      return res.status(403).json({ success: false, message: 'Accès réservé aux managers.' });
    }
    const report = await reportService.reimburseReport(req.params.id, req.user.id);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: 'Rapport introuvable ou non approuvé.' });
    }
    res.json({ success: true, data: report, message: 'Rapport marqué comme remboursé.' });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/reports/:id ──────────────────────────────────────────────────
export async function deleteReport(req, res, next) {
  try {
    const result = await reportService.deleteReport(req.params.id, req.user.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Rapport introuvable.' });
    }
    res.json({ success: true, message: 'Rapport supprimé.' });
  } catch (err) {
    if (err.message.includes('brouillon') || err.message.includes('refusés')) {
      return res.status(409).json({ success: false, message: err.message });
    }
    next(err);
  }
}