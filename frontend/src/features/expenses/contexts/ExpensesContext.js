// src/features/expenses/contexts/ExpensesContext.js
import React, { createContext, useCallback, useContext, useReducer } from 'react';
import * as SecureStore from 'expo-secure-store';

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = 'http://192.168.43.14:4000/api'; // ⚠️ Adapte l'IP si besoin

// ─── Reducer ──────────────────────────────────────────────────────────────────
const initialState = { expenses: [], total: 0, page: 1, loading: false, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':    return { ...state, loading: action.payload };
    case 'SET_ERROR':      return { ...state, error: action.payload, loading: false };
    case 'SET_EXPENSES':   return { ...state, ...action.payload, loading: false, error: null };
    case 'ADD_EXPENSE':    return { ...state, expenses: [action.payload, ...state.expenses], loading: false };
    case 'UPDATE_EXPENSE': return { ...state, expenses: state.expenses.map((e) => e.id === action.payload.id ? action.payload : e), loading: false };
    case 'DELETE_EXPENSE': return { ...state, expenses: state.expenses.filter((e) => e.id !== action.payload), loading: false };
    default: return state;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = async () => {
  try { return await SecureStore.getItemAsync('token'); }
  catch { return null; }
};

const authHeaders = async (isMultipart = false) => {
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}` };
  if (!isMultipart) headers['Content-Type'] = 'application/json';
  return headers;
};

function buildFormData(payload) {
  const fd = new FormData();
  if (payload.description)   fd.append('description',   payload.description);
  if (payload.amount)        fd.append('amount',        String(payload.amount));
  if (payload.date)          fd.append('date',          payload.date);
  if (payload.category)      fd.append('category',      payload.category);
  if (payload.paymentMethod) fd.append('paymentMethod', payload.paymentMethod);
  if (payload.project)       fd.append('project',       payload.project);
  if (payload.mission)       fd.append('mission',       payload.mission);
  if (payload.attachment?.uri) {
    const { uri, name, type } = payload.attachment;
    const mimeType = type === 'PDF' ? 'application/pdf' : 'image/jpeg';
    fd.append('attachment', { uri, name: name || 'justificatif', type: mimeType });
  }
  return fd;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ExpensesContext = createContext(null);

export function ExpensesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Charger les dépenses ──────────────────────────────────────────────────
  const fetchExpenses = useCallback(async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const headers = await authHeaders();
      const params  = new URLSearchParams(filters).toString();
      const res     = await fetch(`${API_BASE}/expenses?${params}`, { headers });
      const json    = await res.json();
      if (!res.ok) throw new Error(json.message || 'Erreur serveur');
      dispatch({ type: 'SET_EXPENSES', payload: json.data });
    } catch (err) {
      console.error('❌ fetchExpenses:', err.message);
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  // ── Créer une dépense ─────────────────────────────────────────────────────
  const createExpense = useCallback(async (payload) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const formData = buildFormData(payload);
      const headers  = await authHeaders(true);

      console.log('🚀 POST', `${API_BASE}/expenses`);
      console.log('📦 payload:', JSON.stringify(payload));

      const res  = await fetch(`${API_BASE}/expenses`, { method: 'POST', headers, body: formData });
      const json = await res.json();

      console.log('📡 status:', res.status, '| réponse:', JSON.stringify(json));

      if (!res.ok) throw new Error(json.message || `Erreur ${res.status}`);
      dispatch({ type: 'ADD_EXPENSE', payload: json.data });
      return { success: true, data: json.data };
    } catch (err) {
      console.error('❌ createExpense:', err.message);
      dispatch({ type: 'SET_ERROR', payload: err.message });
      return { success: false, message: err.message };
    }
  }, []);

  // ── Modifier une dépense ──────────────────────────────────────────────────
  const updateExpense = useCallback(async (id, payload) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const formData = buildFormData(payload);
      const headers  = await authHeaders(true);
      const res      = await fetch(`${API_BASE}/expenses/${id}`, { method: 'PUT', headers, body: formData });
      const json     = await res.json();
      if (!res.ok) throw new Error(json.message || `Erreur ${res.status}`);
      dispatch({ type: 'UPDATE_EXPENSE', payload: json.data });
      return { success: true, data: json.data };
    } catch (err) {
      console.error('❌ updateExpense:', err.message);
      dispatch({ type: 'SET_ERROR', payload: err.message });
      return { success: false, message: err.message };
    }
  }, []);

  // ── Supprimer une dépense ─────────────────────────────────────────────────
  const deleteExpense = useCallback(async (id) => {
    try {
      const headers = await authHeaders();
      const res     = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE', headers });
      const json    = await res.json();
      if (!res.ok) throw new Error(json.message || `Erreur ${res.status}`);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
      return { success: true };
    } catch (err) {
      console.error('❌ deleteExpense:', err.message);
      return { success: false, message: err.message };
    }
  }, []);

  // ── Helper local ──────────────────────────────────────────────────────────
  const getExpenseById = useCallback(
    (id) => state.expenses.find((e) => e.id === id) || null,
    [state.expenses]
  );

  return (
    <ExpensesContext.Provider value={{
      expenses:      state.expenses,
      total:         state.total,
      loading:       state.loading,
      error:         state.error,
      fetchExpenses,
      createExpense,
      updateExpense,
      deleteExpense,
      getExpenseById,
    }}>
      {children}
    </ExpensesContext.Provider>
  );
}

export const useExpenses = () => {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error('useExpenses doit être utilisé dans ExpensesProvider');
  return ctx;
};