import { apiClient } from '../lib/apiClient';
import { 
  LoginRequest, LoginResponse, 
  RegisterRequest, RegisterResponse, 
  RefreshResponse, AuthUser 
} from '../types/auth.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>('/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const res = await apiClient.post<RegisterResponse>('/auth/register', data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (): Promise<RefreshResponse> => {
    const res = await apiClient.post<RefreshResponse>('/auth/refresh');
    return res.data;
  },

  getMe: async (): Promise<{ success: boolean; data: { user: AuthUser } }> => {
    const res = await apiClient.get<{ success: boolean; data: { user: AuthUser } }>('/auth/me');
    return res.data;
  }
};
