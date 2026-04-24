// ── sw.js — place in frontend/public/sw.js ───────────────────────────────────
// Industry-level service worker for medicine reminders
// Works even when app is closed / phone screen off

const CACHE = 'medtrk-v1'

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim())
})

// ── Receive message from app to show notification ─────────────────────────────
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIF') {
    const { title, body, tag, data, delay } = e.data
    // Schedule the notification after `delay` ms
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icon.png',
        badge: '/icon.png',
        tag,
        data,
        requireInteraction: true,
        vibrate: [300, 100, 300, 100, 300],
        actions: [
          { action: 'taken', title: 'Yes, taken!' },
          { action: 'skip',  title: ' Skip'        },
        ],
      })
    }, delay)
  }

  if (e.data?.type === 'SHOW_NOTIF') {
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: '/icon.png',
      badge: '/icon.png',
      tag: e.data.tag,
      data: e.data.data,
      requireInteraction: true,
      vibrate: [300, 100, 300],
      actions: [
        { action: 'taken', title: ' Yes, taken!' },
        { action: 'skip',  title: ' Skip'        },
      ],
    })
  }
})

// ── Notification click / action ───────────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  const notif = e.notification
  const action = e.action
  const data   = notif.data || {}
  notif.close()

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // Send dose action back to open window
      for (const client of list) {
        client.postMessage({
          type:   'DOSE_ACTION',
          taken:  action === 'taken',
          medId:  data.medId,
          date:   data.date,
          time:   data.time,
          name:   data.name,
        })
        client.focus()
        return
      }
      // No open window — open app
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

// ── Push (for future server-push support) ─────────────────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return
  const payload = e.data.json()
  e.waitUntil(
    self.registration.showNotification(payload.title || '💊 Medicine Reminder', {
      body:             payload.body || 'Time to take your medicine!',
      icon:             '/icon.png',
      badge:            '/icon.png',
      tag:              payload.tag  || 'med-reminder',
      data:             payload.data || {},
      requireInteraction: true,
      vibrate:          [300, 100, 300],
      actions: [
        { action: 'taken', title: ' Yes, taken!' },
        { action: 'skip',  title: ' Skip'        },
      ],
    })
  )
})