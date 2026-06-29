// src/services/expenseService.js
const path = require('path');
const fs   = require('fs');
const repo = require('../repositories/expenseRepository');

// ─── Enums alignés sur schema.prisma ─────────────────────────────────────────
const VALID_CATEGORIES = ['TRANSPORT', 'RESTAURANT', 'HOTEL', 'FUEL', 'OFFICE_SUPPLIES', 'OTHER'];
const VALID_PAYMENTS   = ['CARD', 'CASH', 'TRANSFER', 'OTHER'];

// Map frontend label → enum Prisma
const CATEGORY_MAP = {
  'Transport':         'TRANSPORT',
  'Restaurant':        'RESTAURANT',
  'Hôtel':             'HOTEL',
  'Hotel':             'HOTEL',
  'Fourniture':        'OFFICE_SUPPLIES',
  'Sport':             'OTHER',
  'TRANSPORT':         'TRANSPORT',
  'RESTAURANT':        'RESTAURANT',
  'HOTEL':             'HOTEL',
  'FUEL':              'FUEL',
  'OFFICE_SUPPLIES':   'OFFICE_SUPPLIES',
  'OTHER':             'OTHER',
};

const PAYMENT_MAP = {
  'Carte bancaire':  'CARD',
  'Espèces':         'CASH',
  'Mobile Money':    'TRANSFER',
  'CARD':            'CARD',
  'CASH':            'CASH',
  'TRANSFER':        'TRANSFER',
  'OTHER':           'OTHER',
};

// Map enum → icône React Native (pour retour au frontend)
const CATEGORY_ICONS = {
  TRANSPORT:       'car-outline',
  RESTAURANT:      'food-fork-drink',
  HOTEL:           'bed-outline',
  FUEL:            'gas-station-outline',
  OFFICE_SUPPLIES: 'briefcase-outline',
  OTHER:           'receipt-text-outline',
};

// ─── Créer une dépense ────────────────────────────────────────────────────────
const createExpense = async (userId, body, file) => {
  const { description, amount, date, category, paymentMethod, project, mission } = body;

  // Validation champs obligatoires
  if (!amount || !date || !category || !paymentMethod) {
    throw { status: 400, message: 'Champs obligatoires manquants : amount, date, category, paymentMethod.' };
  }

  // Montant
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw { status: 400, message: 'Le montant doit être un nombre positif.' };
  }

  // Date
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw { status: 400, message: 'Date invalide. Format attendu : ISO 8601 (ex: 2026-06-29).' };
  }

  // Catégorie (accepte label français OU enum direct)
  const categoryEnum = CATEGORY_MAP[category];
  if (!categoryEnum || !VALID_CATEGORIES.includes(categoryEnum)) {
    throw {
      status: 400,
      message: `Catégorie invalide. Valeurs acceptées : ${Object.keys(CATEGORY_MAP).join(', ')}`,
    };
  }

  // Moyen de paiement
  const paymentEnum = PAYMENT_MAP[paymentMethod];
  if (!paymentEnum || !VALID_PAYMENTS.includes(paymentEnum)) {
    throw {
      status: 400,
      message: `Moyen de paiement invalide. Valeurs acceptées : ${Object.keys(PAYMENT_MAP).join(', ')}`,
    };
  }

  // Créer la dépense
  const expense = await repo.createExpense({
    amount:        parsedAmount,
    date:          parsedDate,
    currency:      'MGA', // Ariary malgache
    category:      categoryEnum,
    description:   description || null,
    project:       project     || null,
    mission:       mission     || null,
    paymentMethod: paymentEnum,
    userId,
  });

  // Créer l'attachment si un fichier est fourni
  if (file) {
    await repo.createAttachment({
      fileName:     file.filename,
      originalName: file.originalname,
      mimeType:     file.mimetype,
      fileSize:     file.size,
      filePath:     `/uploads/${file.filename}`,
      type:         file.mimetype.includes('pdf') ? 'PDF' : 'IMAGE',
      expenseId:    expense.id,
    });
  }

  // Recharger avec attachments
  const full = await repo.findExpenseById(expense.id);
  return { ...full, icon: CATEGORY_ICONS[categoryEnum] };
};

// ─── Lister les dépenses ──────────────────────────────────────────────────────
const getExpenses = async (user, filters) => {
  if (user.role === 'EMPLOYEE') {
    return repo.findExpensesByUser(user.id, filters);
  }
  return repo.findAllExpenses(filters);
};

// ─── Détail d'une dépense ─────────────────────────────────────────────────────
const getExpenseById = async (id, user) => {
  const expense = await repo.findExpenseById(id);
  if (!expense) throw { status: 404, message: 'Dépense introuvable.' };

  if (user.role === 'EMPLOYEE' && expense.userId !== user.id) {
    throw { status: 403, message: 'Accès refusé.' };
  }

  return { ...expense, icon: CATEGORY_ICONS[expense.category] };
};

// ─── Modifier une dépense ─────────────────────────────────────────────────────
const updateExpense = async (id, userId, role, body, file) => {
  const existing = await repo.findExpenseById(id);
  if (!existing) throw { status: 404, message: 'Dépense introuvable.' };

  if (role === 'EMPLOYEE') {
    if (existing.userId !== userId) throw { status: 403, message: 'Accès refusé.' };
    // Bloqué si déjà dans un rapport soumis
    if (existing.report && existing.report.status !== 'DRAFT') {
      throw { status: 400, message: 'Impossible de modifier une dépense liée à un rapport soumis.' };
    }
  }

  const data = {};
  if (body.description)   data.description   = body.description;
  if (body.amount)        data.amount        = parseFloat(body.amount);
  if (body.date)          data.date          = new Date(body.date);
  if (body.category)      data.category      = CATEGORY_MAP[body.category] || body.category;
  if (body.paymentMethod) data.paymentMethod = PAYMENT_MAP[body.paymentMethod] || body.paymentMethod;
  if (body.project  !== undefined) data.project = body.project  || null;
  if (body.mission  !== undefined) data.mission = body.mission  || null;

  const updated = await repo.updateExpense(id, data);

  // Nouveau fichier → supprimer l'ancien, créer le nouveau
  if (file) {
    const oldAttachments = await repo.findAttachmentsByExpense(id);
    for (const att of oldAttachments) {
      const oldPath = path.join(__dirname, '../../uploads', att.fileName);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      await repo.deleteAttachment(att.id);
    }

    await repo.createAttachment({
      fileName:     file.filename,
      originalName: file.originalname,
      mimeType:     file.mimetype,
      fileSize:     file.size,
      filePath:     `/uploads/${file.filename}`,
      type:         file.mimetype.includes('pdf') ? 'PDF' : 'IMAGE',
      expenseId:    id,
    });
  }

  const full = await repo.findExpenseById(id);
  return { ...full, icon: CATEGORY_ICONS[full.category] };
};

// ─── Supprimer (soft delete) ──────────────────────────────────────────────────
const deleteExpense = async (id, userId, role) => {
  const existing = await repo.findExpenseById(id);
  if (!existing) throw { status: 404, message: 'Dépense introuvable.' };

  if (role === 'EMPLOYEE') {
    if (existing.userId !== userId) throw { status: 403, message: 'Accès refusé.' };
    if (existing.report && existing.report.status !== 'DRAFT') {
      throw { status: 400, message: 'Impossible de supprimer une dépense liée à un rapport soumis.' };
    }
  }

  return repo.softDeleteExpense(id);
};

// ─── Statistiques ─────────────────────────────────────────────────────────────
const getExpenseStats = async (userId) => {
  return repo.getExpenseStats(userId);
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
};
