// import { useState } from 'react'
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// import { getNearbyHospitals } from '../utils/api'
// import 'leaflet/dist/leaflet.css'
// import L from 'leaflet'

// delete L.Icon.Default.prototype._getIconUrl
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
// })

// export default function HospitalMap() {
//   const [hospitals, setHospitals] = useState([])
//   const [userPos, setUserPos] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   const findHospitals = () => {
//     setLoading(true)
//     setError('')
//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         const { latitude: lat, longitude: lon } = pos.coords
//         setUserPos([lat, lon])
//         try {
//           const res = await getNearbyHospitals(lat, lon)
//           setHospitals(res.data.hospitals)
//         } catch {
//           setError('Could not fetch hospitals')
//         } finally {
//           setLoading(false)
//         }
//       },
//       () => {
//         setError('Location access denied')
//         setLoading(false)
//       }
//     )
//   }

//   return (
//     <div style={{
//       background: '#111', borderRadius: '16px',
//       border: '1px solid #222', overflow: 'hidden',
//     }}>
//       <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//         <h3 style={{ color: '#00d4aa', fontSize: '16px' }}>🏥 Nearby Hospitals</h3>
//         <button
//           onClick={findHospitals}
//           disabled={loading}
//           style={{
//             padding: '8px 16px', borderRadius: '20px',
//             background: 'linear-gradient(135deg, #00d4aa, #00ff88)',
//             border: 'none', color: '#000', fontWeight: '700',
//             cursor: 'pointer', fontSize: '13px',
//           }}
//         >
//           {loading ? 'Finding...' : '📍 Find Hospitals'}
//         </button>
//       </div>

//       {error && <p style={{ color: '#f87171', padding: '0 16px 12px', fontSize: '13px' }}>{error}</p>}

//       {userPos && (
//         <div style={{ height: '300px' }}>
//           <MapContainer center={userPos} zoom={14} style={{ height: '100%', width: '100%' }}>
//             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//             <Marker position={userPos}>
//               <Popup>You are here</Popup>
//             </Marker>
//             {hospitals.map(h => (
//               h.lat && h.lon && (
//                 <Marker key={h.id} position={[h.lat, h.lon]}>
//                   <Popup>
//                     <strong>{h.name}</strong><br />
//                     {h.address}<br />
//                     {h.phone}
//                   </Popup>
//                 </Marker>
//               )
//             ))}
//           </MapContainer>
//         </div>
//       )}

//       {hospitals.length > 0 && (
//         <div style={{ padding: '12px 16px', maxHeight: '200px', overflowY: 'auto' }}>
//           {hospitals.map(h => (
//             <div key={h.id} style={{
//               padding: '10px', borderRadius: '10px',
//               background: '#1a1a1a', marginBottom: '8px',
//               border: '1px solid #222',
//             }}>
//               <p style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{h.name}</p>
//               <p style={{ color: '#888', fontSize: '12px' }}>{h.address}</p>
//               {h.phone !== 'N/A' && <p style={{ color: '#00d4aa', fontSize: '12px' }}>📞 {h.phone}</p>}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }





import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { getNearbyHospitals } from '../utils/api'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function HospitalMap() {
  const [hospitals, setHospitals] = useState([])
  const [userPos, setUserPos] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const findHospitals = () => {
    setLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        setUserPos([lat, lon])
        try {
          const res = await getNearbyHospitals(lat, lon)
          setHospitals(res.data.hospitals)
        } catch {
          setError('Could not fetch hospitals')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError('Location access denied')
        setLoading(false)
      }
    )
  }

  const openHospital = (h) => {
    const url = h.website
      ? h.website
      : `https://www.google.com/search?q=${encodeURIComponent(h.name + ' hospital')}`
    window.open(url, '_blank', 'noreferrer')
  }

  return (
    <div style={{
      background: '#111', borderRadius: '16px',
      border: '1px solid #222', overflow: 'hidden',
    }}>
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ color: '#00d4aa', fontSize: '16px' }}>🏥 Nearby Hospitals</h3>
        <button
          onClick={findHospitals}
          disabled={loading}
          style={{
            padding: '8px 16px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #00d4aa, #00ff88)',
            border: 'none', color: '#000', fontWeight: '700',
            cursor: 'pointer', fontSize: '13px',
          }}
        >
          {loading ? 'Finding...' : '📍 Find Hospitals'}
        </button>
      </div>

      {error && <p style={{ color: '#f87171', padding: '0 16px 12px', fontSize: '13px' }}>{error}</p>}

      {userPos && (
        <div style={{ height: '300px' }}>
          <MapContainer center={userPos} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={userPos}>
              <Popup>You are here</Popup>
            </Marker>
            {hospitals.map(h => (
              h.lat && h.lon && (
                <Marker key={h.id} position={[h.lat, h.lon]}>
                  <Popup>
                    <strong>{h.name}</strong><br />
                    {h.address}<br />
                    {h.phone}<br />
                    <a
                      href={h.website || `https://www.google.com/search?q=${encodeURIComponent(h.name + ' hospital')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#00a884', fontWeight: '600' }}
                    >
                      🌐 Visit Website
                    </a>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      )}

      {hospitals.length > 0 && (
        <div style={{ padding: '12px 16px', maxHeight: '200px', overflowY: 'auto' }}>
          {hospitals.map(h => {
  const url = h.website
    ? h.website
    : `https://www.google.com/search?q=${encodeURIComponent(h.name + ' hospital')}`

  return (
    <div
      key={h.id}
      onClick={(e) => {
        e.stopPropagation()
        window.location.href = url  // ← _blank ki jagah direct navigate
      }}
      style={{
        padding: '10px', borderRadius: '10px',
        background: '#1a1a1a', marginBottom: '8px',
        border: '1px solid #222',
        cursor: 'pointer',
        transition: 'border 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.border = '1px solid #00d4aa'}
      onMouseLeave={e => e.currentTarget.style.border = '1px solid #222'}
    >
      <p style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>
        {h.name}{' '}
        <span style={{ color: '#00d4aa', fontSize: '11px' }}>↗ Visit</span>
      </p>
      <p style={{ color: '#888', fontSize: '12px' }}>{h.address}</p>
      {h.phone !== 'N/A' && (
        <p style={{ color: '#00d4aa', fontSize: '12px' }}>📞 {h.phone}</p>
      )}
    </div>
  )
})}