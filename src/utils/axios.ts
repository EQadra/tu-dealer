import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';


export const BASE_URL = 'https://apiapk.tudealer.app/api'

let memoryToken: string | null = null;

/* =========================
   🔐 TOKEN HANDLER
   ========================= */
export const setAuthToken = async (token: string | null) => {
  memoryToken = token;

  if (token) {
    console.log('🟢 setAuthToken → guardando token:', token);
    await SecureStore.setItemAsync('token', token);
  } else {
    console.log('🟠 setAuthToken → eliminando token');
    await SecureStore.deleteItemAsync('token');
  }
};

/* =========================
   🌐 AXIOS INSTANCE
   ========================= */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* =========================
   📤 REQUEST INTERCEPTOR
   ========================= */
api.interceptors.request.use(async (config) => {
  const publicRoutes = ['/auth/login', '/register', '/forgot-password'];

  if (!publicRoutes.includes(config.url || '')) {
    if (!memoryToken) {
      memoryToken = await SecureStore.getItemAsync('token');
    }

    if (memoryToken) {
      config.headers.Authorization = `Bearer ${memoryToken}`;
    }
  } else {
    delete config.headers.Authorization;
  }

  return config;
});
/* =========================
   📥 RESPONSE INTERCEPTOR
   ========================= */
api.interceptors.response.use(
  (response) => {
    console.log('✅ RESPONSE OK', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    console.log('❌ RESPONSE ERROR', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      console.log('🚨 401 DETECTADO → auto logout');
      await setAuthToken(null);
    }

    return Promise.reject(error);
  }
);

export default api;


