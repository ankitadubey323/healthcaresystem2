
import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('✅ MongoDB connected')
    } catch (err) {
        console.error('❌ MongoDB failed:', err.message)
        process.exit(1)
    }
}