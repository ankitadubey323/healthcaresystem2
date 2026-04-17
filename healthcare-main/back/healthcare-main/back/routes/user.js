import express from 'express'
import authMiddleware from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import { getProfile, updateProfile, calculateBMI } from '../controllers/userController.js'

const router = express.Router()

router.get('/profile', authMiddleware, getProfile)
router.put('/update', authMiddleware, upload.single('profilePhoto'), updateProfile)
router.post('/bmi', calculateBMI)

export default router