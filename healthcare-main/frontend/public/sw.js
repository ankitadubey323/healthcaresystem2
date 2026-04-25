const CACHE = 'healthcare-v1'

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim())
})

// ── Push notification receive karo (server se aaya) ──────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return

  let data = {}
  try { data = e.data.json() } catch { data = { title: '💊 Medicine Reminder', body: e.data.text() } }

  const options = {
    body: data.body || 'Medicine lene ka waqt ho gaya!',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.tag || 'medicine-reminder',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      medId: data.medId,
      date: data.date,
      time: data.time,
      tag: data.tag,
      url: '/'
    },
    actions: [
      { action: 'taken', title: '✅ Le Liya' },
      { action: 'skip', title: '❌ Skip' }
    ]
  }

  e.waitUntil(self.registration.showNotification(data.title || '💊 Medicine Reminder', options))
})

// ── Notification pe click handle karo ────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close()

  const { medId, date, time, tag } = e.notification.data || {}
  const action = e.action // 'taken' | 'skip' | '' (normal click)

  const messageType = action === 'taken'
    ? 'DOSE_TAKEN'
    : action === 'skip'
      ? 'DOSE_MISSED'
      : 'DOSE_TAKEN' // normal click = taken

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // App open hai toh usse message bhejo
      if (list.length > 0) {
        list[0].postMessage({ type: messageType, medId, date, time, tag })
        list[0].focus()
        return
      }
      // App band hai toh open karo
      return clients.openWindow('/').then(client => {
        // Thoda wait karo phir message bhejo
        if (client) {
          setTimeout(() => {
            client.postMessage({ type: messageType, medId, date, time, tag })
          }, 2000)
        }
      })
    })
  )
})

// ── Notification dismiss (bina click ke band ki) ─────────────────────────────
self.addEventListener('notificationclose', e => {
  const { medId, date, time } = e.notification.data || {}
  if (!medId) return

  // App ko batao ki dismiss hua — auto-miss baad mein server handle karega
  clients.matchAll({ type: 'window' }).then(list => {
    list.forEach(client => {
      client.postMessage({ type: 'DOSE_DISMISSED', medId, date, time })
    })
  })
})