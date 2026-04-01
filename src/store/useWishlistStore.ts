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
      setItems: (items) => set({ items }),
      toggleItem: async (id, userId) => {
        const currentItems = get().items;
        
        // Optimistic UI update
        if (currentItems.includes(id)) {
          set({ items: currentItems.filter((i) => i !== id) });
        } else {
          set({ items: [...currentItems, id] });
        }

        // Sync with backend if logged in
        if (userId) {
          try {
            await api.post(`/auth/wishlist/${id}`);
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
