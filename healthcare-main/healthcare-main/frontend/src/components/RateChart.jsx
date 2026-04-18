import { useEffect, useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js'
import { useTheme } from '../context/ThemeContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Title)

const INDICATORS = {
  birth: 'SP.DYN.CBRT.IN',
  death: 'SP.DYN.CDRT.IN',
}

const buildUrl = (indicator) =>
  `https://api.worldbank.org/v2/country/IN/indicator/${indicator}?format=json`

const parseWorldBank = (json) => {
  if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) return []

  return json[1]
    .filter((item) => item?.value !== null && item?.date)
    .sort((a, b) => Number(b.date) - Number(a.date))
    .slice(0, 10)
    .reverse()
    .map((item) => ({ year: item.date, value: Number(item.value) }))
}

const formatSeries = (birth, death) => {
  const years = Array.from(
    new Set([...birth.map((row) => row.year), ...death.map((row) => row.year)])
  )
    .sort((a, b) => Number(a) - Number(b))

  const finalYears = years.length > 10 ? years.slice(-10) : years

  const valueByYear = (series) =>
    finalYears.map((year) => {
      const found = series.find((row) => row.year === year)
      return found ? found.value : null
    })

  return {
    labels: finalYears,
    birth: valueByYear(birth),
    death: valueByYear(death),
  }
}

export default function RateChart() {
  const { t } = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [birthSeries, setBirthSeries] = useState([])
  const [deathSeries, setDeathSeries] = useState([])

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true)
        setError('')

        const [birthRes, deathRes] = await Promise.all([
          fetch(buildUrl(INDICATORS.birth)),
          fetch(buildUrl(INDICATORS.death)),
        ])

        if (!birthRes.ok || !deathRes.ok) {
          throw new Error('Unable to load World Bank rate data')
        }

        const birthJson = await birthRes.json()
        const deathJson = await deathRes.json()

        setBirthSeries(parseWorldBank(birthJson))
        setDeathSeries(parseWorldBank(deathJson))
      } catch (err) {
        setError(err?.message || 'Failed to fetch rate data')
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
  }, [])

  const chartData = useMemo(() => {
    const { labels, birth, death } = formatSeries(birthSeries, deathSeries)

    return {
      labels,
      datasets: [
        {
          label: 'Birth Rate per 1,000',
          data: birth,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.22)',
          tension: 0.32,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          spanGaps: true,
        },
        {
          label: 'Death Rate per 1,000',
          data: death,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.16)',
          tension: 0.32,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          spanGaps: true,
        },
      ],
    }
  }, [birthSeries, deathSeries])

  const latestBirth = birthSeries[birthSeries.length - 1]
  const latestDeath = deathSeries[deathSeries.length - 1]

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: t.text,
          font: { weight: '600' },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        padding: 12,
        titleColor: t.text,
        bodyColor: t.text,
        backgroundColor: t.surface,
        borderColor: t.border,
        borderWidth: 1,
      },
      title: {
        display: true,
        text: 'India Birth Rate vs Death Rate (Last 10 years)',
        color: t.text,
        font: { size: 16, weight: '700' },
      },
    },
    scales: {
      x: {
        ticks: { color: t.text },
        grid: { color: 'rgba(148,163,184,0.18)' },
      },
      y: {
        ticks: { color: t.text },
        grid: { color: 'rgba(148,163,184,0.18)' },
      },
    },
  }

  return (
    <div style={{ minHeight: '340px', position: 'relative' }}>
      {loading && (
        <div style={{ minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted }}>
          Loading India rate data...
        </div>
      )}

      {!loading && error && (
        <div style={{ minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.error, textAlign: 'center' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div style={{ padding: '16px', background: t.surfaceAlt, borderRadius: '20px', border: `1px solid ${t.border}` }}>
              <p style={{ margin: 0, color: t.textMuted, fontSize: '12px', fontWeight: '700' }}>Latest birth rate</p>
              <p style={{ margin: '10px 0 0', fontSize: '24px', fontWeight: '800', color: t.text }}>
                {latestBirth ? `${latestBirth.value.toFixed(2)} / 1,000` : 'N/A'}
              </p>
              <p style={{ margin: '8px 0 0', color: t.textSub, fontSize: '13px' }}>
                Year {latestBirth?.year || 'N/A'}
              </p>
            </div>
            <div style={{ padding: '16px', background: t.surfaceAlt, borderRadius: '20px', border: `1px solid ${t.border}` }}>
              <p style={{ margin: 0, color: t.textMuted, fontSize: '12px', fontWeight: '700' }}>Latest death rate</p>
              <p style={{ margin: '10px 0 0', fontSize: '24px', fontWeight: '800', color: t.text }}>
                {latestDeath ? `${latestDeath.value.toFixed(2)} / 1,000` : 'N/A'}
              </p>
              <p style={{ margin: '8px 0 0', color: t.textSub, fontSize: '13px' }}>
                Year {latestDeath?.year || 'N/A'}
              </p>
            </div>
          </div>

          <div style={{ minHeight: '320px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  )
}
