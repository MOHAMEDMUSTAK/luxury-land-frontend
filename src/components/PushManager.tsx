"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

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
        // ── Step 1: Register or update the service worker ──
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'  // Always check for SW updates
        });
        
        // Ensure the SW is updated
        registration.update();
        
        console.log('[Push] Service Worker registered and updated');

        // ── Step 2: Wait for the SW to be fully active ──
        let sw = registration.installing || registration.waiting || registration.active;
        if (sw && sw.state !== 'activated') {
          await new Promise<void>((resolve) => {
            sw!.addEventListener('statechange', function handler() {
              if (sw!.state === 'activated') {
                sw!.removeEventListener('statechange', handler);
                resolve();
              }
            });
            // Safety timeout
            setTimeout(resolve, 5000);
          });
        }

        // ── Step 3: Request notification permission ──
        let permission = Notification.permission;
        if (permission === 'default') {
          // We must ask the user with a direct user interaction
          // Return early, and we'll handle this with a UI prompt below
          return;
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
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey) as any
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
    const timer = setTimeout(() => {
      setupPush();
      
      // If permission is default, ask the user gracefully
      if ('Notification' in window && Notification.permission === 'default') {
        const toastId = toast.custom(
          (t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Enable Notifications
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Get real-time updates for messages, offers, and property status changes.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={async () => {
                    toast.dismiss(t.id);
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                      setupPush(); // Re-run setup now that we have permission
                    }
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-brand-primary hover:text-brand-secondary focus:outline-none"
                >
                  Allow
                </button>
              </div>
            </div>
          ),
          { duration: 10000, position: 'top-center' }
        );
      }
    }, 3000);
    return () => clearTimeout(timer);

  }, [isAuthenticated, user, token]);

  return null; // Headless — no UI
}
