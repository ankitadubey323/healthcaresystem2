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




const app = express()


const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://heathcaresystem-4.onrender.com',
]

// const allowedOrigins = [
//   'http://localhost:5173',
//   'http://127.0.0.1:5173',
//   'http://localhost:3000',
//   'http://127.0.0.1:3000',

// ]
// if (process.env.CORS_ORIGIN) {
//   allowedOrigins.push(
//     ...process.env.CORS_ORIGIN.split(',').map((url) => url.trim()).filter(Boolean),
//   )
// }

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error('CORS policy: Origin not allowed'))
  },
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/hospital', hospitalRoutes)
app.use('/api/document', documentRoutes)
app.use('/api/news', newsRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Health AI Backend Running' })
})

const PORT = process.env.PORT || 5000

const start = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`)
        })
    } catch (err) {
        console.error('Server failed:', err.message)
        process.exit(1)
    }
}

start()
