import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface UIStore {
  isChatActive: boolean;
  setIsChatActive: (active: boolean) => void;

  // Theme
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  _initThemeListener: () => (() => void) | undefined;
}

/** Resolve what the actual rendered theme should be */
function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return mode;
}

/** Apply theme to the DOM instantly — called from store and from the blocking <script> */
function applyThemeToDOM(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  // Update meta theme-color for mobile browsers
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#0B0F1A' : '#6366F1');
  }
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      isChatActive: false,
      setIsChatActive: (active) => {
        set({ isChatActive: active });
        if (typeof document !== 'undefined') {
          if (active) document.body.classList.add('is-chat-active');
          else document.body.classList.remove('is-chat-active');
        }
      },

      theme: 'system',
      resolvedTheme: 'light',

      setTheme: (theme) => {
        const resolved = resolveTheme(theme);
        applyThemeToDOM(resolved);
        set({ theme, resolvedTheme: resolved });
      },

      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
        const resolved = resolveTheme(next);
        applyThemeToDOM(resolved);
        set({ theme: next, resolvedTheme: resolved });
      },

      /** Listen for OS theme changes when mode is 'system'. Returns cleanup fn. */
      _initThemeListener: () => {
        if (typeof window === 'undefined') return undefined;
        const state = get();
        // Apply immediately on init
        const resolved = resolveTheme(state.theme);
        applyThemeToDOM(resolved);
        set({ resolvedTheme: resolved });

        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
          if (get().theme === 'system') {
            const newResolved = resolveTheme('system');
            applyThemeToDOM(newResolved);
            set({ resolvedTheme: newResolved });
          }
        };
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
      },
    }),
    {
      name: 'luxuryland-ui',
      partialize: (state) => ({
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // On rehydration, immediately resolve and apply theme
          const resolved = resolveTheme(state.theme);
          applyThemeToDOM(resolved);
          state.resolvedTheme = resolved;
        }
      },
    }
  )
);
