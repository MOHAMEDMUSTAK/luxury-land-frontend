import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/services/api';

interface WishlistStore {
  items: string[];
  setItems: (items: string[]) => void;
  toggleItem: (id: string, userId?: string) => Promise<number | null>;
  hasItem: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),
      toggleItem: async (id, userId) => {
        const currentItems = get().items;
        const isCurrentlyWishlisted = currentItems.includes(id);
        
        // Optimistic UI update
        if (isCurrentlyWishlisted) {
          set({ items: currentItems.filter((i) => i !== id) });
        } else {
          set({ items: [...currentItems, id] });
        }

        // Sync with backend if logged in
        if (userId) {
          try {
            const res = await api.post(`/auth/wishlist/${id}`);
            // Force sync with server data
            if (res.data?.wishlist) {
              set({ items: res.data.wishlist });
            }
            return res.data?.wishlistCount;
          } catch (error) {
            console.error("Failed to sync wishlist with server:", error);
            // Revert changes on failure
            set({ items: currentItems });
            throw error;
          }
        }
        return null;
      },
      hasItem: (id) => get().items.includes(id),
    }),
    {
      name: 'luxuryland-wishlist',
    }
  )
);
