// public/sw.js
self.addEventListener('push', function (event) {
  let payload = { title: 'Notification', body: '', data: {} };
  try {
    if (event.data) payload = event.data.json();
  } catch (err) {
    console.error('push event parse err', err);
  }

  const options = {
    body: payload.body,
    data: payload.data,
    // icon: '/icons/notification.png',
    // badge: '/icons/badge.png'
  };
  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', function (event) {
  const data = event.notification.data;
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus().then(win => win.navigate(`/notifications/${data.notificationId || ''}`));
      }
      return clients.openWindow(`/notifications/${data.notificationId || ''}`);
    })
  );
});
