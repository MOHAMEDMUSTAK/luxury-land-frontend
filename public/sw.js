/**
 * ═══════════════════════════════════════════════════
 *  LUXURYLAND SERVICE WORKER
 *  Handles: PWA offline + Web Push Notifications
 * ═══════════════════════════════════════════════════
 */

// ─── PUSH NOTIFICATION HANDLER ───
// Fires when a push message arrives from the server, 
// even when the browser tab is completely closed.
self.addEventListener('push', function(event) {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    // If it's not JSON, use it as plain text
    data = {
      title: 'LuxuryLand',
      body: event.data.text(),
      url: '/'
    };
  }

  const title = data.title || 'LuxuryLand';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',       // Use the existing PWA icon
    badge: '/icon-192.png',      // Small icon for Android status bar
    image: data.image || undefined,
    vibrate: [100, 50, 100, 50, 100],
    tag: data.tag || data.type || 'luxuryland-notification', // Prevents duplicates with same tag
    renotify: true,              // Vibrate again even if same tag is updated
    requireInteraction: data.priority === 'urgent' || data.priority === 'high',
    data: {
      url: data.url || '/',
      type: data.type || 'system',
      notificationId: data.notificationId || null
    },
    actions: data.url && data.url !== '/' ? [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ] : []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ─── NOTIFICATION CLICK HANDLER ───
// When user taps/clicks the OS notification
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // If user clicked "dismiss" action, just close
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';
  const fullUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // Check if any existing window/tab has the app open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If a window is already on the target URL, just focus it
        if (client.url === fullUrl && 'focus' in client) {
          return client.focus();
        }
      }

      // If the app is open on a different page, navigate and focus
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client && 'navigate' in client) {
          return client.navigate(fullUrl).then(function(c) {
            return c.focus();
          });
        }
      }

      // If no app window is open at all, open a new one
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// ─── SERVICE WORKER LIFECYCLE ───
// Activate immediately — don't wait for old tabs to close
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});
