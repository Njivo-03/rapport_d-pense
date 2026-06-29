import axios from 'axios';
import { config } from '../config/env';

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

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
