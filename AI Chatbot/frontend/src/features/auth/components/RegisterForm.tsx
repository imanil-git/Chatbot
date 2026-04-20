import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useRegister } from '../hooks/useRegister';

const registerFormSchema = z.object({
  username: z.string().min(3, "Min 3 characters").max(30)
             .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters")
             .regex(/[A-Z]/, "Must contain uppercase letter")
             .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string()
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export const RegisterForm: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema)
  });
  const { register: registerApi, isPending, error } = useRegister();

  const password = watch('password') || '';
  
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ].filter(Boolean).length;
  
  const strengthColors = ['bg-muted', 'bg-danger', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const barColor = password.length > 0 ? strengthColors[strength] : 'bg-border-subtle';

  const onSubmit = (data: RegisterFormData) => {
    registerApi({
      username: data.username,
      email: data.email,
      password: data.password
    });
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
        <p className="text-sm text-muted">Start your Antigravity journey</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          label="Username"
          type="text"
          placeholder="johndoe"
          {...register('username')}
          error={errors.username?.message}
        />
        
        <Input 
          label="Email address"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email?.message}
        />

        <div>
          <Input 
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
          <div className="mt-2 h-1 w-full bg-surface rounded overflow-hidden flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={`flex-1 h-full transition-colors ${strength >= i ? barColor : 'bg-border-subtle'}`}
              />
            ))}
          </div>
        </div>

        <Input 
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full mt-6"
          isLoading={isPending}
        >
          Sign up
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
