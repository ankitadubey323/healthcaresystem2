self.addEventListener('install', e => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(clients.claim()))

self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {}
  const title = data.title || '💊 Medicine Reminder'
  const options = {
    body: data.body || 'Time to take your medicine!',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: data.tag || 'medicine-reminder',
    data: data,
    actions: [
      { action: 'taken', title: '✅ Yes, taken!' },
      { action: 'skip', title: '❌ Skip' },
    ],
    requireInteraction: true,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const action = event.action
  const data = event.notification.data

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        client.postMessage({
          type: 'DOSE_ACTION',
          action: action === 'taken' ? true : false,
          medicineId: data.medicineId,
          date: data.date,
          time: data.time,
        })
        return
      }
      if (clients.openWindow) clients.openWindow('/')
    })
  )
})