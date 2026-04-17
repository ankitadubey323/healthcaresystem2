import express from 'express'
import authMiddleware from '../middleware/auth.js'
import { getNearbyHospitals } from '../controllers/hospitalController.js'

const router = express.Router()

router.get('/nearby', authMiddleware, getNearbyHospitals)

export default router