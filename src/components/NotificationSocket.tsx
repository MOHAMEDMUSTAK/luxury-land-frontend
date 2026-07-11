"use client";

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore, Notification } from '@/store/useNotificationStore';
import toast from 'react-hot-toast';

let socket: Socket | null = null;

export default function NotificationSocket() {
  const { user, isAuthenticated, token } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !user || !token) {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }

    if (!socket) {
      let backendUrl = 'http://localhost:5000';
      if (typeof window !== 'undefined') {
        backendUrl = `http://${window.location.hostname}:5000`;
      }
      if (process.env.NEXT_PUBLIC_API_URL) {
        backendUrl = process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
      }
      socket = io(backendUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('[NotificationSocket] Connected');
        // Join user's personal room to receive targeted notifications
        socket?.emit('join_user_room', user.id);
      });

      socket.on('notification:new', (notification: Notification) => {
        console.log('[NotificationSocket] New notification received:', notification);
        
        // Add to Zustand store instantly
        addNotification(notification);

        // Show toast for high/urgent priority or specific types
        if (notification.priority === 'high' || notification.priority === 'urgent' || notification.type === 'chat') {
          // Play a subtle haptic feedback if supported (mobile)
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
             navigator.vibrate([10, 30, 10]);
          }

          toast(
            (t) => (
              <div className="flex flex-col gap-1 cursor-pointer" onClick={() => {
                toast.dismiss(t.id);
              }}>
                <span className="font-bold text-sm text-brand-primary">{notification.title}</span>
                <span className="text-xs text-text-secondary line-clamp-2">{notification.message}</span>
              </div>
            ),
            {
              duration: notification.priority === 'urgent' ? 6000 : 4000,
              icon: notification.icon === 'message-circle' ? '💬' : '🔔',
            }
          );
        }
      });

      socket.on('disconnect', () => {
        console.log('[NotificationSocket] Disconnected');
      });
    }

    return () => {
      // Don't disconnect on cleanup if we are just re-rendering
    };
  }, [isAuthenticated, user, token, addNotification]);

  return null; // Headless component
}
