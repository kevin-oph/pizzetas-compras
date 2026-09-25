import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar automáticamente el Token JWT en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pizzetas_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas para capturar sesiones expiradas (HTTP 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si la API retorna 401 Unauthorized, limpiamos credenciales locales
      localStorage.removeItem('pizzetas_token');
      localStorage.removeItem('pizzetas_user');
      // Redirigir limpiando el estado si es necesario
      if (window.location.pathname !== '/') {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
