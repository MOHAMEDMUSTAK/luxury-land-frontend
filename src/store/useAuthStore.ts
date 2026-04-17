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
  loginTimestamp: number | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>, token?: string) => void;
  checkAuth: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

// Redundant backup key so auth survives any single storage wipe
const BACKUP_KEY = 'luxuryland-auth-backup';

function saveBackup(user: User, token: string) {
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify({ user, token, ts: Date.now() }));
  } catch {}
}

function loadBackup(): { user: User; token: string } | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function clearBackup() {
  try {
    localStorage.removeItem(BACKUP_KEY);
  } catch {}
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isCheckingAuth: true,
      loginTimestamp: null,
      login: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('luxuryland-auth-token', token);
        }
        
        // Sync wishlist if present, strictly stringified
        if (user.wishlist) {
          useWishlistStore.getState().setItems(user.wishlist.map(id => String(id)));
        }
        
        // Save redundant backup
        saveBackup(user, token);
        
        set({ user, token, isAuthenticated: true, isCheckingAuth: false, loginTimestamp: Date.now() });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('luxuryland-auth-token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('luxuryland-auth');
          sessionStorage.clear();
          clearBackup();
        }
        
        // Clear wishlist on logout
        useWishlistStore.getState().setItems([]);
        
        set({ user: null, token: null, isAuthenticated: false, isCheckingAuth: false, loginTimestamp: null });
      },
      updateUser: (userData, token) => {
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('luxuryland-auth-token', token);
        }
        
        // Sync wishlist if present, strictly stringified
        if (userData.wishlist) {
          useWishlistStore.getState().setItems(userData.wishlist.map(id => String(id)));
        }
        
        const currentUser = get().user;
        const mergedUser = currentUser ? { ...currentUser, ...userData } : null;
        const finalToken = token || get().token;
        
        // Update backup
        if (mergedUser && finalToken) {
          saveBackup(mergedUser, finalToken);
        }
        
        set((state) => ({
          user: mergedUser,
          token: finalToken,
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
            
            // Update backup on successful fetch
            const currentToken = get().token;
            if (currentToken) {
              saveBackup(userData, currentToken);
            }
            
            set({ user: userData, isAuthenticated: true, isCheckingAuth: false });
          } else {
            throw new Error('No user data');
          }
        } catch (error: any) {
          console.error("FETCH_PROFILE_ERROR:", error);
          // ★ NEVER logout on background refresh failure.
          // Keep cached user data — session persists until manual logout.
          // If we have cached data, keep user authenticated.
          const state = get();
          if (state.user && state.token) {
            set({ isAuthenticated: true, isCheckingAuth: false });
          }
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

        // RECOVERY PATH: Try to recover from backup if Zustand state was wiped
        if (typeof window !== 'undefined') {
          const backup = loadBackup();
          if (backup && backup.user && backup.token) {
            localStorage.setItem('luxuryland-auth-token', backup.token);
            set({ user: backup.user, token: backup.token, isAuthenticated: true, isCheckingAuth: false });
            // Silent refresh in background
            get().fetchProfile().catch(() => {});
            return;
          }
        }

        set({ isCheckingAuth: true });
        const token = typeof window !== 'undefined' ? localStorage.getItem('luxuryland-auth-token') : null;
        if (!token) {
          set({ isAuthenticated: false, isCheckingAuth: false });
          return;
        }
        // We have a token but no cached user — try to fetch
        set({ token });
        await get().fetchProfile();
      },
    }),
    {
      name: 'luxuryland-auth',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // On rehydration: if we have cached user+token, resolve immediately
          // instead of making a blocking API call
          state.checkAuth();
        }
      },
    }
  )
);
