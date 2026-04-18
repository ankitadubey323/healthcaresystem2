import { useMemo, useState, useEffect } from 'react'
import stayHealthyTips from '../data/stayHealthyTips'
import { useTheme } from '../context/ThemeContext'

const filterOptions = ['All', 'Diet', 'Fitness', 'Mental Health']

export default function StayHealthyTips() {
  const { t } = useTheme()
  const [activeFilter, setActiveFilter] = useState('All')
  const [hoverScrolling, setHoverScrolling] = useState(false)

  const visibleTips = useMemo(() => {
    if (activeFilter === 'All') return stayHealthyTips
    return stayHealthyTips.filter(tip => tip.category === activeFilter)
  }, [activeFilter])

  useEffect(() => {
    const marquee = document.querySelector('[data-slow-scroll]')
    if (!marquee) return
    const handleMouseEnter = () => setHoverScrolling(true)
    const handleMouseLeave = () => setHoverScrolling(false)
    marquee.addEventListener('mouseenter', handleMouseEnter)
    marquee.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      marquee.removeEventListener('mouseenter', handleMouseEnter)
      marquee.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '12px', color: t.textMuted, marginBottom: '5px', letterSpacing: '0.8px' }}>Stay Healthy Tips</p>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: t.text }}>Healthy habits for your day</h2>
          <p style={{ marginTop: '10px', maxWidth: '520px', color: t.textSub, lineHeight: 1.6, fontSize: '14px' }}>
            Practical tips from trusted health guidance, modern lifestyle reminders, and preventive care habits.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {filterOptions.map(option => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              style={{
                padding: '10px 16px', borderRadius: '999px', border: 'none',
                background: activeFilter === option ? 'linear-gradient(135deg, #4facfe, #00f2fe)' : t.surfaceAlt,
                color: activeFilter === option ? '#fff' : t.text,
                fontWeight: '700', cursor: 'pointer', fontSize: '12px',
                boxShadow: activeFilter === option ? '0 8px 22px rgba(79,172,254,0.22)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          {visibleTips.slice(0, 8).map(tip => (
            <div key={tip.id} style={{
              background: t.surfaceAlt,
              borderRadius: '22px',
              padding: '18px',
              border: `1px solid ${t.border}`,
              boxShadow: t.shadow,
              minHeight: '148px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '16px', display: 'grid', placeItems: 'center', background: 'rgba(79,172,254,0.12)', fontSize: '20px' }}>
                  {tip.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: t.text }}>{tip.title}</p>
                </div>
              </div>
              <p style={{ margin: 0, marginTop: '16px', color: t.textSub, fontSize: '13px', lineHeight: 1.6 }}>
                {tip.description}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)', borderRadius: '24px', padding: '22px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
            <p style={{ fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', margin: 0, opacity: 0.9 }}>Mini Wellness Session</p>
            <h3 style={{ marginTop: '12px', fontSize: '18px', fontWeight: '800' }}>Quick health reset</h3>
            <ul style={{ margin: '18px 0 0', padding: 0, listStyle: 'none', lineHeight: 1.8, fontSize: '14px' }}>
              <li>• Stand and stretch for 3 minutes.</li>
              <li>• Sip water and take a mindful breath.</li>
              <li>• Write one positive thought.</li>
            </ul>
            <button style={{ marginTop: '18px', border: 'none', borderRadius: '16px', padding: '12px 18px', background: '#fff', color: '#0963d1', fontWeight: '700', cursor: 'pointer' }}>
              Start Session
            </button>
          </div>

          <div style={{ background: t.surfaceAlt, borderRadius: '24px', border: `1px solid ${t.border}`, padding: '18px', minHeight: '180px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: t.textMuted, letterSpacing: '0.14em' }}>Continuous scroll</p>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '20px', marginTop: '14px', border: `1px solid ${t.border}`, background: t.surface }}>
              <div
                data-slow-scroll
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '14px',
                  animation: hoverScrolling ? 'none' : 'scrollX 18s linear infinite',
                  whiteSpace: 'nowrap',
                }}
              >
                {[...stayHealthyTips, ...stayHealthyTips].map((tip, index) => (
                  <div key={`${tip.id}-${index}`} style={{
                    minWidth: '210px',
                    background: t.surfaceAlt,
                    borderRadius: '18px',
                    padding: '14px',
                    display: 'inline-flex',
                    flexDirection: 'column',
                    gap: '8px',
                    border: `1px solid ${t.border}`,
                  }}>
                    <span style={{ fontSize: '18px' }}>{tip.icon}</span>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: t.text }}>{tip.title}</p>
                    <p style={{ margin: 0, color: t.textSub, fontSize: '12px', lineHeight: 1.5 }}>{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollX {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
