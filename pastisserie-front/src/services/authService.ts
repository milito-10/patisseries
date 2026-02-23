// src/services/authService.ts
import api from '../api/axios';
import type { ApiResponse, LoginResponse, User } from '../types';

// Definimos interfaces para los Request aquí mismo si son pequeñas
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/auth/forgot-password', { email });
    return response.data;
  },

  verifyResetToken: async (email: string, token: string): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>('/auth/verify-reset-token', { params: { email, token } });
    return response.data;
  },

  resetPassword: async (email: string, token: string, newPassword: string): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/auth/reset-password', { email, token, newPassword });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};