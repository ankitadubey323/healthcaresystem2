import { useState, useEffect, useCallback, useRef } from 'react'
import API from '../utils/api'

// ── Helpers ───────────────────────────────────────────────────────────────────
const TODAY = () => new Date().toISOString().split('T')[0]
const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
const fmtTime = (t) => {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}
const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6']
const STATUS_COLOR = { full: '#10b981', partial: '#f59e0b', skipped: '#ef4444', pending: '#6366f1' }
const SLOT_LABELS = { morning: '🌅 Morning', afternoon: '☀️ Afternoon', evening: '🌆 Evening', night: '🌙 Night' }

// ── In-app Notification Store ─────────────────────────────────────────────────
const NOTIF_KEY = 'med_notifications'
const getNotifs = () => { try { return JSON.parse(localStorage.getItem(NOTIF_KEY)) || [] } catch { return [] } }
const saveNotifs = (n) => { try { localStorage.setItem(NOTIF_KEY, JSON.stringify(n)) } catch { } }
function addNotif(notif) {
  const existing = getNotifs()
  const n = { id: Date.now().toString(), ...notif, createdAt: new Date().toISOString(), read: false, status: 'pending' }
  saveNotifs([n, ...existing].slice(0, 50))
  window.dispatchEvent(new Event('notif_update'))
  return n
}

// ── Web Push ──────────────────────────────────────────────────────────────────
function urlBase64ToUint8Array(b) {
  const pad = '='.repeat((4 - b.length % 4) % 4)
  const base64 = (b + pad).replace(/-/g, '+').replace(/_/g, '/')
  return new Uint8Array([...window.atob(base64)].map(c => c.charCodeAt(0)))
}
async function subscribeToPush() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
    const reg = await navigator.serviceWorker.ready
    const { publicKey } = await (await fetch('/api/push/vapid-key')).json()
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) })
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ subscription: sub.toJSON() })
    })
    return sub
  } catch { return null }
}

// ── Schedule browser notification ────────────────────────────────────────────
const scheduledKeys = new Set()
function scheduleNotif(med, dose, onYes, onNo) {
  if (Notification.permission !== 'granted') return
  const key = `${med.medicineId || med._id}-${dose.date}-${dose.time}`
  if (scheduledKeys.has(key)) return
  const [h, m] = dose.time.split(':').map(Number)
  const fireAt = new Date(); fireAt.setHours(h, m, 0, 0)
  const diff = fireAt - Date.now()
  if (diff <= 0 || diff > 24 * 60 * 60 * 1000) return
  scheduledKeys.add(key)

  setTimeout(() => {
    addNotif({
      type: 'dose_due',
      title: `💊 ${med.name}`,
      body: `${med.dosage}${med.instructions ? ' · ' + med.instructions : ''} — ${fmtTime(dose.time)}`,
      medId: med.medicineId || med._id,
      date: dose.date,
      time: dose.time,
    })
    const n = new Notification(`💊 ${med.name} lene ka waqt!`, {
      body: `${med.dosage}${med.instructions ? ' · ' + med.instructions : ''}\nClick: ✅ Liya  |  Ignore: ❌ Skip`,
      icon: '/favicon.svg', tag: key, requireInteraction: true,
    })
    n.onclick = () => { onYes?.(med, dose); n.close() }
    // 30 min auto-miss
    setTimeout(() => onNo?.(med, dose), 30 * 60 * 1000)
  }, diff)
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MedicineTracker({ onClose }) {
  const [tab, setTab] = useState('today')
  const [medicines, setMedicines] = useState([])
  const [todayDoses, setTodayDoses] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [parsedMed, setParsedMed] = useState(null)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [notifOn, setNotifOn] = useState(Notification?.permission === 'granted')
  const [pushEnabled, setPushEnabled] = useState(false)
  const [calMonth, setCalMonth] = useState(new Date())
  const [selDate, setSelDate] = useState(TODAY())
  const [eodModal, setEodModal] = useState(false)
  const [notifications, setNotifications] = useState(getNotifs())
  const [prediction, setPrediction] = useState(null)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  const showMsg = useCallback((type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 3000)
  }, [])

  // Sync notifs from localStorage
  useEffect(() => {
    const h = () => setNotifications(getNotifs())
    window.addEventListener('notif_update', h)
    return () => window.removeEventListener('notif_update', h)
  }, [])

  // Fetch medicines
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [a, b] = await Promise.all([API.get('/medicine/all'), API.get('/medicine/today')])
      setMedicines(a.data.medicines || [])
      setTodayDoses(b.data.doses || [])
    } catch { showMsg('error', 'Could not load medicines.') }
    setLoading(false)
  }, [showMsg])
  useEffect(() => { fetchAll() }, [fetchAll])

  // Fetch prediction
  const fetchPrediction = useCallback(async () => {
    try {
      const res = await API.get('/medicine/prediction')
      if (res.data?.patterns) setPrediction(res.data)
    } catch { }
  }, [])
  useEffect(() => { fetchPrediction() }, [fetchPrediction])

  // Schedule notifications
  useEffect(() => {
    if (!notifOn) return
    todayDoses.forEach(med => {
      med.doses?.forEach(dose => {
        if (dose.taken === null) scheduleNotif(med, dose,
          (m, d) => handleDose(m, d, true),
          (m, d) => handleDose(m, d, false)
        )
      })
    })
  }, [todayDoses, notifOn])

  // SW message
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const h = (e) => {
      const { type, medId, date, time } = e.data || {}
      if (!medId) return
      const med = todayDoses.find(m => (m.medicineId || m._id) === medId)
      const dose = med?.doses?.find(d => d.date === date && d.time === time)
      if (med && dose) handleDose(med, dose, type === 'DOSE_TAKEN')
    }
    navigator.serviceWorker.addEventListener('message', h)
    return () => navigator.serviceWorker.removeEventListener('message', h)
  }, [todayDoses])

  // EOD
  useEffect(() => {
    const eod = new Date(); eod.setHours(21, 0, 0, 0)
    const diff = eod - Date.now()
    if (diff > 0) { const t = setTimeout(() => setEodModal(true), diff); return () => clearTimeout(t) }
  }, [])

  // Actions
  const enableNotif = async () => {
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') { showMsg('error', 'Permission denied.'); return }
    setNotifOn(true)
    const sub = await subscribeToPush()
    if (sub) { setPushEnabled(true); showMsg('success', '🔔 Push notifications enabled!') }
    else showMsg('success', '🔔 Notifications enabled!')
  }

  const handleDose = useCallback(async (med, dose, taken) => {
    try {
      await API.put('/medicine/dose', { medicineId: med.medicineId || med._id, date: dose.date, time: dose.time, taken })
      // Update notif status
      const notifs = getNotifs().map(n =>
        n.medId === (med.medicineId || med._id) && n.date === dose.date && n.time === dose.time
          ? { ...n, status: taken ? 'yes' : 'no', read: true }
          : n
      )
      saveNotifs(notifs); setNotifications(notifs)
      await fetchAll()
      setTimeout(fetchPrediction, 1500)
      showMsg('success', taken ? '✅ Taken!' : '❌ Skipped.')
    } catch { showMsg('error', 'Update failed.') }
  }, [fetchAll, fetchPrediction, showMsg])

  // Respond to notification (yes/no from notification center)
  const respondToNotif = async (notif, answer) => {
    const med = todayDoses.find(m => (m.medicineId || m._id) === notif.medId)
    const dose = med?.doses?.find(d => d.date === notif.date && d.time === notif.time)
    if (med && dose) {
      await handleDose(med, dose, answer)
    } else {
      try {
        await API.put('/medicine/dose', { medicineId: notif.medId, date: notif.date, time: notif.time, taken: answer })
        const notifs = getNotifs().map(n => n.id === notif.id ? { ...n, status: answer ? 'yes' : 'no', read: true } : n)
        saveNotifs(notifs); setNotifications(notifs)
        showMsg('success', answer ? '✅ Marked as taken!' : '❌ Marked as skipped.')
      } catch { showMsg('error', 'Update failed.') }
    }
  }

  const markRead = (id) => {
    const notifs = getNotifs().map(n => n.id === id ? { ...n, read: true } : n)
    saveNotifs(notifs); setNotifications(notifs)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this medicine?')) return
    await API.delete(`/medicine/${id}`)
    showMsg('success', 'Deleted.'); fetchAll()
  }

  // Voice
  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { showMsg('error', 'Voice not supported in this browser.'); return }
    if (recognitionRef.current) { recognitionRef.current.stop(); return }
    const rec = new SR()
    rec.lang = 'hi-IN'; rec.continuous = false; rec.interimResults = false
    recognitionRef.current = rec; setListening(true)
    rec.onresult = (e) => { setAiInput(e.results[0][0].transcript); setListening(false); recognitionRef.current = null }
    rec.onerror = () => { setListening(false); recognitionRef.current = null; showMsg('error', 'Voice error.') }
    rec.onend = () => { setListening(false); recognitionRef.current = null }
    rec.start()
  }

  // AI Parse
  const handleAIParse = async () => {
    if (!aiInput.trim()) return
    setAiLoading(true)
    try {
      const { data } = await API.post('/medicine/parse', { input: aiInput })
      setParsedMed({ ...data.medicine, color: COLORS[Math.floor(Math.random() * COLORS.length)] })
    } catch (e) { showMsg('error', e?.response?.data?.message || 'Could not parse.') }
    setAiLoading(false)
  }

  const handleSave = async () => {
    if (!parsedMed) return
    setLoading(true)
    try {
      await API.post('/medicine/add', parsedMed)
      showMsg('success', `${parsedMed.name} added!`)
      setParsedMed(null); setAiInput('')
      await fetchAll(); setTimeout(() => setTab('today'), 800)
    } catch { showMsg('error', 'Failed to save.') }
    setLoading(false)
  }

  // Calendar
  const getDayStatus = (ds) => {
    let total = 0, taken = 0, skipped = 0
    const today = TODAY()
    medicines.forEach(med => {
      if (med.startDate > ds || med.endDate < ds) return
      med.doseLogs?.forEach(l => {
        if (l.date !== ds) return
        total++
        if (l.taken === true) taken++
        if (l.taken === false) skipped++
      })
    })
    if (!total) return null
    if (ds < today) { if (taken === total) return 'full'; if (taken > 0) return 'partial'; return 'skipped' }
    if (taken === total) return 'full'
    if (taken > 0) return 'partial'
    if (skipped > 0) return 'skipped'
    return 'pending'
  }

  const getDateDoses = (ds) => medicines.map(med => {
    const logs = med.doseLogs?.filter(l => l.date === ds) || []
    return logs.length ? { ...med, todayLogs: logs } : null
  }).filter(Boolean)

  const allTaken = todayDoses.length > 0 && todayDoses.every(m => m.doses?.every(d => d.taken === true))
  const unreadCount = notifications.filter(n => !n.read).length
  const pendingNotifs = notifications.filter(n => n.status === 'pending')

  // Styles
  const BG = '#0b0f1a', CARD = '#111827', CARD2 = '#1a2236'
  const BORDER = 'rgba(255,255,255,0.07)', TEXT = '#f1f5f9', MUTED = '#64748b', PRI = '#4f46e5'
  const crd = (x = {}) => ({ background: CARD, borderRadius: '12px', padding: '14px', border: `1px solid ${BORDER}`, marginBottom: '10px', ...x })
  const btn = (p, x = {}) => ({ padding: '8px 14px', borderRadius: '8px', border: 'none', background: p ? PRI : CARD2, color: p ? '#fff' : TEXT, fontWeight: '600', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', ...x })
  const pill = (c) => ({ padding: '2px 8px', borderRadius: '20px', background: c + '20', color: c, fontSize: '10px', fontWeight: '700', display: 'inline-block' })
  const inp = (x = {}) => ({ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: CARD2, color: TEXT, fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', ...x })

  // ══════════════════════════════════════════════════════════
  // NOTIFICATION CENTER
  // ══════════════════════════════════════════════════════════
  const NotifTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p style={{ fontWeight: '700', color: TEXT, margin: 0, fontSize: '13px' }}>
          Alerts {unreadCount > 0 && <span style={{ ...pill(PRI), marginLeft: '4px' }}>{unreadCount} new</span>}
        </p>
        {notifications.length > 0 && (
          <button onClick={() => { saveNotifs([]); setNotifications([]) }} style={{ ...btn(false), padding: '4px 8px', fontSize: '10px', color: MUTED }}>Clear all</button>
        )}
      </div>

      {/* Pending — need YES/NO */}
      {pendingNotifs.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <p style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>⚡ Action Required</p>
          {pendingNotifs.map(n => (
            <div key={n.id} style={{ ...crd({ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }) }}>
              <p style={{ fontWeight: '700', color: TEXT, margin: '0 0 2px', fontSize: '13px' }}>{n.title}</p>
              <p style={{ color: MUTED, fontSize: '11px', margin: '0 0 10px' }}>{n.body}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => respondToNotif(n, true)}
                  style={{ ...btn(false), flex: 1, background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                  ✅ Yes, liya
                </button>
                <button onClick={() => respondToNotif(n, false)}
                  style={{ ...btn(false), flex: 1, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  ❌ No, skip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: MUTED }}>
          <p style={{ fontSize: '28px', margin: '0 0 8px' }}>🔔</p>
          <p style={{ fontSize: '12px' }}>No notifications yet</p>
          <p style={{ fontSize: '11px', margin: '4px 0 0', color: MUTED }}>Medicine reminders will appear here</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '10px', color: MUTED, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>History</p>
          {notifications.map(n => (
            <div key={n.id} onClick={() => markRead(n.id)}
              style={{ ...crd({ opacity: n.read ? 0.55 : 1, cursor: 'pointer', borderLeft: `3px solid ${n.status === 'yes' ? '#10b981' : n.status === 'no' ? '#ef4444' : '#f59e0b'}` }), marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', color: TEXT, margin: '0 0 2px', fontSize: '12px' }}>{n.title}</p>
                  <p style={{ color: MUTED, fontSize: '11px', margin: 0 }}>{n.body}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', marginLeft: '8px' }}>
                  <span style={{ fontSize: '10px', color: MUTED }}>{new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span style={pill(n.status === 'yes' ? '#10b981' : n.status === 'no' ? '#ef4444' : '#f59e0b')}>
                    {n.status === 'yes' ? 'Taken' : n.status === 'no' ? 'Skipped' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* AI Prediction Insight */}
      {prediction?.patterns && (() => {
        const { bySlot, worstSlot, overallAdherence, timeAdjustments } = prediction.patterns
        const slots = Object.entries(bySlot || {}).filter(([, v]) => v.total > 0)
        if (!slots.length) return null
        return (
          <div style={{ ...crd({ borderLeft: `3px solid ${PRI}`, marginTop: '16px' }) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ fontWeight: '700', color: TEXT, margin: 0, fontSize: '12px' }}>Smart Insights</p>
              <span style={pill(overallAdherence >= 0.7 ? '#10b981' : overallAdherence >= 0.4 ? '#f59e0b' : '#ef4444')}>
                {Math.round(overallAdherence * 100)}% overall
              </span>
            </div>
            {prediction.insight && (
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px', lineHeight: '1.6', padding: '8px', background: CARD2, borderRadius: '8px' }}>
                {prediction.insight}
              </p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              {slots.map(([slot, data]) => {
                const pct = Math.round(data.rate * 100)
                const isWorst = worstSlot?.slot === slot
                const adj = timeAdjustments?.[slot] || 0
                const color = pct >= 60 ? '#ef4444' : pct >= 30 ? '#f59e0b' : '#10b981'
                return (
                  <div key={slot} style={{ padding: '7px', borderRadius: '7px', background: CARD2, border: `1px solid ${isWorst ? 'rgba(239,68,68,0.25)' : BORDER}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '10px', color: TEXT }}>{SLOT_LABELS[slot]}</span>
                      <span style={{ fontSize: '10px', fontWeight: '700', color }}>{pct}%</span>
                    </div>
                    <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px' }} />
                    </div>
                    {adj !== 0 && <p style={{ fontSize: '9px', color: '#f59e0b', margin: '3px 0 0' }}>Notif {Math.abs(adj)} min earlier</p>}
                    {isWorst && <p style={{ fontSize: '9px', color: '#ef4444', margin: '3px 0 0' }}>Extra reminder active</p>}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )

  // ══════════════════════════════════════════════════════════
  // TODAY TAB
  // ══════════════════════════════════════════════════════════
  const TodayTab = () => (
    <div>
      {allTaken && (
        <div style={{ ...crd({ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', textAlign: 'center' }) }}>
          <p style={{ color: '#10b981', fontWeight: '700', margin: 0, fontSize: '12px' }}>All medicines taken today ✓</p>
        </div>
      )}
      {todayDoses.length === 0 && !loading ? (
        <div style={{ ...crd({ textAlign: 'center', padding: '28px 16px' }) }}>
          <p style={{ fontSize: '12px', color: MUTED, margin: '0 0 10px' }}>No medicines scheduled today</p>
          <button onClick={() => setTab('add')} style={btn(true)}>+ Add Medicine</button>
        </div>
      ) : todayDoses.map(med => (
        <div key={med.medicineId} style={{ ...crd({ borderLeft: `3px solid ${med.color || PRI}` }) }}>
          <p style={{ fontWeight: '700', color: TEXT, margin: '0 0 2px', fontSize: '13px' }}>{med.name}</p>
          <p style={{ color: MUTED, fontSize: '11px', margin: '0 0 8px' }}>{med.dosage}{med.instructions ? ` · ${med.instructions}` : ''}</p>
          {med.doses?.map((dose, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '7px', background: CARD2, marginBottom: '4px' }}>
              <span style={{ fontWeight: '600', color: TEXT, fontSize: '12px' }}>{fmtTime(dose.time)}</span>
              {dose.taken === null ? (
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => handleDose(med, dose, true)} style={{ padding: '4px 11px', borderRadius: '6px', border: 'none', background: 'rgba(16,185,129,0.12)', color: '#10b981', fontWeight: '700', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>✓ Yes</button>
                  <button onClick={() => handleDose(med, dose, false)} style={{ padding: '4px 11px', borderRadius: '6px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>✕ No</button>
                </div>
              ) : (
                <span style={pill(dose.taken ? '#10b981' : '#ef4444')}>{dose.taken ? 'Taken' : 'Skipped'}</span>
              )}
            </div>
          ))}
        </div>
      ))}
      {todayDoses.length > 0 && !allTaken && (
        <button onClick={async () => { for (const m of todayDoses) for (const d of m.doses || []) if (d.taken === null) await handleDose(m, d, true) }}
          style={{ ...btn(false), width: '100%', color: '#10b981', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
          Mark all as taken
        </button>
      )}
    </div>
  )

  // ══════════════════════════════════════════════════════════
  // ADD TAB
  // ══════════════════════════════════════════════════════════
  const AddTab = () => (
    <div>
      <div style={{ ...crd({ border: '1px solid rgba(79,70,229,0.22)' }) }}>
        <p style={{ fontWeight: '700', color: TEXT, margin: '0 0 3px', fontSize: '13px' }}>Quick Add</p>
        <p style={{ color: MUTED, fontSize: '11px', margin: '0 0 10px' }}>Type or speak your medicine schedule</p>
        <div style={{ position: 'relative' }}>
          <textarea value={aiInput} onChange={e => setAiInput(e.target.value)}
            placeholder='e.g. "Paracetamol 500mg subah 8 baje 5 din water ke saath"'
            rows={3} style={{ ...inp({ resize: 'none', paddingRight: '46px' }) }} />
          <button onClick={startVoice} style={{
            position: 'absolute', right: '8px', top: '10px', width: '30px', height: '30px',
            borderRadius: '50%', border: 'none', background: listening ? '#ef4444' : PRI, color: '#fff',
            cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: listening ? '0 0 0 3px rgba(239,68,68,0.25)' : 'none', transition: 'all 0.2s',
          }}>
            {listening ? '⏹' : '🎤'}
          </button>
        </div>
        {listening && <p style={{ color: '#ef4444', fontSize: '11px', margin: '5px 0 0', fontWeight: '600' }}>Listening... bol do apni medicine</p>}
        <button onClick={handleAIParse} disabled={aiLoading || !aiInput.trim()}
          style={{ ...btn(true), width: '100%', marginTop: '8px', opacity: aiLoading || !aiInput.trim() ? 0.6 : 1 }}>
          {aiLoading ? 'Processing...' : 'Fill Form'}
        </button>
      </div>

      {parsedMed && (
        <div style={{ ...crd({ border: '1px solid rgba(16,185,129,0.25)' }) }}>
          <p style={{ fontWeight: '700', color: '#10b981', margin: '0 0 10px', fontSize: '12px' }}>Parsed Successfully ✓</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '10px' }}>
            {[['Medicine', parsedMed.name], ['Dosage', parsedMed.dosage], ['Duration', `${parsedMed.days} days`], ['Instructions', parsedMed.instructions || '—'], ['Start', fmtDate(parsedMed.startDate)], ['End', fmtDate(parsedMed.endDate)]].map(([l, v]) => (
              <div key={l} style={{ padding: '7px 9px', borderRadius: '7px', background: CARD2 }}>
                <p style={{ fontSize: '9px', color: MUTED, margin: '0 0 1px', fontWeight: '700', textTransform: 'uppercase' }}>{l}</p>
                <p style={{ fontSize: '12px', color: TEXT, fontWeight: '600', margin: 0 }}>{v}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '10px', color: MUTED, fontWeight: '700', margin: '0 0 5px', textTransform: 'uppercase' }}>Schedule</p>
          {parsedMed.schedules?.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 9px', borderRadius: '7px', background: CARD2, marginBottom: '3px' }}>
              <span style={{ fontWeight: '600', color: TEXT, fontSize: '12px' }}>{fmtTime(s.time)}</span>
              {s.label && <span style={{ fontSize: '11px', color: MUTED }}>({s.label})</span>}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '7px', marginTop: '10px' }}>
            <button onClick={handleSave} disabled={loading} style={{ ...btn(true), flex: 1 }}>{loading ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setParsedMed(null)} style={{ ...btn(false), flex: 1 }}>Re-parse</button>
          </div>
        </div>
      )}
    </div>
  )

  // ══════════════════════════════════════════════════════════
  // CALENDAR TAB
  // ══════════════════════════════════════════════════════════
  const CalendarTab = () => {
    const year = calMonth.getFullYear(), month = calMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() - 1))} style={btn(false, { padding: '4px 10px' })}>‹</button>
          <p style={{ fontWeight: '700', color: TEXT, margin: 0, fontSize: '13px' }}>{calMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
          <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() + 1))} style={btn(false, { padding: '4px 10px' })}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '3px' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: '9px', fontWeight: '600', color: MUTED }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '10px' }}>
          {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1
            const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const status = getDayStatus(ds)
            const isToday = ds === TODAY(), isSel = ds === selDate
            return (
              <button key={day} onClick={() => setSelDate(ds)} style={{
                padding: '5px 0', borderRadius: '6px',
                border: isSel ? `2px solid ${PRI}` : isToday ? `2px solid ${PRI}55` : '2px solid transparent',
                background: isSel ? PRI : status ? STATUS_COLOR[status] + '22' : CARD2,
                color: isSel ? '#fff' : TEXT, fontWeight: isToday || isSel ? '700' : '400',
                fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', position: 'relative',
              }}>
                {day}
                {status && !isSel && <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '3px', height: '3px', borderRadius: '50%', background: STATUS_COLOR[status] }} />}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {[['#10b981', 'Taken'], ['#f59e0b', 'Partial'], ['#ef4444', 'Missed'], ['#6366f1', 'Pending']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c }} />
              <span style={{ fontSize: '10px', color: MUTED }}>{l}</span>
            </div>
          ))}
        </div>
        <p style={{ fontWeight: '600', color: TEXT, margin: '0 0 7px', fontSize: '12px' }}>{fmtDate(selDate)}</p>
        {getDateDoses(selDate).length === 0
          ? <p style={{ color: MUTED, fontSize: '12px' }}>No medicines on this day.</p>
          : getDateDoses(selDate).map((med, mi) => (
            <div key={mi} style={{ ...crd({ borderLeft: `3px solid ${med.color || PRI}` }) }}>
              <p style={{ fontWeight: '600', color: TEXT, margin: '0 0 6px', fontSize: '12px' }}>{med.name}</p>
              {med.todayLogs?.map((log, li) => (
                <div key={li} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 9px', borderRadius: '6px', background: CARD2, marginBottom: '3px' }}>
                  <span style={{ color: TEXT, fontSize: '11px' }}>{fmtTime(log.time)}</span>
                  <span style={pill(log.taken === true ? '#10b981' : log.taken === false ? '#ef4444' : '#6366f1')}>
                    {log.taken === true ? 'Taken' : log.taken === false ? 'Missed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          ))
        }
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════
  // ALL TAB
  // ══════════════════════════════════════════════════════════
  const AllTab = () => (
    <div>
      {medicines.length === 0
        ? <div style={{ ...crd({ textAlign: 'center', padding: '28px' }) }}>
          <p style={{ color: MUTED, fontSize: '12px', margin: '0 0 10px' }}>No medicines added yet</p>
          <button onClick={() => setTab('add')} style={btn(true)}>+ Add Medicine</button>
        </div>
        : medicines.map(med => {
          const total = med.doseLogs?.length || 0
          const taken = med.doseLogs?.filter(d => d.taken === true).length || 0
          const pct = total > 0 ? Math.round((taken / total) * 100) : 0
          const active = med.startDate <= TODAY() && med.endDate >= TODAY()
          return (
            <div key={med._id} style={{ ...crd({ borderLeft: `3px solid ${med.color || PRI}` }) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <p style={{ fontWeight: '700', color: TEXT, margin: 0, fontSize: '13px' }}>{med.name}</p>
                    {active && <span style={pill('#10b981')}>Active</span>}
                  </div>
                  <p style={{ color: MUTED, fontSize: '11px', margin: '0 0 2px' }}>{med.dosage}{med.instructions ? ` · ${med.instructions}` : ''}</p>
                  <p style={{ color: MUTED, fontSize: '11px', margin: 0 }}>{fmtDate(med.startDate)} → {fmtDate(med.endDate)}</p>
                </div>
                <button onClick={() => handleDelete(med._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: '13px', padding: '2px' }}>🗑</button>
              </div>
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '10px', color: MUTED }}>Adherence</span>
                  <span style={{ fontSize: '10px', color: TEXT, fontWeight: '600' }}>{taken}/{total} ({pct}%)</span>
                </div>
                <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: med.color || PRI, borderRadius: '2px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                {med.schedules?.map((s, i) => <span key={i} style={pill(med.color || PRI)}>{fmtTime(s.time)}</span>)}
              </div>
            </div>
          )
        })
      }
    </div>
  )

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: '100%', maxWidth: '400px',
      background: BG, borderLeft: `1px solid ${BORDER}`,
      display: 'flex', flexDirection: 'column',
      zIndex: 10001, boxShadow: '-12px 0 40px rgba(0,0,0,0.5)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Header */}
      <div style={{ padding: '13px 15px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '11px' }}>
          <p style={{ fontWeight: '700', color: TEXT, fontSize: '14px', margin: 0 }}>Medicine Tracker</p>
          <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
            {!notifOn
              ? <button onClick={enableNotif} style={{ padding: '4px 9px', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', color: '#f59e0b', fontSize: '10px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Enable Alerts</button>
              : <span style={{ fontSize: '10px', color: pushEnabled ? '#10b981' : '#f59e0b' }}>{pushEnabled ? '🔔 Push' : '🔔 On'}</span>
            }
            <button onClick={onClose} style={{ width: '26px', height: '26px', borderRadius: '6px', background: CARD2, border: `1px solid ${BORDER}`, cursor: 'pointer', color: MUTED, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✕</button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {[['today', 'Today'], ['add', '+ Add'], ['notifs', `Alerts${unreadCount > 0 ? ` (${unreadCount})` : ''}`], ['calendar', 'Calendar'], ['all', 'All']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '5px 11px', borderRadius: '6px', border: 'none',
              background: tab === id ? PRI : CARD2,
              color: tab === id ? '#fff' : id === 'notifs' && unreadCount > 0 ? '#f59e0b' : MUTED,
              fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Toast */}
      {msg.text && (
        <div style={{ margin: '7px 11px 0', padding: '7px 11px', borderRadius: '7px', fontSize: '11px', fontWeight: '600', background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: msg.type === 'success' ? '#10b981' : '#ef4444', border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, flexShrink: 0 }}>
          {msg.text}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '11px 13px 24px' }}>
        {loading && tab === 'today'
          ? <div style={{ textAlign: 'center', padding: '40px', color: MUTED, fontSize: '12px' }}>Loading...</div>
          : <>
            {tab === 'today' && <TodayTab />}
            {tab === 'add' && <AddTab />}
            {tab === 'notifs' && <NotifTab />}
            {tab === 'calendar' && <CalendarTab />}
            {tab === 'all' && <AllTab />}
          </>
        }
      </div>

      {/* EOD Modal */}
      {eodModal && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 10 }}>
          <div style={{ background: CARD, borderRadius: '14px', padding: '22px', width: '100%', textAlign: 'center', border: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: '26px', margin: '0 0 7px' }}>🌙</p>
            <h3 style={{ color: TEXT, fontWeight: '700', margin: '0 0 5px', fontSize: '14px' }}>End of Day</h3>
            <p style={{ color: MUTED, fontSize: '11px', margin: '0 0 14px' }}>Did you take all medicines today?</p>
            <div style={{ display: 'flex', gap: '7px' }}>
              <button onClick={async () => { setEodModal(false); for (const m of todayDoses) for (const d of m.doses || []) if (d.taken === null) await handleDose(m, d, true) }} style={{ ...btn(true), flex: 1 }}>Yes, all taken</button>
              <button onClick={() => { setEodModal(false); setTab('today') }} style={{ ...btn(false), flex: 1 }}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
