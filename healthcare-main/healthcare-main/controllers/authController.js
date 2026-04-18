import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import User from '../models/User.js'
import cloudinary from '../config/cloudinary.js'

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