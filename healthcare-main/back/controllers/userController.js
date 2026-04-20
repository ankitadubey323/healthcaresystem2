import User from '../models/User.js'
import cloudinary from '../config/cloudinary.js'

const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder, resource_type: 'auto' },
            (err, result) => err ? reject(err) : resolve(result)
        ).end(buffer)
    })
}

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password')
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json(user)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { name, phone, city, state, age, weight, height, removePhoto } = req.body
        const user = await User.findById(req.userId)
        if (!user) return res.status(404).json({ message: 'User not found' })

        if (removePhoto === 'true' || removePhoto === true) {
            user.profilePhoto = ''
        } else if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'health-ai/profiles')
            user.profilePhoto = result.secure_url
        }

        if (name)   user.name   = name
        if (phone)  user.phone  = phone
        if (city)   user.city   = city
        if (state)  user.state  = state
        if (age)    user.age    = Number(age)
        if (weight) user.weight = Number(weight)
        if (height) user.height = Number(height)

        await user.save()

        res.json({
            message: 'Profile updated',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                city: user.city,
                state: user.state,
                age: user.age,
                weight: user.weight,
                height: user.height,
                bmi: user.bmi,
                profilePhoto: user.profilePhoto,
            }
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const calculateBMI = async (req, res) => {
    try {
        const { weight, height } = req.body
        if (!weight || !height)
            return res.status(400).json({ message: 'Weight and height required' })

        const h = Number(height) / 100
        const bmi = parseFloat((Number(weight) / (h * h)).toFixed(2))

        let category = ''
        if (bmi < 18.5)      category = 'Underweight'
        else if (bmi < 24.9) category = 'Normal ✅'
        else if (bmi < 29.9) category = 'Overweight'
        else                 category = 'Obese'

        res.json({ bmi, category })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}