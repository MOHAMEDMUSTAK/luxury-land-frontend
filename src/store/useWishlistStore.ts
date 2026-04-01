import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/services/api';

interface WishlistStore {
  items: string[];
  setItems: (items: string[]) => void;
  toggleItem: (id: string, userId?: string) => Promise<void>;
  hasItem: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items: items.map(id => String(id)) }),
      toggleItem: async (id, userId) => {
        const currentItems = get().items;
        const stringId = String(id);
        
        // Optimistic UI update
        if (currentItems.includes(stringId)) {
          set({ items: currentItems.filter((i) => i !== stringId) });
        } else {
          set({ items: [...currentItems, stringId] });
        }

        // Sync with backend if logged in
        if (userId) {
          try {
            const response = await api.post(`/auth/wishlist/${stringId}`);
            if (response.data && response.data.wishlist) {
              // Ensure we use the server's source of truth, and strictly stringify
              set({ items: response.data.wishlist.map((i: any) => String(i)) });
            }
          } catch (error) {
            console.error("Failed to sync wishlist with server:", error);
            // Revert changes on failure
            set({ items: currentItems });
          }
        }
      },
      hasItem: (id) => get().items.includes(id),
    }),
    {
      name: 'luxuryland-wishlist',
    }
  )
);
