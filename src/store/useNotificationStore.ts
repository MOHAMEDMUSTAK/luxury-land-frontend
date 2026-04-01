import { create } from 'zustand';
import { api } from '@/services/api';

export interface Notification {
  _id: string;
  message: string;
  type: 'chat' | 'wishlist' | 'system';
  link: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearHistory: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

let pollingInterval: NodeJS.Timeout | null = null;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      // Small optimization: only show loading on very first fetch
      if (get().notifications.length === 0) set({ isLoading: true });
      
      const res = await api.get('/notifications');
      const unreadCount = res.data.filter((n: Notification) => !n.isRead).length;
      set({ notifications: res.data, unreadCount, isLoading: false });
    } catch (error: any) {
      // Silently handle 401s (unauthorized) or Network Errors during background polling
      if (error.response?.status !== 401) {
        console.error('Failed to fetch notifications', error.message);
      }
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      const { notifications } = get();
      const updated = notifications.map(n => n._id === id ? { ...n, isRead: true } : n);
      const unreadCount = updated.filter(n => !n.isRead).length;
      set({ notifications: updated, unreadCount });
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      const { notifications } = get();
      const updated = notifications.map(n => ({ ...n, isRead: true }));
      set({ notifications: updated, unreadCount: 0 });
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  },

  clearHistory: async () => {
    try {
      await api.delete('/notifications/clear-all');
      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error('Failed to clear notification history', error);
    }
  },

  startPolling: () => {
    if (pollingInterval) return;
    get().fetchNotifications(); // Initial fetch
    pollingInterval = setInterval(() => {
      get().fetchNotifications();
    }, 10000); // 10 seconds
  },

  stopPolling: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }
}));
