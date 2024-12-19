const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiConfig = {
  baseURL: API_URL,
  auth: {
    login: '/auth/login',
    register: '/auth/register'
  }
};