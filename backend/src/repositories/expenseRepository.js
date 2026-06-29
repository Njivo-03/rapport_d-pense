// src/repositories/expenseRepository.js
import { prisma } from '../prisma/index.js';

// ─── Dépenses ─────────────────────────────────────────────────────────────────

export const createExpense = async (data) => {
  return prisma.expense.create({ data });
};

export const findExpenseById = async (id) => {
  return prisma.expense.findFirst({
    where: { id, deletedAt: null },
    include: { attachments: true, report: true },
  });
};

export const findExpensesByUser = async (userId, filters = {}) => {
  const { category, startDate, endDate, page = 1, limit = 20 } = filters;

  const where = {
    userId,
    deletedAt: null,
    ...(category && { category }),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate   && { lte: new Date(endDate) }),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { attachments: true },
      orderBy: { date: 'desc' },
      skip:  (page - 1) * limit,
      take:  Number(limit),
    }),
    prisma.expense.count({ where }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

export const findAllExpenses = async (filters = {}) => {
  const { category, startDate, endDate, userId, page = 1, limit = 20 } = filters;

  const where = {
    deletedAt: null,
    ...(userId   && { userId }),
    ...(category && { category }),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate   && { lte: new Date(endDate) }),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { attachments: true, user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { date: 'desc' },
      skip:  (page - 1) * limit,
      take:  Number(limit),
    }),
    prisma.expense.count({ where }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

export const updateExpense = async (id, data) => {
  return prisma.expense.update({ where: { id }, data });
};

export const softDeleteExpense = async (id) => {
  return prisma.expense.update({
    where: { id },
    data:  { deletedAt: new Date() },
  });
};

export const getExpenseStats = async (userId) => {
  const expenses = await prisma.expense.findMany({
    where: { userId, deletedAt: null },
    select: { amount: true, category: true, date: true },
  });

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  return { total, count: expenses.length, byCategory };
};

// ─── Attachments ──────────────────────────────────────────────────────────────

export const createAttachment = async (data) => {
  return prisma.attachment.create({ data });
};

export const findAttachmentsByExpense = async (expenseId) => {
  return prisma.attachment.findMany({ where: { expenseId } });
};

export const deleteAttachment = async (id) => {
  return prisma.attachment.delete({ where: { id } });
};