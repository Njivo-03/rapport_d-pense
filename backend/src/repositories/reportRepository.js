import { prisma } from '../prisma/index.js';

// ─── Reports ──────────────────────────────────────────────────────────────────

export const findReports = async (where) => {
  return prisma.report.findMany({
    where,
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      reviewedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      expenses: {
        where: { deletedAt: null },
        select: { id: true, amount: true, currency: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const findReportById = async (id) => {
  return prisma.report.findFirst({
    where: { id, deletedAt: null },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      reviewedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      expenses: {
        where: { deletedAt: null },
        include: { attachments: true },
        orderBy: { date: 'desc' },
      },
    },
  });
};

export const createReport = async (data) => {
  return prisma.report.create({
    data,
    include: {
      expenses: {
        where: { deletedAt: null },
        select: { id: true, amount: true, currency: true },
      },
    },
  });
};

export const updateReport = async (id, data) => {
  return prisma.report.update({
    where: { id },
    data,
    include: {
      expenses: {
        where: { deletedAt: null },
        select: { id: true, amount: true, currency: true },
      },
    },
  });
};

export const softDeleteReport = async (id) => {
  return prisma.$transaction([
    prisma.expense.updateMany({
      where: { reportId: id },
      data: { reportId: null },
    }),
    prisma.report.update({
      where: { id },
      data: { deletedAt: new Date() },
    }),
  ]);
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const findManagers = async () => {
  return prisma.user.findMany({
    where: { role: 'MANAGER', isActive: true },
    select: { id: true },
  });
};

export const createNotification = async (data) => {
  return prisma.notification.create({ data });
};

export const createManyNotifications = async (data) => {
  return prisma.notification.createMany({ data });
};