import Medicine from '../models/Medicine.js'
import Groq from 'groq-sdk'
import cron from 'node-cron'
import {
  analyzeUserPatterns,
  generateAIInsight,
  updateUserPatterns,
  getAdjustedTime,
  sendSmartNotification,
} from '../services/predictionService.js'
import { sendPushToUser } from '../routes/push.js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ── Extract JSON safely ───────────────────────────────────────────────────────
function extractJSON(text) {
  try { return JSON.parse(text.trim()) } catch { }
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match) { try { return JSON.parse(match[1].trim()) } catch { } }
  const s = text.indexOf('{'), e = text.lastIndexOf('}')
  if (s !== -1 && e !== -1) { try { return JSON.parse(text.slice(s, e + 1)) } catch { } }
  throw new Error('No valid JSON found')
}

// ── AI Parse ──────────────────────────────────────────────────────────────────
export const parseMedicineWithAI = async (req, res) => {
  try {
    const { input } = req.body
    if (!input?.trim()) return res.status(400).json({ message: 'Input required' })

    const now = new Date()
    const currentTime24 = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const today = now.toISOString().split('T')[0]

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a medicine schedule parser. Current time is ${currentTime24}, today is ${today}.
Parse the user's medicine input including RELATIVE TIME expressions.

RELATIVE TIME RULES:
- "20 min baad" or "20 minutes later" = current time + 20 minutes
- "1 ghante baad" = current time + 1 hour
- "abhi" or "now" = current time + 2 minutes
- "subah" = 08:00, "dopahar" = 13:00, "shaam" = 18:00, "raat" = 21:00

OUTPUT: Return ONLY valid JSON:
{"name":"medicine name","dosage":"1 tablet","days":1,"instructions":"after meal","relativeMinutes":null,"schedules":[{"time":"HH:MM","label":"label"}]}

- relativeMinutes: minutes from now if relative time given, else null
- time must be in 24hr HH:MM format
- ONLY JSON, nothing else`
        },
        { role: 'user', content: input }
      ],
      temperature: 0.1,
      max_tokens: 400,
    })

    const raw = completion.choices[0]?.message?.content || ''
    const parsed = extractJSON(raw)

    let schedules = parsed.schedules || [{ time: '08:00', label: 'Morning' }]

    // Relative time handle karo
    if (parsed.relativeMinutes > 0) {
      const fireAt = new Date(now.getTime() + parsed.relativeMinutes * 60000)
      const hh = String(fireAt.getHours()).padStart(2, '0')
      const mm = String(fireAt.getMinutes()).padStart(2, '0')
      schedules = [{ time: `${hh}:${mm}`, label: 'Reminder' }]
    } else {
      // Filter out weird night times (midnight - 5am) agar unintended
      schedules = schedules.filter(s => {
        const h = parseInt(s.time.split(':')[0])
        return h >= 5 && h <= 23
      })
      if (schedules.length === 0) schedules = [{ time: '08:00', label: 'Morning' }]
    }

    const days = parseInt(parsed.days) || 1
    const [y, mo, da] = today.split('-').map(Number)
    const endD = new Date(Date.UTC(y, mo - 1, da))
    endD.setUTCDate(endD.getUTCDate() + days - 1)
    const computedEndDate = endD.toISOString().split('T')[0]

    const result = {
      name: String(parsed.name || 'Medicine').trim(),
      dosage: String(parsed.dosage || '1 tablet').trim(),
      days,
      instructions: String(parsed.instructions || '').trim(),
      schedules,
      startDate: today,
      endDate: computedEndDate,
      frequency: schedules.length,
      relativeMinutes: parsed.relativeMinutes || null,
    }

    res.json({ success: true, medicine: result })
  } catch (err) {
    console.error('AI parse error:', err.message)
    res.status(500).json({ message: 'Could not parse. Try: "Dolo 650mg subah 8 baje 5 din"' })
  }
}

// ── Add Medicine ──────────────────────────────────────────────────────────────
export const addMedicine = async (req, res) => {
  try {
    const { name, dosage, days, instructions, schedules, startDate, endDate, color } = req.body

    if (!name || !startDate || !endDate || !schedules?.length)
      return res.status(400).json({ message: 'Missing required fields' })

    const doseLogs = []
    const end = new Date(endDate + 'T00:00:00')
    for (let d = new Date(startDate + 'T00:00:00'); d <= end; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().split('T')[0]
      schedules.forEach(s => doseLogs.push({ date: ds, time: s.time, taken: null }))
    }

    const medicine = await Medicine.create({
      userId: req.userId,
      name: name.trim(),
      dosage: dosage || '1 tablet',
      days: days || 1,
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
    res.status(500).json({ message: err.message })
  }
}

// ── Get Medicines ─────────────────────────────────────────────────────────────
export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json({ success: true, medicines })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Update Dose Log ───────────────────────────────────────────────────────────
export const updateDoseLog = async (req, res) => {
  try {
    const { medicineId, date, time, taken } = req.body
    const medicine = await Medicine.findOne({ _id: medicineId, userId: req.userId })
    if (!medicine) return res.status(404).json({ message: 'Not found' })

    const log = medicine.doseLogs.find(l => l.date === date && l.time === time)
    if (log) {
      log.taken = taken
      log.takenAt = taken ? new Date() : null
    }
    await medicine.save()

    // Pattern update karo async (block mat karo response)
    updateUserPatterns(req.userId).catch(console.error)

    res.json({ success: true, medicine })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Delete Medicine ───────────────────────────────────────────────────────────
export const deleteMedicine = async (req, res) => {
  try {
    await Medicine.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Today's Medicines ─────────────────────────────────────────────────────────
export const getTodaysMedicines = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const medicines = await Medicine.find({
      userId: req.userId,
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today },
    })
    const doses = medicines.map(med => ({
      medicineId: med._id,
      name: med.name,
      dosage: med.dosage,
      color: med.color,
      instructions: med.instructions,
      doses: med.doseLogs.filter(l => l.date === today),
    }))
    res.json({ success: true, doses })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Get User Prediction/Insight ───────────────────────────────────────────────
export const getPrediction = async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default
    const user = await User.findById(req.userId).select('smartPrediction')

    // Agar purana data hai (> 1 din) toh refresh karo
    const lastUpdate = user?.smartPrediction?.updatedAt
    const isStale = !lastUpdate || (Date.now() - new Date(lastUpdate).getTime()) > 24 * 60 * 60 * 1000

    if (isStale) {
      const result = await updateUserPatterns(req.userId)
      return res.json({ success: true, ...result })
    }

    res.json({
      success: true,
      patterns: user.smartPrediction?.patterns,
      insight: user.smartPrediction?.insight,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SMART CRON — Har minute check, smart timing ke saath
// ════════════════════════════════════════════════════════════════════════════
const autoMissTimers = new Map() // Track auto-miss timers

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

    // Saare active medicines lo
    const medicines = await Medicine.find({
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today },
    })

    for (const med of medicines) {
      // User ke smart adjustments lo
      const { adjustedTime, extraTime } = await getAdjustedTime(med.userId, currentTime)

      const dueLogs = med.doseLogs.filter(l =>
        l.date === today &&
        l.time === currentTime && // Original scheduled time
        l.taken === null
      )

      // Smart adjusted time pe bhi check karo
      const adjustedDueLogs = adjustedTime !== currentTime
        ? med.doseLogs.filter(l =>
            l.date === today &&
            l.time === adjustedTime &&
            l.taken === null
          )
        : []

      const logsToNotify = [...dueLogs, ...adjustedDueLogs]

      for (const log of logsToNotify) {
        const timerKey = `${med._id}-${log.date}-${log.time}`

        // Duplicate notification avoid karo
        if (autoMissTimers.has(timerKey)) continue

        // Push notification bhejo
        await sendSmartNotification(med, log, false)

        // Extra reminder agar worst slot hai
        if (extraTime) {
          const extraDelay = (() => {
            const [eh, em] = extraTime.split(':').map(Number)
            const [lh, lm] = log.time.split(':').map(Number)
            return ((eh * 60 + em) - (lh * 60 + lm)) * 60 * 1000
          })()

          if (extraDelay > 0) {
            setTimeout(async () => {
              const fresh = await Medicine.findById(med._id)
              const freshLog = fresh?.doseLogs.find(l => l.date === log.date && l.time === log.time)
              if (freshLog && freshLog.taken === null) {
                await sendSmartNotification(med, log, true) // Extra "abhi tak nahi liya" notification
              }
            }, extraDelay)
          }
        }

        // 30 min baad auto-miss
        const missTimer = setTimeout(async () => {
          try {
            const fresh = await Medicine.findById(med._id)
            const freshLog = fresh?.doseLogs.find(l => l.date === log.date && l.time === log.time)
            if (freshLog && freshLog.taken === null) {
              freshLog.taken = false
              freshLog.takenAt = null
              await fresh.save()

              // Pattern update karo jab miss ho
              await updateUserPatterns(med.userId)

              console.log(`Auto-missed: ${med.name} at ${log.time}`)
            }
          } catch (e) {
            console.error('Auto-miss error:', e.message)
          }
          autoMissTimers.delete(timerKey)
        }, 30 * 60 * 1000)

        autoMissTimers.set(timerKey, missTimer)
      }
    }
  } catch (err) {
    console.error('Cron error:', err.message)
  }
})

// ── Weekly pattern recalculation — Har Sunday raat 11 PM ─────────────────────
cron.schedule('0 23 * * 0', async () => {
  try {
    console.log('🔄 Weekly pattern recalculation started...')
    const User = (await import('../models/User.js')).default
    const users = await User.find({ pushSubscription: { $exists: true } }).select('_id')

    for (const user of users) {
      await updateUserPatterns(user._id)
    }
    console.log(`✅ Patterns updated for ${users.length} users`)
  } catch (err) {
    console.error('Weekly cron error:', err.message)
  }
})

console.log('✅ Smart notification cron jobs started')