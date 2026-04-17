
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6 },
    phone: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    age: { type: Number },
    weight: { type: Number },
    height: { type: Number },
    bmi: { type: Number },
    profilePhoto: { type: String, default: '' },
    aadhaarUrl: { type: String, default: '' },
}, { timestamps: true })

// Auto hash password
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return
    this.password = await bcrypt.hash(this.password, 12)
})

// Auto calculate BMI
userSchema.pre('save', function () {
    if (this.weight && this.height) {
        const h = this.height / 100
        this.bmi = parseFloat((this.weight / (h * h)).toFixed(2))
    }
})

// Compare password method
userSchema.methods.comparePassword = async function (pass) {
    return bcrypt.compare(pass, this.password)
}

export default mongoose.model('User', userSchema)