import axios from 'axios';

// Usar la variable de entorno Vite `VITE_API_BASE_URL` en producción.
// Si no está definida, caerá al `localhost:4000` para desarrollo local.
const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: apiBase,
});

// Adjuntar token automáticamente si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;