import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import hospitalRoutes from './routes/hospital.js'
import documentRoutes from './routes/document.js'
import newsRoutes from './routes/news.js'
import medicineRoutes from './routes/medicine.js'
import pushRouter from './routes/push.js'
import foodAIRoutes from './routes/foodAI.js'




const app = express()

app.use(cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://healthcaresystem2-1.onrender.com',
    ],
    credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/hospital', hospitalRoutes)
app.use('/api/document', documentRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/medicine', medicineRoutes)
app.use('/api/push', pushRouter)
app.use('/api/food', foodAIRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Health AI Backend Running' })
})

const PORT = process.env.PORT || 5000

const start = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(` Server running on port ${PORT}`)
        })
    } catch (err) {
        console.error('Server failed:', err.message)
        process.exit(1)
    }
}

start()
