
import { useEffect, useRef } from 'react'

const news = [
  '🏥 WHO recommends 150 minutes of exercise per week for adults',
  '💊 New study shows Mediterranean diet reduces heart disease risk by 30%',
  '🧠 Mental health awareness: Practice mindfulness for 10 minutes daily',
  '🩸 Blood donation camps available near you — donate and save lives',
  '🥗 Eating 5 portions of fruits and vegetables daily boosts immunity',
  '😴 7-9 hours of sleep essential for optimal brain function',
  '💧 Drink at least 8 glasses of water daily for better health',
  '🫀 Regular health checkups can detect diseases early — schedule yours today',
]

export default function NewsBar() {
  const scrollRef = useRef(null)

  const primaryBlue = '#1e40af'
  const darkBlue = '#1e3a8a'
  const lightBlue = '#3b82f6'

  useEffect(() => {
    const el = scrollRef.current
    let animId
    let pos = 0

    const scroll = () => {
      pos += 0.5
      if (pos >= el.scrollWidth / 2) pos = 0
      el.scrollLeft = pos
      animId = requestAnimationFrame(scroll)
    }

    animId = requestAnimationFrame(scroll)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div style={{
      background: darkBlue,
      borderBottom: `1px solid ${primaryBlue}`,
      padding: '10px 0',
      overflow: 'hidden',
    }}>
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '60px',
          overflowX: 'hidden',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
        }}
      >
        {[...news, ...news].map((item, i) => (
          <span key={i} style={{ color: lightBlue, fontSize: '13px', flexShrink: 0 }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}