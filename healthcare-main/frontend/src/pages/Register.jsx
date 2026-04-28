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
  const [showPassword, setShowPassword] = useState(false)

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
    borderRadius: '10px',
    border: `1px solid ${t.border}`,
    background: t.surface,
    color: t.text,
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
  }

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: t.textMuted,
    marginBottom: '6px',
    display: 'block',
    letterSpacing: '0.2px',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: t.pageBg,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px 16px',
      position: 'relative',
    }}>
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed', top: '16px', right: '16px', zIndex: 100,
          width: '36px', height: '36px', borderRadius: '50%',
          background: t.surface, border: `1px solid ${t.border}`,
          boxShadow: t.shadow, cursor: 'pointer',
          fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '600', color: t.text,
        }}
      >
        {isLight ? '☀' : '☾'}
      </button>

      <div style={{
        width: '100%',
        maxWidth: '520px',
        padding: '0 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            width: '100%',
            background: t.surface,
            borderRadius: '16px',
            padding: '32px 24px',
            boxShadow: t.shadow,
            border: `1px solid ${t.border}`,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: t.primary }}>
              DR+
            </div>
            <h2 style={{
              fontSize: '22px', fontWeight: '700', color: t.text,
              marginBottom: '8px', letterSpacing: '-0.3px',
            }}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <p style={{ color: t.textMuted, fontSize: '12px', lineHeight: 1.5 }}>
              {mode === 'login'
                ? 'Welcome back to your health dashboard'
                : 'Join thousands managing their health smarter'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div style={{
            display: 'flex',
            background: t.surfaceAlt,
            borderRadius: '10px',
            padding: '3px',
            marginBottom: '24px',
            border: `1px solid ${t.border}`,
            gap: '3px',
          }}>
            {['register', 'login'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '9px',
                  borderRadius: '8px', border: 'none',
                  background: mode === m ? t.primary : 'transparent',
                  color: mode === m ? '#fff' : t.textMuted,
                  fontWeight: mode === m ? '600' : '500', cursor: 'pointer', fontSize: '12px',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: t.errorBg,
              border: `1px solid ${t.errorBorder}`,
              borderRadius: '10px', padding: '11px 14px',
              color: t.error, fontSize: '12px', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

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

              {/* Password with toggle */}
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                      color: t.textMuted,
                      lineHeight: 1, padding: 0,
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input style={inputStyle} name="phone" placeholder="+91 9876543210"
                      value={form.phone} onChange={handleChange} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: `1px solid ${t.border}`,
                      background: t.surfaceAlt,
                      color: t.primary,
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      fontFamily: 'inherit',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {showBMI ? 'Hide BMI Calculator' : 'Calculate BMI (Optional)'}
                  </button>

                  {showBMI && <BMICalculator onBMICalculated={handleBMICalculated} />}

                  {/* Profile Photo - Camera + Gallery */}
                  <div>
                    <label style={labelStyle}>Profile Photo</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <label htmlFor="profilePhoto" style={{
                        flex: 1, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '6px',
                        padding: '10px', borderRadius: '10px',
                        border: `1px solid ${t.border}`,
                        background: t.surfaceAlt, cursor: 'pointer',
                      }}>
                        <span style={{ color: t.primary, fontSize: '12px', fontWeight: '600' }}>Gallery</span>
                      </label>
                      <label htmlFor="profilePhotoCamera" style={{
                        flex: 1, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '6px',
                        padding: '10px', borderRadius: '10px',
                        border: `1px solid ${t.border}`,
                        background: t.surfaceAlt, cursor: 'pointer',
                      }}>
                        <span style={{ color: t.primary, fontSize: '12px', fontWeight: '600' }}>Camera</span>
                      </label>
                    </div>
                    {profilePhoto && (
                      <p style={{ fontSize: '11px', color: t.textMuted, marginTop: '6px' }}>
                        {profilePhoto.name}
                      </p>
                    )}
                    <input id="profilePhoto" type="file" accept="image/*"
                      onChange={e => setProfilePhoto(e.target.files[0])}
                      style={{ display: 'none' }} />
                    <input id="profilePhotoCamera" type="file" accept="image/*"
                      capture="environment"
                      onChange={e => setProfilePhoto(e.target.files[0])}
                      style={{ display: 'none' }} />
                  </div>

                  {/* Aadhaar */}
                  <div>
                    <label style={labelStyle}>Aadhaar Card (Optional)</label>
                    <label htmlFor="aadhaar" style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', borderRadius: '10px',
                      border: `1px solid ${t.border}`,
                      background: t.surfaceAlt, cursor: 'pointer',
                      fontSize: '12px', color: aadhaar ? t.text : t.textMuted,
                    }}>
                      {aadhaar ? aadhaar.name : 'Upload PDF or image'}
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
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
                style={{
                  padding: '12px',
                  borderRadius: '10px', border: 'none',
                  background: loading ? t.surfaceAlt : t.primary,
                  color: loading ? t.textMuted : '#fff',
                  fontWeight: '600', fontSize: '13px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '8px',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'login' ? 'Sign In' : 'Create Account'}
              </motion.button>

              <p style={{ textAlign: 'center', fontSize: '12px', color: t.textMuted, marginTop: '8px' }}>
                {mode === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <span
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  style={{ color: t.primary, fontWeight: '600', cursor: 'pointer' }}
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </span>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
