import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const SPECIALIZATIONS = [
  "General Physician / Family Medicine",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Gynecologist / Obstetrician",
  "Pediatrician",
  "Psychiatrist / Mental Health",
  "ENT Specialist",
  "Ophthalmologist",
  "Urologist",
  "Gastroenterologist",
  "Endocrinologist",
  "Pulmonologist",
  "Oncologist",
  "Nephrologist",
  "Rheumatologist",
  "Dentist",
  "Physiotherapist",
  "Radiologist",
  "Anesthesiologist",
  "Plastic Surgeon",
  "Vascular Surgeon",
  "Hematologist",
  "Infectious Disease Specialist",
  "Allergist / Immunologist",
  "Sports Medicine",
  "Homeopathic Doctor",
  "Ayurvedic Doctor",
  "Unani Specialist",
]

const EXPERTISE_OPTIONS = [
  "Diabetes Management", "Hypertension", "Heart Failure", "Arthritis",
  "Child Development", "Women's Health", "Mental Health Counseling",
  "Weight Loss / Obesity", "Skin Allergies", "Hair & Scalp",
  "Sports Injuries", "Spine Problems", "Fertility Treatment",
  "Cancer Screening", "Kidney Stones", "Thyroid Disorders",
  "Sleep Disorders", "Migraine", "Asthma & COPD", "Digestive Disorders",
  "Eye Care", "Dental Surgery", "Physiotherapy", "Vaccination",
  "Nutrition & Diet", "Geriatric Care", "Neonatal Care",
]

const QUALIFICATIONS = [
  "MBBS", "MD", "MS", "DM", "MCh", "BDS", "MDS",
  "BAMS", "BHMS", "BUMS", "DNB", "FRCS", "MRCP",
  "PhD", "Fellowship", "Diploma",
]

const LANGUAGES = [
  "Hindi", "English", "Punjabi", "Bengali", "Marathi",
  "Tamil", "Telugu", "Kannada", "Gujarati", "Urdu",
  "Malayalam", "Odia",
]

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const STEPS = ["Account", "Personal", "Professional", "Availability", "Documents"]

export default function DoctorRegister() {
  const navigate = useNavigate()
  const { t, themeName, toggleTheme } = useTheme()
  const isLight = themeName === 'light'

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // ── Form State ────────────────────────────────────────────────
  const [form, setForm] = useState({
    // Step 0 - Account
    email: '', password: '',
    // Step 1 - Personal
    name: '', phone: '', gender: '', dateOfBirth: '', city: '', bio: '',
    // Step 2 - Professional
    specialization: '', registrationNumber: '',
    experience: '', consultationFees: '',
    clinicName: '', clinicAddress: '', clinicPhone: '',
    // Step 3 - Availability
    maxAppointmentsPerDay: '10',
    timeSlotStart: '09:00', timeSlotEnd: '17:00',
  })

  // Multi-select states
  const [expertise, setExpertise] = useState([])
  const [qualifications, setQualifications] = useState([])
  const [languages, setLanguages] = useState(['Hindi', 'English'])
  const [availableDays, setAvailableDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])

  // Files
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null)
  const [degreeCert, setDegreeCert] = useState(null)
  const [regCert, setRegCert] = useState(null)
  const [identityProof, setIdentityProof] = useState(null)
  const [additionalCerts, setAdditionalCerts] = useState([])

  // ── Styles ────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: `1px solid ${t.border}`,
    background: t.surface,
    color: t.text,
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: t.textMuted,
    marginBottom: '5px',
    display: 'block',
    letterSpacing: '0.2px',
  }

  const sectionTitle = {
    fontSize: '13px',
    fontWeight: '700',
    color: t.text,
    marginBottom: '12px',
    marginTop: '4px',
  }

  // ── Helpers ───────────────────────────────────────────────────
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const toggleItem = (list, setList, item) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  const handleProfilePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setProfilePhoto(file)
    setProfilePhotoPreview(URL.createObjectURL(file))
  }

  const chipStyle = (active) => ({
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    border: `1px solid ${active ? t.primary : t.border}`,
    background: active ? t.primary : t.surfaceAlt,
    color: active ? '#fff' : t.textMuted,
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  })

  const fileUploadStyle = (hasFile) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    border: `1px dashed ${hasFile ? t.primary : t.border}`,
    background: hasFile ? `${t.primary}10` : t.surfaceAlt,
    cursor: 'pointer',
    fontSize: '12px',
    color: hasFile ? t.primary : t.textMuted,
    fontWeight: hasFile ? '600' : '400',
  })

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()

      // Text fields
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })

      // Arrays — Send as JSON string
      fd.append('expertise', JSON.stringify(expertise))
      fd.append('qualifications', JSON.stringify(qualifications))
      fd.append('languages', JSON.stringify(languages))
      fd.append('availableDays', JSON.stringify(availableDays))
      fd.append('timeSlots', JSON.stringify([`${form.timeSlotStart}-${form.timeSlotEnd}`]))

      // Files
      if (profilePhoto) fd.append('profilePhoto', profilePhoto)
      if (degreeCert) fd.append('degreeCertificate', degreeCert)
      if (regCert) fd.append('registrationCertificate', regCert)
      if (identityProof) fd.append('identityProof', identityProof)
      additionalCerts.forEach(f => fd.append('additionalCertificates', f))

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/doctor/register`, {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')

      // Token save karo
      localStorage.setItem('doctorToken', data.token)
      localStorage.setItem('doctorInfo', JSON.stringify(data.doctor))

      navigate('/doctor/dashboard')
    } catch (err) {
      setError(err.message || 'Registration error occurred')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    setError('')
    // Basic validation per step
    if (step === 0 && (!form.email || !form.password)) {
      setError('Email and password are required')
      return
    }
    if (step === 1 && (!form.name || !form.phone || !form.gender)) {
      setError('Name, phone and gender are required')
      return
    }
    if (step === 2 && (!form.specialization || !form.registrationNumber || qualifications.length === 0)) {
      setError('Specialization, registration number and qualifications are required')
      return
    }
    if (step === STEPS.length - 1) {
      handleSubmit()
      return
    }
    setStep(s => s + 1)
  }

  // ── Step Content ──────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {

      // ── Step 0: Account ──────────────────────────────────────
      case 0:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ ...sectionTitle }}>Registration</p>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input style={inputStyle} name="email" type="email"
                placeholder="doctor@example.com" value={form.email} onChange={handleChange} />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '11px', fontWeight: '600', color: t.textMuted,
                  }}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        )

      // ── Step 1: Personal ─────────────────────────────────────
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={sectionTitle}>Personal information</p>

            {/* Profile Photo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: t.surfaceAlt, border: `2px solid ${t.border}`,
                overflow: 'hidden', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {profilePhotoPreview
                  ? <img src={profilePhotoPreview} alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '28px' }}>👨‍⚕️</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Profile Photo</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label htmlFor="profilePhoto" style={{
                    flex: 1, textAlign: 'center', padding: '8px',
                    borderRadius: '8px', border: `1px solid ${t.border}`,
                    background: t.surfaceAlt, cursor: 'pointer',
                    fontSize: '11px', fontWeight: '600', color: t.primary,
                  }}>Gallery</label>
                  <label htmlFor="profilePhotoCamera" style={{
                    flex: 1, textAlign: 'center', padding: '8px',
                    borderRadius: '8px', border: `1px solid ${t.border}`,
                    background: t.surfaceAlt, cursor: 'pointer',
                    fontSize: '11px', fontWeight: '600', color: t.primary,
                  }}>Camera</label>
                </div>
                <input id="profilePhoto" type="file" accept="image/*"
                  onChange={handleProfilePhoto} style={{ display: 'none' }} />
                <input id="profilePhotoCamera" type="file" accept="image/*"
                  capture="environment" onChange={handleProfilePhoto} style={{ display: 'none' }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} name="name" placeholder="Dr. Rahul Sharma"
                value={form.name} onChange={handleChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} name="phone" placeholder="+91 9876543210"
                  value={form.phone} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select style={{ ...inputStyle }} name="gender"
                  value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input style={inputStyle} name="dateOfBirth" type="date"
                  value={form.dateOfBirth} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input style={inputStyle} name="city" placeholder="Delhi"
                  value={form.city} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Bio (Optional)</label>
              <textarea style={{ ...inputStyle, resize: 'none', height: '80px' }}
                name="bio" placeholder="Tell us about yourself..."
                value={form.bio} onChange={handleChange} />
            </div>
          </div>
        )

      // ── Step 2: Professional ──────────────────────────────────
      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={sectionTitle}>Professional details</p>

            <div>
              <label style={labelStyle}>Specialization</label>
              <select style={inputStyle} name="specialization"
                value={form.specialization} onChange={handleChange}>
                <option value="">Select specialization</option>
                {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Experience (Years)</label>
                <input style={inputStyle} name="experience" type="number"
                  placeholder="5" value={form.experience} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>Fees (₹)</label>
                <input style={inputStyle} name="consultationFees" type="number"
                  placeholder="500" value={form.consultationFees} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Medical Registration Number</label>
              <input style={inputStyle} name="registrationNumber"
                placeholder="MCI-12345 / State Council Number"
                value={form.registrationNumber} onChange={handleChange} />
            </div>

            {/* Qualifications */}
            <div>
              <label style={labelStyle}>Qualifications (select all that apply)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {QUALIFICATIONS.map(q => (
                  <span key={q} onClick={() => toggleItem(qualifications, setQualifications, q)}
                    style={chipStyle(qualifications.includes(q))}>
                    {q}
                  </span>
                ))}
              </div>
            </div>

            {/* Expertise */}
            <div>
              <label style={labelStyle}>Areas of Expertise (optional)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {EXPERTISE_OPTIONS.map(e => (
                  <span key={e} onClick={() => toggleItem(expertise, setExpertise, e)}
                    style={chipStyle(expertise.includes(e))}>
                    {e}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <label style={labelStyle}>Languages Spoken</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {LANGUAGES.map(l => (
                  <span key={l} onClick={() => toggleItem(languages, setLanguages, l)}
                    style={chipStyle(languages.includes(l))}>
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Clinic Info */}
            <p style={{ ...sectionTitle, marginTop: '8px' }}>Clinic / Hospital (optional)</p>
            <div>
              <label style={labelStyle}>Clinic Name</label>
              <input style={inputStyle} name="clinicName" placeholder="City Health Clinic"
                value={form.clinicName} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle}>Clinic Address</label>
              <input style={inputStyle} name="clinicAddress"
                placeholder="123, Main Street, Delhi"
                value={form.clinicAddress} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle}>Clinic Phone</label>
              <input style={inputStyle} name="clinicPhone" placeholder="011-23456789"
                value={form.clinicPhone} onChange={handleChange} />
            </div>
          </div>
        )

      // ── Step 3: Availability ──────────────────────────────────
      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={sectionTitle}>Availability settings</p>

            {/* Available Days */}
            <div>
              <label style={labelStyle}>Available Days</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {DAYS.map(d => (
                  <span key={d} onClick={() => toggleItem(availableDays, setAvailableDays, d)}
                    style={chipStyle(availableDays.includes(d))}>
                    {d.slice(0, 3)}
                  </span>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label style={labelStyle}>Consultation Hours</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: '10px' }}>Start Time</label>
                  <input style={inputStyle} name="timeSlotStart" type="time"
                    value={form.timeSlotStart} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '10px' }}>End Time</label>
                  <input style={inputStyle} name="timeSlotEnd" type="time"
                    value={form.timeSlotEnd} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Max appointments */}
            <div>
              <label style={labelStyle}>
                Max Appointments Per Day:
                <span style={{ color: t.primary, fontWeight: '700', marginLeft: '6px' }}>
                  {form.maxAppointmentsPerDay}
                </span>
              </label>
              <input type="range" min="1" max="50" name="maxAppointmentsPerDay"
                value={form.maxAppointmentsPerDay} onChange={handleChange}
                style={{ width: '100%', accentColor: t.primary }} />
              <div style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: '10px', color: t.textMuted, marginTop: '2px' }}>
                <span>1</span><span>50</span>
              </div>
            </div>

            {/* Summary card */}
            <div style={{
              padding: '14px', borderRadius: '10px',
              background: `${t.primary}10`,
              border: `1px solid ${t.primary}30`,
            }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: t.primary, marginBottom: '8px' }}>
                Availability Summary
              </p>
              <p style={{ fontSize: '11px', color: t.text, lineHeight: 1.7 }}>
                Days: {availableDays.map(d => d.slice(0,3)).join(', ') || 'None selected'}<br/>
                Hours: {form.timeSlotStart} – {form.timeSlotEnd}<br/>
                Max patients/day: {form.maxAppointmentsPerDay}
              </p>
            </div>
          </div>
        )

      // ── Step 4: Documents ─────────────────────────────────────
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={sectionTitle}>Upload documents</p>
            <p style={{ fontSize: '11px', color: t.textMuted, marginTop: '-8px' }}>
              Both PDF and images are accepted (max 5MB each)
            </p>

            {[
              { label: 'Medical Degree Certificate *', key: 'degree', state: degreeCert, setter: setDegreeCert },
              { label: 'Medical Council Registration *', key: 'reg', state: regCert, setter: setRegCert },
              { label: 'Identity Proof (Aadhaar/PAN) *', key: 'id', state: identityProof, setter: setIdentityProof },
            ].map(({ label, key, state, setter }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <label htmlFor={`doc_${key}`} style={fileUploadStyle(!!state)}>
                  <span style={{ fontSize: '16px' }}>{state ? '✓' : '+'}</span>
                  <span>{state ? state.name : 'Upload file'}</span>
                </label>
                <input id={`doc_${key}`} type="file" accept="image/*,.pdf"
                  onChange={e => setter(e.target.files[0])}
                  style={{ display: 'none' }} />
              </div>
            ))}

            {/* Additional certificates */}
            <div>
              <label style={labelStyle}>Additional Certificates (Optional)</label>
              <label htmlFor="addCerts" style={fileUploadStyle(additionalCerts.length > 0)}>
                <span style={{ fontSize: '16px' }}>+</span>
                <span>
                  {additionalCerts.length > 0
                    ? `${additionalCerts.length} file(s) selected`
                    : 'Upload multiple files'}
                </span>
              </label>
              <input id="addCerts" type="file" accept="image/*,.pdf" multiple
                onChange={e => setAdditionalCerts(Array.from(e.target.files))}
                style={{ display: 'none' }} />
            </div>

            {/* Final summary */}
            <div style={{
              padding: '14px', borderRadius: '10px',
              background: `${t.primary}10`,
              border: `1px solid ${t.primary}30`,
            }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: t.primary, marginBottom: '8px' }}>
                Registration Summary
              </p>
              <p style={{ fontSize: '11px', color: t.text, lineHeight: 1.8 }}>
                Name: {form.name || '—'}<br/>
                Specialization: {form.specialization || '—'}<br/>
                Experience: {form.experience || '—'} years<br/>
                Fees: ₹{form.consultationFees || '—'}<br/>
                City: {form.city || '—'}
              </p>
            </div>
          </div>
        )

      default: return null
    }
  }

  // ── Main Render ───────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: t.pageBg,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px 16px',
    }}>
      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{
        position: 'fixed', top: '16px', right: '16px', zIndex: 100,
        width: '36px', height: '36px', borderRadius: '50%',
        background: t.surface, border: `1px solid ${t.border}`,
        boxShadow: t.shadow, cursor: 'pointer',
        fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: t.text,
      }}>
        {isLight ? '☀' : '☾'}
      </button>

      <div style={{ width: '100%', maxWidth: '520px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            background: t.surface,
            borderRadius: '16px',
            padding: '28px 24px',
            boxShadow: t.shadow,
            border: `1px solid ${t.border}`,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
              DR+
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: t.text, marginBottom: '4px' }}>
              Doctor Registration
            </h2>
            <p style={{ color: t.textMuted, fontSize: '12px' }}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{
            height: '4px', borderRadius: '4px',
            background: t.surfaceAlt,
            marginBottom: '24px', overflow: 'hidden',
          }}>
            <motion.div
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%', background: t.primary, borderRadius: '4px' }}
            />
          </div>

          {/* Step Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{
                width: i === step ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i <= step ? t.primary : t.border,
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: t.errorBg,
              border: `1px solid ${t.errorBorder}`,
              borderRadius: '10px', padding: '10px 14px',
              color: t.error, fontSize: '12px', marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  flex: 1, padding: '12px',
                  borderRadius: '10px',
                  border: `1px solid ${t.border}`,
                  background: t.surfaceAlt,
                  color: t.text,
                  fontWeight: '600', fontSize: '13px',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Back
              </button>
            )}

            <motion.button
              onClick={nextStep}
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              style={{
                flex: 2, padding: '12px',
                borderRadius: '10px', border: 'none',
                background: loading ? t.surfaceAlt : t.primary,
                color: loading ? t.textMuted : '#fff',
                fontWeight: '600', fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
              }}
            >
              {loading
                ? 'Registering...'
                : step === STEPS.length - 1 ? 'Submit Registration' : 'Continue'}
            </motion.button>
          </div>

          {/* Login link */}
          <p style={{ textAlign: 'center', fontSize: '12px', color: t.textMuted, marginTop: '16px' }}>
            Already registered?{' '}
            <span onClick={() => navigate('/doctor/login')}
              style={{ color: t.primary, fontWeight: '600', cursor: 'pointer' }}>
              Sign In
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
