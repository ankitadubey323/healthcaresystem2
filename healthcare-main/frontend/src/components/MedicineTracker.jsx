import { useState } from 'react'

export default function MedicineTracker({ onClose }) {
  const [medicines, setMedicines] = useState([])

  const primaryBlue = '#1e40af'
  const darkBlue = '#1e3a8a'
  const lightBlue = '#3b82f6'
  const bgDark = '#0f172a'
  const cardBg = '#1e293b'
  const textLight = '#e2e8f0'
  const textMuted = '#94a3b8'

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: bgDark,
      overflow: 'auto',
    }}>
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.1)',
          background: cardBg,
          color: textLight,
          fontSize: '18px',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        ✕
      </button>
      <div style={{ padding: '20px' }}>
        <h2 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '22px', 
          fontWeight: 700,
          color: textLight,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>💊</span> Medicine Tracker
        </h2>
        {medicines.length === 0 ? (
          <div style={{
            background: cardBg,
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <p style={{ color: textMuted, fontSize: '15px' }}>
              No medicines tracked yet.
            </p>
          </div>
        ) : (
          <div>{medicines.map((m, i) => <div key={i}>{m}</div>)}</div>
        )}
      </div>
    </div>
  )
}