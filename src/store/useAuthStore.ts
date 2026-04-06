import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useWishlistStore } from './useWishlistStore';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profileImage?: string;
  role: 'user' | 'owner';
  wishlist?: string[];
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
        
        // Sync wishlist if present, strictly stringified
        if (user.wishlist) {
          useWishlistStore.getState().setItems(user.wishlist.map(id => String(id)));
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
        
        // Clear wishlist on logout
        useWishlistStore.getState().setItems([]);
        
        set({ user: null, token: null, isAuthenticated: false, isCheckingAuth: false });
      },
      updateUser: (userData, token) => {
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('luxuryland-auth-token', token);
        }
        
        // Sync wishlist if present, strictly stringified
        if (userData.wishlist) {
          useWishlistStore.getState().setItems(userData.wishlist.map(id => String(id)));
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
            const userData = res.data;
            
            // Sync wishlist with server state, strictly stringified
            if (userData.wishlist) {
              useWishlistStore.getState().setItems(userData.wishlist.map((id: any) => String(id)));
            }
            
            set({ user: userData, isAuthenticated: true, isCheckingAuth: false });
          } else {
            throw new Error('No user data');
          }
        } catch (error) {
          console.error("FETCH_PROFILE_ERROR:", error);
          get().logout();
        } finally {
          set({ isCheckingAuth: false });
        }
      },
      checkAuth: async () => {
        const state = get();

        // FAST PATH: If Zustand already has a cached user+token from persist,
        // mark authenticated immediately and do a silent background refresh.
        if (state.user && state.token) {
          set({ isAuthenticated: true, isCheckingAuth: false });
          // Silent background refresh — no blocking, no loading screen
          get().fetchProfile().catch(() => {});
          return;
        }

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
          // On rehydration: if we have cached user+token, resolve immediately
          // instead of making a blocking API call
          if (state.user && state.token) {
            state.checkAuth(); // This will now take the fast path above
          } else {
            state.checkAuth();
          }
        }
      },
    }
  )
);
