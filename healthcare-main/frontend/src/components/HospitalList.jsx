// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useTheme } from '../context/ThemeContext'
// import { getNearbyHospitals } from '../utils/api'

// const defaultHospitals = [
//   { id: 1, name: 'Apollo Hospitals', address: 'Sector 26, Near City Center', distance: '1.2 km', rating: 4.8, type: 'Multi-specialty', icon: '🏥' },
//   { id: 2, name: 'Fortis Healthcare', address: 'MG Road, Downtown', distance: '2.4 km', rating: 4.6, type: 'Super-specialty', icon: '🏨' },
//   { id: 3, name: 'AIIMS City Clinic', address: 'Ring Road, East Zone', distance: '3.1 km', rating: 4.9, type: 'Government', icon: '⚕️' },
//   { id: 4, name: 'Max Super Hospital', address: 'NH-48, Bypass Road', distance: '4.7 km', rating: 4.5, type: 'Super-specialty', icon: '🏥' },
// ]

// function Stars({ rating }) {
//   const full = Math.floor(rating)
//   return (
//     <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
//       {[1,2,3,4,5].map(i => (
//         <span key={i} style={{ fontSize: '11px', color: i <= full ? '#f6ad55' : '#d1d5db' }}>★</span>
//       ))}
//       <span style={{ fontSize: '11px', color: '#718096', marginLeft: '3px', fontWeight: '600' }}>{rating}</span>
//     </div>
//   )
// }

// const iconColors = [
//   ['#a1c4fd', '#c2e9fb'],
//   ['#d4fc79', '#96e6a1'],
//   ['#fbc2eb', '#a6c1ee'],
//   ['#fddb92', '#d1fdff'],
// ]

// export default function HospitalList() {
//   const navigate = useNavigate()
//   const { t } = useTheme()
//   const [hospitals, setHospitals] = useState(defaultHospitals)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   const goToHospital = (hospital) => {
//     navigate(`/dashboard/hospital/${hospital.id}`, { state: hospital })
//   }

//   const findNearby = () => {
//     setLoading(true); setError('')
//     navigator.geolocation.getCurrentPosition(
//       async pos => {
//         const { latitude: lat, longitude: lon } = pos.coords
//         try {
//           const res = await getNearbyHospitals(lat, lon)
//           const mapped = res.data.hospitals.map((h, i) => ({
//             id: h.id || i, name: h.name,
//             address: h.address || 'Address not available',
//             distance: h.distance ? `${h.distance} km` : `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
//             rating: h.rating || +(4 + Math.random()).toFixed(1),
//             type: h.type || 'Hospital', icon: '🏥',
//           }))
//           setHospitals(mapped.length ? mapped : defaultHospitals)
//         } catch {
//           setError('Could not load nearby hospitals')
//         } finally { setLoading(false) }
//       },
//       () => { setError('Location access denied'); setLoading(false) }
//     )
//   }

//   return (
//     <div>
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
//         <h2 style={{ fontSize: '16px', fontWeight: '800', color: t.text }}>🏥 Nearest Hospitals</h2>
//         <button onClick={findNearby} disabled={loading} style={{
//           padding: '7px 14px', borderRadius: '20px', border: 'none',
//           background: t.primaryGrad, color: '#fff',
//           fontSize: '11px', fontWeight: '700', cursor: loading ? 'default' : 'pointer',
//           opacity: loading ? 0.7 : 1,
//           boxShadow: `0 4px 14px ${t.primary}44`,
//           fontFamily: 'inherit',
//         }}>
//           {loading ? '📍 Finding...' : '📍 Near Me'}
//         </button>
//       </div>

//       {error && (
//         <div style={{
//           padding: '10px 14px', borderRadius: '12px',
//           background: t.errorBg, border: `1px solid ${t.errorBorder}`,
//           color: t.error, fontSize: '12px', marginBottom: '12px',
//         }}>
//           {error}
//         </div>
//       )}

//       <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//         {hospitals.map((h, idx) => (
//           <div key={h.id} style={{
//             background: t.surface, borderRadius: '20px',
//             padding: '14px 16px',
//             display: 'flex', alignItems: 'center', gap: '14px',
//             boxShadow: t.shadow, border: `1px solid ${t.border}`,
//             cursor: 'pointer', transition: 'transform 0.15s ease',
//           }}
//             onClick={() => goToHospital(h)}
//             onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
//             onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
//           >
//             <div style={{
//               width: '52px', height: '52px', borderRadius: '16px',
//               background: `linear-gradient(135deg, ${iconColors[idx % 4][0]}, ${iconColors[idx % 4][1]})`,
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: '26px', flexShrink: 0,
//               boxShadow: `0 4px 12px ${iconColors[idx % 4][0]}88`,
//             }}>
//               {h.icon}
//             </div>

//             <div style={{ flex: 1, minWidth: 0 }}>
//               <p style={{ fontSize: '14px', fontWeight: '700', color: t.text, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                 {h.name}
//               </p>
//               <p style={{ fontSize: '11px', color: t.textMuted, marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                 {h.address}
//               </p>
//               <Stars rating={parseFloat(h.rating)} />
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
//               <div style={{
//                 padding: '4px 10px', borderRadius: '20px',
//                 background: t.primaryLight, color: t.primary,
//                 fontSize: '11px', fontWeight: '700',
//               }}>
//                 {h.distance}
//               </div>
//               <span style={{ fontSize: '10px', color: t.textMuted }}>{h.type}</span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )



// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useTheme } from '../context/ThemeContext'

// const defaultHospitals = [
//   { id: 1, name: 'Apollo Hospitals', address: 'Sector 26, Near City Center', distance: '1.2 km', rating: 4.8, type: 'Multi-specialty', icon: '🏥' },
//   { id: 2, name: 'Fortis Healthcare', address: 'MG Road, Downtown', distance: '2.4 km', rating: 4.6, type: 'Super-specialty', icon: '🏨' },
//   { id: 3, name: 'AIIMS City Clinic', address: 'Ring Road, East Zone', distance: '3.1 km', rating: 4.9, type: 'Government', icon: '⚕️' },
//   { id: 4, name: 'Max Super Hospital', address: 'NH-48, Bypass Road', distance: '4.7 km', rating: 4.5, type: 'Super-specialty', icon: '🏥' },
// ]

// // Haversine formula — lat/lon se km distance
// function getDistanceKm(lat1, lon1, lat2, lon2) {
//   const R = 6371
//   const dLat = ((lat2 - lat1) * Math.PI) / 180
//   const dLon = ((lon2 - lon1) * Math.PI) / 180
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) ** 2
//   return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1)
// }

// function Stars({ rating }) {
//   const full = Math.floor(rating)
//   return (
//     <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
//       {[1, 2, 3, 4, 5].map(i => (
//         <span key={i} style={{ fontSize: '11px', color: i <= full ? '#f6ad55' : '#d1d5db' }}>★</span>
//       ))}
//       <span style={{ fontSize: '11px', color: '#718096', marginLeft: '3px', fontWeight: '600' }}>{rating}</span>
//     </div>
//   )
// }

// const iconColors = [
//   ['#a1c4fd', '#c2e9fb'],
//   ['#d4fc79', '#96e6a1'],
//   ['#fbc2eb', '#a6c1ee'],
//   ['#fddb92', '#d1fdff'],
//   ['#a18cd1', '#fbc2eb'],
//   ['#84fab0', '#8fd3f4'],
// ]

// // Google Places Nearby Search — CORS-safe via proxy OR direct (works in browser)
// async function fetchNearbyHospitals(lat, lon) {
//   const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

//   // ── Option A: Google Places API (if key available) ──────────────────────────
//   if (GOOGLE_API_KEY) {
//     const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=hospital&key=${GOOGLE_API_KEY}`
//     try {
//       const res = await fetch(url)
//       const data = await res.json()
//       if (data.results?.length) {
//         return data.results.slice(0, 6).map((p, i) => ({
//           id: p.place_id || i,
//           name: p.name,
//           address: p.vicinity || 'Address not available',
//           distance: getDistanceKm(lat, lon, p.geometry.location.lat, p.geometry.location.lng) + ' km',
//           rating: p.rating || +(4 + Math.random()).toFixed(1),
//           type: p.types?.includes('hospital') ? 'Hospital' : p.types?.[0]?.replace(/_/g, ' ') || 'Hospital',
//           icon: '🏥',
//           lat: p.geometry.location.lat,
//           lon: p.geometry.location.lng,
//           mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}&query_place_id=${p.place_id}`,
//         }))
//       }
//     } catch {
//       // fall through to Option B
//     }
//   }

//   // ── Option B: OpenStreetMap Overpass API (free, no key needed) ────────────
//   const overpassUrl = `https://overpass-api.de/api/interpreter`
//   const query = `
//     [out:json][timeout:15];
//     (
//       node["amenity"="hospital"](around:5000,${lat},${lon});
//       way["amenity"="hospital"](around:5000,${lat},${lon});
//       node["amenity"="clinic"](around:3000,${lat},${lon});
//     );
//     out center 10;
//   `
//   const res = await fetch(overpassUrl, {
//     method: 'POST',
//     body: query,
//   })
//   const data = await res.json()

//   if (!data.elements?.length) throw new Error('No hospitals found')

//   return data.elements
//     .map(el => {
//       const elLat = el.lat ?? el.center?.lat
//       const elLon = el.lon ?? el.center?.lon
//       const name = el.tags?.name || el.tags?.['name:en'] || 'Hospital'
//       const addr = [
//         el.tags?.['addr:street'],
//         el.tags?.['addr:suburb'],
//         el.tags?.['addr:city'],
//       ].filter(Boolean).join(', ') || 'Nearby location'

//       return {
//         id: el.id,
//         name,
//         address: addr,
//         distance: elLat ? getDistanceKm(lat, lon, elLat, elLon) + ' km' : '— km',
//         distNum: elLat ? parseFloat(getDistanceKm(lat, lon, elLat, elLon)) : 99,
//         rating: +(3.8 + Math.random() * 1.1).toFixed(1),
//         type: el.tags?.amenity === 'clinic' ? 'Clinic' : el.tags?.healthcare || 'Hospital',
//         icon: '🏥',
//         mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + addr)}`,
//       }
//     })
//     .filter(h => h.name && h.name.length > 1)
//     .sort((a, b) => a.distNum - b.distNum)
//     .slice(0, 6)
// }

// export default function HospitalList() {
//   const navigate = useNavigate()
//   const { t } = useTheme()
//   const [hospitals, setHospitals] = useState(defaultHospitals)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [isReal, setIsReal] = useState(false)

//   const goToHospital = (hospital) => {
//     // If we have a real maps URL, open it; otherwise navigate internally
//     if (hospital.mapsUrl) {
//       window.open(hospital.mapsUrl, '_blank')
//     } else {
//       navigate(`/dashboard/hospital/${hospital.id}`, { state: hospital })
//     }
//   }

//   const findNearby = () => {
//     if (!navigator.geolocation) {
//       setError('Geolocation is not supported by your browser')
//       return
//     }
//     setLoading(true)
//     setError('')

//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         const { latitude: lat, longitude: lon } = pos.coords
//         try {
//           const results = await fetchNearbyHospitals(lat, lon)
//           if (results.length) {
//             setHospitals(results)
//             setIsReal(true)
//           } else {
//             setError('No hospitals found nearby. Showing default list.')
//             setHospitals(defaultHospitals)
//           }
//         } catch (err) {
//           console.error(err)
//           setError('Could not fetch nearby hospitals. Showing default list.')
//           setHospitals(defaultHospitals)
//         } finally {
//           setLoading(false)
//         }
//       },
//       (geoErr) => {
//         setLoading(false)
//         if (geoErr.code === 1) {
//           setError('📍 Location access denied. Please allow location in browser settings.')
//         } else if (geoErr.code === 2) {
//           setError('📍 Location unavailable. Please check your GPS/network.')
//         } else {
//           setError('📍 Location request timed out. Please try again.')
//         }
//       },
//       { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
//     )
//   }

//   return (
//     <div>
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
//         <h2 style={{ fontSize: '16px', fontWeight: '800', color: t.text }}>🏥 Nearest Hospitals</h2>
//         <button
//           onClick={findNearby}
//           disabled={loading}
//           style={{
//             padding: '7px 14px', borderRadius: '20px', border: 'none',
//             background: loading ? t.surfaceAlt : t.primaryGrad,
//             color: loading ? t.textMuted : '#fff',
//             fontSize: '11px', fontWeight: '700',
//             cursor: loading ? 'default' : 'pointer',
//             boxShadow: loading ? 'none' : `0 4px 14px ${t.primary}44`,
//             fontFamily: 'inherit',
//             transition: 'all 0.2s ease',
//             display: 'flex', alignItems: 'center', gap: '5px',
//           }}
//         >
//           {loading ? (
//             <>
//               <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
//               Finding...
//             </>
//           ) : '📍 Near Me'}
//         </button>
//       </div>

//       {/* Status banner */}
//       {isReal && !error && (
//         <div style={{
//           padding: '8px 12px', borderRadius: '10px', marginBottom: '12px',
//           background: 'rgba(72,187,120,0.1)', border: '1px solid rgba(72,187,120,0.3)',
//           color: '#38a169', fontSize: '11px', fontWeight: '600',
//           display: 'flex', alignItems: 'center', gap: '6px',
//         }}>
//           ✅ Showing real hospitals near you · Tap any to open in Google Maps
//         </div>
//       )}

//       {error && (
//         <div style={{
//           padding: '10px 14px', borderRadius: '12px',
//           background: t.errorBg || 'rgba(254,202,202,0.3)',
//           border: `1px solid ${t.errorBorder || '#fca5a5'}`,
//           color: t.error || '#dc2626',
//           fontSize: '12px', marginBottom: '12px',
//           lineHeight: 1.5,
//         }}>
//           {error}
//         </div>
//       )}

//       <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//         {hospitals.map((h, idx) => (
//           <div
//             key={h.id}
//             style={{
//               background: t.surface, borderRadius: '20px',
//               padding: '14px 16px',
//               display: 'flex', alignItems: 'center', gap: '14px',
//               boxShadow: t.shadow, border: `1px solid ${t.border}`,
//               cursor: 'pointer', transition: 'transform 0.15s ease',
//             }}
//             onClick={() => goToHospital(h)}
//             onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
//             onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
//           >
//             <div style={{
//               width: '52px', height: '52px', borderRadius: '16px',
//               background: `linear-gradient(135deg, ${iconColors[idx % 6][0]}, ${iconColors[idx % 6][1]})`,
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: '26px', flexShrink: 0,
//               boxShadow: `0 4px 12px ${iconColors[idx % 6][0]}88`,
//             }}>
//               {h.icon}
//             </div>

//             <div style={{ flex: 1, minWidth: 0 }}>
//               <p style={{
//                 fontSize: '14px', fontWeight: '700', color: t.text,
//                 marginBottom: '2px', whiteSpace: 'nowrap',
//                 overflow: 'hidden', textOverflow: 'ellipsis',
//               }}>
//                 {h.name}
//               </p>
//               <p style={{
//                 fontSize: '11px', color: t.textMuted, marginBottom: '5px',
//                 whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
//               }}>
//                 {h.address}
//               </p>
//               <Stars rating={parseFloat(h.rating)} />
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
//               <div style={{
//                 padding: '4px 10px', borderRadius: '20px',
//                 background: t.primaryLight || 'rgba(99,102,241,0.1)',
//                 color: t.primary,
//                 fontSize: '11px', fontWeight: '700',
//               }}>
//                 {h.distance}
//               </div>
//               <span style={{ fontSize: '10px', color: t.textMuted, textTransform: 'capitalize' }}>{h.type}</span>
//               {h.mapsUrl && (
//                 <span style={{ fontSize: '9px', color: t.primary, opacity: 0.7 }}>↗ Maps</span>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       <style>{`
//         @keyframes spin { to { transform: rotate(360deg); } }
//       `}</style>
//     </div>
//   )
// }


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

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
      {[1, 2, 3, 4, 5].map(i => (
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
  ['#a18cd1', '#fbc2eb'],
  ['#84fab0', '#8fd3f4'],
]

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1)
}

async function fetchNearbyHospitals(lat, lon, cityName) {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:5000,${lat},${lon});
      way["amenity"="hospital"](around:5000,${lat},${lon});
      node["amenity"="clinic"](around:3000,${lat},${lon});
      way["amenity"="clinic"](around:3000,${lat},${lon});
    );
    out center 8;
  `

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  })

  const data = await res.json()
  if (!data.elements?.length) throw new Error('No results')

  return data.elements
    .map((el, i) => {
      const elLat = el.lat ?? el.center?.lat
      const elLon = el.lon ?? el.center?.lon
      const name = el.tags?.name || el.tags?.['name:en'] || ''
      if (!name || name.length < 2) return null

      const addr = [
        el.tags?.['addr:full'],
        el.tags?.['addr:street'],
        el.tags?.['addr:suburb'],
        el.tags?.['addr:city'],
      ].filter(Boolean).join(', ') || cityName || 'Nearby'

      const dist = elLat ? parseFloat(getDistance(lat, lon, elLat, elLon)) : 99

      return {
        id: el.id || i,
        name,
        address: addr,
        distance: dist + ' km',
        distNum: dist,
        rating: +(3.8 + Math.random() * 1.1).toFixed(1),
        type: el.tags?.amenity === 'clinic' ? 'Clinic' : 'Hospital',
        icon: '🏥',
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + addr)}`,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.distNum - b.distNum)
    .slice(0, 6)
}

export default function HospitalList() {
  const navigate = useNavigate()
  const { t } = useTheme()
  const [hospitals, setHospitals] = useState(defaultHospitals)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isReal, setIsReal] = useState(false)
  const [cityName, setCityName] = useState('')

  const goToHospital = (h) => {
    if (h.mapsUrl) window.open(h.mapsUrl, '_blank')
    else navigate(`/dashboard/hospital/${h.id}`, { state: h })
  }

  const findNearby = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser.')
      return
    }
    setLoading(true)
    setError('')
    setIsReal(false)

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        let city = ''
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const geoData = await geoRes.json()
          city =
            geoData?.address?.city ||
            geoData?.address?.town ||
            geoData?.address?.suburb ||
            geoData?.address?.county || ''
          if (city) setCityName(city)
        } catch {
          // ignore
        }

        try {
          const results = await fetchNearbyHospitals(lat, lon, city)
          if (results?.length) {
            setHospitals(results)
            setIsReal(true)
          } else {
            setError('No hospitals found nearby. Showing default list.')
            setHospitals(defaultHospitals)
          }
        } catch (err) {
          console.error(err)
          setError('Could not fetch hospitals. Showing default list.')
          setHospitals(defaultHospitals)
        } finally {
          setLoading(false)
        }
      },
      (geoErr) => {
        setLoading(false)
        const msgs = {
          1: '📍 Location access denied. Please allow location in browser settings.',
          2: '📍 Location unavailable. Check your GPS or network.',
          3: '📍 Location request timed out. Try again.',
        }
        setError(msgs[geoErr.code] || '📍 Could not get location.')
      },
      { timeout: 12000, maximumAge: 60000, enableHighAccuracy: false }
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: t.text, margin: 0 }}>🏥 Nearest Hospitals</h2>
          {cityName && (
            <p style={{ fontSize: '10px', color: t.primary, fontWeight: '600', margin: '3px 0 0' }}>
              📍 Near {cityName}
            </p>
          )}
        </div>

        <button
          onClick={findNearby}
          disabled={loading}
          style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none',
            background: loading ? (t.surfaceAlt || '#f1f5f9') : 'linear-gradient(135deg,#ef4444,#f97316)',
            color: loading ? (t.textMuted || '#94a3b8') : '#fff',
            fontSize: '12px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 14px rgba(239,68,68,0.4)',
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.2s',
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: '11px', height: '11px',
                border: '2px solid #94a3b8',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'hs 0.7s linear infinite',
              }} />
              Finding…
            </>
          ) : '📍 Near Me'}
        </button>
      </div>

      {loading && (
        <div style={{
          padding: '13px 15px', borderRadius: '14px', marginBottom: '14px',
          background: 'linear-gradient(135deg,rgba(6,182,212,.07),rgba(59,130,246,.07))',
          border: '1px solid rgba(6,182,212,.2)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '22px', animation: 'hp 1.2s ease-in-out infinite' }}>📍</span>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#0e7490', margin: 0 }}>
              Finding hospitals near you…
            </p>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>
              Searching real hospitals in your area
            </p>
          </div>
        </div>
      )}

      {isReal && !error && !loading && (
        <div style={{
          padding: '8px 13px', borderRadius: '11px', marginBottom: '12px',
          background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.25)',
          color: '#059669', fontSize: '11px', fontWeight: '600',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          ✅ Real hospitals near you · Tap any to open in Google Maps
        </div>
      )}

      {error && !loading && (
        <div style={{
          padding: '10px 14px', borderRadius: '12px',
          background: 'rgba(254,202,202,.3)', border: '1px solid #fca5a5',
          color: '#dc2626', fontSize: '12px', marginBottom: '12px', lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {hospitals.map((h, idx) => (
          <div
            key={h.id}
            onClick={() => goToHospital(h)}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
            style={{
              background: t.surface, borderRadius: '20px', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: '14px',
              boxShadow: t.shadow, border: `1px solid ${t.border}`,
              cursor: 'pointer', transition: 'transform 0.15s ease',
            }}
          >
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: `linear-gradient(135deg,${iconColors[idx % 6][0]},${iconColors[idx % 6][1]})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', flexShrink: 0,
              boxShadow: `0 4px 12px ${iconColors[idx % 6][0]}88`,
            }}>
              {h.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '14px', fontWeight: '700', color: t.text,
                marginBottom: '2px', whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {h.name}
              </p>
              <p style={{
                fontSize: '11px', color: t.textMuted, marginBottom: '5px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {h.address}
              </p>
              <Stars rating={parseFloat(h.rating)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <div style={{
                padding: '4px 10px', borderRadius: '20px',
                background: t.primaryLight || 'rgba(99,102,241,.1)',
                color: t.primary, fontSize: '11px', fontWeight: '700',
              }}>
                {h.distance}
              </div>
              <span style={{ fontSize: '10px', color: t.textMuted, textTransform: 'capitalize' }}>
                {h.type}
              </span>
              {h.mapsUrl && (
                <span style={{ fontSize: '9px', color: t.primary, opacity: 0.6 }}>↗ Maps</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes hs { to { transform: rotate(360deg); } }
        @keyframes hp { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>
    </div>
  )
}