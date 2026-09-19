import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'diwali_token';

/** Web / iOS simulator use localhost; Android emulator uses 10.0.2.2 */
function defaultBaseUrl() {
  if (Platform.OS === 'android') return 'http://10.0.2.2:4000/api';
  return 'http://localhost:4000/api';
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || defaultBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export function apiErrorMessage(err: unknown, fallback = 'Something went wrong') {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    if (err.message === 'Network Error') {
      return `Cannot reach server (${API_BASE_URL})`;
    }
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
