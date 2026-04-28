import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { X, Activity, Droplet, Pill, TrendingUp } from 'lucide-react'

export default function QuickHealthDrawer() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const drawerRef = useRef(null)

  // Swipe detection from right edge
  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    if (touch.clientX > window.innerWidth - 20) {
      setTouchStart(touch.clientX)
    }
  }

  const handleTouchEnd = (e) => {
    if (!touchStart) return
    const touchEnd = e.changedTouches[0].clientX
    if (touchStart - touchEnd > 50) {
      setIsOpen(true)
    }
  }

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [touchStart])

  const avatarLetter = user?.name?.[0]?.toUpperCase() || 'U'

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '88px',
          right: '16px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'var(--accent-blue)',
          border: 'none',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 90,
          boxShadow: '0 4px 16px rgba(79, 142, 247, 0.4)',
          transition: 'all var(--transition-base)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Activity size={20} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
            animation: 'fadeIn 200ms ease-in',
          }}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: '80vw',
          background: 'var(--bg-card)',
          borderLeft: '2px solid var(--accent-blue)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease-out',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--spacing-lg)',
            borderBottom: `1px solid var(--border-color)`,
          }}
        >
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Health Snapshot
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 'var(--spacing-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--spacing-lg)', flex: 1, overflow: 'auto' }}>
          {/* User Profile */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-xl)',
              padding: 'var(--spacing-lg)',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid var(--border-color)`,
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '700',
                color: 'white',
              }}
            >
              {avatarLetter}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                {user?.city || 'Health Profile'}
              </p>
            </div>
          </div>

          {/* Water Intake */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h4
              style={{
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              <Droplet
                size={12}
                style={{ display: 'inline', marginRight: '4px' }}
              />
              Water Intake
            </h4>
            <div
              style={{
                height: '6px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '65%',
                  background: 'var(--accent-green)',
                  borderRadius: 'var(--radius-full)',
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              6.5 of 10 glasses
            </p>
          </div>

          {/* Vitals */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h4
              style={{
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              <TrendingUp
                size={12}
                style={{ display: 'inline', marginRight: '4px' }}
              />
              Vital Stats
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-md)',
              }}
            >
              {[
                { label: 'Heart Rate', value: '72', unit: 'bpm' },
                { label: 'Blood O2', value: '98', unit: '%' },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    padding: 'var(--spacing-lg)',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    border: `1px solid var(--border-color)`,
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      margin: '0 0 var(--spacing-sm)',
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: 'var(--accent-blue)',
                      margin: 0,
                    }}
                  >
                    {stat.value} <span style={{ fontSize: '12px' }}>{stat.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Medicine Reminders */}
          <div>
            <h4
              style={{
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              <Pill
                size={12}
                style={{ display: 'inline', marginRight: '4px' }}
              />
              Medicines
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {[
                { name: 'Vitamin D3', time: '8:00 AM', taken: true },
                { name: 'Aspirin', time: '2:00 PM', taken: false },
              ].map((med, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--spacing-md)',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid var(--border-color)`,
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {med.name}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {med.time}
                    </p>
                  </div>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: med.taken ? 'var(--accent-green)' : 'var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {med.taken && (
                      <span style={{ fontSize: '12px', color: 'white' }}>✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
