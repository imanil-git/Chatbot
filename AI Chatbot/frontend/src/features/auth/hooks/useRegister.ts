import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { RegisterRequest, RegisterResponse } from '../types/auth.types';
import { AxiosError } from 'axios';

export const useRegister = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { mutate: register, isPending, error } = useMutation<RegisterResponse, AxiosError<{ message?: string }>, RegisterRequest>({
    mutationFn: (data) => authApi.register(data),
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.accessToken);
      navigate('/chat');
    },
  });

  const errorMessage = error?.response?.data?.message || error?.message || null;

  return { register, isPending, error: errorMessage };
};
