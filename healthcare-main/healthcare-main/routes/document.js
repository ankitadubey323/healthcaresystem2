import express from 'express'
import authMiddleware from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import { uploadDocument, getDocuments, deleteDocument } from '../controllers/documentController.js'

const router = express.Router()

router.post('/upload', authMiddleware, upload.single('document'), uploadDocument)
router.get('/list', authMiddleware, getDocuments)
router.delete('/:id', authMiddleware, deleteDocument)

export default router