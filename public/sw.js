self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      
      const options = {
        body: data.body,
        icon: data.icon === 'message-circle' ? '/icons/chat.png' : '/icons/logo.png', // Fallback to logo if specific icon doesn't exist
        badge: '/icons/badge.png', // Small monochrome icon for Android status bar
        vibrate: [100, 50, 100],
        data: {
          url: data.url || '/'
        },
        requireInteraction: data.priority === 'urgent' || data.priority === 'high'
      };

      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    } catch (e) {
      console.error('Push event payload was not valid JSON', e);
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If a window tab is already open, focus it and navigate
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If the app is open but on a different route, focus and navigate
      if (clientList.length > 0) {
        const client = clientList[0];
        client.navigate(urlToOpen);
        return client.focus();
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
