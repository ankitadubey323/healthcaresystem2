// import { useLocation, useNavigate, useParams } from 'react-router-dom'
// import { useTheme } from '../context/ThemeContext'
// import { newsItems } from '../data/newsData'

// export default function NewsDetail() {
//   const { t } = useTheme()
//   const navigate = useNavigate()
//   const { id } = useParams()
//   const { state } = useLocation()

//   const article = state || newsItems.find(item => item.id === Number(id)) || {
//     id,
//     title: 'Article not found',
//     desc: 'This article may have moved or is no longer available.',
//     content: 'Please return to the news feed to choose another story.',
//     source: 'Health News',
//     emoji: '❓',
//     tag: 'News',
//     color: ['#cbd5e1', '#94a3b8'],
//     light: '#f8fafc',
//     dark: '#1e293b',
//   }

//   const displayTag = article.tag || article.source || 'Health News'
//   const displayColor = article.color || ['#34d399', '#3b82f6']
//   const displayEmoji = article.emoji || '📰'
//   const displayContent = article.content || article.desc || 'No preview available.'

//   return (
//     <div style={{ minHeight: '100vh', background: t.pageBg, padding: '24px', color: t.text }}>
//       <button
//         onClick={() => navigate(-1)}
//         style={{
//           marginBottom: '22px', padding: '10px 16px', borderRadius: '16px',
//           border: `1px solid ${t.border}`, background: t.surface,
//           color: t.text, cursor: 'pointer', fontFamily: 'inherit',
//         }}
//       >
//         ← Back to news
//       </button>

//       <div style={{
//         maxWidth: '840px', margin: '0 auto', padding: '28px',
//         borderRadius: '28px', background: t.surface,
//         boxShadow: t.shadow, border: `1px solid ${t.border}`,
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px' }}>
//           <div style={{
//             width: '72px', height: '72px', borderRadius: '22px',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             background: `linear-gradient(135deg, ${displayColor[0]}, ${displayColor[1]})`,
//             fontSize: '32px',
//           }}>
//             {displayEmoji}
//           </div>
//           <div>
//             <p style={{ margin: 0, color: t.textMuted, fontSize: '13px' }}>{displayTag}</p>
//             <h1 style={{ margin: '6px 0 0', fontSize: '32px', color: t.text }}>{article.title}</h1>
//           </div>
//         </div>
//         <p style={{ fontSize: '14px', color: t.textMuted, marginBottom: '24px', lineHeight: 1.75 }}>
//           {article.desc || ''}
//         </p>
//         <div style={{ fontSize: '15px', color: t.text, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
//           {displayContent}
//         </div>
//         {article.url && (
//           <a
//             href={article.url}
//             target="_blank"
//             rel="noreferrer"
//             style={{
//               display: 'inline-block', marginTop: '22px', padding: '12px 18px',
//               borderRadius: '18px', background: t.primary, color: '#fff', textDecoration: 'none', fontWeight: '700'
//             }}
//           >
//             Read full article
//           </a>
//         )}
//       </div>
//     </div>
//   )
// }


import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function NewsDetail() {
  const { t } = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()
  const { state } = useLocation()
  const scrollRef = useRef(null)
  const pausedRef = useRef(false)

  const article = state || {
    id,
    title: 'Article not found',
    desc: 'This article may have moved or is no longer available.',
    content: 'Please return to the news feed to choose another story.',
    source: 'Health News',
  }

  const displayTag = article.tag || article.source || 'Health News'
  const displayColor = article.color || ['#34d399', '#3b82f6']
  const displayEmoji = article.emoji || '📰'
  const displayContent = article.content || article.desc || 'No preview available.'

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let animId = null
    let pos = 0
    const step = () => {
      if (!pausedRef.current) {
        pos += 0.4
        if (pos >= el.scrollHeight - el.clientHeight) {
          pos = 0
        }
        el.scrollTop = pos
      }
      animId = requestAnimationFrame(step)
    }
    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: t.pageBg, padding: '24px', color: t.text }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '22px', padding: '10px 16px', borderRadius: '16px',
          border: `1px solid ${t.border}`, background: t.surface,
          color: t.text, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        ← Back to news
      </button>

      <div
        ref={scrollRef}
        onMouseEnter={() => { pausedRef.current = true }}
        onMouseLeave={() => { pausedRef.current = false }}
        onTouchStart={() => { pausedRef.current = true }}
        onTouchEnd={() => { pausedRef.current = false }}
        style={{
          maxWidth: '840px', margin: '0 auto',
          maxHeight: '80vh', overflowY: 'auto',
          borderRadius: '28px', background: t.surface,
          boxShadow: t.shadow, border: `1px solid ${t.border}`,
          scrollbarWidth: 'none',
        }}
      >
        <div style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${displayColor[0]}, ${displayColor[1]})`,
              fontSize: '32px', flexShrink: 0,
            }}>
              {displayEmoji}
            </div>
            <div>
              <p style={{ margin: 0, color: t.textMuted, fontSize: '13px' }}>{displayTag}</p>
              <h1 style={{ margin: '6px 0 0', fontSize: '26px', color: t.text }}>{article.title}</h1>
            </div>
          </div>

          {article.publishedAt && (
            <p style={{ fontSize: '12px', color: t.textMuted, marginBottom: '16px' }}>
              📅 {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          )}

          <p style={{ fontSize: '15px', color: t.textSub, marginBottom: '24px', lineHeight: 1.75 }}>
            {article.desc || ''}
          </p>

          <div style={{ fontSize: '15px', color: t.text, lineHeight: 1.9, whiteSpace: 'pre-line' }}>
            {displayContent}
          </div>

{article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-block', marginTop: '28px', padding: '14px 22px',
                borderRadius: '18px', background: t.primaryGrad,
                color: '#fff', textDecoration: 'none', fontWeight: '700',
                fontSize: '15px',
              }}
            >
              🔗 Read full article
            </a>
          )}
        </div>
      </div>
    </div>
  )
}