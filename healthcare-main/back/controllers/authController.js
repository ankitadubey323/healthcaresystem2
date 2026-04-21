import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import User from '../models/User.js'
import cloudinary from '../config/cloudinary.js'

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

const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder, resource_type: 'auto' },
            (err, result) => err ? reject(err) : resolve(result)
        ).end(buffer)
    })
}

const createTransporter = () => {
  const host = process.env.EMAIL_HOST
  const port = process.env.EMAIL_PORT
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!host || !port || !user || !pass) {
    console.warn('Email not configured: missing EMAIL_HOST, EMAIL_PORT, EMAIL_USER or EMAIL_PASS')
    return null
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user,
      pass,
    },
  })
}

const sendWelcomeEmail = async ({ email, name }) => {
  const transporter = createTransporter()
  if (!transporter) {
    console.warn('Skipping welcome email because SMTP is not configured.')
    return false
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Health AI',
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
        <h2 style="color: #0f172a;">Welcome to Health AI, ${name}!</h2>
        <p>Thank you for creating your account. We are excited to have you onboard for smarter health guidance, doctor support, and wellness tracking.</p>
        <p style="margin: 24px 0 0;">Here are a few ways to get started:</p>
        <ul style="margin: 12px 0 0; padding-left: 20px;">
          <li>Explore your personalized dashboard</li>
          <li>Upload your documents and manage reports</li>
          <li>Stay updated with doctor tips and news</li>
        </ul>
        <p style="margin: 24px 0 0;">If you need help, just reply to this email or log in to your account.</p>
        <p style="margin: 24px 0 0; color: #2563eb;">Best wishes,<br/>The Health AI Team</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Welcome email sent to ${email}`)
    return true
  } catch (err) {
    console.error('Failed to send welcome email:', err.message)
    return false
  }
}

export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body
    if (!phone) return res.status(400).json({ message: 'Phone number is required' })

    const user = await User.findOne({ phone })
    if (!user) return res.status(404).json({ message: 'Phone number not registered' })

    const otp = generateOTP()
    const expires = new Date(Date.now() + 10 * 60 * 1000)

    user.verificationOTP = otp
    user.verificationExpires = expires
    await user.save()

    const smsSent = await sendSMS(phone, `Your Health AI verification code is: ${otp}. Valid for 10 minutes.`)
    if (!smsSent) return res.status(500).json({ message: 'Failed to send OTP via SMS' })

    res.json({ message: 'OTP sent successfully' })
  } catch (err) {
    console.error('SEND OTP ERROR:', err)
    res.status(500).json({ message: err.message })
  }
}

export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' })

    const user = await User.findOne({ phone })
    if (!user) return res.status(404).json({ message: 'Phone number not registered' })

    if (!user.verificationOTP || user.verificationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }

    if (!user.verificationExpires || new Date() > user.verificationExpires) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' })
    }

    user.isPhoneVerified = true
    user.verificationOTP = ''
    user.verificationExpires = null
    await user.save()

    res.json({ message: 'Phone verified successfully' })
  } catch (err) {
    console.error('VERIFY OTP ERROR:', err)
    res.status(500).json({ message: err.message })
  }
}

export const register = async (req, res) => {
    try {
        const { name, email, password, phone, city, state, age, weight, height } = req.body

        const existing = await User.findOne({ email })
        if (existing) return res.status(400).json({ message: 'Email already registered' })

        let profilePhoto = ''
        let aadhaarUrl = ''

        if (req.files?.profilePhoto) {
            const result = await uploadToCloudinary(
                req.files.profilePhoto[0].buffer,
                'health-ai/profiles'
            )
            profilePhoto = result.secure_url
        }

        if (req.files?.aadhaar) {
            const result = await uploadToCloudinary(
                req.files.aadhaar[0].buffer,
                'health-ai/aadhaar'

            )
            aadhaarUrl = result.secure_url
        }

        const user = await User.create({
            name, email, password,
            phone, city, state,
            age: age ? Number(age) : undefined,
            weight: weight ? Number(weight) : undefined,
            height: height ? Number(height) : undefined,
            profilePhoto,
            aadhaarUrl,
        })

        const emailSent = await sendWelcomeEmail({ email: user.email, name: user.name })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.status(201).json({
            message: 'Registered successfully',
            token,
            emailSent,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                city: user.city,
                state: user.state,
                age: user.age,
                weight: user.weight,
                height: user.height,
                bmi: user.bmi,
                profilePhoto: user.profilePhoto,
            }
        })
    } catch (err) {
        console.error('REGISTER ERROR:', err)
        res.status(500).json({ message: err.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' })

        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: 'Invalid credentials' })

        const isMatch = await user.comparePassword(password)
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                city: user.city,
                state: user.state,
                age: user.age,
                bmi: user.bmi,
                profilePhoto: user.profilePhoto,
            }
        })
    } catch (err) {
        console.error('LOGIN ERROR:', err) // full error object
        res.status(500).json({ message: err.message })
    }
}