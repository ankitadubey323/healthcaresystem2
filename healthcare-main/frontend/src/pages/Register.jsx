import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { registerUser, loginUser } from '../utils/api'
import BMICalculator from '../components/BMICalculator'

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const { t, themeName, toggleTheme } = useTheme()

  const isLogin = searchParams.get('mode') === 'login'
  const [mode, setMode] = useState(isLogin ? 'login' : 'register')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showBMI, setShowBMI] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    phone: '', city: '', state: '',
    age: '', weight: '', height: '', bmi: '',
  })
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [aadhaar, setAadhaar] = useState(null)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleBMICalculated = (bmi, weight, height) =>
    setForm(prev => ({ ...prev, bmi, weight, height }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let res
      if (mode === 'register') {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
        if (profilePhoto) fd.append('profilePhoto', profilePhoto)
        if (aadhaar) fd.append('aadhaar', aadhaar)
        res = await registerUser(fd)
      } else {
        res = await loginUser({ email: form.email, password: form.password })
      }

      if (!res?.data?.token || !res?.data?.user) {
        throw new Error('Authentication failed. Please try again.')
      }

      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      const networkError = err.message === 'Network Error' || !err.response
      const message = networkError
        ? 'Cannot connect to backend. Start the backend server and try again.'
        : err.response?.data?.message || 'Unable to connect to server. Please start the backend.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const isLight = themeName === 'light'

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: `1.5px solid ${t.inputBorder}`,
    background: t.inputBg,
    color: t.inputText,
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  }

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: t.textMuted,
    marginBottom: '5px',
    display: 'block',
    letterSpacing: '0.3px',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: t.pageBg,
      display: 'flex',
      alignItems: 'stretch',
      position: 'relative',
    }}>
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 100,
          width: '42px', height: '42px', borderRadius: '50%',
          background: t.surface, border: `1px solid ${t.border}`,
          boxShadow: t.shadow, cursor: 'pointer',
          fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {isLight ? '🌙' : '☀️'}
      </button>

      {/* ── LEFT PANEL (desktop only) ── */}
      <div style={{
        flex: '0 0 46%',
        background: t.primaryGrad,
        display: 'none', // hidden on mobile (overridden by media class trick below)
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        position: 'relative',
        overflow: 'hidden',
      }} className="register-left-panel">
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '250px', height: '250px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '-40px',
          width: '150px', height: '150px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🩺</div>
          <h1 style={{
            fontSize: '42px', fontWeight: '900', color: '#fff',
            marginBottom: '16px', letterSpacing: '-1px',
          }}>
            Health AI
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.82)', fontSize: '17px',
            lineHeight: 1.7, marginBottom: '48px', maxWidth: '320px',
          }}>
            Your all-in-one personal health companion. Track wellness, find hospitals, and manage your medical records.
          </p>

          {/* Feature list */}
          {[
            { icon: '🏥', text: 'Find nearby hospitals instantly' },
            { icon: '💧', text: 'Track daily water intake' },
            { icon: '🧘', text: 'Guided yoga & workout sessions' },
            { icon: '📁', text: 'Secure medical document vault' },
            { icon: '📰', text: 'Latest health news & updates' },
          ].map(f => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              marginBottom: '14px', textAlign: 'left',
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        overflowY: 'auto',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: '480px',
            background: t.surface,
            borderRadius: '28px',
            padding: 'clamp(24px, 5vw, 40px)',
            boxShadow: t.shadowLg,
            border: `1px solid ${t.border}`,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>
              {mode === 'login' ? '👋' : '✨'}
            </div>
            <h2 style={{
              fontSize: '26px', fontWeight: '800', color: t.text,
              marginBottom: '6px', letterSpacing: '-0.5px',
            }}>
              {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p style={{ color: t.textMuted, fontSize: '14px' }}>
              {mode === 'login'
                ? 'Sign in to your Health AI account'
                : 'Join thousands managing their health smarter'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div style={{
            display: 'flex',
            background: t.surfaceAlt,
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '24px',
            border: `1px solid ${t.border}`,
          }}>
            {['register', 'login'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '10px',
                  borderRadius: '10px', border: 'none',
                  background: mode === m ? t.primaryGrad : 'transparent',
                  color: mode === m ? '#fff' : t.textMuted,
                  fontWeight: '700', cursor: 'pointer', fontSize: '13px',
                  boxShadow: mode === m ? '0 4px 12px rgba(102,126,234,0.35)' : 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                {m === 'login' ? '🔑 Login' : '📝 Register'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: t.errorBg,
              border: `1px solid ${t.errorBorder}`,
              borderRadius: '12px', padding: '12px 16px',
              color: t.error, fontSize: '13px', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {mode === 'register' && (
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} name="name" placeholder="Rahul Sharma"
                    value={form.name} onChange={handleChange} required />
                </div>
              )}

              <div>
                <label style={labelStyle}>Email Address</label>
                <input style={inputStyle} name="email" type="email"
                  placeholder="you@example.com" value={form.email}
                  onChange={handleChange} required />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input style={inputStyle} name="password" type="password"
                  placeholder="••••••••" value={form.password}
                  onChange={handleChange} required />
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input style={inputStyle} name="phone" placeholder="+91 9876543210"
                      value={form.phone} onChange={handleChange} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>City</label>
                      <input style={inputStyle} name="city" placeholder="Mumbai"
                        value={form.city} onChange={handleChange} />
                    </div>
                    <div>
                      <label style={labelStyle}>State</label>
                      <input style={inputStyle} name="state" placeholder="Maharashtra"
                        value={form.state} onChange={handleChange} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Age</label>
                    <input style={inputStyle} name="age" type="number" placeholder="25"
                      value={form.age} onChange={handleChange} />
                  </div>

                  {/* BMI */}
                  <button
                    type="button"
                    onClick={() => setShowBMI(!showBMI)}
                    style={{
                      padding: '11px 16px',
                      borderRadius: '12px',
                      border: `1.5px dashed ${t.primary}`,
                      background: t.primaryLight,
                      color: t.primary,
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                    }}
                  >
                    {showBMI ? '▲ Hide BMI Calculator' : '🧮 Calculate BMI (optional)'}
                  </button>

                  {showBMI && <BMICalculator onBMICalculated={handleBMICalculated} />}

                  {/* Profile Photo */}
                  <div>
                    <label style={labelStyle}>Profile Photo</label>
                    <label htmlFor="profilePhoto" style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', borderRadius: '12px',
                      border: `1.5px dashed ${t.inputBorder}`,
                      background: t.inputBg, cursor: 'pointer',
                    }}>
                      <span style={{ fontSize: '22px' }}>📷</span>
                      <span style={{ color: profilePhoto ? t.text : t.textLight, fontSize: '13px' }}>
                        {profilePhoto ? profilePhoto.name : 'Click to upload photo'}
                      </span>
                    </label>
                    <input id="profilePhoto" type="file" accept="image/*"
                      onChange={e => setProfilePhoto(e.target.files[0])}
                      style={{ display: 'none' }} />
                  </div>

                  {/* Aadhaar */}
                  <div>
                    <label style={labelStyle}>Aadhaar Card (optional)</label>
                    <label htmlFor="aadhaar" style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', borderRadius: '12px',
                      border: `1.5px dashed ${t.inputBorder}`,
                      background: t.inputBg, cursor: 'pointer',
                    }}>
                      <span style={{ fontSize: '22px' }}>📄</span>
                      <span style={{ color: aadhaar ? t.text : t.textLight, fontSize: '13px' }}>
                        {aadhaar ? aadhaar.name : 'Click to upload PDF or image'}
                      </span>
                    </label>
                    <input id="aadhaar" type="file" accept="image/*,.pdf"
                      onChange={e => setAadhaar(e.target.files[0])}
                      style={{ display: 'none' }} />
                  </div>
                </>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                style={{
                  padding: '14px',
                  borderRadius: '14px', border: 'none',
                  background: loading ? t.surfaceAlt : t.primaryGrad,
                  color: loading ? t.textMuted : '#fff',
                  fontWeight: '700', fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '6px',
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(102,126,234,0.4)',
                  fontFamily: 'inherit',
                }}
              >
                {loading
                  ? '⏳ Please wait...'
                  : mode === 'login' ? '🔑 Login to Dashboard' : '✨ Create My Account'}
              </motion.button>

              <p style={{ textAlign: 'center', fontSize: '13px', color: t.textMuted, marginTop: '4px' }}>
                {mode === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <span
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  style={{ color: t.primary, fontWeight: '700', cursor: 'pointer' }}
                >
                  {mode === 'login' ? 'Register here' : 'Login'}
                </span>
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Media query for desktop two-column layout */}
      <style>{`
        @media (min-width: 768px) {
          .register-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
