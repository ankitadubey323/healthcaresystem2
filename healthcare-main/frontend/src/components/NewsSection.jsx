// import { useEffect, useRef, useState } from 'react'
// import { useTheme } from '../context/ThemeContext'

// const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines?category=health&language=en&pageSize=12'
// const REFRESH_INTERVAL = 1000 * 60 * 5
// const SCROLL_SPEED = 0.12

// const FALLBACK_TIPS = [
//   {
//     id: 'tip-1',
//     title: 'Drink enough water',
//     description: 'Stay hydrated throughout the day to support energy, digestion, and skin health.',
//     imageUrl: 'https://images.unsplash.com/photo-1510626176961-4b3a7fafb7b6?auto=format&fit=crop&w=900&q=80',
//     source: 'Healthline',
//     url: 'https://www.healthline.com/nutrition/how-much-water-should-you-drink-per-day',
//   },
//   {
//     id: 'tip-2',
//     title: 'Move your body daily',
//     description: 'A short walk or stretch can boost circulation, focus, and mood.',
//     imageUrl: 'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=900&q=80',
//     source: 'Mayo Clinic',
//     url: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/exercise/art-20048389',
//   },
//   {
//     id: 'tip-3',
//     title: 'Eat colorful fruits',
//     description: 'Choose vibrant fruits for vitamins, fiber, and antioxidant support.',
//     imageUrl: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=900&q=80',
//     source: 'WebMD',
//     url: 'https://www.webmd.com/diet/ss/slideshow-healthy-fruits',
//   },
//   {
//     id: 'tip-4',
//     title: 'Sleep consistently',
//     description: 'A steady sleep schedule helps your body recover and keeps your mind sharp.',
//     imageUrl: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=900&q=80',
//     source: 'Sleep Foundation',
//     url: 'https://www.sleepfoundation.org/healthy-sleep/healthy-sleep-habits',
//   },
//   {
//     id: 'tip-5',
//     title: 'Practice mindful breathing',
//     description: 'Take a few deep breaths to reduce stress and calm your nervous system.',
//     imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80',
//     source: 'Verywell Mind',
//     url: 'https://www.verywellmind.com/how-to-practice-deep-breathing-2795485',
//   },
//   {
//     id: 'tip-6',
//     title: 'Limit added sugar',
//     description: 'Choose whole foods over sugary snacks to maintain steady energy.',
//     imageUrl: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=900&q=80',
//     source: 'CDC',
//     url: 'https://www.cdc.gov/nutrition/data-statistics/know-your-limit-for-added-sugars.html',
//   },
//   {
//     id: 'tip-7',
//     title: 'Take a break from screens',
//     description: 'Rest your eyes and mind with regular screen breaks during work.',
//     imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de1c03b?auto=format&fit=crop&w=900&q=80',
//     source: 'Harvard Health',
//     url: 'https://www.health.harvard.edu/staying-healthy/are-computer-glasses-worth-it',
//   },
//   {
//     id: 'tip-8',
//     title: 'Fill your plate with veggies',
//     description: 'Vegetables provide fiber, vitamins, and minerals for better digestion.',
//     imageUrl: 'https://images.unsplash.com/photo-1514516870920-a199b2ccc1b1?auto=format&fit=crop&w=900&q=80',
//     source: 'WHO',
//     url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
//   },
//   {
//     id: 'tip-9',
//     title: 'Keep moving between tasks',
//     description: 'Light activity between work sessions supports circulation and focus.',
//     imageUrl: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=900&q=80',
//     source: 'NIH',
//     url: 'https://www.nih.gov/news-events/nih-research-matters/physical-activity-may-help-reduce-risk-certain-cancers',
//   },
//   {
//     id: 'tip-10',
//     title: 'Keep a gratitude habit',
//     description: 'Noting positive moments can improve mood and emotional resilience.',
//     imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
//     source: 'Psychology Today',
//     url: 'https://www.psychologytoday.com/us/blog/what-mentally-strong-people-dont-do/201603/the-benefits-gratitude',
//   },
// ]

// function buildTipItems(items) {
//   return items.map((item, index) => ({
//     id: item.id || `${item.title}-${index}`,
//     title: item.title || 'Healthy tip',
//     description: item.description || item.content || 'A helpful health tip for your day.',
//     imageUrl: item.imageUrl || item.urlToImage || 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=900&q=80',
//     source: item.source?.name || item.source || 'Health source',
//     url: item.url,
//   }))
// }

// export default function NewsSection() {
//   const { t, themeName } = useTheme()
//   const scrollRef = useRef(null)
//   const pausedRef = useRef(false)
//   const [tips, setTips] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [usingFallback, setUsingFallback] = useState(false)
//   const isLight = themeName === 'light'

//   const sectionBg = isLight
//     ? 'linear-gradient(180deg, rgba(248,250,255,0.95) 0%, rgba(232,240,255,0.9) 100%)'
//     : 'linear-gradient(180deg, rgba(17,24,39,0.95) 0%, rgba(15,23,42,0.96) 100%)'

//   const sectionBorder = isLight
//     ? '1px solid rgba(102,126,234,0.14)'
//     : '1px solid rgba(148,163,184,0.12)'

//   const titleColor = isLight ? '#111827' : '#e2e8f0'

//   const loadTips = async () => {
//     setError('')
//     setLoading(true)
//     try {
//       const apiKey = import.meta.env.VITE_NEWS_API_KEY
//       if (!apiKey) throw new Error('NewsAPI key not configured')

//       const response = await fetch(NEWS_API_URL, {
//         headers: { Authorization: `Bearer ${apiKey}` },
//       })

//       if (!response.ok) {
//         const errorBody = await response.json().catch(() => null)
//         throw new Error(errorBody?.message || 'Failed to fetch health tips')
//       }

//       const data = await response.json()
//       if (!Array.isArray(data.articles) || data.articles.length === 0) {
//         throw new Error('No health tips returned from NewsAPI')
//       }

//       setTips(buildTipItems(data.articles))
//       setUsingFallback(false)
//     } catch (err) {
//       setError(err.message || 'Unable to load live health tips')
//       setTips(buildTipItems(FALLBACK_TIPS))
//       setUsingFallback(true)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadTips()
//     const interval = setInterval(loadTips, REFRESH_INTERVAL)
//     return () => clearInterval(interval)
//   }, [])

//   useEffect(() => {
//     const el = scrollRef.current
//     if (!el || tips.length === 0) return

//     let animId = null
//     let pos = 0

//     const step = () => {
//       if (!el) return
//       if (!pausedRef.current) {
//         pos += SCROLL_SPEED
//         if (pos >= el.scrollWidth / 2) pos = 0
//         el.scrollLeft = pos
//       }
//       animId = requestAnimationFrame(step)
//     }

//     animId = requestAnimationFrame(step)
//     return () => cancelAnimationFrame(animId)
//   }, [tips])

//   const openTip = (tip) => {
//     if (tip.url) {
//       window.open(tip.url, '_blank', 'noopener,noreferrer')
//     }
//   }

//   const displayItems = tips.length > 0 ? [...tips, ...tips] : []

//   return (
//     <div style={{
//       background: sectionBg,
//       borderRadius: '40px',
//       border: sectionBorder,
//       padding: '24px',
//       margin: '0 0 18px',
//       boxShadow: isLight
//         ? '0 40px 110px rgba(102,126,234,0.12), 0 18px 48px rgba(102,126,234,0.08)'
//         : '0 40px 110px rgba(20, 28, 48, 0.32), 0 20px 60px rgba(15, 23, 42, 0.24)',
//       backdropFilter: 'blur(18px)',
//     }}>
//       <div style={{ padding: '0 14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
//         <div>
//           <h2 style={{ fontSize: '20px', fontWeight: '900', color: titleColor, letterSpacing: '-0.04em', marginBottom: '6px' }}>
//             Healthy Tips & Tricks
//           </h2>
//           <p style={{ margin: 0, fontSize: '13px', color: t.textMuted, maxWidth: '620px' }}>
//             Realtime health advice from NewsAPI{usingFallback ? ' · showing fallback tips' : ' · updates every 5 mins'}
//           </p>
//         </div>
//         <span style={{ fontSize: '12px', color: t.textMuted, fontWeight: '700' }}>Pause on hover</span>
//       </div>

//       <div style={{ position: 'relative', overflow: 'hidden', padding: '0 14px 8px', perspective: '1200px' }}>
//         {loading && (
//           <div style={{ display: 'flex', gap: '14px', padding: '14px 0' }}>
//             {Array.from({ length: 4 }).map((_, index) => (
//               <div key={index} style={{ minWidth: '240px', minHeight: '260px', borderRadius: '24px', background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadow }} />
//             ))}
//           </div>
//         )}

//         {!loading && error && (
//           <div style={{ color: t.textSub, padding: '12px 20px 10px', fontSize: '12px' }}>{error}</div>
//         )}

//         <div
//           ref={scrollRef}
//           style={{ display: 'flex', gap: '18px', overflowX: 'hidden', whiteSpace: 'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '6px' }}
//           onMouseEnter={() => { pausedRef.current = true }}
//           onMouseLeave={() => { pausedRef.current = false }}
//         >
//           {displayItems.map((tip, index) => (
//             <div
//               key={`${tip.id}-${index}`}
//               onClick={() => openTip(tip)}
//               style={{
//                 minWidth: '280px', maxWidth: '280px', background: t.surface, borderRadius: '26px', overflow: 'hidden', boxShadow: t.shadow,
//                 border: `1px solid ${t.border}`, cursor: tip.url ? 'pointer' : 'default', flexShrink: 0,
//                 transition: 'transform 0.25s ease, box-shadow 0.25s ease',
//               }}
//               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = t.shadowMd }}
//               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = t.shadow }}
//             >
//               <div style={{ height: '158px', backgroundImage: `url(${tip.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
//               <div style={{ padding: '16px 16px 18px' }}>
//                 <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '10px', padding: '6px 10px', borderRadius: '18px', background: t.surfaceAlt, color: t.textMuted, fontSize: '11px', fontWeight: '700' }}>
//                   {tip.source}
//                 </span>
//                 <h3 style={{ fontSize: '16px', fontWeight: '800', color: t.text, lineHeight: '1.35', marginBottom: '10px' }}>{tip.title}</h3>
//                 <p style={{ fontSize: '13px', color: t.textSub, lineHeight: '1.6', minHeight: '72px' }}>{tip.description}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }


import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { getHealthNews } from '../utils/api'

const REFRESH_INTERVAL = 1000 * 60 * 5
const SCROLL_SPEED = 0.5

const HEALTHY_TIPS = [
  {
    id: 'tip-1',
    title: 'Drink 8 glasses of water daily',
    description: 'Staying hydrated helps your kidneys flush toxins, keeps skin glowing, and boosts energy levels throughout the day.',
    imageUrl: 'https://images.unsplash.com/photo-1510626176961-4b3a7fafb7b6?auto=format&fit=crop&w=900&q=80',
    source: 'Wikipedia · Drinking water',
    url: 'https://en.wikipedia.org/wiki/Drinking_water',
  },
  {
    id: 'tip-2',
    title: 'Walk 10,000 steps a day',
    description: 'Regular walking reduces risk of heart disease, strengthens bones, and improves mental health according to WHO guidelines.',
    imageUrl: 'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=900&q=80',
    source: 'Wikipedia · Walking',
    url: 'https://en.wikipedia.org/wiki/Walking',
  },
  {
    id: 'tip-3',
    title: 'Eat a rainbow of vegetables',
    description: 'Different colored vegetables provide different vitamins and antioxidants. Aim for at least 5 portions per day.',
    imageUrl: 'https://images.unsplash.com/photo-1514516870920-a199b2ccc1b1?auto=format&fit=crop&w=900&q=80',
    source: 'Wikipedia · Vegetable',
    url: 'https://en.wikipedia.org/wiki/Vegetable',
  },
  {
    id: 'tip-4',
    title: 'Sleep 7–9 hours every night',
    description: 'Quality sleep restores the brain, repairs tissues, and regulates hormones. Poor sleep is linked to obesity and depression.',
    imageUrl: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=900&q=80',
    source: 'Wikipedia · Sleep',
    url: 'https://en.wikipedia.org/wiki/Sleep',
  },
  {
    id: 'tip-5',
    title: 'Practice deep breathing',
    description: 'Diaphragmatic breathing activates the parasympathetic system, lowering cortisol and reducing anxiety within minutes.',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80',
    source: 'Wikipedia · Diaphragmatic breathing',
    url: 'https://en.wikipedia.org/wiki/Diaphragmatic_breathing',
  },
  {
    id: 'tip-6',
    title: 'Limit processed sugar',
    description: 'Excess added sugar raises triglycerides, feeds harmful bacteria, and spikes insulin. Switch to whole fruits instead.',
    imageUrl: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=900&q=80',
    source: 'Wikipedia · Sugar',
    url: 'https://en.wikipedia.org/wiki/Sugar',
  },
  {
    id: 'tip-7',
    title: '20-20-20 rule for eyes',
    description: 'Every 20 minutes look at something 20 feet away for 20 seconds to reduce digital eye strain and headaches.',
    imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de1c03b?auto=format&fit=crop&w=900&q=80',
    source: 'Wikipedia · Eye strain',
    url: 'https://en.wikipedia.org/wiki/Eye_strain',
  },
  {
    id: 'tip-8',
    title: 'Meditate for 10 minutes',
    description: 'Even brief mindfulness meditation shrinks the amygdala, improves focus, and builds emotional resilience over time.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    source: 'Wikipedia · Meditation',
    url: 'https://en.wikipedia.org/wiki/Meditation',
  },
  {
    id: 'tip-9',
    title: 'Wash hands frequently',
    description: 'Handwashing with soap for 20 seconds is the single most effective way to prevent the spread of infectious diseases.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
    source: 'Wikipedia · Hand washing',
    url: 'https://en.wikipedia.org/wiki/Hand_washing',
  },
  {
    id: 'tip-10',
    title: 'Eat more fibre',
    description: 'Dietary fibre feeds good gut bacteria, lowers cholesterol, and reduces the risk of colorectal cancer and type 2 diabetes.',
    imageUrl: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=900&q=80',
    source: 'Wikipedia · Dietary fibre',
    url: 'https://en.wikipedia.org/wiki/Dietary_fiber',
  },
]

function NewsCard({ item, t, isLight, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        minWidth: '280px', maxWidth: '280px',
        background: isLight
          ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,249,255,0.98))'
          : 'linear-gradient(180deg, rgba(16,24,40,0.98), rgba(22,35,57,0.98))',
        borderRadius: '32px',
        overflow: 'hidden',
        boxShadow: isLight
          ? '0 28px 80px rgba(59,130,246,0.16)'
          : '0 28px 80px rgba(15,23,42,0.65)',
        border: isLight ? '1px solid rgba(255,255,255,0.55)' : '1px solid rgba(148,163,184,0.18)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        position: 'relative',
        transformStyle: 'preserve-3d',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px) rotateY(1deg)'
        e.currentTarget.style.boxShadow = isLight
          ? '0 32px 90px rgba(59,130,246,0.24)'
          : '0 32px 90px rgba(15,23,42,0.75)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) rotateY(0deg)'
        e.currentTarget.style.boxShadow = isLight
          ? '0 28px 80px rgba(59,130,246,0.16)'
          : '0 28px 80px rgba(15,23,42,0.65)'
      }}
    >
      <div style={{
        position: 'relative',
        height: '170px',
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.02)), url(${item.imageUrl || item.urlToImage || 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=900&q=80'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at top left, rgba(255,255,255,0.26), transparent 40%)',
          mixBlendMode: 'screen',
        }} />
      </div>
      <div style={{ padding: '20px 18px 22px' }}>
        <span style={{
          display: 'inline-block', marginBottom: '12px',
          padding: '7px 12px', borderRadius: '999px',
          background: isLight ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.18)',
          color: t.primary,
          fontSize: '11px', fontWeight: '800',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {item.source?.name || item.source || 'Health'}
        </span>
        <h3 style={{
          fontSize: '17px', fontWeight: '900',
          color: t.text, lineHeight: '1.3', marginBottom: '10px',
        }}>
          {item.title}
        </h3>
        <p style={{
          fontSize: '13px', color: t.textSub,
          lineHeight: '1.8', minHeight: '72px', margin: 0,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {item.description || item.content || ''}
        </p>
        <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.primary }} />
          <span style={{ fontSize: '12px', fontWeight: '700', color: t.textMuted }}>Swipe for more</span>
        </div>
      </div>
    </div>
  )
}

function ScrollRow({ items, t, speed = SCROLL_SPEED }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || items.length === 0) return
    let animId, pos = 0

    const step = () => {
      pos += speed
      if (pos >= el.scrollWidth / 2) pos = 0
      el.scrollLeft = pos
      animId = requestAnimationFrame(step)
    }
    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [items, speed])

  const doubled = [...items, ...items]

  const handleNewsClick = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    
    const newsUrl = item.url || item.urlToImage
    if (newsUrl && newsUrl.startsWith('http')) {
      window.open(newsUrl, '_blank')
    } else {
      window.location.href = `/dashboard/news/${encodeURIComponent(item.title || 'news')}`
    }
  }

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex', gap: '18px',
        overflowX: 'hidden', whiteSpace: 'nowrap',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
        paddingBottom: '6px',
      }}
    >
      {doubled.map((item, i) => (
        <NewsCard
          key={`${item.id || item.title}-${i}`}
          item={item}
          t={t}
          isLight={t.mode === 'light'}
          onClick={(e) => handleNewsClick(e, item)}
        />
      ))}
    </div>
  )
}

export default function NewsSection() {
  const { t, themeName } = useTheme()
  const [newsItems, setNewsItems] = useState([])
  const [loading, setLoading] = useState(true)
  const isLight = themeName === 'light'

  const titleColor = isLight ? '#111827' : '#e2e8f0'

  const loadNews = async () => {
    setLoading(true)
    try {
      const res = await getHealthNews()
      const articles = res.data?.articles || []
      if (articles.length === 0) throw new Error('empty')
      setNewsItems(articles.map((a, i) => ({ ...a, id: `news-${i}` })))
    } catch {
      setNewsItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNews()
    const interval = setInterval(loadNews, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const sectionStyle = {
    background: isLight
      ? 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(235,244,255,0.92))'
      : 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(22,33,56,0.94))',
    borderRadius: '40px',
    border: isLight ? '1px solid rgba(59,130,246,0.12)' : '1px solid rgba(148,163,184,0.16)',
    padding: '28px 24px 22px',
    marginBottom: '18px',
    boxShadow: isLight
      ? '0 32px 90px rgba(148,163,184,0.14)'
      : '0 32px 90px rgba(15,23,42,0.45)',
    backdropFilter: 'blur(18px)',
    position: 'relative',
    overflow: 'hidden',
  }

  const SectionHeader = ({ title, sub, action }) => (
    <div style={{ padding: sub ? '0 14px 14px' : '0 14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '900', color: titleColor, marginBottom: sub ? '4px' : 0 }}>{title}</h2>
        {sub && <p style={{ fontSize: '12px', color: t.textMuted, margin: 0 }}>{sub}</p>}
      </div>
      {action}
    </div>
  )

  return (
    <div style={sectionStyle}>

      {/* ── SECTION 1: Live Health News ── */}
      <SectionHeader
        title="📰 Health News"
        action={(
          <Link to="/dashboard/news" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                padding: '10px 18px',
                borderRadius: '16px',
                border: `1px solid ${t.border}`,
                background: t.surface,
                color: t.text,
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              See More
            </button>
          </Link>
        )}
      />

      <div style={{ padding: '0 14px 20px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', gap: '14px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                minWidth: '280px', height: '280px', borderRadius: '24px',
                background: t.surface, border: `1px solid ${t.border}`,
              }} />
            ))}
          </div>
        ) : newsItems.length > 0 ? (
          <ScrollRow items={newsItems} t={t} speed={0.4} />
        ) : null}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)', margin: '4px 14px 20px' }} />

      {/* ── SECTION 2: Healthy Tips ── */}
      <SectionHeader
        title="💡 Healthy Tips"
        sub="Evidence-based tips · Wikipedia & WHO sources"
      />

      <div style={{ padding: '0 14px 8px', overflow: 'hidden' }}>
        <ScrollRow items={HEALTHY_TIPS} t={t} speed={0.3} />
      </div>

    </div>
  )
}
