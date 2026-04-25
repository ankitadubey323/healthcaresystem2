/**
 * Smart Prediction Service
 * - User ke skip patterns analyze karta hai (by time slot + day of week)
 * - Smart notification time suggest karta hai
 * - Groq AI se personalized insight generate karta hai
 */

import Medicine from '../models/Medicine.js'
import User from '../models/User.js'
import Groq from 'groq-sdk'
import { sendPushToUser } from '../routes/push.js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Time slots
const TIME_SLOTS = {
  morning:   { label: 'Morning',   range: [5, 11],  defaultTime: '08:00' },
  afternoon: { label: 'Afternoon', range: [12, 16], defaultTime: '13:00' },
  evening:   { label: 'Evening',   range: [17, 20], defaultTime: '18:00' },
  night:     { label: 'Night',     range: [21, 4],  defaultTime: '21:00' },
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_HI = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar']

function getTimeSlot(timeStr) {
  const hour = parseInt(timeStr.split(':')[0])
  if (hour >= 5  && hour <= 11) return 'morning'
  if (hour >= 12 && hour <= 16) return 'afternoon'
  if (hour >= 17 && hour <= 20) return 'evening'
  return 'night'
}

// ── Core Analysis ─────────────────────────────────────────────────────────────
export async function analyzeUserPatterns(userId) {
  try {
    const medicines = await Medicine.find({ userId })

    // Collect all dose logs
    const allLogs = []
    medicines.forEach(med => {
      (med.doseLogs || []).forEach(log => {
        if (log.taken === null) return // pending, skip
        const date = new Date(log.date + 'T00:00:00')
        allLogs.push({
          medId: med._id.toString(),
          medName: med.name,
          date: log.date,
          time: log.time,
          taken: log.taken,
          dayOfWeek: date.getDay(),         // 0=Sun, 6=Sat
          timeSlot: getTimeSlot(log.time),
          hour: parseInt(log.time.split(':')[0]),
        })
      })
    })

    if (allLogs.length < 3) return null // Not enough data

    // ── Skip rate by TIME SLOT ─────────────────────────────────────────────
    const bySlot = {}
    Object.keys(TIME_SLOTS).forEach(slot => {
      bySlot[slot] = { total: 0, missed: 0, rate: 0 }
    })
    allLogs.forEach(log => {
      bySlot[log.timeSlot].total++
      if (!log.taken) bySlot[log.timeSlot].missed++
    })
    Object.keys(bySlot).forEach(slot => {
      bySlot[slot].rate = bySlot[slot].total > 0
        ? bySlot[slot].missed / bySlot[slot].total
        : 0
    })

    // ── Skip rate by DAY OF WEEK ───────────────────────────────────────────
    const byDay = Array(7).fill(null).map(() => ({ total: 0, missed: 0, rate: 0 }))
    allLogs.forEach(log => {
      byDay[log.dayOfWeek].total++
      if (!log.taken) byDay[log.dayOfWeek].missed++
    })
    byDay.forEach(d => {
      d.rate = d.total > 0 ? d.missed / d.total : 0
    })

    // ── Worst slot & day ──────────────────────────────────────────────────
    const worstSlot = Object.entries(bySlot)
      .filter(([, v]) => v.total >= 2)
      .sort((a, b) => b[1].rate - a[1].rate)[0]

    const worstDay = byDay
      .map((d, i) => ({ ...d, day: i }))
      .filter(d => d.total >= 2)
      .sort((a, b) => b.rate - a.rate)[0]

    const bestSlot = Object.entries(bySlot)
      .filter(([, v]) => v.total >= 2)
      .sort((a, b) => a[1].rate - b[1].rate)[0]

    // ── Smart time adjustments ─────────────────────────────────────────────
    // Agar kisi slot mein 50%+ skip rate → us slot ka notification 20 min pehle karo
    const timeAdjustments = {}
    Object.entries(bySlot).forEach(([slot, data]) => {
      if (data.rate >= 0.5 && data.total >= 3) {
        timeAdjustments[slot] = -20 // 20 min pehle
      } else if (data.rate >= 0.3 && data.total >= 3) {
        timeAdjustments[slot] = -10 // 10 min pehle
      } else {
        timeAdjustments[slot] = 0
      }
    })

    // ── Extra notification slots ──────────────────────────────────────────
    // Worst slot mein extra reminder bhi bhejo (10 min baad)
    const extraReminders = {}
    if (worstSlot && worstSlot[1].rate >= 0.5) {
      extraReminders[worstSlot[0]] = 10 // 10 min baad extra reminder
    }

    return {
      totalDoses: allLogs.length,
      takenCount: allLogs.filter(l => l.taken).length,
      missedCount: allLogs.filter(l => !l.taken).length,
      overallAdherence: allLogs.filter(l => l.taken).length / allLogs.length,
      bySlot,
      byDay,
      worstSlot: worstSlot ? { slot: worstSlot[0], ...worstSlot[1] } : null,
      worstDay: worstDay || null,
      bestSlot: bestSlot ? { slot: bestSlot[0], ...bestSlot[1] } : null,
      timeAdjustments,
      extraReminders,
      analyzedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.error('Pattern analysis error:', err.message)
    return null
  }
}

// ── AI Insight Generator ──────────────────────────────────────────────────────
export async function generateAIInsight(patterns) {
  if (!patterns) return null
  try {
    const { bySlot, byDay, worstSlot, worstDay, overallAdherence, totalDoses } = patterns

    const slotSummary = Object.entries(bySlot)
      .filter(([, v]) => v.total > 0)
      .map(([slot, v]) => `${TIME_SLOTS[slot].label}: ${v.missed}/${v.total} missed (${Math.round(v.rate * 100)}%)`)
      .join(', ')

    const daySummary = byDay
      .map((d, i) => d.total > 0 ? `${DAYS[i]}: ${d.missed}/${d.total} missed` : null)
      .filter(Boolean).join(', ')

    const worstInfo = worstSlot
      ? `Worst time: ${TIME_SLOTS[worstSlot.slot].label} (${Math.round(worstSlot.rate * 100)}% skip rate)`
      : ''

    const worstDayInfo = worstDay
      ? `Worst day: ${DAYS[worstDay.day]} (${Math.round(worstDay.rate * 100)}% skip rate)`
      : ''

    const prompt = `You are a friendly medicine adherence coach. Analyze this patient's medicine skip data and give a SHORT, warm, actionable tip in Hinglish (mix of Hindi and English).

Data:
- Overall adherence: ${Math.round(overallAdherence * 100)}% (${totalDoses} total doses)
- By time: ${slotSummary}
- By day: ${daySummary}
- ${worstInfo}
- ${worstDayInfo}

Rules:
- Max 2 sentences
- Warm and encouraging tone
- Specific about WHEN they struggle
- Give ONE practical tip
- Use Hinglish naturally (not forced)
- Don't be preachy

Example good response: "Aap morning mein thoda bhool jaate ho, isliye humne aapke notifications 10 min pehle set kar diye! 🌅 Subah alarm ke saath hi medicine rakh lo bedside pe."

Respond with ONLY the insight text, nothing else.`

    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    })

    return res.choices[0]?.message?.content?.trim() || null
  } catch (err) {
    console.error('AI insight error:', err.message)
    return null
  }
}

// ── Save patterns to User ─────────────────────────────────────────────────────
export async function updateUserPatterns(userId) {
  const patterns = await analyzeUserPatterns(userId)
  if (!patterns) return null

  const insight = await generateAIInsight(patterns)

  await User.findByIdAndUpdate(userId, {
    'smartPrediction.patterns': patterns,
    'smartPrediction.insight': insight,
    'smartPrediction.updatedAt': new Date(),
  })

  return { patterns, insight }
}

// ── Get adjusted notification time ───────────────────────────────────────────
export async function getAdjustedTime(userId, originalTime) {
  try {
    const user = await User.findById(userId).select('smartPrediction')
    const adjustments = user?.smartPrediction?.patterns?.timeAdjustments
    if (!adjustments) return { adjustedTime: originalTime, extraTime: null }

    const slot = getTimeSlot(originalTime)
    const adjustMins = adjustments[slot] || 0

    if (adjustMins === 0) return { adjustedTime: originalTime, extraTime: null }

    // Time adjust karo
    const [h, m] = originalTime.split(':').map(Number)
    const base = new Date()
    base.setHours(h, m + adjustMins, 0, 0)
    const adjustedTime = `${String(base.getHours()).padStart(2,'0')}:${String(base.getMinutes()).padStart(2,'0')}`

    // Extra reminder time (agar worst slot hai)
    const extraReminders = user?.smartPrediction?.patterns?.extraReminders || {}
    let extraTime = null
    if (extraReminders[slot]) {
      const extra = new Date()
      extra.setHours(h, m + extraReminders[slot], 0, 0)
      extraTime = `${String(extra.getHours()).padStart(2,'0')}:${String(extra.getMinutes()).padStart(2,'0')}`
    }

    return { adjustedTime, extraTime, adjustMins }
  } catch {
    return { adjustedTime: originalTime, extraTime: null }
  }
}

// ── Send smart notification ───────────────────────────────────────────────────
export async function sendSmartNotification(med, log, isExtra = false) {
  const payload = {
    type: 'DOSE_DUE',
    title: isExtra
      ? `⏰ ${med.name} — abhi tak liya nahi!`
      : `💊 ${med.name} lene ka waqt!`,
    body: `${med.dosage}${med.instructions ? ' · ' + med.instructions : ''}`,
    medId: med._id.toString(),
    date: log.date,
    time: log.time,
    tag: `${med._id}-${log.date}-${log.time}${isExtra ? '-extra' : ''}`,
    isExtra,
  }
  await sendPushToUser(med.userId, payload)
}