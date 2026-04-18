import { createContext, useContext, useState, useEffect } from 'react'

// ─────────────────────────────────────────────
// Color palettes
// ─────────────────────────────────────────────
export const themes = {
  light: {
    mode: 'light',
    // Page / container
    pageBg: 'radial-gradient(circle at top left, rgba(239,68,68,0.18), transparent 25%), radial-gradient(circle at bottom right, rgba(248,113,113,0.14), transparent 30%), #fff7f7',
    containerBg: '#ffffff',
    surface: '#ffffff',
    surfaceHover: '#fff2f2',
    surfaceAlt: '#fff0f0',
    headerBg: 'rgba(255,255,255,0.94)',
    sidebarBg: 'rgba(255,255,255,0.96)',

    // Borders & Shadows
    border: 'rgba(239,68,68,0.18)',
    borderStrong: 'rgba(239,68,68,0.32)',
    shadow: '0 24px 60px rgba(239,68,68,0.12)',
    shadowMd: '0 28px 76px rgba(239,68,68,0.16)',
    shadowLg: '0 34px 98px rgba(239,68,68,0.2)',

    // Text
    text: '#111827',
    textSub: '#475569',
    textMuted: '#7f1d1d',
    textLight: '#9ca3af',

    // Brand / primary
    primary: '#ef4444',
    primaryDark: '#dc2626',
    primaryGrad: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    primaryLight: 'rgba(239,68,68,0.14)',

    // Inputs
    inputBg: '#f7fafc',
    inputBorder: '#e2e8f0',
    inputText: '#1a202c',
    inputPlaceholder: '#a0aec0',

    // Bottom nav / sidebar
    navActive: 'rgba(239,68,68,0.14)',
    navActiveDot: '#dc2626',

    // Misc status
    success: '#38a169',
    warning: '#d69e2e',
    error: '#e53e3e',
    info: '#3182ce',
    errorBg: '#fff5f5',
    errorBorder: '#fed7d7',
  },
  dark: {
    mode: 'dark',
    // Page / container
    pageBg: 'radial-gradient(circle at top left, rgba(248,113,113,0.18), transparent 18%), radial-gradient(circle at bottom right, rgba(239,68,68,0.12), transparent 24%), #09080b',
    containerBg: '#111827',
    surface: '#111827',
    surfaceHover: '#231021',
    surfaceAlt: '#1f1322',
    headerBg: 'rgba(17,24,39,0.94)',
    sidebarBg: 'rgba(17,24,39,0.96)',

    // Borders & Shadows
    border: 'rgba(248,113,113,0.18)',
    borderStrong: 'rgba(239,68,68,0.28)',
    shadow: '0 26px 84px rgba(15,23,42,0.45)',
    shadowMd: '0 30px 98px rgba(15,23,42,0.55)',
    shadowLg: '0 36px 120px rgba(15,23,42,0.6)',

    // Text
    text: '#f8fafc',
    textSub: '#fbcfe8',
    textMuted: '#f9a8d4',
    textLight: '#f3f4f6',

    // Brand / primary
    primary: '#fb7185',
    primaryDark: '#f43f5e',
    primaryGrad: 'linear-gradient(135deg, #fb7185 0%, #ef4444 100%)',
    primaryLight: 'rgba(251,113,133,0.16)',

    // Inputs
    inputBg: '#111827',
    inputBorder: 'rgba(248,113,113,0.16)',
    inputText: '#f8fafc',
    inputPlaceholder: '#f9a8d4',

    // Bottom nav / sidebar
    navActive: 'rgba(251,113,133,0.18)',
    navActiveDot: '#fb7185',

    // Misc status
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
    errorBg: 'rgba(248,113,113,0.1)',
    errorBorder: 'rgba(248,113,113,0.3)',
  },
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('healthai_theme') || 'light'
  })

  const t = themes[themeName]

  const toggleTheme = () => {
    setThemeName(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('healthai_theme', next)
      return next
    })
  }

  // Apply page-level background via CSS vars on <html>
  useEffect(() => {
    document.documentElement.style.setProperty('--page-bg', t.pageBg)
    document.documentElement.style.setProperty('--page-text', t.text)
    document.body.style.background = t.pageBg
    document.body.style.color = t.text
  }, [t])

  return (
    <ThemeContext.Provider value={{ themeName, t, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
