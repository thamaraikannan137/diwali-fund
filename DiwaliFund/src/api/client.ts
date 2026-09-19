import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

const TOKEN_KEY = 'diwali_token';

/** Production default if EXPO_PUBLIC_API_URL is unset. Prefer DiwaliFund/.env */
function defaultBaseUrl() {
  return 'https://diwali-fund.onrender.com/api';
}

/**
 * Metro bundle host = Mac LAN IP when the app loads from the packager.
 * Avoids expo-constants (needs ExpoAsset native module / rebuild).
 */
function metroDevHost(): string | null {
  try {
    const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
    if (!scriptURL) return null;
    const match = scriptURL.match(/https?:\/\/([^/:]+)(?::\d+)?/);
    const host = match?.[1];
    if (!host || host === 'localhost' || host === '127.0.0.1') return null;
    return host;
  } catch {
    return null;
  }
}

function resolveApiBaseUrl() {
  let url = process.env.EXPO_PUBLIC_API_URL || defaultBaseUrl();
  // Physical device + "localhost" in .env → rewrite to Mac LAN IP from Metro
  if (Platform.OS !== 'web' && /localhost|127\.0\.0\.1/.test(url)) {
    const host = metroDevHost();
    if (host) {
      url = url.replace(/localhost|127\.0\.0\.1/, host);
    }
  }
  return url;
}

export const API_BASE_URL = resolveApiBaseUrl();

if (__DEV__) {
  console.log(`[api] baseURL=${API_BASE_URL}`);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  // Render free tier cold-starts can take 1–3 minutes before the first response.
  timeout: 180000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (__DEV__) {
    console.log(`[api] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (__DEV__) {
      console.log(`[api] ← ${res.status} ${res.config.method?.toUpperCase()} ${res.config.url}`);
    }
    return res;
  },
  (err) => {
    if (__DEV__ && axios.isAxiosError(err)) {
      console.warn(
        `[api] ✕ ${err.config?.method?.toUpperCase()} ${err.config?.url}`,
        err.response?.status ?? err.message,
      );
    }
    return Promise.reject(err);
  },
);

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
    if (err.code === 'ECONNABORTED' || /timeout/i.test(err.message)) {
      return 'Server is waking up — wait a moment and try again';
    }
    if (err.message === 'Network Error') {
      return `Cannot reach server (${API_BASE_URL})`;
    }
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
