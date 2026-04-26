import { createContext, useContext, useState, useEffect } from 'react'

const themes = {
  light: {
    mode: 'light',
    // Page / container
    pageBg: '#F0F4FF',
    containerBg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceHover: '#F5F8FF',
    surfaceAlt: '#EEF3FF',
    headerBg: '#FFFFFF',
    sidebarBg: 'rgba(255,255,255,0.95)',

    // Borders & Shadows
    border: '#DDE5F4',
    borderStrong: '#B8C8E8',
    borderLight: '#EEF3FF',
    shadow: '0 1px 3px rgba(0,0,0,0.06), 0 3px 6px rgba(0,0,0,0.04)',
    shadowMd: '0 6px 16px -3px rgba(0,0,0,0.1), 0 4px 8px -2px rgba(0,0,0,0.06)',
    shadowLg: '0 12px 32px -6px rgba(0,0,0,0.12), 0 8px 16px -4px rgba(0,0,0,0.08)',
    shadowXl: '0 24px 48px -10px rgba(0,0,0,0.15), 0 12px 24px -6px rgba(0,0,0,0.1)',
    shadow2xl: '0 28px 64px -14px rgba(0,0,0,0.18), 0 14px 32px -7px rgba(0,0,0,0.12)',
    shadowGlow: '0 0 0 1px rgba(37,99,235,0.1), 0 0 24px rgba(37,99,235,0.12)',
    shadowCard: '0 2px 4px rgba(0,0,0,0.04), 0 8px 14px -3px rgba(0,0,0,0.06)',
    shadowElevated: '0 16px 40px -8px rgba(0,0,0,0.12), 0 10px 20px -5px rgba(0,0,0,0.08)',
    shadowPressed: 'inset 0 3px 6px rgba(0,0,0,0.08)',
    shadowFloating: '0 10px 40px -8px rgba(0,0,0,0.14), 0 6px 14px -4px rgba(0,0,0,0.1)',
    shadowModal: '0 28px 72px -14px rgba(0,0,0,0.18), 0 14px 36px -8px rgba(0,0,0,0.12)',

    // Text
    text: '#111827',
    textSub: '#374151',
    textMuted: '#6B7280',
    textLight: '#9CA3AF',

    // Brand / primary - Blue
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryGrad: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
    primaryLight: 'rgba(37,99,235,0.08)',

    // Secondary
    secondary: '#3B82F6',
    secondaryGrad: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',

    // Gradient backgrounds
    gradientBlob1: 'radial-gradient(circle at 20% 20%, rgba(37,99,235,0.08) 0%, transparent 50%)',
    gradientBlob2: 'radial-gradient(circle at 80% 80%, rgba(59,130,246,0.06) 0%, transparent 50%)',

    // Glass
    glass: 'rgba(255,255,255,0.9)',
    glassBorder: 'rgba(255,255,255,0.8)',

    // Inputs
    inputBg: '#F8FAFF',
    inputBorder: '#DDE5F4',
    inputText: '#111827',
    inputPlaceholder: '#9CA3AF',
    inputFocusRing: '0 0 0 3px rgba(37,99,235,0.15)',

    // Nav
    navActive: 'rgba(37,99,235,0.08)',
    navActiveDot: '#2563EB',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    errorBg: '#FEF2F2',
    errorBorder: '#FECACA',

    accentCyan: '#06B6D4',
    accentEmerald: '#10B981',
    accentAmber: '#F59E0B',
    accentRose: '#F43F5E',
  },
  dark: {
    mode: 'dark',
    // Page / container - Dark Navy
    pageBg: '#0A0F1E',
    containerBg: '#0D1526',
    surface: '#111827',
    surfaceHover: '#1A2236',
    surfaceAlt: '#1A2236',
    headerBg: '#0D1526',
    sidebarBg: 'rgba(13,21,38,0.95)',

    // Borders & Shadows
    border: 'rgba(255,255,255,0.07)',
    borderStrong: 'rgba(255,255,255,0.12)',
    borderLight: 'rgba(255,255,255,0.04)',
    shadow: '0 2px 4px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.3)',
    shadowMd: '0 6px 16px -3px rgba(0,0,0,0.5), 0 4px 8px -2px rgba(0,0,0,0.4)',
    shadowLg: '0 14px 32px -6px rgba(0,0,0,0.55), 0 8px 18px -4px rgba(0,0,0,0.45)',
    shadowXl: '0 26px 52px -10px rgba(0,0,0,0.6), 0 12px 26px -8px rgba(0,0,0,0.5)',
    shadow2xl: '0 30px 70px -16px rgba(0,0,0,0.7), 0 16px 36px -8px rgba(0,0,0,0.55)',
    shadowGlow: '0 0 0 1px rgba(37,99,235,0.15), 0 0 32px rgba(37,99,235,0.2)',
    shadowCard: '0 2px 4px rgba(0,0,0,0.4), 0 8px 14px -3px rgba(0,0,0,0.35)',
    shadowElevated: '0 18px 44px -8px rgba(0,0,0,0.55), 0 12px 22px -6px rgba(0,0,0,0.45)',
    shadowPressed: 'inset 0 4px 8px rgba(0,0,0,0.4)',
    shadowFloating: '0 12px 40px -8px rgba(0,0,0,0.6), 0 6px 16px -4px rgba(0,0,0,0.5)',
    shadowModal: '0 30px 72px -16px rgba(0,0,0,0.7), 0 16px 40px -8px rgba(0,0,0,0.55)',

    // Text
    text: '#F1F5F9',
    textSub: '#94A3B8',
    textMuted: '#475569',
    textLight: '#334155',

    // Brand / primary - Blue
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryGrad: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
    primaryLight: 'rgba(59,130,246,0.15)',

    // Secondary
    secondary: '#60A5FA',
    secondaryGrad: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',

    // Gradient backgrounds
    gradientBlob1: 'radial-gradient(circle at 20% 20%, rgba(37,99,235,0.2) 0%, transparent 50%)',
    gradientBlob2: 'radial-gradient(circle at 80% 80%, rgba(59,130,246,0.15) 0%, transparent 50%)',

    // Glass
    glass: 'rgba(13,21,38,0.85)',
    glassBorder: 'rgba(59,130,246,0.12)',

    // Inputs
    inputBg: '#0A0F1E',
    inputBorder: 'rgba(255,255,255,0.08)',
    inputText: '#F1F5F9',
    inputPlaceholder: '#475569',
    inputFocusRing: '0 0 0 3px rgba(59,130,246,0.2)',

    // Nav
    navActive: 'rgba(37,99,235,0.2)',
    navActiveDot: '#38BDF8',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    errorBg: 'rgba(239,68,68,0.1)',
    errorBorder: 'rgba(239,68,68,0.25)',

    accentCyan: '#38BDF8',
    accentEmerald: '#10B981',
    accentAmber: '#F59E0B',
    accentRose: '#FB7185',
  },
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('healthai_theme') || 'dark'
  })

  const t = themes[themeName]

  const toggleTheme = () => {
    setThemeName(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('healthai_theme', next)
      return next
    })
  }

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
