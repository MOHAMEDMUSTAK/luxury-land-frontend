import { create } from 'zustand';
import { api } from '@/services/api';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'chat' | 'inquiry' | 'property_approved' | 'property_status' | 'view_milestone' | 'price_change' | 'new_match' | 'promotion' | 'offer' | 'account' | 'system';
  link: string;
  icon: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
  isLoading: boolean;
  filter: 'all' | 'unread';
  setFilter: (filter: 'all' | 'unread') => void;
  fetchNotifications: (page?: number, reset?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

let pollingInterval: ReturnType<typeof setInterval> | null = null;
let isPageVisible = true;

if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
  }, { passive: true });
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  total: 0,
  page: 1,
  pages: 1,
  hasMore: false,
  isLoading: false,
  filter: 'all',

  setFilter: (filter) => {
    set({ filter });
    get().fetchNotifications(1, true);
  },

  fetchNotifications: async (page = 1, reset = false) => {
    if (!isPageVisible) return;

    try {
      if (reset) set({ isLoading: true });
      
      const { filter } = get();
      const res = await api.get(`/notifications?page=${page}&limit=20${filter === 'unread' ? '&filter=unread' : ''}`);
      
      const newNotifications = res.data.notifications;
      
      set((state) => ({
        notifications: reset ? newNotifications : [...state.notifications, ...newNotifications],
        unreadCount: res.data.unreadCount,
        total: res.data.total,
        page: res.data.page,
        pages: res.data.pages,
        hasMore: res.data.hasMore,
        isLoading: false
      }));
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch notifications', error.message);
      }
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    if (!isPageVisible) return;
    try {
      const res = await api.get('/notifications/unread-count');
      set({ unreadCount: res.data.count });
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => {
      // If we are filtering by unread, or all, adding it to the top is correct
      const newNotifications = [notification, ...state.notifications];
      return {
        notifications: newNotifications,
        unreadCount: state.unreadCount + 1,
        total: state.total + 1
      };
    });
  },

  markAsRead: async (id: string) => {
    try {
      // Optimistic update
      set((state) => {
        const updated = state.notifications.map(n => n._id === id ? { ...n, isRead: true } : n);
        // If filter is unread, remove it from list
        if (state.filter === 'unread') {
          return {
             notifications: updated.filter(n => !n.isRead),
             unreadCount: Math.max(0, state.unreadCount - 1)
          }
        }
        return { 
          notifications: updated, 
          unreadCount: Math.max(0, state.unreadCount - 1) 
        };
      });
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
      get().fetchNotifications(1, true); // Revert on fail
    }
  },

  markAllAsRead: async () => {
    try {
      set((state) => ({
        notifications: state.filter === 'unread' ? [] : state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
      await api.patch('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all as read', error);
      get().fetchNotifications(1, true);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      set((state) => {
        const notification = state.notifications.find(n => n._id === id);
        return {
          notifications: state.notifications.filter(n => n._id !== id),
          unreadCount: (notification && !notification.isRead) ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          total: Math.max(0, state.total - 1)
        };
      });
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Failed to delete notification', error);
      get().fetchNotifications(1, true);
    }
  },

  clearHistory: async () => {
    try {
      set({ notifications: [], unreadCount: 0, total: 0 });
      await api.delete('/notifications/clear-all');
    } catch (error) {
      console.error('Failed to clear notification history', error);
      get().fetchNotifications(1, true);
    }
  },

  // Keep polling as a resilient fallback for when sockets disconnect or background fetch is needed
  startPolling: () => {
    if (pollingInterval) return;
    get().fetchNotifications(1, true); 
    pollingInterval = setInterval(() => {
      if (isPageVisible) {
        get().fetchUnreadCount(); // Light check, don't re-fetch list unless needed
      }
    }, 60000); 
  },

  stopPolling: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }
}));
