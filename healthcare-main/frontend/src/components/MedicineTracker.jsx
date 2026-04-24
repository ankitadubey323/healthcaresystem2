import { useState, useEffect, useCallback, useRef, memo } from 'react'

// ── helpers ───────────────────────────────────────────────────────────────────
const TODAY = () => new Date().toISOString().split('T')[0]
const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
const fmtTime = (t) => {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}
const genId = () => Math.random().toString(36).slice(2)
const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6']
const STATUS_COLOR = { full: '#10b981', partial: '#f59e0b', skipped: '#ef4444', pending: '#6366f1' }

const LS = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { } },
}

async function requestNotifPerm() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  return (await Notification.requestPermission()) === 'granted'
}

const scheduled = new Set()
function scheduleNotif(med, log, onYes) {
  const key = `${med.id}-${log.date}-${log.time}`
  if (scheduled.has(key) || Notification.permission !== 'granted') return
  const [h, m] = log.time.split(':').map(Number)
  const fireAt = new Date(); fireAt.setHours(h, m, 0, 0)
  const diff = fireAt - Date.now()
  if (diff <= 0) return
  scheduled.add(key)
  setTimeout(() => {
    const n = new Notification(`💊 ${med.name} lene ka waqt!`, {
      body: `${med.dosage}${med.instructions ? '\n' + med.instructions : ''}`,
      icon: '/icon.png', tag: key, requireInteraction: true,
    })
    n.onclick = () => { onYes(med.id, log.date, log.time); n.close() }
  }, diff)
}

function generateLogs(med) {
  const logs = []
  const end = new Date(med.endDate + 'T00:00:00')
  for (let d = new Date(med.startDate + 'T00:00:00'); d <= end; d.setDate(d.getDate() + 1)) {
    const ds = d.toISOString().split('T')[0]
    med.times.forEach(t => logs.push({ date: ds, time: t, taken: null }))
  }
  return logs
}

// ── Fast uncontrolled Input ────────────────────────────────────────────────────
const FastInput = memo(({ defaultValue, onChange, placeholder, type = 'text', style = {} }) => {
  const ref = useRef()
  useEffect(() => { if (ref.current) ref.current.value = defaultValue ?? '' }, [])
  return (
    <input
      ref={ref}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={style}
    />
  )
})

const FastTextarea = memo(({ defaultValue, onChange, placeholder, rows = 2, style = {} }) => {
  const ref = useRef()
  useEffect(() => { if (ref.current) ref.current.value = defaultValue ?? '' }, [])
  return (
    <textarea
      ref={ref}
      rows={rows}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={style}
    />
  )
})

// ─────────────────────────────────────────────────────────────────────────────
export default function MedicineTracker({ onClose }) {
  const [medicines, setMedicines] = useState(() => LS.get('medtrk_v3') || [])
  const [view, setView] = useState('home')
  const [selDate, setSelDate] = useState(TODAY())
  const [calMonth, setCalMonth] = useState(new Date())
  const [notifOn, setNotifOn] = useState(Notification?.permission === 'granted')
  const [eodModal, setEodModal] = useState(false)
  const [eodDone, setEodDone] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [aiLoading, setAiLoading] = useState(false)

  // ── Add form — each field is its own ref (zero re-render on typing) ─────────
  const fName = useRef('')
  const fDosage = useRef('')
  const fInstructions = useRef('')
  const fStartDate = useRef(TODAY())
  const fDays = useRef('7')
  const [fTimes, setFTimes] = useState(['08:00'])
  const [fColor, setFColor] = useState(COLORS[0])
  const aiRef = useRef('')

  useEffect(() => { LS.set('medtrk_v3', medicines) }, [medicines])

  const showMsg = useCallback((type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 3000)
  }, [])

  // schedule notifications
  useEffect(() => {
    if (!notifOn) return
    const t = TODAY()
    medicines.forEach(med => {
      med.logs?.forEach(log => {
        if (log.date === t && log.taken === null) scheduleNotif(med, log, updateDose)
      })
    })
  }, [medicines, notifOn])

  // EOD at 9 PM
  useEffect(() => {
    const eod = new Date(); eod.setHours(21, 0, 0, 0)
    const diff = eod - Date.now()
    if (diff > 0 && !eodDone) {
      const t = setTimeout(() => setEodModal(true), diff)
      return () => clearTimeout(t)
    }
  }, [eodDone])

  // ── actions ────────────────────────────────────────────────────────────────
  const updateDose = useCallback((medId, date, time, taken) => {
    setMedicines(prev => prev.map(m =>
      m.id !== medId ? m : {
        ...m,
        logs: m.logs.map(l =>
          l.date === date && l.time === time
            ? { ...l, taken, takenAt: taken ? new Date().toISOString() : null }
            : l
        )
      }
    ))
    showMsg('success', taken ? '✅ Marked as taken!' : '❌ Dose skipped.')
  }, [showMsg])

  const addMedicine = useCallback(() => {
    const name = fName.current.trim()
    const startDate = fStartDate.current
    const days = parseInt(fDays.current)
    if (!name || !startDate || !days || fTimes.length === 0) {
      showMsg('error', 'Please fill Name, Start Date, Duration and at least one time.')
      return
    }
    const end = new Date(startDate + 'T00:00:00')
    end.setDate(end.getDate() + days - 1)
    const med = {
      id: genId(),
      name,
      dosage: fDosage.current.trim() || '1 tablet',
      instructions: fInstructions.current.trim(),
      startDate, endDate: end.toISOString().split('T')[0], days,
      times: [...fTimes],
      color: fColor,
      createdAt: new Date().toISOString(),
    }
    med.logs = generateLogs(med)
    setMedicines(prev => [med, ...prev])
    // reset refs
    fName.current = ''; fDosage.current = ''; fInstructions.current = ''
    fStartDate.current = TODAY(); fDays.current = '7'
    setFTimes(['08:00']); setFColor(COLORS[0])
    setView('home')
    showMsg('success', `✅ ${med.name} added! Reminders set.`)
  }, [fTimes, fColor, showMsg])

  const deleteMedicine = useCallback((id) => {
    if (!confirm('Delete this medicine?')) return
    setMedicines(prev => prev.filter(m => m.id !== id))
    showMsg('success', 'Deleted.')
  }, [showMsg])

  const handleAIParse = async () => {
    const input = aiRef.current.trim()
    if (!input) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/medicine/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ input }),
      })
      if (!res.ok) throw new Error()
      const { medicine: m } = await res.json()
      fName.current = m.name || ''
      fDosage.current = m.dosage || ''
      fInstructions.current = m.instructions || ''
      fStartDate.current = m.startDate || TODAY()
      fDays.current = String(m.days || 7)
      if (m.schedules?.length) setFTimes(m.schedules.map(s => s.time))
      setFColor(COLORS[Math.floor(Math.random() * COLORS.length)])
      // force re-render of AddView to update defaultValues
      setView('_tmp'); setTimeout(() => setView('add'), 0)
      showMsg('success', '🤖 Form filled! Review and save.')
    } catch {
      showMsg('error', 'AI parse failed. Fill manually.')
    }
    setAiLoading(false)
  }

  // ── derived ────────────────────────────────────────────────────────────────
  const getDayStatus = (ds) => {
    let total = 0, taken = 0, skipped = 0
    medicines.forEach(m => m.logs?.forEach(l => {
      if (l.date !== ds) return
      total++
      if (l.taken === true) taken++
      if (l.taken === false) skipped++
    }))
    if (!total) return null
    if (taken === total) return 'full'
    if (taken > 0) return 'partial'
    if (skipped > 0) return 'skipped'
    return 'pending'
  }

  const todayLogs = medicines
    .filter(m => m.startDate <= TODAY() && m.endDate >= TODAY())
    .flatMap(m => (m.logs || []).filter(l => l.date === TODAY()).map(l => ({ ...l, med: m })))
    .sort((a, b) => a.time.localeCompare(b.time))

  const allTaken = todayLogs.length > 0 && todayLogs.every(l => l.taken === true)
  const pendingCount = todayLogs.filter(l => l.taken === null).length

  // ── colours ────────────────────────────────────────────────────────────────
  const BG = '#0b0f1a', CARD = '#131929', CARD2 = '#1a2236'
  const BORDER = 'rgba(255,255,255,0.07)', TEXT = '#f1f5f9', MUTED = '#7c8da6', PRI = '#6366f1'

  const crd = (x = {}) => ({ background: CARD, borderRadius: '16px', padding: '16px', border: `1px solid ${BORDER}`, ...x })
  const btn = (p, x = {}) => ({ padding: '9px 15px', borderRadius: '10px', border: 'none', background: p ? PRI : CARD2, color: p ? '#fff' : TEXT, fontWeight: '600', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', ...x })
  const inp = (x = {}) => ({ width: '100%', padding: '10px 13px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: CARD2, color: TEXT, fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', ...x })
  const pill = (c) => ({ padding: '3px 8px', borderRadius: '20px', background: c + '22', color: c, fontSize: '11px', fontWeight: '700', display: 'inline-block' })

  // ════════════════════════════════════════════════════════════════════════════
  // HOME
  // ════════════════════════════════════════════════════════════════════════════
  const HomeView = () => {
    const year = calMonth.getFullYear()
    const month = calMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return (
      <div>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
          {[[todayLogs.length, 'Total', PRI], [todayLogs.filter(l => l.taken === true).length, 'Taken', '#10b981'], [pendingCount, 'Pending', pendingCount > 0 ? '#f59e0b' : MUTED]].map(([v, l, c]) => (
            <div key={l} style={{ ...crd(), textAlign: 'center', padding: '12px 6px' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', color: c, margin: 0 }}>{v}</p>
              <p style={{ fontSize: '10px', color: MUTED, margin: '2px 0 0' }}>{l}</p>
            </div>
          ))}
        </div>

        {/* TODAY TABLE */}
        <div style={{ ...crd(), marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontWeight: '800', color: TEXT, margin: 0, fontSize: '14px' }}>📅 Today's Medicines</p>
            <span style={{ fontSize: '11px', color: MUTED }}>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          </div>

          {allTaken && (
            <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '10px' }}>
              <p style={{ color: '#10b981', fontWeight: '700', margin: 0, fontSize: '13px' }}>🎉 All medicines taken today!</p>
            </div>
          )}

          {todayLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: MUTED }}>
              <p style={{ fontSize: '13px', margin: '0 0 10px' }}>No medicines today</p>
              <button onClick={() => setView('add')} style={btn(true)}>+ Add Medicine</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '420px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {['Medicine', 'Dosage', 'Time', 'Instructions', 'Status', 'Mark'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: MUTED, fontWeight: '600', fontSize: '10px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {todayLogs.map((log, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: '10px', color: TEXT, fontWeight: '600' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: log.med.color, flexShrink: 0 }} />
                          {log.med.name}
                        </div>
                      </td>
                      <td style={{ padding: '10px', color: MUTED }}>{log.med.dosage}</td>
                      <td style={{ padding: '10px', color: TEXT, whiteSpace: 'nowrap', fontWeight: '600' }}>🕐 {fmtTime(log.time)}</td>
                      <td style={{ padding: '10px', color: MUTED, maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.med.instructions || '—'}</td>
                      <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                        {log.taken === true ? <span style={pill('#10b981')}>✅ Taken</span>
                          : log.taken === false ? <span style={pill('#ef4444')}>❌ Skipped</span>
                            : <span style={pill('#f59e0b')}>⏳ Pending</span>}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {log.taken === null ? (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => updateDose(log.med.id, log.date, log.time, true)}
                              style={{ padding: '5px 9px', borderRadius: '7px', border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: '700', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>✅</button>
                            <button onClick={() => updateDose(log.med.id, log.date, log.time, false)}
                              style={{ padding: '5px 9px', borderRadius: '7px', border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>❌</button>
                          </div>
                        ) : (
                          <button onClick={() => updateDose(log.med.id, log.date, log.time, null)}
                            style={{ padding: '4px 8px', borderRadius: '7px', border: 'none', background: CARD2, color: MUTED, fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>Undo</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CALENDAR */}
        <div style={{ ...crd(), marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() - 1))} style={btn(false, { padding: '5px 11px' })}>‹</button>
            <p style={{ fontWeight: '800', color: TEXT, margin: 0, fontSize: '13px' }}>
              {calMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
            <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() + 1))} style={btn(false, { padding: '5px 11px' })}>›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '3px' }}>
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: '9px', fontWeight: '700', color: MUTED, paddingBottom: '3px' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1
              const ds = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const status = getDayStatus(ds)
              const isToday = ds === TODAY()
              const isSel = ds === selDate
              return (
                <button key={day} onClick={() => setSelDate(ds)} style={{
                  padding: '6px 0', borderRadius: '8px',
                  border: isSel ? `2px solid ${PRI}` : isToday ? `2px solid ${PRI}44` : '2px solid transparent',
                  background: isSel ? PRI : status ? STATUS_COLOR[status] + '22' : CARD2,
                  color: isSel ? '#fff' : TEXT, fontWeight: isToday || isSel ? '800' : '400',
                  fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', position: 'relative',
                }}>
                  {day}
                  {status && !isSel && (
                    <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: STATUS_COLOR[status] }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            {[['#10b981','All taken'],['#f59e0b','Partial'],['#ef4444','Skipped'],['#6366f1','Pending']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c }} />
                <span style={{ fontSize: '10px', color: MUTED }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Selected date detail */}
          {selDate !== TODAY() && (() => {
            const logs = medicines.flatMap(m =>
              (m.logs || []).filter(l => l.date === selDate).map(l => ({ ...l, med: m }))
            )
            if (!logs.length) return null
            return (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${BORDER}` }}>
                <p style={{ fontWeight: '700', color: TEXT, margin: '0 0 8px', fontSize: '12px' }}>📅 {fmtDate(selDate)}</p>
                {logs.map((log, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: '8px', background: CARD2, marginBottom: '4px' }}>
                    <span style={{ color: TEXT, fontSize: '12px', fontWeight: '600' }}>{log.med.name} <span style={{ color: MUTED, fontWeight: '400' }}>{fmtTime(log.time)}</span></span>
                    {log.taken === true ? <span style={pill('#10b981')}>✅</span>
                      : log.taken === false ? <span style={pill('#ef4444')}>❌</span>
                        : <span style={pill('#f59e0b')}>⏳</span>}
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        {/* ALL MEDICINES */}
        <div style={crd()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontWeight: '800', color: TEXT, margin: 0, fontSize: '14px' }}>💊 All Medicines</p>
            <button onClick={() => setView('add')} style={btn(true, { padding: '7px 13px', fontSize: '12px' })}>+ Add</button>
          </div>
          {medicines.length === 0 ? (
            <p style={{ color: MUTED, fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No medicines yet.</p>
          ) : medicines.map(med => {
            const total = med.logs?.length || 0
            const taken = med.logs?.filter(l => l.taken === true).length || 0
            const pct = total > 0 ? Math.round((taken / total) * 100) : 0
            const active = med.startDate <= TODAY() && med.endDate >= TODAY()
            return (
              <div key={med.id} style={{ padding: '12px', borderRadius: '12px', background: CARD2, border: `1px solid ${BORDER}`, borderLeft: `4px solid ${med.color}`, marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <p style={{ fontWeight: '700', color: TEXT, margin: 0, fontSize: '14px' }}>{med.name}</p>
                      {active && <span style={pill('#10b981')}>Active</span>}
                    </div>
                    <p style={{ color: MUTED, fontSize: '11px', margin: '0 0 3px' }}>{med.dosage}{med.instructions ? ` · ${med.instructions}` : ''}</p>
                    <p style={{ color: MUTED, fontSize: '11px', margin: 0 }}>📅 {fmtDate(med.startDate)} → {fmtDate(med.endDate)}</p>
                  </div>
                  <button onClick={() => deleteMedicine(med.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '14px', padding: '2px 4px' }}>🗑️</button>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '10px', color: MUTED }}>Adherence</span>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: TEXT }}>{taken}/{total} ({pct}%)</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: med.color, borderRadius: '2px', transition: 'width 0.4s' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px', marginTop: '7px', flexWrap: 'wrap' }}>
                  {med.times?.map((t, i) => <span key={i} style={pill(med.color)}>🕐 {fmtTime(t)}</span>)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ADD VIEW — uncontrolled inputs = zero lag typing
  // ════════════════════════════════════════════════════════════════════════════
  const AddView = () => (
    <div>
      {/* AI section */}
      <div style={{ ...crd(), background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '14px' }}>
        <p style={{ fontWeight: '800', color: TEXT, margin: '0 0 3px', fontSize: '13px' }}>🤖 AI Auto-Fill</p>
        <p style={{ color: MUTED, fontSize: '11px', margin: '0 0 8px' }}>Type naturally, AI fills the form below</p>
        <FastTextarea
          defaultValue=""
          onChange={v => { aiRef.current = v }}
          placeholder="e.g. Paracetamol 500mg subah 8 baje raat 9 baje 5 din"
          rows={2}
          style={{ ...inp(), resize: 'none' }}
        />
        <button onClick={handleAIParse} disabled={aiLoading}
          style={{ ...btn(true), marginTop: '8px', width: '100%', opacity: aiLoading ? 0.7 : 1 }}>
          {aiLoading ? '🤖 Parsing...' : '🤖 Auto-fill with AI'}
        </button>
      </div>

      {/* Manual form — ALL uncontrolled */}
      <div style={crd()}>
        <p style={{ fontWeight: '800', color: TEXT, margin: '0 0 14px', fontSize: '14px' }}>📝 Medicine Details</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div>
            <label style={{ fontSize: '10px', color: MUTED, fontWeight: '600', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Medicine Name *</label>
            <FastInput
              defaultValue={fName.current}
              onChange={v => { fName.current = v }}
              placeholder="e.g. Paracetamol"
              style={inp()}
            />
          </div>

          <div>
            <label style={{ fontSize: '10px', color: MUTED, fontWeight: '600', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dosage</label>
            <FastInput
              defaultValue={fDosage.current}
              onChange={v => { fDosage.current = v }}
              placeholder="e.g. 500mg, 1 tablet"
              style={inp()}
            />
          </div>

          <div>
            <label style={{ fontSize: '10px', color: MUTED, fontWeight: '600', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instructions</label>
            <FastInput
              defaultValue={fInstructions.current}
              onChange={v => { fInstructions.current = v }}
              placeholder="e.g. After meal, with water"
              style={inp()}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '10px', color: MUTED, fontWeight: '600', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start Date *</label>
              <FastInput
                defaultValue={fStartDate.current}
                onChange={v => { fStartDate.current = v }}
                type="date"
                style={inp()}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: MUTED, fontWeight: '600', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration (Days) *</label>
              <FastInput
                defaultValue={fDays.current}
                onChange={v => { fDays.current = v }}
                type="number"
                placeholder="7"
                style={inp()}
              />
            </div>
          </div>

          {/* Times */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '10px', color: MUTED, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reminder Times *</label>
              <button onClick={() => setFTimes(p => [...p, '12:00'])} style={btn(false, { padding: '4px 10px', fontSize: '11px' })}>+ Add</button>
            </div>
            {fTimes.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                <input
                  type="time"
                  defaultValue={t}
                  onChange={e => setFTimes(p => p.map((tt, ii) => ii === i ? e.target.value : tt))}
                  style={{ ...inp(), flex: 1 }}
                />
                {fTimes.length > 1 && (
                  <button onClick={() => setFTimes(p => p.filter((_, ii) => ii !== i))} style={{ ...btn(false), padding: '8px 10px', color: '#ef4444' }}>✕</button>
                )}
              </div>
            ))}
          </div>

          {/* Color */}
          <div>
            <label style={{ fontSize: '10px', color: MUTED, fontWeight: '600', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setFColor(c)} style={{ width: '26px', height: '26px', borderRadius: '50%', border: fColor === c ? '3px solid #fff' : '3px solid transparent', background: c, cursor: 'pointer', boxShadow: fColor === c ? `0 0 0 2px ${c}` : 'none' }} />
              ))}
            </div>
          </div>

          <button onClick={addMedicine} style={{ ...btn(true), padding: '12px', width: '100%', fontSize: '13px', marginTop: '4px' }}>
            💾 Save & Schedule Reminders
          </button>
        </div>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: BG, overflow: 'auto', zIndex: 10001 }}>

       {/* Header */}
       <div style={{ padding: '13px 16px', background: '#0d47a1', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: view === 'home' ? '10px' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {view !== 'home' && (
              <button onClick={() => setView('home')} style={{ ...btn(false), padding: '5px 10px', fontSize: '11px', marginRight: '4px' }}>← Back</button>
            )}
            <span style={{ fontSize: '18px' }}>💊</span>
            <span style={{ fontWeight: '900', color: TEXT, fontSize: '16px' }}>
              {view === 'add' ? 'Add Medicine' : 'Medicine Tracker'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {notifOn
              ? <span style={{ fontSize: '11px', color: '#10b981' }}>🔔 On</span>
              : <button onClick={async () => { const ok = await requestNotifPerm(); setNotifOn(ok); showMsg(ok ? 'success' : 'error', ok ? '🔔 Alerts enabled!' : 'Permission denied.') }}
                style={{ padding: '5px 10px', borderRadius: '20px', border: 'none', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                🔔 Enable
              </button>
            }
            <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: '50%', background: CARD2, border: 'none', cursor: 'pointer', color: TEXT, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>

        {view === 'home' && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setView('add')} style={btn(true, { padding: '6px 13px', fontSize: '12px' })}>+ Add Medicine</button>
            {todayLogs.length > 0 && !allTaken && (
              <button onClick={() => todayLogs.forEach(l => { if (l.taken === null) updateDose(l.med.id, l.date, l.time, true) })}
                style={{ ...btn(false), padding: '6px 13px', fontSize: '12px', background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                ✅ All taken
              </button>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {msg.text && (
        <div style={{ margin: '10px 16px 0', padding: '9px 13px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', background: msg.type === 'success' ? 'rgba(16,185,129,0.13)' : 'rgba(239,68,68,0.13)', color: msg.type === 'success' ? '#10b981' : '#ef4444', border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
          {msg.text}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '14px 16px 80px' }}>
        {view === 'home' && <HomeView />}
        {view === 'add' && <AddView />}
      </div>

      {/* EOD Modal */}
      {eodModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10020, padding: '20px' }}>
          <div style={{ background: CARD, borderRadius: '20px', padding: '26px', maxWidth: '300px', width: '100%', textAlign: 'center', border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🌙</div>
            <h3 style={{ color: TEXT, fontWeight: '800', margin: '0 0 5px', fontSize: '16px' }}>Day Checkout</h3>
            <p style={{ color: MUTED, fontSize: '12px', margin: '0 0 12px' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <div style={{ padding: '10px', borderRadius: '10px', background: CARD2, marginBottom: '14px', fontSize: '13px' }}>
              <span style={{ color: '#10b981', fontWeight: '700' }}>{todayLogs.filter(l => l.taken === true).length}</span> taken ·{' '}
              <span style={{ color: '#ef4444', fontWeight: '700' }}>{todayLogs.filter(l => l.taken === false).length}</span> skipped ·{' '}
              <span style={{ color: '#f59e0b', fontWeight: '700' }}>{pendingCount}</span> pending
            </div>
            <p style={{ color: TEXT, fontSize: '13px', margin: '0 0 14px', fontWeight: '600' }}>Did you take all medicines today?</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => {
                todayLogs.forEach(l => { if (l.taken === null) updateDose(l.med.id, l.date, l.time, true) })
                setEodModal(false); setEodDone(true)
                showMsg('success', '🌙 Day checked out! Great job!')
              }} style={{ ...btn(true), flex: 1 }}>✅ Yes!</button>
              <button onClick={() => { setEodModal(false); setEodDone(true) }} style={{ ...btn(false), flex: 1 }}>❌ No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
