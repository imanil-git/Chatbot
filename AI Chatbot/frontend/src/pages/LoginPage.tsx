import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Antigravity</h1>
          <p className="text-muted text-sm mt-2">AI-powered conversations</p>
        </div>
        <div className="bg-card rounded-2xl shadow-2xl p-10 border border-border-subtle sm:rounded-2xl rounded-none sm:mx-0 -mx-4">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};
