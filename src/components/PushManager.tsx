"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';

/**
 * Convert VAPID public key from base64url to Uint8Array
 * Required by the Web Push API's PushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * PushNotificationManager
 * 
 * Headless component that:
 * 1. Registers/updates the service worker
 * 2. Waits for it to be fully active
 * 3. Requests notification permission from the user
 * 4. Subscribes to Web Push via the browser's PushManager
 * 5. Sends the subscription keys to the backend
 * 6. Re-syncs on every login to handle device changes
 */
export default function PushNotificationManager() {
  const { isAuthenticated, user, token } = useAuthStore();
  const hasSubscribed = useRef(false);

  useEffect(() => {
    // Gate: only run for authenticated users in browsers that support push
    if (!isAuthenticated || !user || !token) {
      hasSubscribed.current = false;
      return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[Push] Browser does not support Push Notifications');
      return;
    }

    const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicVapidKey) {
      console.warn('[Push] Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY in environment');
      return;
    }

    // Prevent duplicate registration within the same session
    if (hasSubscribed.current) return;

    const setupPush = async () => {
      try {
        // ── Step 1: Register the service worker ──
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'  // Always check for SW updates
        });
        console.log('[Push] Service Worker registered');

        // ── Step 2: Wait for the SW to be fully active ──
        // On first install, the SW goes: installing → waiting → active
        // Push subscriptions only work on an active SW
        const sw = registration.installing || registration.waiting || registration.active;
        if (sw && sw.state !== 'activated') {
          await new Promise<void>((resolve) => {
            sw.addEventListener('statechange', function handler() {
              if (sw.state === 'activated') {
                sw.removeEventListener('statechange', handler);
                resolve();
              }
            });
            // Safety timeout — don't block forever
            setTimeout(resolve, 5000);
          });
        }

        // ── Step 3: Request notification permission ──
        let permission = Notification.permission;
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }

        if (permission !== 'granted') {
          console.log('[Push] Notification permission denied by user');
          return;
        }

        // ── Step 4: Get or create push subscription ──
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });
          console.log('[Push] New push subscription created');
        } else {
          console.log('[Push] Existing push subscription found');
        }

        // ── Step 5: Send subscription to backend ──
        await api.post('/notifications/push/subscribe', subscription.toJSON());
        hasSubscribed.current = true;
        console.log('[Push] Subscription synced with backend successfully');

      } catch (error: any) {
        // Don't crash the app if push setup fails
        console.error('[Push] Setup failed:', error.message || error);
      }
    };

    // Small delay to not compete with initial page load
    const timer = setTimeout(setupPush, 2000);
    return () => clearTimeout(timer);

  }, [isAuthenticated, user, token]);

  return null; // Headless — no UI
}
