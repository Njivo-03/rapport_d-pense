import axios from 'axios';
import { config } from '../config/env';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Interceptor REQUEST : injecter le token ──
apiClient.interceptors.request.use(
  async (requestConfig) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor RESPONSE : normaliser les erreurs ──
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Une erreur est survenue. Veuillez reessayer.';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;