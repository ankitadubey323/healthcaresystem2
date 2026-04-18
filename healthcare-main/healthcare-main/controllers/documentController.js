import Document from '../models/Document.js'
import cloudinary from '../config/cloudinary.js'

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file provided' })

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'health-ai/documents', resource_type: 'auto' },
                (err, result) => err ? reject(err) : resolve(result)
            ).end(req.file.buffer)
        })

        const doc = await Document.create({
            userId: req.userId,
            fileName: req.file.originalname,
            fileUrl: result.secure_url,
            fileType: req.file.mimetype,
        })

        res.status(201).json({ message: 'Document uploaded', document: doc })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const getDocuments = async (req, res) => {
    try {
        const docs = await Document.find({ userId: req.userId }).sort({ uploadedAt: -1 })
        res.json({ documents: docs })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        })
        if (!doc) return res.status(404).json({ message: 'Document not found' })
        res.json({ message: 'Document deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}