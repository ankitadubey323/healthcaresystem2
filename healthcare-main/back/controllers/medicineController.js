// import Medicine from '../models/Medicine.js'
// import Groq from 'groq-sdk'

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// export const parseMedicineWithAI = async (req, res) => {
//   try {
//     const { input } = req.body
//     if (!input) return res.status(400).json({ message: 'Input required' })

//     const today = new Date().toISOString().split('T')[0]

//     const completion = await groq.chat.completions.create({
//       model: 'llama-3.3-70b-versatile',
//       messages: [
//         {
//           role: 'system',
//           content: `You are a medicine schedule parser. Extract medicine details from user input and return ONLY valid JSON.
// Today's date is ${today}.
// Return this exact JSON structure:
// {
//   "name": "medicine name",
//   "dosage": "dosage like 500mg or 1 tablet",
//   "days": number of days,
//   "instructions": "after meal / before sleep / with water etc",
//   "schedules": [
//     {"time": "HH:MM", "label": "Morning/Afternoon/Evening/Night"}
//   ]
// }
// Rules:
// - time must be in 24hr HH:MM format
// - if user says "subah 8 baje" = "08:00"
// - if user says "raat 9 baje" = "21:00"
// - if user says "din mein 2 baar" = 2 schedules
// - if user says "3 baar" = 3 schedules: 08:00, 14:00, 20:00
// - days default to 7 if not mentioned
// - dosage default to "1 tablet" if not mentioned
// - Return ONLY the JSON object, no explanation`
//         },
//         { role: 'user', content: input }
//       ],
//       temperature: 0.1,
//       max_tokens: 500,
//     })

//     const text = completion.choices[0]?.message?.content || ''
//     const clean = text.replace(/```json|```/g, '').trim()
//     const parsed = JSON.parse(clean)

//     const start = new Date()
//     const end = new Date()
//     end.setDate(end.getDate() + (parsed.days || 7) - 1)

//     const result = {
//       name: parsed.name || 'Medicine',
//       dosage: parsed.dosage || '1 tablet',
//       days: parsed.days || 7,
//       instructions: parsed.instructions || '',
//       schedules: parsed.schedules || [{ time: '08:00', label: 'Morning' }],
//       startDate: start.toISOString().split('T')[0],
//       endDate: end.toISOString().split('T')[0],
//       frequency: (parsed.schedules || []).length || 1,
//     }

//     res.json({ success: true, medicine: result })
//   } catch (err) {
//     console.error('AI parse error:', err)
//     res.status(500).json({ message: 'Could not parse medicine. Please try again.' })
//   }
// }

// export const addMedicine = async (req, res) => {
//   try {
//     const { name, dosage, days, instructions, schedules, startDate, endDate, frequency, color } = req.body

//     const doseLogs = []
//     const start = new Date(startDate)
//     const end = new Date(endDate)

//     for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
//       const dateStr = d.toISOString().split('T')[0]
//       for (const sch of schedules) {
//         doseLogs.push({ date: dateStr, time: sch.time, taken: null })
//       }
//     }

//     const medicine = await Medicine.create({
//       userId: req.userId,
//       name, dosage, days, instructions, schedules,
//       startDate, endDate,
//       frequency: schedules.length,
//       color: color || '#6366f1',
//       isActive: true,
//       doseLogs,
//     })

//     res.status(201).json({ success: true, medicine })
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }
// }

// export const getMedicines = async (req, res) => {
//   try {
//     const medicines = await Medicine.find({ userId: req.userId }).sort({ createdAt: -1 })
//     res.json({ success: true, medicines })
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }
// }

// export const updateDoseLog = async (req, res) => {
//   try {
//     const { medicineId, date, time, taken } = req.body
//     const medicine = await Medicine.findOne({ _id: medicineId, userId: req.userId })
//     if (!medicine) return res.status(404).json({ message: 'Medicine not found' })

//     const log = medicine.doseLogs.find(l => l.date === date && l.time === time)
//     if (log) {
//       log.taken = taken
//       if (taken) log.takenAt = new Date()
//     }

//     await medicine.save()
//     res.json({ success: true, medicine })
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }
// }

// export const deleteMedicine = async (req, res) => {
//   try {
//     await Medicine.findOneAndDelete({ _id: req.params.id, userId: req.userId })
//     res.json({ success: true, message: 'Medicine deleted' })
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }
// }

// export const getTodaysMedicines = async (req, res) => {
//   try {
//     const today = new Date().toISOString().split('T')[0]
//     const medicines = await Medicine.find({
//       userId: req.userId,
//       isActive: true,
//       startDate: { $lte: today },
//       endDate: { $gte: today },
//     })

//     const todayDoses = medicines.map(med => ({
//       medicineId: med._id,
//       name: med.name,
//       dosage: med.dosage,
//       color: med.color,
//       instructions: med.instructions,
//       doses: med.doseLogs.filter(l => l.date === today),
//     }))

//     res.json({ success: true, doses: todayDoses })
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }
// }



import Medicine from '../models/Medicine.js'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ── helper to extract JSON from Groq response ────────────────────────────────
function extractJSON(text) {
  // Try direct parse first
  try { return JSON.parse(text.trim()) } catch { }
  // Try extracting from ```json ... ``` blocks
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match) { try { return JSON.parse(match[1].trim()) } catch { } }
  // Try extracting first { ... } block
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(text.slice(start, end + 1)) } catch { }
  }
  throw new Error('Could not extract JSON from response')
}

export const parseMedicineWithAI = async (req, res) => {
  try {
    const { input } = req.body

    // Debug log for production troubleshooting
    console.log('Medicine parse request body:', JSON.stringify(req.body).substring(0, 200))

    // Validate input is a non-empty string
    if (!input || typeof input !== 'string' || !input.trim()) {
      return res.status(400).json({ message: 'Text input required. Please type medicine details.' })
    }

    // Reject if input looks like a file path or image
    const imagePattern = /\.(png|jpg|jpeg|gif|webp|svg|bmp)(\?.*)?$/i
    if (imagePattern.test(input.trim()) || input.includes('data:image')) {
      console.error('Image upload rejected:', input.substring(0, 100))
      return res.status(400).json({ message: 'Image upload not supported. Please type medicine details as text.' })
    }

    const today = new Date().toISOString().split('T')[0]

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a medicine schedule parser. Extract medicine details from user input.
Today's date is ${today}.
You MUST return ONLY a valid JSON object, nothing else, no explanation, no markdown.

JSON format:
{"name":"medicine name","dosage":"500mg or 1 tablet","days":7,"instructions":"after meal","schedules":[{"time":"08:00","label":"Morning"}]}

Rules:
- time in 24hr HH:MM
- subah/morning = 08:00, dopahar/afternoon = 14:00, shaam/evening = 18:00, raat/night = 21:00
- "2 baar" or "twice" = 2 schedules (08:00 and 20:00)
- "3 baar" or "thrice" = 3 schedules (08:00, 14:00, 20:00)
- days default 7 if not mentioned
- dosage default "1 tablet" if not mentioned
- ONLY JSON, no other text`
        },
        { role: 'user', content: input.substring(0, 1000) } // Limit input size
      ],
      temperature: 0.1,
      max_tokens: 400,
    })

    const raw = completion.choices[0]?.message?.content || ''
    console.log('Groq raw response:', raw)

    const parsed = extractJSON(raw)

    // Validate and sanitize
    const schedules = Array.isArray(parsed.schedules) && parsed.schedules.length > 0
      ? parsed.schedules.map(s => ({ time: s.time || '08:00', label: s.label || 'Reminder' }))
      : [{ time: '08:00', label: 'Morning' }]

    const days = parseInt(parsed.days) || 7
    const start = new Date()
    const end = new Date()
    end.setDate(end.getDate() + days - 1)

    const result = {
      name: String(parsed.name || 'Medicine').trim(),
      dosage: String(parsed.dosage || '1 tablet').trim(),
      days,
      instructions: String(parsed.instructions || '').trim(),
      schedules,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      frequency: schedules.length,
    }

    res.json({ success: true, medicine: result })
  } catch (err) {
    console.error('AI parse error:', err.message)
    // Provide specific error for model-related issues
    if (err.message?.includes('model') || err.message?.includes('image')) {
      return res.status(500).json({ message: 'AI service error. Please type medicine details manually.' })
    }
    res.status(500).json({ message: 'Could not parse. Try: "Paracetamol 500mg morning and night for 5 days"' })
  }
}

export const addMedicine = async (req, res) => {
  try {
    const { name, dosage, days, instructions, schedules, startDate, endDate, frequency, color } = req.body

    if (!name || !startDate || !endDate || !schedules?.length) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const doseLogs = []
    const start = new Date(startDate + 'T00:00:00')
    const end = new Date(endDate + 'T00:00:00')

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      for (const sch of schedules) {
        doseLogs.push({ date: dateStr, time: sch.time, taken: null })
      }
    }

    const medicine = await Medicine.create({
      userId: req.userId,
      name: name.trim(),
      dosage: dosage || '1 tablet',
      days: days || 7,
      instructions: instructions || '',
      schedules,
      startDate,
      endDate,
      frequency: schedules.length,
      color: color || '#6366f1',
      isActive: true,
      doseLogs,
    })

    res.status(201).json({ success: true, medicine })
  } catch (err) {
    console.error('addMedicine error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json({ success: true, medicines })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateDoseLog = async (req, res) => {
  try {
    const { medicineId, date, time, taken } = req.body
    const medicine = await Medicine.findOne({ _id: medicineId, userId: req.userId })
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' })

    const log = medicine.doseLogs.find(l => l.date === date && l.time === time)
    if (log) {
      log.taken = taken
      if (taken) log.takenAt = new Date()
      else log.takenAt = null
    }

    await medicine.save()
    res.json({ success: true, medicine })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteMedicine = async (req, res) => {
  try {
    await Medicine.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ success: true, message: 'Medicine deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getTodaysMedicines = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const medicines = await Medicine.find({
      userId: req.userId,
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today },
    })

    const todayDoses = medicines.map(med => ({
      medicineId: med._id,
      name: med.name,
      dosage: med.dosage,
      color: med.color,
      instructions: med.instructions,
      doses: med.doseLogs.filter(l => l.date === today),
    }))

    res.json({ success: true, doses: todayDoses })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}