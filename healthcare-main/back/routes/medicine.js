import express from 'express'
import authMiddleware from '../middleware/auth.js'
import {
  parseMedicineWithAI,
  addMedicine,
  getMedicines,
  updateDoseLog,
  deleteMedicine,
  getTodaysMedicines,
  getPrediction,        // ← ADD
} from '../controllers/medicineController.js'

const router = express.Router()

router.post('/parse',      authMiddleware, parseMedicineWithAI)
router.post('/add',        authMiddleware, addMedicine)
router.get('/all',         authMiddleware, getMedicines)
router.get('/today',       authMiddleware, getTodaysMedicines)
router.put('/dose',        authMiddleware, updateDoseLog)
router.delete('/:id',      authMiddleware, deleteMedicine)
router.get('/prediction',  authMiddleware, getPrediction)   // ← protect → authMiddleware

export default router