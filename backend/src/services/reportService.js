import * as repo from '../repositories/reportRepository.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatReportSummary(report) {
  const expenses = report.expenses || [];
  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const currency = expenses[0]?.currency || 'MGA';

  return {
    id: report.id,
    title: report.title,
    status: report.status.toLowerCase(),
    amount: `${total.toFixed(2)} ${currency}`,
    totalAmount: total,
    currency,
    expenseCount: expenses.length,
    period: report.submittedAt ? formatDate(report.submittedAt) : formatDate(report.createdAt),
    date: formatDate(report.createdAt),
    submittedAt: report.submittedAt,
    approvedAt: report.approvedAt,
    rejectedAt: report.rejectedAt,
    reimbursedAt: report.reimbursedAt,
    managerComment: report.managerComment,
    employee: report.user
      ? { id: report.user.id, name: `${report.user.firstName} ${report.user.lastName}`, email: report.user.email }
      : undefined,
    reviewedBy: report.reviewedBy
      ? `${report.reviewedBy.firstName} ${report.reviewedBy.lastName}`
      : null,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

function formatReportDetail(report) {
  return {
    ...formatReportSummary(report),
    expenses: (report.expenses || []).map((e) => ({
      id: e.id,
      amount: parseFloat(e.amount),
      currency: e.currency,
      category: e.category,
      description: e.description,
      project: e.project,
      mission: e.mission,
      paymentMethod: e.paymentMethod,
      date: formatDate(e.date),
      attachments: (e.attachments || []).map((a) => ({
        id: a.id,
        fileName: a.fileName,
        originalName: a.originalName,
        mimeType: a.mimeType,
        fileSize: a.fileSize,
        type: a.type,
      })),
    })),
  };
}

// ─── List Reports ─────────────────────────────────────────────────────────────

export async function listReports(userId, role, filters = {}) {
  const { status, search } = filters;

  const where = { deletedAt: null };

  // Employé : seulement ses rapports. Manager : tout sauf brouillons des autres
  if (role === 'EMPLOYEE') {
    where.userId = userId;
  } else {
    where.status = { notIn: ['DRAFT'] };
  }

  if (status && status !== 'all') {
    where.status = status.toUpperCase();
  }

  if (search && search.trim()) {
    where.title = { contains: search.trim(), mode: 'insensitive' };
  }

  const reports = await repo.findReports(where);
  return reports.map(formatReportSummary);
}

// ─── Get One Report ───────────────────────────────────────────────────────────

export async function getReportById(reportId, userId, role) {
  const report = await repo.findReportById(reportId);

  if (!report) return null;

  // Employé ne peut voir que ses propres rapports
  if (role === 'EMPLOYEE' && report.userId !== userId) return null;

  return formatReportDetail(report);
}

// ─── Create Report ────────────────────────────────────────────────────────────

export async function createReport(userId, data) {
  const { title, expenseIds = [] } = data;

  const report = await repo.createReport({
    title,
    userId,
    status: 'DRAFT',
    ...(expenseIds.length > 0
      ? { expenses: { connect: expenseIds.map((id) => ({ id })) } }
      : {}),
  });

  return formatReportSummary(report);
}

// ─── Update Report ────────────────────────────────────────────────────────────

export async function updateReport(reportId, userId, data) {
  const existing = await repo.findReportById(reportId);

  if (!existing) return null;
  if (existing.userId !== userId) return null;

  if (!['DRAFT', 'REJECTED'].includes(existing.status)) {
    throw new Error('Seuls les rapports en brouillon ou refusés peuvent être modifiés.');
  }

  const { title, expenseIds } = data;

  const updated = await repo.updateReport(reportId, {
    ...(title ? { title } : {}),
    ...(expenseIds !== undefined
      ? { expenses: { set: expenseIds.map((id) => ({ id })) } }
      : {}),
  });

  return formatReportSummary(updated);
}

// ─── Submit Report ────────────────────────────────────────────────────────────

export async function submitReport(reportId, userId) {
  const report = await repo.findReportById(reportId);

  if (!report) return null;
  if (report.userId !== userId) return null;

  if (!['DRAFT', 'REJECTED'].includes(report.status)) {
    throw new Error('Seul un rapport en brouillon ou refusé peut être soumis.');
  }

  if (!report.expenses || report.expenses.length === 0) {
    throw new Error('Le rapport doit contenir au moins une dépense avant soumission.');
  }

  const updated = await repo.updateReport(reportId, {
    status: 'SUBMITTED',
    submittedAt: new Date(),
    rejectedAt: null,
    managerComment: null,
  });

  // Notifications pour tous les managers
  const managers = await repo.findManagers();
  if (managers.length > 0) {
    await repo.createManyNotifications(
      managers.map((m) => ({
        type: 'REPORT_SUBMITTED',
        title: 'Nouveau rapport soumis',
        message: `Le rapport "${report.title}" a été soumis pour validation.`,
        userId: m.id,
        reportId: report.id,
      }))
    );
  }

  return formatReportSummary(updated);
}

// ─── Approve Report ───────────────────────────────────────────────────────────

export async function approveReport(reportId, managerId, comment) {
  const report = await repo.findReportById(reportId);

  if (!report) return null;
  if (report.status !== 'SUBMITTED') return null;

  const updated = await repo.updateReport(reportId, {
    status: 'APPROVED',
    approvedAt: new Date(),
    reviewedById: managerId,
    managerComment: comment || null,
  });

  await repo.createNotification({
    type: 'REPORT_APPROVED',
    title: 'Rapport approuvé',
    message: `Votre rapport "${report.title}" a été approuvé.`,
    userId: report.userId,
    reportId: report.id,
  });

  return formatReportSummary(updated);
}

// ─── Reject Report ────────────────────────────────────────────────────────────

export async function rejectReport(reportId, managerId, comment) {
  const report = await repo.findReportById(reportId);

  if (!report) return null;
  if (report.status !== 'SUBMITTED') return null;

  const updated = await repo.updateReport(reportId, {
    status: 'REJECTED',
    rejectedAt: new Date(),
    reviewedById: managerId,
    managerComment: comment || null,
  });

  await repo.createNotification({
    type: 'REPORT_REJECTED',
    title: 'Rapport refusé',
    message: `Votre rapport "${report.title}" a été refusé.${comment ? ` Motif : ${comment}` : ''}`,
    userId: report.userId,
    reportId: report.id,
  });

  return formatReportSummary(updated);
}

// ─── Reimburse Report ─────────────────────────────────────────────────────────

export async function reimburseReport(reportId, managerId) {
  const report = await repo.findReportById(reportId);

  if (!report) return null;
  if (report.status !== 'APPROVED') return null;

  const updated = await repo.updateReport(reportId, {
    status: 'REIMBURSED',
    reimbursedAt: new Date(),
    reviewedById: managerId,
  });

  await repo.createNotification({
    type: 'REPORT_REIMBURSED',
    title: 'Rapport remboursé',
    message: `Votre rapport "${report.title}" a été remboursé.`,
    userId: report.userId,
    reportId: report.id,
  });

  return formatReportSummary(updated);
}

// ─── Delete Report ────────────────────────────────────────────────────────────

export async function deleteReport(reportId, userId) {
  const report = await repo.findReportById(reportId);

  if (!report) return null;
  if (report.userId !== userId) return null;

  if (!['DRAFT', 'REJECTED'].includes(report.status)) {
    throw new Error('Seuls les rapports en brouillon ou refusés peuvent être supprimés.');
  }

  await repo.softDeleteReport(reportId);
  return true;
}