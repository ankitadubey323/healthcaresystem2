import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

export default function BMICalculator({ onBMICalculated }) {
  const { t } = useTheme()
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [result, setResult] = useState(null)

  const calculate = () => {
    if (!weight || !height) return
    const h = Number(height) / 100
    const bmi = parseFloat((Number(weight) / (h * h)).toFixed(2))
    let category, color
    if (bmi < 18.5)      { category = 'Underweight'; color = t.info }
    else if (bmi < 24.9) { category = 'Normal ✅';   color = t.success }
    else if (bmi < 29.9) { category = 'Overweight';  color = t.warning }
    else                 { category = 'Obese';        color = t.error }

    setResult({ bmi, category, color })
    if (onBMICalculated) onBMICalculated(bmi, weight, height)
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    borderRadius: '12px',
    border: `1.5px solid ${t.inputBorder}`,
    background: t.inputBg,
    color: t.inputText,
    fontSize: '14px', outline: 'none',
    fontFamily: 'inherit',
  }

  return (
    <div style={{
      background: t.surfaceAlt,
      border: `1px solid ${t.border}`,
      borderRadius: '18px',
      padding: '20px',
    }}>
      <p style={{ color: t.primary, fontWeight: '700', marginBottom: '14px', fontSize: '14px' }}>
        🧮 BMI Calculator
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div>
          <label style={{ color: t.textMuted, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
            Weight (kg)
          </label>
          <input style={inputStyle} type="number" placeholder="70"
            value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        <div>
          <label style={{ color: t.textMuted, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
            Height (cm)
          </label>
          <input style={inputStyle} type="number" placeholder="170"
            value={height} onChange={e => setHeight(e.target.value)} />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={calculate}
        style={{
          width: '100%', padding: '11px',
          borderRadius: '12px', border: 'none',
          background: t.primaryGrad,
          color: '#fff', fontWeight: '700',
          cursor: 'pointer', fontSize: '13px',
          fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(102,126,234,0.35)',
        }}
      >
        Calculate BMI
      </motion.button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            marginTop: '12px', padding: '14px',
            borderRadius: '12px',
            background: t.surface,
            textAlign: 'center',
            border: `2px solid ${result.color}44`,
          }}
        >
          <p style={{ fontSize: '30px', fontWeight: '900', color: result.color }}>{result.bmi}</p>
          <p style={{ color: result.color, fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>{result.category}</p>
        </motion.div>
      )}
    </div>
  )
}
