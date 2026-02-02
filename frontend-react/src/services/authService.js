import api from './api'
import { API_CONFIG, STORAGE_KEYS } from '../config'

export const authService = {
  // ===== Google OAuth =====
  
  /**
   * Iniciar autenticación con Google
   * Redirige al usuario a Google para autenticarse
   */
  loginWithGoogle: () => {
    window.location.href = `${API_CONFIG.BASE_URL}/auth/google`;
  },

  // ===== Autenticación tradicional =====
  
  /**
   * Iniciar sesión con email y contraseña
   */
  login: async (email, password) => {
    const response = await api.post(API_CONFIG.ENDPOINTS.LOGIN, { email, password });
    if (response.data.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      if (response.data.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },

  /**
   * Registrar nuevo usuario
   */
  register: async (userData) => {
    const response = await api.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
    if (response.data.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      if (response.data.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    try {
      // Opcional: Notificar al servidor
      await api.post('/api/auth/logout').catch(() => {});
    } finally {
      // Limpiar localStorage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      // Redirigir a login
      window.location.href = '/login';
    }
  },

  /**
   * Verificar token actual
   */
  verifyToken: async () => {
    const response = await api.get(API_CONFIG.ENDPOINTS.VERIFY);
    return response.data;
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: () => {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  /**
   * Obtener token de autenticación
   */
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }
}
