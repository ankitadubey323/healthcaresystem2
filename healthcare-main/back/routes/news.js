// import express from 'express'
// import authMiddleware from '../middleware/auth.js'

// const router = express.Router()

// router.get('/health', authMiddleware, async (req, res) => {
//     try {
//         const apiKey = process.env.NEWS_API_KEY
//         if (!apiKey) return res.status(500).json({ message: 'News API key not configured' })

//         const response = await fetch(
//             `https://newsapi.org/v2/top-headlines?category=health&language=en&pageSize=12&apiKey=${apiKey}`
//         )
//         const data = await response.json()
//         res.json(data)
//     } catch (err) {
//         res.status(500).json({ message: err.message })
//     }
// })

// export default router


import express from 'express'

const router = express.Router()

router.get('/health', async (req, res) => {
    try {
        const apiKey = process.env.NEWS_API_KEY
        if (!apiKey) return res.status(500).json({ message: 'News API key not configured' })

        const response = await fetch(
            `https://newsapi.org/v2/top-headlines?category=health&language=en&pageSize=12&apiKey=${apiKey}`
        )
        const data = await response.json()
        res.json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

export default router