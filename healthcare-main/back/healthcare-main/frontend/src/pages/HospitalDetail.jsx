import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function HospitalDetail() {
  const { t } = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()
  const { state } = useLocation()

  const hospital = state || {
    id,
    name: `Hospital ${id}`,
    address: 'Address not available',
    distance: 'Unknown',
    rating: 'N/A',
    type: 'Hospital',
    phone: 'N/A',
  }

  return (
    <div style={{ minHeight: '100vh', background: t.pageBg, padding: '24px', color: t.text }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '22px', padding: '10px 16px', borderRadius: '16px',
          border: `1px solid ${t.border}`, background: t.surface,
          color: t.text, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        ← Back to hospitals
      </button>

      <div style={{
        background: t.surface, borderRadius: '28px', padding: '28px',
        boxShadow: t.shadow, border: `1px solid ${t.border}`,
        maxWidth: '840px', margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '22px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: t.primaryLight, fontSize: '32px',
          }}>
            🏥
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', color: t.text }}>{hospital.name}</h1>
            <p style={{ margin: '6px 0 0', color: t.textMuted, fontSize: '14px' }}>{hospital.type}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '22px' }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: t.textMuted }}>Address</p>
            <p style={{ margin: 0, color: t.text }}>{hospital.address}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: t.textMuted }}>Distance</p>
            <p style={{ margin: 0, color: t.text }}>{hospital.distance}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: t.textMuted }}>Rating</p>
            <p style={{ margin: 0, color: t.text }}>{hospital.rating}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: t.textMuted }}>Contact</p>
            <p style={{ margin: 0, color: t.text }}>{hospital.phone || 'N/A'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ padding: '20px', borderRadius: '22px', background: t.surfaceAlt, border: `1px solid ${t.border}` }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: t.text }}>Overview</p>
            <p style={{ margin: '12px 0 0', color: t.textMuted, fontSize: '13px', lineHeight: 1.7 }}>
              This is the hospital detail page. It is currently loaded from the selected hospital card. Expand this section to show services, doctors, opening hours, and appointment links.
            </p>
          </div>
          <div style={{ padding: '20px', borderRadius: '22px', background: t.surfaceAlt, border: `1px solid ${t.border}` }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: t.text }}>Actions</p>
            <button
              onClick={() => window.open(hospital.website || `https://www.google.com/search?q=${encodeURIComponent(hospital.name + ' hospital')}`, '_blank', 'noreferrer')}
              style={{
                marginTop: '14px', width: '100%', padding: '12px 16px', borderRadius: '16px',
                border: 'none', background: t.primaryGrad, color: '#000', fontWeight: '700', cursor: 'pointer',
              }}
            >
              Visit website
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
