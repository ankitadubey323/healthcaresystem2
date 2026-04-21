import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

// ── Shared Modal Shell ────────────────────────────────────
function Modal({ onClose, grad, title, subtitle, children }) {
  const { t } = useTheme()
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
      zIndex: 400,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: '560px',
        background: t.surface, borderRadius: '28px 28px 0 0',
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        overflow: 'hidden',
        border: `1px solid ${t.border}`,
      }}>
        <div style={{
          background: grad, padding: '22px 22px 28px',
          position: 'relative', flexShrink: 0,
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: '14px', right: '14px',
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.5)',
            color: '#ffffff', fontSize: '22px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit',
            lineHeight: 1,
            fontWeight: '500',
            padding: 0,
            zIndex: 100,
          }}>✕</button>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '800' }}>{title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '13px', marginTop: '4px' }}>{subtitle}</p>
        </div>
        <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>{children}</div>
        <div style={{ padding: '16px', borderTop: `1px solid ${t.border}` }}>
          <button onClick={onClose} style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            background: t.surfaceAlt, border: `1px solid ${t.border}`,
            color: t.text, fontSize: '15px', fontWeight: '600',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Workout Modal ─────────────────────────────────────────
function WorkoutModal({ duration, setDuration, onClose }) {
  const { t } = useTheme()
  const [selectedTime, setSelectedTime] = useState('06:00')
  const timeSlots = ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM']
  const videos = [
    { title: 'Full Body Warm-Up', url: 'https://www.youtube.com/embed/R0mMyV5OtcM', duration: '5 min' },
    { title: 'Morning Cardio Blast', url: 'https://www.youtube.com/embed/ml6cT4AZdqI', duration: '10 min' },
    { title: 'Core Strength Routine', url: 'https://www.youtube.com/embed/DHD1-2P94DI', duration: '15 min' },
    { title: 'Stretching & Cool Down', url: 'https://www.youtube.com/embed/g_tea8ZNk5A', duration: '5 min' },
  ]
  return (
    <Modal onClose={onClose} title="🏃 Morning Workout" subtitle="Set your session time and duration"
      grad="linear-gradient(135deg, #f093fb, #f5576c)">
      <p style={{ fontSize: '12px', fontWeight: '700', color: t.textMuted, marginBottom: '10px', letterSpacing: '0.5px' }}>
        SESSION TIME
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {timeSlots.map(time => (
          <button key={time} onClick={() => setSelectedTime(time)} style={{
            padding: '8px 14px', borderRadius: '20px', border: 'none',
            background: selectedTime === time ? 'linear-gradient(135deg, #f093fb, #f5576c)' : t.surfaceAlt,
            color: selectedTime === time ? '#fff' : t.textSub,
            fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            boxShadow: selectedTime === time ? '0 4px 12px rgba(240,147,251,0.4)' : 'none',
            fontFamily: 'inherit',
          }}>
            {time}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '12px', fontWeight: '700', color: t.textMuted, marginBottom: '10px', letterSpacing: '0.5px' }}>
        SESSION DURATION
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[10, 15, 20, 30, 45, 60].map(d => (
          <button key={d} onClick={() => setDuration(d)} style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none',
            background: duration === d ? 'linear-gradient(135deg, #f093fb, #f5576c)' : t.surfaceAlt,
            color: duration === d ? '#fff' : t.textSub,
            fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            boxShadow: duration === d ? '0 4px 12px rgba(240,147,251,0.4)' : 'none',
            fontFamily: 'inherit',
          }}>
            {d} min
          </button>
        ))}
      </div>
      <p style={{ fontSize: '12px', fontWeight: '700', color: t.textMuted, marginBottom: '10px', letterSpacing: '0.5px' }}>
        EXERCISE VIDEOS
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {videos.map((v, i) => (
          <div key={i} style={{
            background: t.surfaceAlt, borderRadius: '16px', overflow: 'hidden',
            border: `1px solid ${t.border}`,
          }}>
            <iframe src={v.url} title={v.title} allowFullScreen
              style={{ width: '100%', height: '160px', border: 'none', display: 'block' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: t.text }}>{v.title}</span>
              <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(240,147,251,0.15)', color: '#c026d3', fontSize: '11px', fontWeight: '600' }}>
                {v.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

// ── Yoga Data Helpers ───────────────────────────────────
const wikiYogaTitles = [
  { title: 'Anulom Vilom', type: 'Pranayama' },
  { title: 'Kapalbhati', type: 'Pranayama' },
  { title: 'Nadi Shodhana', type: 'Pranayama' },
  { title: 'Bhastrika', type: 'Pranayama' },
  { title: 'Bhujangasana', type: 'Asana' },
  { title: 'Tadasana', type: 'Asana' },
  { title: 'Vrikshasana', type: 'Asana' },
  { title: 'Trikonasana', type: 'Asana' },
  { title: 'Balasana', type: 'Asana' },
  { title: 'Setu Bandhasana', type: 'Asana' },
]

const yogaVideos = [
  { title: 'Gentle Morning Yoga', url: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '12 min' },
  { title: 'Yoga for Flexibility', url: 'https://www.youtube.com/embed/aNX0hTqVqBw', duration: '18 min' },
  { title: 'Breath & Balance Flow', url: 'https://www.youtube.com/embed/4pKly2JojMw', duration: '15 min' },
]

const poseSpecificImages = {
  'Anulom Vilom': 'https://images.unsplash.com/photo-1508830524289-0adcbe822b40?auto=format&fit=crop&w=900&q=80',
  'Kapalbhati': 'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=900&q=80',
  'Nadi Shodhana': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80',
  'Bhastrika': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
  'Bhujangasana': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
  'Tadasana': 'https://images.unsplash.com/photo-1526401485004-6a02f76a9c2c?auto=format&fit=crop&w=900&q=80',
  'Vrikshasana': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
  'Trikonasana': 'https://images.unsplash.com/photo-1526401485004-6a02f76a9c2c?auto=format&fit=crop&w=900&q=80',
  'Balasana': 'https://images.unsplash.com/photo-1526401485004-6a02f76a9c2c?auto=format&fit=crop&w=900&q=80',
  'Setu Bandhasana': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
}

const fallbackYogaImage = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80'

function getShortDescription(extract) {
  if (!extract) return 'Learn the key benefits and practice steps for this yoga item.'
  const sentence = extract.split('. ').find(Boolean)
  return sentence ? `${sentence.replace(/\.$/, '')}.` : extract
}

function generateBenefits(type, title, extract) {
  if (extract?.toLowerCase().includes('improves') || extract?.toLowerCase().includes('strengthens')) {
    return [
      `Supports better posture and alignment for ${title}.`,
      'Helps calm the mind and reduce stress.',
      'Boosts overall energy and body awareness.',
    ]
  }

  if (type === 'Pranayama') {
    return [
      'Calms the nervous system and reduces anxiety.',
      'Improves breathing efficiency and lung capacity.',
      'Helps balance mental focus and energy flow.',
    ]
  }

  return [
    `Improves flexibility and joint mobility for ${title}.`,
    'Builds core strength and body stability.',
    'Encourages calm breathing and mental focus.',
  ]
}

function generateSteps(type) {
  if (type === 'Pranayama') {
    return [
      'Sit comfortably with a straight spine and relaxed shoulders.',
      'Feel the breath entering and leaving naturally through the nose.',
      'Use a gentle hand gesture if needed to regulate each nostril.',
      'Continue with slow, measured inhalations and exhalations.',
      'Practice for 5–10 minutes while keeping the mind calm.',
    ]
  }

  return [
    'Stand or sit with a firm foundation and steady posture.',
    'Move slowly into the pose while keeping the breath even.',
    'Hold the position with balanced effort and relaxation.',
    'Notice how the body opens and lengthens with each breath.',
    'Release gently and observe how your body feels.',
  ]
}

function createFallbackYogaItem(title, type) {
  return {
    id: title,
    title,
    type,
    shortDescription: `A yoga practice focused on ${title}.`,
    longDescription: `This is a fallback description for ${title}. Practice mindfully and gently as you learn the pose or breathing technique.`,
    benefits: generateBenefits(type, title),
    steps: generateSteps(type),
    imageUrl: poseSpecificImages[title] || fallbackYogaImage,
    wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  }
}

function createYogaItemFromPage(page, item) {
  const description = page.description || getShortDescription(page.extract)
  return {
    id: page.title || item.title,
    title: page.title || item.title,
    type: item.type,
    shortDescription: description,
    longDescription: page.extract || description,
    benefits: generateBenefits(item.type, item.title, page.extract),
    steps: generateSteps(item.type),
    imageUrl: page.originalimage?.source || page.thumbnail?.source || poseSpecificImages[item.title] || fallbackYogaImage,
    wikiUrl: page.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
  }
}

// ── Yoga Modal ────────────────────────────────────────────
function YogaModal({ onClose }) {
  const { t } = useTheme()
  const [activeTab, setActiveTab] = useState('poses')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [selectedTime, setSelectedTime] = useState('06:00 AM')
  const timeSlots = ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM']

  useEffect(() => {
    let active = true

    async function loadYogaItems() {
      try {
        const loaded = await Promise.all(wikiYogaTitles.map(async item => {
          const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.title)}`)
          if (!response.ok) return createFallbackYogaItem(item.title, item.type)
          const page = await response.json()
          return createYogaItemFromPage(page, item)
        }))

        if (!active) return
        setItems(loaded)
        setStatus('ready')
      } catch (fetchError) {
        if (!active) return
        setStatus('error')
        setError('Unable to load yoga information from Wikipedia at this time.')
      }
    }

    loadYogaItems()
    return () => { active = false }
  }, [])

  const displayedItems = items.filter(item => {
    const matchesTab = activeTab === 'poses'
      ? item.type === 'Asana'
      : activeTab === 'pranayama'
        ? item.type === 'Pranayama'
        : true
    const matchesSearch = [item.title, item.shortDescription, item.type]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase().trim())
    return matchesTab && matchesSearch
  })

  return (
    <Modal onClose={onClose} title="🧘 Yoga & Pranayama" subtitle="Select time and explore yoga sessions"
      grad="linear-gradient(135deg, #4facfe, #00f2fe)">
      <p style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: '10px', letterSpacing: '0.5px' }}>
        SESSION TIME
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {timeSlots.map(time => (
          <button key={time} onClick={() => setSelectedTime(time)} style={{
            padding: '8px 14px', borderRadius: '20px', border: 'none',
            background: selectedTime === time ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
            color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            boxShadow: selectedTime === time ? '0 4px 12px rgba(255,255,255,0.2)' : 'none',
            fontFamily: 'inherit',
          }}>
            {time}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { key: 'poses', label: 'Yoga Poses' },
            { key: 'pranayama', label: 'Pranayama' },
            { key: 'videos', label: 'Videos' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: '1 0 auto', padding: '10px 14px', borderRadius: '18px', border: 'none',
              background: activeTab === tab.key ? 'linear-gradient(135deg, #4facfe, #00f2fe)' : t.surfaceAlt,
              color: activeTab === tab.key ? '#fff' : t.text,
              fontWeight: '700', fontSize: '12px', cursor: 'pointer',
              boxShadow: activeTab === tab.key ? '0 6px 18px rgba(79,172,254,0.25)' : 'none',
              fontFamily: 'inherit',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== 'videos' && (
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search poses, pranayama or keywords"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '18px', border: `1px solid ${t.border}`,
              background: t.surfaceAlt, color: t.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit',
            }}
          />
        )}
      </div>

      {status === 'loading' && (
        <div style={{ padding: '20px', borderRadius: '20px', background: t.surface, border: `1px solid ${t.border}`, color: t.textMuted }}>
          Loading yoga data from Wikipedia...
        </div>
      )}

      {status === 'error' && (
        <div style={{ padding: '20px', borderRadius: '20px', background: t.surface, border: `1px solid ${t.border}`, color: t.textMuted }}>
          {error}
        </div>
      )}

      {status === 'ready' && activeTab === 'videos' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {yogaVideos.map((video, idx) => (
            <div key={idx} style={{ background: t.surfaceAlt, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${t.border}` }}>
              <iframe
                src={video.url}
                title={video.title}
                allowFullScreen
                style={{ width: '100%', height: '190px', border: 'none', display: 'block' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
              <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: t.text }}>{video.title}</span>
                <span style={{ fontSize: '11px', color: t.textSub, fontWeight: '600' }}>{video.duration}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {status === 'ready' && activeTab !== 'videos' && (
        <div style={{ display: 'grid', gap: '18px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {displayedItems.map(item => {
            const isExpanded = expandedId === item.id
            return (
              <div key={item.id} style={{
                background: t.surfaceAlt,
                borderRadius: '24px',
                overflow: 'hidden',
                border: `1px solid ${t.border}`,
                boxShadow: t.shadow,
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}>
                <div style={{ position: 'relative', overflow: 'hidden', minHeight: '180px' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    onError={e => { e.currentTarget.src = fallbackYogaImage }}
                    style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#0984e3', margin: 0 }}>{item.type}</p>
                    <h3 style={{ fontSize: '18px', margin: '8px 0 0', color: t.text }}>{item.title}</h3>
                  </div>
                  <p style={{ margin: 0, color: t.textSub, fontSize: '13px', lineHeight: 1.6 }}>{item.shortDescription}</p>

                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {item.longDescription && (
                        <p style={{ margin: 0, color: t.text, fontSize: '13px', lineHeight: 1.7 }}>{item.longDescription}</p>
                      )}
                      <div>
                        <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: '700', color: t.textMuted }}>Benefits</p>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: t.text, fontSize: '13px', lineHeight: 1.7 }}>
                          {item.benefits.map((benefit, idx) => (
                            <li key={idx}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: '700', color: t.textMuted }}>Steps</p>
                        <ol style={{ margin: 0, paddingLeft: '18px', color: t.text, fontSize: '13px', lineHeight: 1.7 }}>
                          {item.steps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      <a href={item.wikiUrl} target="_blank" rel="noreferrer" style={{ color: '#0984e3', fontSize: '12px', fontWeight: '700' }}>
                        View full Wikipedia article
                      </a>
                    </div>
                  )}

                  <button onClick={() => setExpandedId(isExpanded ? null : item.id)} style={{
                    alignSelf: 'flex-start', padding: '10px 16px', borderRadius: '16px', border: 'none',
                    background: isExpanded ? t.surface : 'linear-gradient(135deg, #4facfe, #00f2fe)',
                    color: isExpanded ? t.text : '#fff', fontWeight: '700', cursor: 'pointer',
                    boxShadow: isExpanded ? 'none' : '0 6px 18px rgba(79,172,254,0.25)', fontFamily: 'inherit',
                  }}>
                    {isExpanded ? 'Hide Details' : 'Read More'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {status === 'ready' && activeTab !== 'videos' && displayedItems.length === 0 && (
        <div style={{ padding: '24px', borderRadius: '20px', background: t.surface, border: `1px solid ${t.border}`, textAlign: 'center', color: t.textMuted }}>
          No matching sessions found. Try another search term.
        </div>
      )}
    </Modal>
  )
}

// ── Main Export ───────────────────────────────────────────
export default function HealthFeatures() {
  const { t } = useTheme()
  const [workoutOpen, setWorkoutOpen] = useState(false)
  const [yogaOpen, setYogaOpen] = useState(false)
  const [workoutDuration, setWorkoutDuration] = useState(20)

  return (
    <>
      <h2 style={{ fontSize: '16px', fontWeight: '800', color: t.text, marginBottom: '14px' }}>
        💪 Health Features
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Workout Card */}
        <button onClick={() => setWorkoutOpen(true)} style={{
          background: t.surface, borderRadius: '22px',
          padding: '20px 16px', border: `1px solid rgba(240,147,251,0.2)`,
          cursor: 'pointer', textAlign: 'left',
          boxShadow: t.shadow,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          fontFamily: 'inherit',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(240,147,251,0.28)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = t.shadow }}
        >
          <div style={{
            width: '48px', height: '48px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', marginBottom: '14px',
            boxShadow: '0 4px 14px rgba(240,147,251,0.45)',
          }}>🏃</div>
          <p style={{ fontSize: '14px', fontWeight: '800', color: t.text, marginBottom: '4px' }}>
            Morning<br />Workout
          </p>
          <p style={{ fontSize: '11px', color: '#c026d3', fontWeight: '600' }}>{workoutDuration} min session</p>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: t.textMuted }}>Tap to start</span>
            <span style={{ color: '#f5576c', fontSize: '12px' }}>→</span>
          </div>
        </button>

        {/* Yoga Card */}
        <button onClick={() => setYogaOpen(true)} style={{
          background: t.surface, borderRadius: '22px',
          padding: '20px 16px', border: `1px solid rgba(79,172,254,0.2)`,
          cursor: 'pointer', textAlign: 'left',
          boxShadow: t.shadow,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          fontFamily: 'inherit',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(79,172,254,0.28)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = t.shadow }}
        >
          <div style={{
            width: '48px', height: '48px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', marginBottom: '14px',
            boxShadow: '0 4px 14px rgba(79,172,254,0.45)',
          }}>🧘</div>
          <p style={{ fontSize: '14px', fontWeight: '800', color: t.text, marginBottom: '4px' }}>
            Yoga<br />Session
          </p>
          <p style={{ fontSize: '11px', color: '#0984e3', fontWeight: '600' }}>Videos + Reading</p>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: t.textMuted }}>Tap to explore</span>
            <span style={{ color: '#4facfe', fontSize: '12px' }}>→</span>
          </div>
        </button>
      </div>

      {workoutOpen && <WorkoutModal duration={workoutDuration} setDuration={setWorkoutDuration} onClose={() => setWorkoutOpen(false)} />}
      {yogaOpen && <YogaModal onClose={() => setYogaOpen(false)} />}

      <style>{`
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>
    </>
  )
}
