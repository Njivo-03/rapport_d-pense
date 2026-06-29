/**
 * services/reportService.js
 *
 * Toutes les fonctions d'appel API pour les rapports.
 * Utilise le même pattern que vos autres services (apiClient ou fetch).
 * Port backend : 4000
 */

import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://localhost:4000/api';

// ─── Helper : headers avec token JWT ─────────────────────────────────────────

async function getAuthHeaders() {
  const token = await SecureStore.getItemAsync('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Helper : gestion des réponses ───────────────────────────────────────────

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    const message = data?.message || `Erreur ${response.status}`;
    throw new Error(message);
  }
  return data;
}

// ─── Liste des rapports ───────────────────────────────────────────────────────

/**
 * @param {Object} filters - { status?: string, search?: string }
 * @returns {Promise<Array>} liste des rapports
 */
export async function fetchReports(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters.search && filters.search.trim()) {
    params.append('search', filters.search.trim());
  }

  const url = `${BASE_URL}/reports${params.toString() ? `?${params}` : ''}`;
  const headers = await getAuthHeaders();
  const response = await fetch(url, { headers });
  const data = await handleResponse(response);
  return data.data;
}

// ─── Détail d'un rapport ──────────────────────────────────────────────────────

/**
 * @param {string} reportId
 * @returns {Promise<Object>} rapport avec ses dépenses
 */
export async function fetchReportById(reportId) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/reports/${reportId}`, { headers });
  const data = await handleResponse(response);
  return data.data;
}

// ─── Créer un rapport ─────────────────────────────────────────────────────────

/**
 * @param {{ title: string, expenseIds?: string[] }} payload
 * @returns {Promise<Object>} rapport créé
 */
export async function createReport(payload) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(response);
  return data.data;
}

// ─── Modifier un rapport ──────────────────────────────────────────────────────

/**
 * @param {string} reportId
 * @param {{ title?: string, expenseIds?: string[] }} payload
 */
export async function updateReport(reportId, payload) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/reports/${reportId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(response);
  return data.data;
}

// ─── Soumettre un rapport ─────────────────────────────────────────────────────

/**
 * @param {string} reportId
 */
export async function submitReport(reportId) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/reports/${reportId}/submit`, {
    method: 'POST',
    headers,
  });
  return handleResponse(response);
}

// ─── Approuver un rapport (Manager) ──────────────────────────────────────────

/**
 * @param {string} reportId
 * @param {string} [comment]
 */
export async function approveReport(reportId, comment) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/reports/${reportId}/approve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ comment }),
  });
  return handleResponse(response);
}

// ─── Refuser un rapport (Manager) ────────────────────────────────────────────

/**
 * @param {string} reportId
 * @param {string} [comment]
 */
export async function rejectReport(reportId, comment) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/reports/${reportId}/reject`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ comment }),
  });
  return handleResponse(response);
}

// ─── Rembourser un rapport (Manager) ─────────────────────────────────────────

/**
 * @param {string} reportId
 */
export async function reimburseReport(reportId) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/reports/${reportId}/reimburse`, {
    method: 'POST',
    headers,
  });
  return handleResponse(response);
}

// ─── Supprimer un rapport ─────────────────────────────────────────────────────

/**
 * @param {string} reportId
 */
export async function deleteReport(reportId) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/reports/${reportId}`, {
    method: 'DELETE',
    headers,
  });
  return handleResponse(response);
}