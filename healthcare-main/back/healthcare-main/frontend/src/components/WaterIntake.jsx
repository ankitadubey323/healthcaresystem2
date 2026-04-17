import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const GOAL = 2.0
const CUP = 0.25

export default function WaterIntake() {
  const { t } = useTheme()
  const [consumed, setConsumed] = useState(1.25)
  const pct = Math.min((consumed / GOAL) * 100, 100)
  const cups = Math.round(consumed / CUP)
  const totalCups = Math.round(GOAL / CUP)

  const grad = pct >= 80 ? ['#43e97b', '#38f9d7']
             : pct >= 50 ? ['#4facfe', '#00f2fe']
                         : ['#a1c4fd', '#c2e9fb']

  return (
    <div style={{
      background: t.surface,
      borderRadius: '22px', padding: '20px',
      boxShadow: t.shadow, border: `1px solid ${t.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', boxShadow: '0 4px 12px rgba(79,172,254,0.4)',
          }}>💧</div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '800', color: t.text }}>Water Intake</p>
            <p style={{ fontSize: '11px', color: t.textMuted }}>Daily hydration tracker</p>
          </div>
        </div>
        <button onClick={() => setConsumed(0)} style={{
          padding: '5px 12px', borderRadius: '20px',
          border: `1px solid ${t.border}`,
          background: t.surfaceAlt, color: t.textSub,
          fontSize: '11px', fontWeight: '600', cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          Reset
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <span style={{
          fontSize: '36px', fontWeight: '900',
          background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {consumed.toFixed(2)}L
        </span>
        <span style={{ fontSize: '15px', color: t.textMuted, fontWeight: '500', marginLeft: '4px' }}>
          / {GOAL}L
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '14px', borderRadius: '20px',
        background: t.surfaceAlt,
        overflow: 'hidden', marginBottom: '12px',
        border: `1px solid ${t.border}`,
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          borderRadius: '20px',
          background: `linear-gradient(90deg, ${grad[0]}, ${grad[1]})`,
          transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: `0 2px 8px ${grad[0]}66`,
        }} />
      </div>

      {/* Cup icons */}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '14px' }}>
        {Array.from({ length: totalCups }).map((_, i) => (
          <span key={i} style={{ fontSize: '16px', opacity: i < cups ? 1 : 0.22, transition: 'opacity 0.3s' }}>🥛</span>
        ))}
      </div>

      <button
        onClick={() => setConsumed(v => Math.min(+(v + CUP).toFixed(2), GOAL))}
        disabled={consumed >= GOAL}
        style={{
          width: '100%', padding: '13px', borderRadius: '14px', border: 'none',
          background: consumed >= GOAL ? t.surfaceAlt : `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
          color: consumed >= GOAL ? t.textMuted : '#fff',
          fontWeight: '700', fontSize: '13px',
          cursor: consumed >= GOAL ? 'default' : 'pointer',
          boxShadow: consumed >= GOAL ? 'none' : `0 6px 18px ${grad[0]}55`,
          fontFamily: 'inherit',
        }}
      >
        {consumed >= GOAL ? '🎉 Goal Reached!' : `+ Add ${CUP}L (1 cup)`}
      </button>

      {pct >= 100 && (
        <p style={{ textAlign: 'center', fontSize: '12px', color: t.success, fontWeight: '700', marginTop: '10px' }}>
          Amazing! Daily water goal complete! 🏆
        </p>
      )}
    </div>
  )
}
