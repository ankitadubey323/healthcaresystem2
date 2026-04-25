import express from 'express'
import webpush from 'web-push'
import User from '../models/User.js'
import protect from '../middleware/auth.js'

const router = express.Router()

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

// Frontend se VAPID public key lega
router.get('/vapid-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY })
})

// User ka push subscription save karo
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { subscription } = req.body
    if (!subscription?.endpoint) return res.status(400).json({ message: 'Invalid subscription' })

    await User.findByIdAndUpdate(req.userId, {
      pushSubscription: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      }
    })
    res.json({ success: true, message: 'Subscribed!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Subscription remove karo
router.post('/unsubscribe', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      $unset: { pushSubscription: 1 }
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Internal use — medicine notification bhejo (medicineController se call hoga)
export async function sendPushToUser(userId, payload) {
  try {
    const user = await User.findById(userId).select('pushSubscription')
    if (!user?.pushSubscription?.endpoint) return

    await webpush.sendNotification(
      user.pushSubscription,
      JSON.stringify(payload)
    )
  } catch (err) {
    if (err.statusCode === 410) {
      // Subscription expire ho gayi — remove karo
      await User.findByIdAndUpdate(userId, { $unset: { pushSubscription: 1 } })
    }
    console.error('Push error:', err.message)
  }
}

export default router