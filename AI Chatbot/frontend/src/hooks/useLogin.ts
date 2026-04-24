import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { LoginRequest, LoginResponse } from '../types/auth.types';
import { AxiosError } from 'axios';

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { mutate: login, isPending, error } = useMutation<LoginResponse, AxiosError<{ message?: string }>, LoginRequest>({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.accessToken);
      navigate('/chat');
    },
  });

  const errorMessage = error?.response?.data?.message || error?.message || null;

  return { login, isPending, error: errorMessage };
};
