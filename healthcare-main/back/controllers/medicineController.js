import Medicine from '../models/Medicine.js'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const parseMedicineWithAI = async (req, res) => {
  try {
    const { input } = req.body
    if (!input) return res.status(400).json({ message: 'Input required' })

    const today = new Date().toISOString().split('T')[0]

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `You are a medicine schedule parser. Extract medicine details from user input and return ONLY valid JSON.
Today's date is ${today}.
Return this exact JSON structure:
{
  "name": "medicine name",
  "dosage": "dosage like 500mg or 1 tablet",
  "days": number of days,
  "instructions": "after meal / before sleep / with water etc",
  "schedules": [
    {"time": "HH:MM", "label": "Morning/Afternoon/Evening/Night"}
  ]
}
Rules:
- time must be in 24hr HH:MM format
- if user says "subah 8 baje" = "08:00"
- if user says "raat 9 baje" = "21:00"
- if user says "din mein 2 baar" = 2 schedules
- if user says "3 baar" = 3 schedules: 08:00, 14:00, 20:00
- days default to 7 if not mentioned
- dosage default to "1 tablet" if not mentioned
- Return ONLY the JSON object, no explanation`
        },
        { role: 'user', content: input }
      ],
      temperature: 0.1,
      max_tokens: 500,
    })

    const text = completion.choices[0]?.message?.content || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    const start = new Date()
    const end = new Date()
    end.setDate(end.getDate() + (parsed.days || 7) - 1)

    const result = {
      name: parsed.name || 'Medicine',
      dosage: parsed.dosage || '1 tablet',
      days: parsed.days || 7,
      instructions: parsed.instructions || '',
      schedules: parsed.schedules || [{ time: '08:00', label: 'Morning' }],
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      frequency: (parsed.schedules || []).length || 1,
    }

    res.json({ success: true, medicine: result })
  } catch (err) {
    console.error('AI parse error:', err)
    res.status(500).json({ message: 'Could not parse medicine. Please try again.' })
  }
}

export const addMedicine = async (req, res) => {
  try {
    const { name, dosage, days, instructions, schedules, startDate, endDate, frequency, color } = req.body

    const doseLogs = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      for (const sch of schedules) {
        doseLogs.push({ date: dateStr, time: sch.time, taken: null })
      }
    }

    const medicine = await Medicine.create({
      userId: req.userId,
      name, dosage, days, instructions, schedules,
      startDate, endDate,
      frequency: schedules.length,
      color: color || '#6366f1',
      isActive: true,
      doseLogs,
    })

    res.status(201).json({ success: true, medicine })
  } catch (err) {
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