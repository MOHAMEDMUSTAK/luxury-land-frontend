"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';

// Helper to convert base64 public key to Uint8Array for the PushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushManager() {
  const { isAuthenticated, user } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Only attempt push registration if user is authenticated and browser supports it
    if (!isAuthenticated || !user || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const registerPush = async () => {
      try {
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[PushManager] Service Worker registered with scope:', registration.scope);

        // Check current subscription status
        const existingSubscription = await registration.pushManager.getSubscription();
        
        if (existingSubscription) {
          console.log('[PushManager] Already subscribed to push notifications');
          setIsSubscribed(true);
          // Always resync with backend just in case
          await api.post('/notifications/push/subscribe', existingSubscription);
          return;
        }

        // We only automatically ask for permission on specific interactions usually, 
        // but for this implementation, we will check if they already granted it, 
        // or wait for them to interact with the app.
        // For best UX, you'd usually trigger this from a "Enable Notifications" button.
        // Here we silently attempt it if permission was already granted previously.
        if (Notification.permission === 'granted') {
          await subscribeUser(registration);
        } else if (Notification.permission === 'default') {
          // You might want to remove this auto-prompt and tie it to a button instead
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            await subscribeUser(registration);
          }
        }
      } catch (error) {
        console.error('[PushManager] Failed to register push:', error);
      }
    };

    const subscribeUser = async (registration: ServiceWorkerRegistration) => {
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        console.warn('[PushManager] Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY');
        return;
      }

      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        // Send subscription to backend
        await api.post('/notifications/push/subscribe', subscription);
        setIsSubscribed(true);
        console.log('[PushManager] Successfully subscribed and synced with backend');
      } catch (err) {
        console.error('[PushManager] Failed to subscribe to push manager:', err);
      }
    };

    registerPush();
  }, [isAuthenticated, user]);

  return null; // Headless component
}
