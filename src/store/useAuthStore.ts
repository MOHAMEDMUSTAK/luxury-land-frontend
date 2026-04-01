import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profileImage?: string;
  role: 'user' | 'owner';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>, token?: string) => void;
  checkAuth: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isCheckingAuth: true,
      login: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('luxuryland-auth-token', token);
        }
        set({ user, token, isAuthenticated: true, isCheckingAuth: false });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('luxuryland-auth-token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('luxuryland-auth');
          sessionStorage.clear();
        }
        set({ user: null, token: null, isAuthenticated: false, isCheckingAuth: false });
      },
      updateUser: (userData, token) => {
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('luxuryland-auth-token', token);
        }
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
          token: token || state.token,
          isAuthenticated: !!(state.user || userData)
        }));
      },
      fetchProfile: async () => {
        try {
          const { api } = await import('@/services/api');
          const res = await api.get('/auth/me');
          if (res.data) {
            set({ user: res.data, isAuthenticated: true, isCheckingAuth: false });
          } else {
            throw new Error('No user data');
          }
        } catch (error) {
          get().logout();
        } finally {
          set({ isCheckingAuth: false });
        }
      },
      checkAuth: async () => {
        set({ isCheckingAuth: true });
        const token = typeof window !== 'undefined' ? localStorage.getItem('luxuryland-auth-token') : null;
        if (!token) {
          set({ isAuthenticated: false, isCheckingAuth: false });
          return;
        }
        await get().fetchProfile();
      },
    }),
    {
      name: 'luxuryland-auth',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Trigger a silent check on rehydration to sync with localStorage
          state.checkAuth();
        }
      },
    }
  )
);
