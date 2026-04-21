// import { useState } from 'react'
// import { useNavigate, useSearchParams } from 'react-router-dom'
// import { motion } from 'framer-motion'
// import { useAuth } from '../context/AuthContext'
// import { useTheme } from '../context/ThemeContext'
// import { registerUser, loginUser } from '../utils/api'
// import BMICalculator from '../components/BMICalculator'

// export default function Register() {
//   const navigate = useNavigate()
//   const [searchParams] = useSearchParams()
//   const { login } = useAuth()
//   const { t, themeName, toggleTheme } = useTheme()

//   const isLogin = searchParams.get('mode') === 'login'
//   const [mode, setMode] = useState(isLogin ? 'login' : 'register')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [showBMI, setShowBMI] = useState(false)

//   const [form, setForm] = useState({
//     name: '', email: '', password: '',
//     phone: '', city: '', state: '',
//     age: '', weight: '', height: '', bmi: '',
//   })
//   const [profilePhoto, setProfilePhoto] = useState(null)
//   const [aadhaar, setAadhaar] = useState(null)

//   const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

//   const handleBMICalculated = (bmi, weight, height) =>
//     setForm(prev => ({ ...prev, bmi, weight, height }))

//   const handleSubmit = async e => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')
//     try {
//       let res
//       if (mode === 'register') {
//         const fd = new FormData()
//         Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
//         if (profilePhoto) fd.append('profilePhoto', profilePhoto)
//         if (aadhaar) fd.append('aadhaar', aadhaar)
//         res = await registerUser(fd)
//       } else {
//         res = await loginUser({ email: form.email, password: form.password })
//       }

//       if (!res?.data?.token || !res?.data?.user) {
//         throw new Error('Authentication failed. Please try again.')
//       }

//       login(res.data.user, res.data.token)
//       navigate('/dashboard')
//     } catch (err) {
//       const networkError = err.message === 'Network Error' || !err.response
//       const message = networkError
//         ? 'Cannot connect to backend. Start the backend server and try again.'
//         : err.response?.data?.message || 'Unable to connect to server. Please start the backend.'
//       setError(message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const isLight = themeName === 'light'

//   const inputStyle = {
//     width: '100%',
//     padding: '12px 16px',
//     borderRadius: '12px',
//     border: `1.5px solid ${t.inputBorder}`,
//     background: t.inputBg,
//     color: t.inputText,
//     fontSize: '14px',
//     outline: 'none',
//     fontFamily: 'inherit',
//   }

//   const labelStyle = {
//     fontSize: '12px',
//     fontWeight: '600',
//     color: t.textMuted,
//     marginBottom: '5px',
//     display: 'block',
//     letterSpacing: '0.3px',
//   }

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: t.pageBg,
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       padding: '24px 16px',
//       position: 'relative',
//     }}>
//       {/* Theme toggle */}
//       <button
//         onClick={toggleTheme}
//         style={{
//           position: 'fixed', top: '16px', right: '16px', zIndex: 100,
//           width: '42px', height: '42px', borderRadius: '50%',
//           background: t.surface, border: `1px solid ${t.border}`,
//           boxShadow: t.shadow, cursor: 'pointer',
//           fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
//         }}
//       >
//         {isLight ? '🌙' : '☀️'}
//       </button>

//       <div style={{
//         width: '100%',
//         maxWidth: '520px',
//         padding: '0 10px',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//       }}>
//         <motion.div
//           initial={{ opacity: 0, y: 24 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, ease: 'easeOut' }}
//           style={{
//             width: '100%',
//             background: t.surface,
//             borderRadius: '36px',
//             padding: '28px 22px',
//             boxShadow: t.shadowLg,
//             border: `1px solid ${t.border}`,
//             overflow: 'hidden',
//           }}
//         >
//           <div style={{
//             marginBottom: '24px',
//             textAlign: 'center',
//             padding: '20px 16px',
//             borderRadius: '28px',
//             background: t.primaryLight,
//           }}>
//             <div style={{
//               margin: '0 auto 14px',
//               width: '72px',
//               height: '72px',
//               display: 'grid',
//               placeItems: 'center',
//               borderRadius: '24px',
//               background: 'linear-gradient(135deg, #ff5f6d, #ff9a8b)',
//               color: '#fff',
//               fontSize: '34px',
//             }}>
//               🩺
//             </div>
//             <h2 style={{
//               fontSize: '24px',
//               fontWeight: '900',
//               margin: 0,
//               color: t.text,
//               lineHeight: 1.05,
//             }}>
//               {mode === 'login' ? 'Welcome Back!' : 'Health AI Sign Up'}
//             </h2>
//             <p style={{ color: t.textMuted, fontSize: '14px', marginTop: '10px' }}>
//               {mode === 'login'
//                 ? 'Sign in to your mobile health AI dashboard.'
//                 : 'Create your Health AI account and start your journey.'}
//             </p>
//           </div>
//           {/* Header */}
//           <div style={{ textAlign: 'center', marginBottom: '28px' }}>
//             <div style={{ fontSize: '40px', marginBottom: '10px' }}>
//               {mode === 'login' ? '👋' : '✨'}
//             </div>
//             <h2 style={{
//               fontSize: '26px', fontWeight: '800', color: t.text,
//               marginBottom: '6px', letterSpacing: '-0.5px',
//             }}>
//               {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
//             </h2>
//             <p style={{ color: t.textMuted, fontSize: '14px' }}>
//               {mode === 'login'
//                 ? 'Sign in to your Health AI account'
//                 : 'Join thousands managing their health smarter'}
//             </p>
//           </div>

//           {/* Mode Toggle */}
//           <div style={{
//             display: 'flex',
//             background: t.surfaceAlt,
//             borderRadius: '14px',
//             padding: '4px',
//             marginBottom: '24px',
//             border: `1px solid ${t.border}`,
//           }}>
//             {['register', 'login'].map(m => (
//               <button
//                 key={m}
//                 onClick={() => setMode(m)}
//                 style={{
//                   flex: 1, padding: '10px',
//                   borderRadius: '10px', border: 'none',
//                   background: mode === m ? t.primaryGrad : 'transparent',
//                   color: mode === m ? '#fff' : t.textMuted,
//                   fontWeight: '700', cursor: 'pointer', fontSize: '13px',
//                   boxShadow: mode === m ? '0 4px 12px rgba(102,126,234,0.35)' : 'none',
//                   transition: 'all 0.2s ease',
//                   fontFamily: 'inherit',
//                 }}
//               >
//                 {m === 'login' ? '🔑 Login' : '📝 Register'}
//               </button>
//             ))}
//           </div>

//           {/* Error */}
//           {error && (
//             <div style={{
//               background: t.errorBg,
//               border: `1px solid ${t.errorBorder}`,
//               borderRadius: '12px', padding: '12px 16px',
//               color: t.error, fontSize: '13px', marginBottom: '16px',
//               display: 'flex', alignItems: 'center', gap: '8px',
//             }}>
//               ⚠️ {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

//               {mode === 'register' && (
//                 <div>
//                   <label style={labelStyle}>Full Name</label>
//                   <input style={inputStyle} name="name" placeholder="Rahul Sharma"
//                     value={form.name} onChange={handleChange} required />
//                 </div>
//               )}

//               <div>
//                 <label style={labelStyle}>Email Address</label>
//                 <input style={inputStyle} name="email" type="email"
//                   placeholder="you@example.com" value={form.email}
//                   onChange={handleChange} required />
//               </div>

//               <div>
//                 <label style={labelStyle}>Password</label>
//                 <input style={inputStyle} name="password" type="password"
//                   placeholder="••••••••" value={form.password}
//                   onChange={handleChange} required />
//               </div>

//               {mode === 'register' && (
//                 <>
//                   <div>
//                     <label style={labelStyle}>Phone Number</label>
//                     <input style={inputStyle} name="phone" placeholder="+91 9876543210"
//                       value={form.phone} onChange={handleChange} />
//                   </div>

//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
//                     <div>
//                       <label style={labelStyle}>City</label>
//                       <input style={inputStyle} name="city" placeholder="Mumbai"
//                         value={form.city} onChange={handleChange} />
//                     </div>
//                     <div>
//                       <label style={labelStyle}>State</label>
//                       <input style={inputStyle} name="state" placeholder="Maharashtra"
//                         value={form.state} onChange={handleChange} />
//                     </div>
//                   </div>

//                   <div>
//                     <label style={labelStyle}>Age</label>
//                     <input style={inputStyle} name="age" type="number" placeholder="25"
//                       value={form.age} onChange={handleChange} />
//                   </div>

//                   {/* BMI */}
//                   <button
//                     type="button"
//                     onClick={() => setShowBMI(!showBMI)}
//                     style={{
//                       padding: '11px 16px',
//                       borderRadius: '12px',
//                       border: `1.5px dashed ${t.primary}`,
//                       background: t.primaryLight,
//                       color: t.primary,
//                       cursor: 'pointer',
//                       fontSize: '13px',
//                       fontWeight: '600',
//                       fontFamily: 'inherit',
//                       textAlign: 'left',
//                     }}
//                   >
//                     {showBMI ? '▲ Hide BMI Calculator' : '🧮 Calculate BMI (optional)'}
//                   </button>

//                   {showBMI && <BMICalculator onBMICalculated={handleBMICalculated} />}

//                   {/* Profile Photo */}
//                   <div>
//                     <label style={labelStyle}>Profile Photo</label>
//                     <label htmlFor="profilePhoto" style={{
//                       display: 'flex', alignItems: 'center', gap: '12px',
//                       padding: '12px 16px', borderRadius: '12px',
//                       border: `1.5px dashed ${t.inputBorder}`,
//                       background: t.inputBg, cursor: 'pointer',
//                     }}>
//                       <span style={{ fontSize: '22px' }}>📷</span>
//                       <span style={{ color: profilePhoto ? t.text : t.textLight, fontSize: '13px' }}>
//                         {profilePhoto ? profilePhoto.name : 'Click to upload photo'}
//                       </span>
//                     </label>
//                     <input id="profilePhoto" type="file" accept="image/*"
//                       onChange={e => setProfilePhoto(e.target.files[0])}
//                       style={{ display: 'none' }} />
//                   </div>

//                   {/* Aadhaar */}
//                   <div>
//                     <label style={labelStyle}>Aadhaar Card (optional)</label>
//                     <label htmlFor="aadhaar" style={{
//                       display: 'flex', alignItems: 'center', gap: '12px',
//                       padding: '12px 16px', borderRadius: '12px',
//                       border: `1.5px dashed ${t.inputBorder}`,
//                       background: t.inputBg, cursor: 'pointer',
//                     }}>
//                       <span style={{ fontSize: '22px' }}>📄</span>
//                       <span style={{ color: aadhaar ? t.text : t.textLight, fontSize: '13px' }}>
//                         {aadhaar ? aadhaar.name : 'Click to upload PDF or image'}
//                       </span>
//                     </label>
//                     <input id="aadhaar" type="file" accept="image/*,.pdf"
//                       onChange={e => setAadhaar(e.target.files[0])}
//                       style={{ display: 'none' }} />
//                   </div>
//                 </>
//               )}

//               <motion.button
//                 type="submit"
//                 disabled={loading}
//                 whileHover={!loading ? { scale: 1.02 } : {}}
//                 whileTap={!loading ? { scale: 0.98 } : {}}
//                 style={{
//                   padding: '14px',
//                   borderRadius: '14px', border: 'none',
//                   background: loading ? t.surfaceAlt : t.primaryGrad,
//                   color: loading ? t.textMuted : '#fff',
//                   fontWeight: '700', fontSize: '15px',
//                   cursor: loading ? 'not-allowed' : 'pointer',
//                   marginTop: '6px',
//                   boxShadow: loading ? 'none' : '0 6px 20px rgba(102,126,234,0.4)',
//                   fontFamily: 'inherit',
//                 }}
//               >
//                 {loading
//                   ? '⏳ Please wait...'
//                   : mode === 'login' ? '🔑 Login to Dashboard' : '✨ Create My Account'}
//               </motion.button>

//               <p style={{ textAlign: 'center', fontSize: '13px', color: t.textMuted, marginTop: '4px' }}>
//                 {mode === 'login'
//                   ? "Don't have an account? "
//                   : 'Already have an account? '}
//                 <span
//                   onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
//                   style={{ color: t.primary, fontWeight: '700', cursor: 'pointer' }}
//                 >
//                   {mode === 'login' ? 'Register here' : 'Login'}
//                 </span>
//               </p>
//             </div>
//           </form>
//         </motion.div>
//       </div>

//     </div>
//   )
// }



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
    padding: '14px 16px',
    borderRadius: '12px',
    border: `1px solid ${t.inputBorder}`,
    background: t.surface,
    color: t.inputText,
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxShadow: t.shadow,
  }

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: t.textMuted,
    marginBottom: '8px',
    display: 'block',
    letterSpacing: '0.3px',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: t.pageBg,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient background layers */}
      <div style={{
        position: 'absolute',
        top: '-30%',
        left: '-20%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: t.gradientBlob1,
        filter: 'blur(120px)',
        opacity: 0.8,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-25%',
        right: '-20%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: t.gradientBlob2,
        filter: 'blur(100px)',
        opacity: 0.6,
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '30%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      {/* Theme toggle - floating with glass effect */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 100,
          width: '44px', height: '44px', borderRadius: '14px',
          background: t.glass, border: `1px solid ${t.glassBorder}`,
          boxShadow: t.shadowMd, cursor: 'pointer',
          fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.2s ease',
        }}
      >
        {isLight ? '🌙' : '☀️'}
      </button>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '0 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            width: '100%',
            background: t.glass,
            borderRadius: '24px',
            padding: '36px 32px',
            boxShadow: t.shadowXl,
            border: `1px solid ${t.glassBorder}`,
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{
            marginBottom: '28px',
            textAlign: 'center',
            padding: '24px 20px',
            borderRadius: '20px',
            background: t.primaryLight,
          }}>
            <div style={{
              margin: '0 auto 16px',
              width: '64px',
              height: '64px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '20px',
              background: t.primaryGrad,
              color: '#fff',
              fontSize: '28px',
              boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
            }}>
              🩺
            </div>
            <h2 style={{
              fontSize: '26px',
              fontWeight: '800',
              margin: 0,
              background: t.primaryGrad,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.15,
            }}>
              {mode === 'login' ? 'Welcome Back!' : 'Health AI Sign Up'}
            </h2>
            <p style={{ color: t.textMuted, fontSize: '14px', marginTop: '8px' }}>
              {mode === 'login'
                ? 'Sign in to your mobile health AI dashboard.'
                : 'Create your Health AI account and start your journey.'}
            </p>
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>
              {mode === 'login' ? '👋' : '✨'}
            </div>
            <h2 style={{
              fontSize: '24px', fontWeight: '700', color: t.text,
              marginBottom: '4px', letterSpacing: '-0.3px',
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
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '24px',
            border: `1px solid ${t.border}`,
          }}>
            {['register', 'login'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '12px 16px',
                  borderRadius: '10px', border: 'none',
                  background: mode === m ? t.primaryGrad : 'transparent',
                  color: mode === m ? '#fff' : t.textMuted,
                  fontWeight: '600', cursor: 'pointer', fontSize: '13px',
                  boxShadow: mode === m ? '0 4px 14px rgba(79,70,229,0.35)' : 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
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

              {/* Password with toggle */}
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...inputStyle, paddingRight: '44px' }}
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
                      cursor: 'pointer', fontSize: '18px',
                      lineHeight: 1, padding: 0,
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
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

                  {/* Profile Photo - Camera + Gallery */}
                  <div>
                    <label style={labelStyle}>Profile Photo</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label htmlFor="profilePhoto" style={{
                        flex: 1, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px',
                        padding: '12px', borderRadius: '12px',
                        border: `1.5px dashed ${t.inputBorder}`,
                        background: t.inputBg, cursor: 'pointer',
                      }}>
                        <span style={{ fontSize: '22px' }}>🖼️</span>
                        <span style={{ color: t.textMuted, fontSize: '13px' }}>Gallery</span>
                      </label>
                      <label htmlFor="profilePhotoCamera" style={{
                        flex: 1, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px',
                        padding: '12px', borderRadius: '12px',
                        border: `1.5px dashed ${t.inputBorder}`,
                        background: t.inputBg, cursor: 'pointer',
                      }}>
                        <span style={{ fontSize: '22px' }}>📷</span>
                        <span style={{ color: t.textMuted, fontSize: '13px' }}>Camera</span>
                      </label>
                    </div>
                    {profilePhoto ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', padding: '14px 16px', background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))', borderRadius: '14px', border: `2px solid ${t.success}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '24px' }}>✅</span>
                          <span style={{ fontSize: '13px', color: t.text, fontWeight: '600' }}>{profilePhoto.name}</span>
                        </div>
                        <button type="button" onClick={() => setProfilePhoto(null)} style={{ background: '#EF4444', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#FFFFFF', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', minWidth: '70px' }}>✕ Remove</button>
                      </div>
                    ) : (
                      <div style={{ marginTop: '10px', padding: '14px', textAlign: 'center', color: t.textMuted, fontSize: '13px' }}>No photo selected</div>
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
                    {aadhaar ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', padding: '14px 16px', background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))', borderRadius: '14px', border: `2px solid ${t.success}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '24px' }}>✅</span>
                          <span style={{ fontSize: '13px', color: t.text, fontWeight: '600' }}>{aadhaar.name}</span>
                        </div>
                        <button type="button" onClick={() => setAadhaar(null)} style={{ background: '#EF4444', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#FFFFFF', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', minWidth: '70px' }}>✕ Remove</button>
                      </div>
                    ) : (
                      <div style={{ marginTop: '10px', padding: '14px', textAlign: 'center', color: t.textMuted, fontSize: '13px' }}>No document selected</div>
                    )}
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
                  padding: '16px',
                  borderRadius: '12px', border: 'none',
                  background: loading ? t.surfaceAlt : t.primaryGrad,
                  color: loading ? t.textMuted : '#fff',
                  fontWeight: '600', fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '8px',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(79,70,229,0.35)',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'login' ? 'Sign In to Dashboard' : 'Create My Account'}
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
    </div>
  )
}