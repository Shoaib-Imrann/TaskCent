import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from './axios';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: { id: string; email: string } | null;
  isLoading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      isLoading: true,

      signup: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await axiosInstance.post('/api/auth/signup', {
            email,
            password
          });

          const { token, user } = response.data;
          
          set({
            isAuthenticated: true,
            token,
            user,
            isLoading: false
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.detail || 'Signup failed');
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await axiosInstance.post('/api/auth/login', {
            email,
            password
          });

          const { token, user } = response.data;
          
          set({
            isAuthenticated: true,
            token,
            user,
            isLoading: false
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.detail || 'Login failed');
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          user: null
        });
      },

      checkAuth: async () => {
        set({ isLoading: true });
        const { token, user } = get();
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }
        
        // Token exists, keep user authenticated
        set({
          isAuthenticated: true,
          user,
          isLoading: false
        });
      }
    }),
    {
      name: 'user-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.isAuthenticated = true;
          state.isLoading = false;
        } else {
          state.isLoading = false;
        }
      }
    }
  )
);