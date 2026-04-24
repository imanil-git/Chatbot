import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, AuthUser } from '../types/auth.types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user: AuthUser, accessToken: string) => 
        set({ user, accessToken, isAuthenticated: true }),
      clearAuth: () => 
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      // SECURITY: Notice we ONLY persist 'user' and 'isAuthenticated'. 
      // The 'accessToken' only lives in active JS memory (cleared on hard reload).
      // The 'refreshToken' is NEVER in JS memory; it lives securely in the browser's httpOnly cookie vault.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
