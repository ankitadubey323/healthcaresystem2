// import { useEffect, useRef, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useTheme } from '../context/ThemeContext'
// import { getLatestNews } from '../utils/api'

// export default function NewsList() {
//   const { t } = useTheme()
//   const navigate = useNavigate()
//   const scrollRef = useRef(null)
//   const pausedRef = useRef(false)
//   const [articles, setArticles] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     const fetchNews = async () => {
//       try {
//         setLoading(true)
//         const { data } = await getLatestNews()
//         const news = Array.isArray(data?.articles) ? data.articles : []
//         if (news.length === 0) {
//           throw new Error(data?.message || 'No news available right now')
//         }
//         setArticles(news)
//         setError('')
//       } catch (err) {
//         setError(err?.response?.data?.message || err.message || 'Unable to load news')
//         setArticles([])
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchNews()
//     const interval = setInterval(fetchNews, 60000)
//     return () => clearInterval(interval)
//   }, [])

//   useEffect(() => {
//     const el = scrollRef.current
//     if (!el || articles.length === 0) return

//     let animId = null
//     let pos = 0

//     const step = () => {
//       if (!el) return
//       if (!pausedRef.current) {
//         pos += 0.5
//         if (pos >= el.scrollHeight / 2) pos = 0
//         el.scrollTop = pos
//       }
//       animId = requestAnimationFrame(step)
//     }

//     animId = requestAnimationFrame(step)
//     return () => cancelAnimationFrame(animId)
//   }, [articles])

//   const openArticle = (item) => {
//     navigate(`/dashboard/news/${item.id}`, { state: item })
//   }

//   return (
//     <div style={{ minHeight: '100vh', padding: '24px', background: t.pageBg, color: t.text }}>
//       <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
//           <div>
//             <p style={{ margin: 0, color: t.textMuted, fontSize: '12px' }}>Health News</p>
//             <h1 style={{ margin: '8px 0 0', fontSize: '32px', color: t.text }}>Latest headlines</h1>
//           </div>
//           <button
//             onClick={() => navigate(-1)}
//             style={{ padding: '12px 18px', borderRadius: '16px', border: `1px solid ${t.border}`, background: t.surface, color: t.text, cursor: 'pointer', fontWeight: '700' }}
//           >
//             Back
//           </button>
//         </div>

//         {loading && (
//           <div style={{ minHeight: '420px', background: t.surface, borderRadius: '28px', border: `1px solid ${t.border}`, boxShadow: t.shadow, padding: '28px' }}>
//             Loading news...
//           </div>
//         )}

//         {!loading && error && (
//           <div style={{ minHeight: '420px', background: t.surface, borderRadius: '28px', border: `1px solid ${t.border}`, boxShadow: t.shadow, padding: '28px', color: t.danger }}>
//             {error}
//           </div>
//         )}

//         {!loading && !error && articles.length > 0 && (
//           <div
//             ref={scrollRef}
//             onMouseEnter={() => { pausedRef.current = true }}
//             onMouseLeave={() => { pausedRef.current = false }}
//             style={{
//               maxHeight: '72vh',
//               overflowY: 'hidden',
//               borderRadius: '28px',
//               border: `1px solid ${t.border}`,
//               background: t.surface,
//               boxShadow: t.shadow,
//               padding: '24px',
//             }}
//           >
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
//               {articles.map((item, index) => (
//                 <div
//                   key={`${item.url || item.id}-${index}`}
//                   onClick={() => openArticle(item)}
//                   style={{
//                     display: 'flex',
//                     flexDirection: 'column',
//                     padding: '20px',
//                     borderRadius: '24px',
//                     border: `1px solid ${t.border}`,
//                     background: t.pageBg,
//                     boxShadow: t.shadow,
//                     cursor: 'pointer',
//                     transition: 'transform 0.2s ease, box-shadow 0.2s ease',
//                   }}
//                   onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = t.shadowMd }}
//                   onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = t.shadow }}
//                 >
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
//                     <span style={{ fontSize: '12px', fontWeight: '700', color: t.primary }}>{item.source}</span>
//                     <span style={{ fontSize: '12px', color: t.textMuted }}>{new Date(item.publishedAt).toLocaleDateString()}</span>
//                   </div>
//                   <h2 style={{ margin: '0 0 10px', fontSize: '20px', color: t.text }}>{item.title}</h2>
//                   <p style={{ margin: 0, color: t.textSub, lineHeight: 1.7 }}>{item.desc || item.content || 'Read the full news story from the source.'}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {!loading && !error && articles.length === 0 && (
//           <div style={{ minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.surface, borderRadius: '28px', border: `1px solid ${t.border}`, boxShadow: t.shadow, padding: '28px', color: t.textMuted }}>
//             No news available right now. Please check back in a moment.
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }




import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { getLatestNews } from '../utils/api'

export default function NewsList() {
  const { t } = useTheme()
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const pausedRef = useRef(false)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const { data } = await getLatestNews()
        const news = Array.isArray(data?.articles) ? data.articles : []
        if (news.length === 0) {
          throw new Error(data?.message || 'No news available right now')
        }
        setArticles(news)
        setError('')
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Unable to load news')
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || articles.length === 0) return
    let animId = null
    let pos = 0
    const step = () => {
      if (!el) return
      if (!pausedRef.current) {
        pos += 0.5
        if (pos >= el.scrollHeight / 2) pos = 0
        el.scrollTop = pos
      }
      animId = requestAnimationFrame(step)
    }
    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [articles])

  const openArticle = (item) => {
    navigate(`/dashboard/news/${encodeURIComponent(item.url || item.title)}`, { state: item })
  }

  return (
    <div style={{ minHeight: '100vh', padding: '24px', background: t.pageBg, color: t.text }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <p style={{ margin: 0, color: t.textMuted, fontSize: '12px' }}>Health News</p>
            <h1 style={{ margin: '8px 0 0', fontSize: '32px', color: t.text }}>Latest headlines</h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: '12px 18px', borderRadius: '16px', border: `1px solid ${t.border}`, background: t.surface, color: t.text, cursor: 'pointer', fontWeight: '700' }}
          >
            Back
          </button>
        </div>

        {loading && (
          <div style={{ minHeight: '420px', background: t.surface, borderRadius: '28px', border: `1px solid ${t.border}`, boxShadow: t.shadow, padding: '28px' }}>
            Loading news...
          </div>
        )}

        {!loading && error && (
          <div style={{ minHeight: '420px', background: t.surface, borderRadius: '28px', border: `1px solid ${t.border}`, boxShadow: t.shadow, padding: '28px', color: t.danger }}>
            {error}
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div
            ref={scrollRef}
            onMouseEnter={() => { pausedRef.current = true }}
            onMouseLeave={() => { pausedRef.current = false }}
            onTouchStart={() => { pausedRef.current = true }}
            onTouchEnd={() => { pausedRef.current = false }}
            style={{
              maxHeight: '72vh',
              overflowY: 'hidden',
              borderRadius: '28px',
              border: `1px solid ${t.border}`,
              background: t.surface,
              boxShadow: t.shadow,
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {articles.map((item, index) => (
                <div
                  key={`${item.url || item.title}-${index}`}
                  onClick={() => openArticle(item)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    borderRadius: '24px',
                    border: `1px solid ${t.border}`,
                    background: t.pageBg,
                    boxShadow: t.shadow,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = t.shadowMd }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = t.shadow }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: t.primary }}>
                      {item.source?.name || item.source || 'Health News'}
                    </span>
                    <span style={{ fontSize: '12px', color: t.textMuted }}>
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <h2 style={{ margin: '0 0 10px', fontSize: '20px', color: t.text }}>{item.title}</h2>
                  <p style={{ margin: 0, color: t.textSub, lineHeight: 1.7 }}>
                    {item.description || item.desc || item.content || 'Read the full news story from the source.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div style={{ minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.surface, borderRadius: '28px', border: `1px solid ${t.border}`, boxShadow: t.shadow, padding: '28px', color: t.textMuted }}>
            No news available right now. Please check back in a moment.
          </div>
        )}
      </div>
    </div>
  )
}