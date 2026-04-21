import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useChat } from '../context/ChatContext'
import { useNavigate } from 'react-router-dom'
import { uploadDocument, updateProfile, uploadProfilePhoto } from '../utils/api'
import NewsSection from '../components/NewsSection'
import RateChart from '../components/RateChart'
import HospitalList from '../components/HospitalList'
import DocumentVault from '../components/DocumentVault'
import WaterIntake from '../components/WaterIntake'
import HealthFeatures from '../components/HealthFeatures'

function Card({ children, t, style = {} }) {
  return (
    <div style={{
      background: t.surface,
      borderRadius: '28px',
      padding: '24px',
      boxShadow: t.shadowLg,
      border: `1px solid ${t.borderStrong}`,
      transform: 'translateZ(0)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionHeader({ title, subtitle, action, t }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '18px',
      flexWrap: 'wrap',
      marginBottom: '20px',
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: '11px',
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          fontWeight: '700',
          color: t.primary,
        }}>
          {subtitle}
        </p>
        <h2 style={{ margin: '8px 0 0', fontSize: '22px', lineHeight: 1.15, fontWeight: '900', color: t.text }}>
          {title}
        </h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { user, logout, setUser } = useAuth()
  const { t, themeName, toggleTheme } = useTheme()
  const { toggleChat } = useChat()
  const navigate = useNavigate()
  const isDesktop = false
  const isLight = themeName === 'light'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Good Morning'
    if (hour >= 12 && hour < 17) return 'Good Afternoon'
    if (hour >= 17 && hour < 21) return 'Good Evening'
    return 'Good Night'
  }

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showPhotoOptions, setShowPhotoOptions] = useState(false)
  const [showWaterPopup, setShowWaterPopup] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [showNewsSection, setShowNewsSection] = useState(false)
  const [showUploadMenu, setShowUploadMenu] = useState(false)
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileForm, setProfileForm] = useState({
    name: '', phone: '', city: '', state: '', age: '', weight: '', height: ''
  })
  const [notifications, setNotifications] = useState(3)
  const [docRefreshKey, setDocRefreshKey] = useState(0)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const photoInputRef = useRef(null)
  const profileCameraRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowWaterPopup(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleLogout = () => { logout(); navigate('/') }
  const avatarLetter = user?.name?.[0]?.toUpperCase() || 'U'

  useEffect(() => {
    if (!user) return
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      city: user.city || '',
      state: user.state || '',
      age: user.age || '',
      weight: user.weight || '',
      height: user.height || '',
    })
  }, [user])

  const Avatar = ({ size = 44 }) => (
    user?.profilePhoto ? (
      <img src={user.profilePhoto} alt={user.name} style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover',
        border: `2.5px solid ${t.primary}`,
        boxShadow: `0 4px 14px ${t.primary}55`,
      }} />
    ) : (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: t.primaryGrad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.4, fontWeight: '800', color: '#fff',
        boxShadow: `0 4px 14px ${t.primary}55`,
        flexShrink: 0,
      }}>
        {avatarLetter}
      </div>
    )
  )

  const handleUploadFile = async (file) => {
    if (!file) return
    try {
      const fd = new FormData()
      fd.append('document', file)
      await uploadDocument(fd)
      setDocRefreshKey(k => k + 1)
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setShowUploadMenu(false)
    }
  }

  const onSelectUploadFile = async (event) => {
    const selected = event.target.files?.[0]
    if (selected) await handleUploadFile(selected)
    event.target.value = ''
  }

  const handleProfileInput = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()
    setProfileSaving(true)
    setProfileError('')
    setProfileMessage('')
    try {
      const { data } = await updateProfile(profileForm)
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      setProfileMessage('Details updated successfully.')
      setShowProfileSettings(false)
    } catch (err) {
      setProfileError(err?.response?.data?.message || err.message || 'Unable to save profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePhoto = () => {
    setShowProfileMenu(false)
    setShowPhotoOptions(true)
  }

  const handlePhotoSelected = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setShowPhotoOptions(false)
    setProfileError('')
    setProfileMessage('')
    try {
      const formData = new FormData()
      formData.append('profilePhoto', file)
      const { data } = await uploadProfilePhoto(formData)
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      setProfileMessage('Profile photo updated successfully.')
    } catch (err) {
      setProfileError(err?.response?.data?.message || err.message || 'Failed to update photo')
    } finally {
      event.target.value = ''
    }
  }

  // ✅ FIXED: FormData use karo — removePhoto string 'true' jata hai backend mein
  const handleRemovePhoto = async () => {
    setShowProfileMenu(false)
    setShowPhotoOptions(false)
    setProfileError('')
    setProfileMessage('')
    try {
      const formData = new FormData()
      formData.append('removePhoto', 'true')
      const { data } = await updateProfile(formData)
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      setProfileMessage('Profile photo removed.')
    } catch (err) {
      setProfileError(err?.response?.data?.message || 'Failed to remove photo')
    }
  }

  const modalInputStyle = (t) => ({
    width: '100%', padding: '12px 14px', borderRadius: '14px',
    border: `1px solid ${t.border}`, background: t.surfaceAlt,
    color: t.text, fontSize: '14px', outline: 'none', fontFamily: 'inherit',
  })

  const modalButtonStyle = (t, primary) => ({
    minWidth: '120px', padding: '12px 16px', borderRadius: '14px',
    border: 'none', cursor: 'pointer', fontWeight: '700',
    background: primary ? t.primary : t.surfaceAlt,
    color: primary ? '#fff' : t.text,
  })

  const ActionRow = () => (
    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
      <button
        onClick={e => { e.stopPropagation(); setShowNewsSection(v => !v); setShowUploadMenu(false) }}
        style={{
          flex: '1 1 140px', minWidth: 0,
          padding: '18px 14px', borderRadius: '20px', border: 'none',
          background: showNewsSection ? t.primaryGrad : t.surface,
          boxShadow: showNewsSection ? `0 8px 24px ${t.primary}55` : t.shadow,
          cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
          transition: 'all 0.25s ease',
        }}
      >
        <span style={{ fontSize: '28px' }}>📰</span>
        <span style={{ fontSize: '13px', fontWeight: '700', color: showNewsSection ? '#fff' : t.primary }}>Health News</span>
        <span style={{ fontSize: '11px', color: showNewsSection ? 'rgba(255,255,255,0.75)' : t.textMuted }}>Latest updates</span>
      </button>

      <div style={{ flex: '1 1 140px', minWidth: 0, position: 'relative' }}>
        <button
          onClick={e => { e.stopPropagation(); setShowUploadMenu(v => !v); setShowNewsSection(false) }}
          style={{
            width: '100%', padding: '18px 14px', borderRadius: '20px', border: 'none',
            background: showUploadMenu ? 'linear-gradient(135deg, #f093fb, #f5576c)' : t.surface,
            boxShadow: showUploadMenu ? '0 8px 24px rgba(240,147,251,0.45)' : t.shadow,
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
          }}
        >
          <span style={{ fontSize: '28px' }}>📁</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: showUploadMenu ? '#fff' : '#f5576c' }}>Upload Docs</span>
          <span style={{ fontSize: '11px', color: showUploadMenu ? 'rgba(255,255,255,0.75)' : t.textMuted }}>Files & photos</span>
        </button>

        {showUploadMenu && (
          <div onClick={e => e.stopPropagation()} style={{
            position: 'absolute', top: 'calc(100% + 10px)',
            right: 0, left: 0,
            background: t.surface, borderRadius: '18px',
            boxShadow: t.shadowMd, padding: '10px', zIndex: 200,
            border: `1px solid ${t.border}`, minWidth: '180px',
          }}>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={onSelectUploadFile} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={onSelectUploadFile} />
            {[
              { icon: '📄', label: 'Upload File', sub: 'PDF, images', ref: fileInputRef },
              { icon: '📷', label: 'Take Photo', sub: 'Use camera', ref: cameraInputRef },
            ].map((opt, i) => (
              <button key={i}
                onClick={() => opt.ref.current?.click()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', padding: '12px 14px',
                  borderRadius: '12px', border: 'none',
                  background: 'none', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: '22px' }}>{opt.icon}</span>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: t.text }}>{opt.label}</div>
                  <div style={{ fontSize: '11px', color: t.textMuted }}>{opt.sub}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const ProfileSettingsModal = () => (
    <div
      onClick={() => setShowProfileSettings(false)}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, padding: '18px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '540px', background: t.surface,
          borderRadius: '28px', padding: '28px', boxShadow: t.shadowLg,
          border: `1px solid ${t.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', color: t.text }}>Edit your details</h2>
            <p style={{ margin: '6px 0 0', color: t.textMuted, fontSize: '13px' }}>
              Update your profile information for a better experience.
            </p>
          </div>
          <button onClick={() => setShowProfileSettings(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: t.textMuted }}>✕</button>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '14px' }}>
          {profileError && <div style={{ color: t.error, fontSize: '13px' }}>{profileError}</div>}
          {profileMessage && <div style={{ color: t.primary, fontSize: '13px' }}>{profileMessage}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: t.text }}>
              Full name
              <input value={profileForm.name} onChange={e => handleProfileInput('name', e.target.value)} style={modalInputStyle(t)} />
            </label>
            <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: t.text }}>
              Phone
              <input value={profileForm.phone} onChange={e => handleProfileInput('phone', e.target.value)} style={modalInputStyle(t)} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: t.text }}>
              City
              <input value={profileForm.city} onChange={e => handleProfileInput('city', e.target.value)} style={modalInputStyle(t)} />
            </label>
            <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: t.text }}>
              State
              <input value={profileForm.state} onChange={e => handleProfileInput('state', e.target.value)} style={modalInputStyle(t)} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: t.text }}>
              Age
              <input value={profileForm.age} onChange={e => handleProfileInput('age', e.target.value)} style={modalInputStyle(t)} />
            </label>
            <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: t.text }}>
              Weight
              <input value={profileForm.weight} onChange={e => handleProfileInput('weight', e.target.value)} style={modalInputStyle(t)} />
            </label>
            <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: t.text }}>
              Height
              <input value={profileForm.height} onChange={e => handleProfileInput('height', e.target.value)} style={modalInputStyle(t)} />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={() => setShowProfileSettings(false)} style={modalButtonStyle(t, false)}>Cancel</button>
            <button type="submit" disabled={profileSaving} style={modalButtonStyle(t, true)}>
              {profileSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const PhotoOptionsMenu = () => (
    <div
      onClick={() => setShowPhotoOptions(false)}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 600, padding: '0',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '520px',
          background: t.surface,
          borderRadius: '28px 28px 0 0',
          padding: '28px 20px 40px',
          boxShadow: t.shadowLg,
          border: `1px solid ${t.border}`,
          animation: 'slideUp 0.3s ease',
        }}
      >
        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: t.border, margin: '0 auto 24px' }} />

        <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '800', color: t.text, textAlign: 'center' }}>
          Change Profile Photo
        </h3>

        <label
          htmlFor="profile-camera-input"
          style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            width: '100%', padding: '18px 20px',
            borderRadius: '18px',
            background: t.surfaceAlt, cursor: 'pointer',
            marginBottom: '12px', boxSizing: 'border-box',
          }}
        >
          <span style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', flexShrink: 0,
          }}>📷</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: t.text }}>Take Photo</div>
            <div style={{ fontSize: '12px', color: t.textMuted, marginTop: '2px' }}>Open camera directly</div>
          </div>
        </label>
        <input
          id="profile-camera-input"
          type="file"
          accept="image/*"
          capture="user"
          style={{ display: 'none' }}
          onChange={handlePhotoSelected}
        />

        <label
          htmlFor="profile-gallery-input"
          style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            width: '100%', padding: '18px 20px',
            borderRadius: '18px',
            background: t.surfaceAlt, cursor: 'pointer',
            marginBottom: '12px', boxSizing: 'border-box',
          }}
        >
          <span style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', flexShrink: 0,
          }}>🖼️</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: t.text }}>Choose from Gallery</div>
            <div style={{ fontSize: '12px', color: t.textMuted, marginTop: '2px' }}>Pick from your photos</div>
          </div>
        </label>
        <input
          id="profile-gallery-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePhotoSelected}
        />

        {user?.profilePhoto && (
          <button
            onClick={handleRemovePhoto}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              width: '100%', padding: '18px 20px',
              borderRadius: '18px', border: 'none',
              background: 'rgba(239,68,68,0.08)', cursor: 'pointer',
              marginBottom: '4px', boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          >
            <span style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #f6546a, #e53e3e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', flexShrink: 0,
            }}>🗑️</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#dc2626' }}>Remove Photo</div>
              <div style={{ fontSize: '12px', color: t.textMuted, marginTop: '2px' }}>Delete current photo</div>
            </div>
          </button>
        )}

        <button
          onClick={() => setShowPhotoOptions(false)}
          style={{
            width: '100%', marginTop: '16px', padding: '16px',
            borderRadius: '16px', border: 'none',
            background: 'transparent', cursor: 'pointer',
            fontSize: '15px', fontWeight: '600', color: t.textMuted,
            fontFamily: 'inherit',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )

  const UserCard = ({ compact = false }) => (
    <div style={{
      background: t.primaryGrad,
      borderRadius: '22px',
      padding: compact ? '20px' : '22px',
      position: 'relative', overflow: 'hidden',
      boxShadow: `0 12px 40px ${t.primary}44`,
    }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
      <div style={{ position: 'absolute', bottom: '-30px', right: '50px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
        <Avatar size={compact ? 56 : 64} />
        <div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: '500' }}>My Profile</p>
          <p style={{ color: '#fff', fontSize: compact ? '16px' : '18px', fontWeight: '800', letterSpacing: '-0.3px' }}>
            {user?.name || 'User'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', marginTop: '2px' }}>
            📍 {[user?.city, user?.state].filter(Boolean).join(', ') || 'Location not set'}
          </p>
          {user?.age && (
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', marginTop: '3px' }}>
              Age: {user.age}{user?.bmi ? `  •  BMI: ${user.bmi}` : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <div
        onClick={() => { setShowProfileMenu(false); setShowUploadMenu(false) }}
        style={{ minHeight: '100vh', background: t.pageBg, display: 'flex', flexDirection: 'column' }}
      >
        <header style={{
          background: t.headerBg, backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${t.border}`,
          padding: '0 40px', height: '68px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100, boxShadow: t.shadow,
        }}>
          <div onClick={toggleChat} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <span style={{ fontSize: '28px' }}>🩺</span>
            <span style={{ fontSize: '20px', fontWeight: '900', background: t.primaryGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              Health AI
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={e => { e.stopPropagation(); toggleTheme() }} style={{ width: '40px', height: '40px', borderRadius: '50%', background: t.surfaceAlt, border: `1px solid ${t.border}`, cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadow }}>
              {isLight ? '🌙' : '☀️'}
            </button>
            <div onClick={e => { e.stopPropagation(); setNotifications(0) }} style={{ position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: t.surfaceAlt, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: t.shadow }}>🔔</div>
              {notifications > 0 && (
                <div style={{ position: 'absolute', top: '-2px', right: '-2px', background: 'linear-gradient(135deg, #f6546a, #e53e3e)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', border: '2px solid white' }}>
                  {notifications}
                </div>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <div onClick={e => { e.stopPropagation(); setShowProfileMenu(v => !v) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px 6px 8px', borderRadius: '40px', background: t.surfaceAlt, border: `1px solid ${t.border}`, cursor: 'pointer', boxShadow: t.shadow }}>
                <Avatar size={34} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: t.text }}>{user?.name?.split(' ')[0] || 'User'}</span>
                <span style={{ color: t.textMuted, fontSize: '12px' }}>▾</span>
              </div>
              {showProfileMenu && (
                <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: t.surface, borderRadius: '18px', boxShadow: t.shadowMd, padding: '8px', minWidth: '180px', zIndex: 300, border: `1px solid ${t.border}` }}>
                  <DropBtn onClick={() => { setShowProfileMenu(false); setShowProfileSettings(true) }} t={t}>✏️  Edit your details</DropBtn>
                  <DropBtn onClick={handleChangePhoto} t={t}>🖼️  Change photo</DropBtn>
                  {user?.profilePhoto && <DropBtn onClick={handleRemovePhoto} t={t} danger>🗑️  Remove photo</DropBtn>}
                  <div style={{ height: '1px', background: t.border, margin: '4px 0' }} />
                  <DropBtn onClick={handleLogout} t={t} danger>🚪  Logout</DropBtn>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ display: 'flex', flex: 1, gap: 0 }}>
          <aside style={{ width: '260px', flexShrink: 0, background: t.sidebarBg, backdropFilter: 'blur(20px)', borderRight: `1px solid ${t.border}`, padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: '28px', position: 'sticky', top: '68px', height: 'calc(100vh - 68px)', overflowY: 'auto' }}>
            <UserCard compact />
            <WaterIntake />
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'home', icon: '🏠', label: 'Home' },
                { id: 'health', icon: '❤️', label: 'Health Features' },
                { id: 'hospitals', icon: '🏥', label: 'Hospitals' },
                { id: 'documents', icon: '📁', label: 'My Documents' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '14px', border: 'none', background: activeTab === tab.id ? t.navActive : 'transparent', color: activeTab === tab.id ? t.primary : t.textSub, fontWeight: activeTab === tab.id ? '700' : '500', fontSize: '14px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s ease' }}>
                  <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.id && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: t.primary }} />}
                </button>
              ))}
            </nav>
          </aside>

          <main style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', alignItems: 'start' }}>
              <Card t={t}><SectionHeader title="Quick actions" subtitle="Dashboard" t={t} /><ActionRow /></Card>
              <Card t={t}><SectionHeader title="India birth vs death rate" subtitle="Vital rates" t={t} /><RateChart /></Card>
            </div>
            {showNewsSection && <Card t={t}><SectionHeader title="Health updates" subtitle="Insights" t={t} /><NewsSection /></Card>}
            <Card t={t}><SectionHeader title="Health features" subtitle="Wellness" t={t} /><HealthFeatures /></Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
              <Card t={t}><HospitalList /></Card>
              <Card t={t}><DocumentVault refreshKey={docRefreshKey} /></Card>
            </div>
          </main>
        </div>

        {showProfileSettings && <ProfileSettingsModal />}
        {showPhotoOptions && <PhotoOptionsMenu />}
        {showWaterPopup && <WaterPopup t={t} onYes={() => setShowWaterPopup(false)} onNo={() => setShowWaterPopup(false)} />}
      </div>
    )
  }

  function DropBtn({ children, onClick, t, danger }) {
    return (
      <button onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        width: '100%', padding: '10px 14px',
        borderRadius: '12px', border: 'none',
        background: 'none', cursor: 'pointer',
        fontSize: '13px', fontWeight: '600',
        color: danger ? t.error : t.text,
        textAlign: 'left', fontFamily: 'inherit',
      }}>
        {children}
      </button>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: t.pageBg, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%', maxWidth: '520px', minHeight: '100vh',
          background: t.containerBg,
          position: 'relative', paddingBottom: '84px',
          boxShadow: '0 0 60px rgba(100,149,237,0.1)',
        }}
        onClick={() => { setShowProfileMenu(false); setShowUploadMenu(false) }}
      >
        <div style={{
          padding: '16px 18px 14px',
          background: t.headerBg, backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100, boxShadow: t.shadow,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
            <div onClick={e => { e.stopPropagation(); setShowProfileMenu(v => !v) }} style={{ position: 'relative', cursor: 'pointer' }}>
              <Avatar size={44} />
              <div style={{ position: 'absolute', bottom: 1, right: 1, width: '11px', height: '11px', borderRadius: '50%', background: '#48bb78', border: '2px solid white' }} />
            </div>
            <div>
              <p style={{ fontSize: '11px', color: t.textMuted, fontWeight: '500' }}>{getGreeting()} 👋</p>
              <p style={{ fontSize: '15px', fontWeight: '800', color: t.text }}>{user?.name || 'User'}</p>
            </div>

            {showProfileMenu && (
              <div style={{
                position: 'absolute', top: '54px', left: 0,
                background: t.surface, borderRadius: '18px',
                boxShadow: t.shadowMd, padding: '8px', minWidth: '175px',
                zIndex: 200, border: `1px solid ${t.border}`,
              }}>
                <DropBtn onClick={() => { setShowProfileMenu(false); setShowProfileSettings(true) }} t={t}>✏️  Edit your details</DropBtn>
                <DropBtn onClick={handleChangePhoto} t={t}>🖼️  Change photo</DropBtn>
                {user?.profilePhoto && <DropBtn onClick={handleRemovePhoto} t={t} danger>🗑️  Remove photo</DropBtn>}
                <div style={{ height: '1px', background: t.border, margin: '4px 0' }} />
                <DropBtn onClick={handleLogout} t={t} danger>🚪  Logout</DropBtn>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={e => { e.stopPropagation(); toggleTheme() }} style={{ width: '38px', height: '38px', borderRadius: '50%', background: t.surfaceAlt, border: `1px solid ${t.border}`, cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isLight ? '🌙' : '☀️'}
            </button>
            <div onClick={e => { e.stopPropagation(); setNotifications(0) }} style={{ position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: t.surfaceAlt, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🔔</div>
              {notifications > 0 && (
                <div style={{ position: 'absolute', top: '-2px', right: '-2px', background: 'linear-gradient(135deg, #f6546a, #e53e3e)', color: '#fff', borderRadius: '50%', width: '17px', height: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', border: '2px solid white' }}>
                  {notifications}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ overflowY: 'auto' }}>
          <div style={{ padding: '20px 18px 0' }}><ActionRow /></div>

          <div style={{ padding: '16px 18px 0' }}>
            <Card t={t} style={{ minHeight: '420px' }}>
              <SectionHeader title="India birth vs death rate" subtitle="Vital rates" t={t} />
              <RateChart />
            </Card>
          </div>

          {showNewsSection && (
            <div style={{ paddingTop: '16px' }}>
              <Card t={t}>
                <SectionHeader title="Health updates" subtitle="Insights" t={t} />
                <NewsSection />
              </Card>
            </div>
          )}

          <div style={{ padding: '16px 18px 0' }}><UserCard /></div>
          <div style={{ padding: '16px 18px 0' }}><WaterIntake /></div>

          <div style={{ padding: '16px 18px 0' }}>
            <Card t={t}>
              <SectionHeader title="Health features" subtitle="Wellness" t={t} />
              <HealthFeatures />
            </Card>
          </div>

          <div style={{ padding: '16px 18px 0' }}>
            <Card t={t}><HospitalList /></Card>
          </div>

          <div style={{ padding: '16px 18px 28px' }}>
            <Card t={t}><DocumentVault refreshKey={docRefreshKey} /></Card>
          </div>
        </div>

        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: '520px',
          background: t.headerBg, backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${t.border}`,
          padding: '10px 8px 14px',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          zIndex: 150, boxShadow: `0 -8px 28px ${t.primary}14`,
        }}>
          {[
            { id: 'home', icon: '🏠', label: 'Home' },
            { id: 'health', icon: '❤️', label: 'Health' },
            { id: 'hospitals', icon: '🏥', label: 'Hospitals' },
            { id: 'profile', icon: '👤', label: 'Profile' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              background: activeTab === tab.id ? t.navActive : 'none',
              border: 'none', cursor: 'pointer',
              padding: '6px 14px', borderRadius: '14px', fontFamily: 'inherit',
            }}>
              <span style={{ fontSize: '22px', lineHeight: 1 }}>{tab.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: activeTab === tab.id ? '700' : '500', color: activeTab === tab.id ? t.navActiveDot : t.textLight }}>
                {tab.label}
              </span>
              {activeTab === tab.id && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: t.navActiveDot, marginTop: '-2px' }} />}
            </button>
          ))}
        </div>

        {showProfileSettings && <ProfileSettingsModal />}
        {showPhotoOptions && <PhotoOptionsMenu />}
        {showWaterPopup && <WaterPopup t={t} onYes={() => setShowWaterPopup(false)} onNo={() => setShowWaterPopup(false)} />}
      </div>

      <style>{`
        @keyframes popIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>
    </div>
  )
}

function DropBtn({ children, onClick, t, danger }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      width: '100%', padding: '10px 14px',
      borderRadius: '12px', border: 'none',
      background: 'none', cursor: 'pointer',
      fontSize: '13px', fontWeight: '600',
      color: danger ? t.error : t.text,
      textAlign: 'left', fontFamily: 'inherit',
    }}>
      {children}
    </button>
  )
}

function WaterPopup({ t, onYes, onNo }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 400, padding: '20px',
    }}>
      <div style={{
        background: t.surface, borderRadius: '28px',
        padding: '32px 28px', textAlign: 'center',
        boxShadow: t.shadowLg, maxWidth: '310px', width: '100%',
        animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        border: `1px solid ${t.border}`,
      }}>
        <div style={{ fontSize: '52px', marginBottom: '12px' }}>💧</div>
        <h3 style={{ fontSize: '20px', fontWeight: '800', color: t.text, marginBottom: '8px' }}>Stay Hydrated!</h3>
        <p style={{ color: t.textSub, fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          Did you drink water in the last hour?
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onYes} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #43e97b, #38f9d7)', color: '#fff', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(67,233,123,0.4)', fontFamily: 'inherit' }}>
            ✅ Yes!
          </button>
          <button onClick={onNo} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: `2px solid ${t.border}`, background: t.surface, color: t.textMuted, fontWeight: '700', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Not yet
          </button>
        </div>
      </div>
    </div>
  )
}

