import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const GOAL = 2.0
const CUP = 0.25

export default function WaterIntake() {
  const { t } = useTheme()
  const [consumed, setConsumed] = useState(1.25)
  const [celebration, setCelebration] = useState(false)
  const pct = Math.min((consumed / GOAL) * 100, 100)
  const cups = Math.round(consumed / CUP)
  const totalCups = Math.round(GOAL / CUP)

  const grad = pct >= 80 ? ['#43e97b', '#38f9d7']
             : pct >= 50 ? ['#4facfe', '#00f2fe']
                         : ['#a1c4fd', '#c2e9fb']

  useEffect(() => {
    if (pct >= 100 && !celebration) {
      setCelebration(true)
      const timer = setTimeout(() => setCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [pct, celebration])

  return (
    <div style={{
      background: t.surface,
      borderRadius: '22px', padding: '20px',
      boxShadow: t.shadow, border: `1px solid ${t.border}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes sprinkle-3d {
          0% {
            transform: translate(-50%, -50%) translateY(0) translateZ(0) rotateX(0deg) rotateY(0deg) scale(0.5);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(-20px) translateZ(50px) rotateX(180deg) rotateY(45deg) scale(1.2);
          }
          40% {
            transform: translate(-50%, -50%) translateY(calc(var(--radius) * -0.3)) translateZ(100px) rotateX(360deg) rotateY(90deg) scale(1);
          }
          70% {
            transform: translate(-50%, -50%) translateY(calc(var(--radius) * -0.5)) translateZ(50px) rotateX(540deg) rotateY(180deg) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) translateY(calc(var(--radius) * -1)) translateZ(0) rotateX(720deg) rotateY(360deg) scale(0.3);
            opacity: 0;
          }
        }
        @keyframes icon-bounce {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.2) rotate(-10deg); }
          50% { transform: scale(0.9) rotate(10deg); }
          75% { transform: scale(1.1) rotate(-5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px var(--glow-color, #43e97b), inset 0 0 10px var(--glow-color, #43e97b); }
          50% { box-shadow: 0 0 35px var(--glow-color, #43e97b), inset 0 0 20px var(--glow-color, #43e97b); }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <div style={{
             width: '38px', height: '38px', borderRadius: '12px',
             background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
             display: 'flex', alignItems: 'center', justifyContent: 'center',
             fontSize: '20px', boxShadow: '0 4px 12px rgba(79,172,254,0.4)',
             animation: pct >= 100 ? 'icon-bounce 1s ease-in-out' : 'none',
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
         boxShadow: pct >= 100 ? `0 0 20px ${grad[0]}80, inset 0 0 10px ${grad[0]}40` : 'none',
         animation: pct >= 100 ? 'pulse-glow 2s ease-in-out infinite' : 'none',
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

       {/* 3D Sprinkling Celebration Effect */}
       {celebration && (
         <div style={{
           position: 'absolute',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           pointerEvents: 'none',
           overflow: 'hidden',
           borderRadius: '22px',
           zIndex: 10,
         }}>
           {Array.from({ length: 50 }).map((_, i) => {
             const angle = (i / 50) * Math.PI * 2
             const radius = 80 + Math.random() * 100
             const delay = Math.random() * 0.5
             const size = 6 + Math.random() * 10
             const hue = 180 + Math.random() * 60
             return (
               <div key={i} style={{
                 position: 'absolute',
                 top: '50%',
                 left: '50%',
                 width: `${size}px`,
                 height: `${size}px`,
                 background: `radial-gradient(circle at 30% 30%, hsl(${hue}, 100%, 85%), hsl(${hue}, 100%, 50%))`,
                 borderRadius: '50% 50% 50% 0',
                 transform: 'translate(-50%, -50%)',
                 animation: `sprinkle-3d 1.5s ease-out ${delay}s forwards`,
                 '--angle': `${angle}rad`,
                 '--radius': `${radius}px`,
                 boxShadow: `0 0 ${size/2}px hsl(${hue}, 100%, 70%), inset 0 0 ${size/3}px rgba(255,255,255,0.6)`,
               }} />
             )
           })}
         </div>
       )}
     </div>
   )
 }
