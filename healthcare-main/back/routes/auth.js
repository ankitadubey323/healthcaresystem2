import express from 'express'
import upload from '../middleware/upload.js'
import { register, login, sendOTP, verifyOTP } from '../controllers/authController.js'
import User from '../models/User.js'

const router = express.Router()

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

const sendSMS = async (phone, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !twilioPhone) {
    console.warn('SMS not configured: missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN or TWILIO_PHONE_NUMBER')
    return false
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: new URLSearchParams({
          To: phone,
          From: twilioPhone,
          Body: message,
        }),
      }
    )
    const data = await response.json()
    if (data.sid) {
      console.log(`SMS sent to ${phone}`)
      return true
    }
    console.error('Twilio error:', data.message)
    return false
  } catch (err) {
    console.error('Failed to send SMS:', err.message)
    return false
  }
}

const pendingRegistrations = new Map()

router.post('/send-register-otp', async (req, res) => {
  try {
    const { phone } = req.body
    if (!phone) return res.status(400).json({ message: 'Phone number is required' })

    const existing = await User.findOne({ phone })
    if (existing) return res.status(400).json({ message: 'Phone already registered' })

    const otp = generateOTP()
    const expires = new Date(Date.now() + 10 * 60 * 1000)

    pendingRegistrations.set(phone, { otp, expires })

    const smsSent = await sendSMS(phone, `Your Health AI verification code is: ${otp}. Valid for 10 minutes.`)
    if (!smsSent) return res.status(500).json({ message: 'Failed to send OTP via SMS' })

    res.json({ message: 'OTP sent successfully', phone: phone.slice(-4).padStart(phone.length, '*') })
  } catch (err) {
    console.error('SEND REGISTER OTP ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})

router.post('/verify-register-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' })

    const pending = pendingRegistrations.get(phone)
    if (!pending) return res.status(400).json({ message: 'No OTP requested for this phone' })

    if (pending.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' })

    if (new Date() > pending.expires) {
      pendingRegistrations.delete(phone)
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' })
    }

    pendingRegistrations.delete(phone)
    pendingRegistrations.set(phone, { verified: true })

    res.json({ message: 'Phone verified successfully' })
  } catch (err) {
    console.error('VERIFY REGISTER OTP ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})

router.post('/register', upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'aadhaar', maxCount: 1 }
]), (req, res) => register(req, res))

router.get('/register', (req, res) => {
  res.status(405).json({
    message: 'Register endpoint requires POST. Use the app login/register form.',
  })
})

router.post('/login', login)

router.get('/login', (req, res) => {
  res.status(405).json({
    message: 'Login endpoint requires POST. Use the app login/register form.',
  })
})

router.post('/send-otp', sendOTP)
router.post('/verify-otp', verifyOTP)

export default router