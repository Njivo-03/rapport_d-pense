import * as SecureStore from 'expo-secure-store';
import apiClient from './apiClient';

// authService.js
export async function login(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  const token = response.data?.token;
  if (token) {
    await SecureStore.setItemAsync('authToken', token); // 'authToken' au lieu de 'token'
  }
  return response;
}

export async function logout() {
  await SecureStore.deleteItemAsync('authToken');
}

export async function getToken() {
  return SecureStore.getItemAsync('authToken');
}