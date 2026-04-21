import express from 'express'
import upload from '../middleware/upload.js'
import { register, login } from '../controllers/authController.js'

const router = express.Router()

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

export default router