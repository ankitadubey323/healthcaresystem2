import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { getNearbyHospitals } from '../utils/api'

const defaultHospitals = [
  { id: 1, name: 'Apollo Hospitals', address: 'Sector 26, Near City Center', distance: '1.2 km', rating: 4.8, type: 'Multi-specialty', icon: '🏥' },
  { id: 2, name: 'Fortis Healthcare', address: 'MG Road, Downtown', distance: '2.4 km', rating: 4.6, type: 'Super-specialty', icon: '🏨' },
  { id: 3, name: 'AIIMS City Clinic', address: 'Ring Road, East Zone', distance: '3.1 km', rating: 4.9, type: 'Government', icon: '⚕️' },
  { id: 4, name: 'Max Super Hospital', address: 'NH-48, Bypass Road', distance: '4.7 km', rating: 4.5, type: 'Super-specialty', icon: '🏥' },
]

function Stars({ rating }) {
  const full = Math.floor(rating)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: '11px', color: i <= full ? '#f6ad55' : '#d1d5db' }}>★</span>
      ))}
      <span style={{ fontSize: '11px', color: '#718096', marginLeft: '3px', fontWeight: '600' }}>{rating}</span>
    </div>
  )
}

const iconColors = [
  ['#a1c4fd', '#c2e9fb'],
  ['#d4fc79', '#96e6a1'],
  ['#fbc2eb', '#a6c1ee'],
  ['#fddb92', '#d1fdff'],
]

export default function HospitalList() {
  const navigate = useNavigate()
  const { t } = useTheme()
  const [hospitals, setHospitals] = useState(defaultHospitals)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const goToHospital = (hospital) => {
    navigate(`/dashboard/hospital/${hospital.id}`, { state: hospital })
  }

  const findNearby = () => {
    setLoading(true); setError('')
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lon } = pos.coords
        try {
          const res = await getNearbyHospitals(lat, lon)
          const mapped = res.data.hospitals.map((h, i) => ({
            id: h.id || i, name: h.name,
            address: h.address || 'Address not available',
            distance: h.distance ? `${h.distance} km` : `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
            rating: h.rating || +(4 + Math.random()).toFixed(1),
            type: h.type || 'Hospital', icon: '🏥',
          }))
          setHospitals(mapped.length ? mapped : defaultHospitals)
        } catch {
          setError('Could not load nearby hospitals')
        } finally { setLoading(false) }
      },
      () => { setError('Location access denied'); setLoading(false) }
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: t.text }}>🏥 Nearest Hospitals</h2>
        <button onClick={findNearby} disabled={loading} style={{
          padding: '7px 14px', borderRadius: '20px', border: 'none',
          background: t.primaryGrad, color: '#fff',
          fontSize: '11px', fontWeight: '700', cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.7 : 1,
          boxShadow: `0 4px 14px ${t.primary}44`,
          fontFamily: 'inherit',
        }}>
          {loading ? '📍 Finding...' : '📍 Near Me'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: '12px',
          background: t.errorBg, border: `1px solid ${t.errorBorder}`,
          color: t.error, fontSize: '12px', marginBottom: '12px',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {hospitals.map((h, idx) => (
          <div key={h.id} style={{
            background: t.surface, borderRadius: '20px',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: '14px',
            boxShadow: t.shadow, border: `1px solid ${t.border}`,
            cursor: 'pointer', transition: 'transform 0.15s ease',
          }}
            onClick={() => goToHospital(h)}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
          >
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: `linear-gradient(135deg, ${iconColors[idx % 4][0]}, ${iconColors[idx % 4][1]})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', flexShrink: 0,
              boxShadow: `0 4px 12px ${iconColors[idx % 4][0]}88`,
            }}>
              {h.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: t.text, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {h.name}
              </p>
              <p style={{ fontSize: '11px', color: t.textMuted, marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {h.address}
              </p>
              <Stars rating={parseFloat(h.rating)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <div style={{
                padding: '4px 10px', borderRadius: '20px',
                background: t.primaryLight, color: t.primary,
                fontSize: '11px', fontWeight: '700',
              }}>
                {h.distance}
              </div>
              <span style={{ fontSize: '10px', color: t.textMuted }}>{h.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
