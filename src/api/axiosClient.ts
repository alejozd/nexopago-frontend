import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
import type { ApiError } from '../types/common.types';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
      window.location.assign('/login');
    }

    const apiError: ApiError = {
      statusCode: error.response?.status ?? 0,
      message: error.response?.data?.message ?? error.message ?? 'Error de red',
    };
    return Promise.reject(apiError);
  },
);
