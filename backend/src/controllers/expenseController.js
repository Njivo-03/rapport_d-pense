// src/controllers/expenseController.js
import * as service from '../services/expenseService.js';

export const createExpense = async (req, res) => {
  try {
    const expense = await service.createExpense(req.user.id, req.body, req.file);
    return res.status(201).json({ success: true, message: 'Dépense créée avec succès.', data: expense });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Erreur serveur.' });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const result = await service.getExpenses(req.user, req.query);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Erreur serveur.' });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const expense = await service.getExpenseById(req.params.id, req.user);
    return res.status(200).json({ success: true, data: expense });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Erreur serveur.' });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await service.updateExpense(req.params.id, req.user.id, req.user.role, req.body, req.file);
    return res.status(200).json({ success: true, message: 'Dépense mise à jour.', data: expense });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Erreur serveur.' });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    await service.deleteExpense(req.params.id, req.user.id, req.user.role);
    return res.status(200).json({ success: true, message: 'Dépense supprimée.' });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Erreur serveur.' });
  }
};

export const getExpenseStats = async (req, res) => {
  try {
    const stats = await service.getExpenseStats(req.user.id);
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Erreur serveur.' });
  }
};

export const updateExpenseStatus = async (req, res) => {
  try {
    const expense = await service.updateExpenseStatus(req.params.id, req.user, req.body.status);
    return res.status(200).json({ success: true, message: 'Statut mis à jour.', data: expense });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Erreur serveur.' });
  }
};