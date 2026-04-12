import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useLogin } from '../hooks/useLogin';
import { LoginRequest } from '../types/auth.types';

const loginFormSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required")
});

export const LoginForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: zodResolver(loginFormSchema)
  });
  const { login, isPending, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: LoginRequest) => {
    login(data);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-sm text-muted">Sign in to your Antigravity account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          label="Email address"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email?.message}
        />

        <div className="relative">
          <Input 
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
          <button 
            type="button"
            className="absolute right-3 top-9 text-muted hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full mt-6"
          isLoading={isPending}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-dark font-medium transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
