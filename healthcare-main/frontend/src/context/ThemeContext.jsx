import { createContext, useContext, useState, useEffect } from 'react'

// ─────────────────────────────────────────────
// Premium SaaS Design System - Stripe/Notion Inspired
// Subtle 3D Depth, Soft Shadows, Modern Aesthetics
// ─────────────────────────────────────────────
export const themes = {
  light: {
    mode: 'light',
    // Page / container
    pageBg: '#F8FAFC',
    containerBg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceHover: '#F8FAFC',
    surfaceAlt: '#F1F5F9',
    headerBg: 'rgba(255,255,255,0.85)',
    sidebarBg: 'rgba(255,255,255,0.92)',

    // Borders & Shadows - Premium SaaS layered depth (Stripe/Notion inspired)
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    borderLight: '#F1F5F9',
    
    // Layered shadows for 3D depth effect
    shadow: '0 1px 3px rgba(0,0,0,0.04), 0 3px 6px rgba(0,0,0,0.03)',
    shadowMd: '0 6px 16px -3px rgba(0,0,0,0.08), 0 4px 8px -2px rgba(0,0,0,0.05)',
    shadowLg: '0 12px 32px -6px rgba(0,0,0,0.1), 0 8px 16px -4px rgba(0,0,0,0.06)',
    shadowXl: '0 24px 48px -10px rgba(0,0,0,0.14), 0 12px 24px -6px rgba(0,0,0,0.08)',
    shadow2xl: '0 28px 64px -14px rgba(0,0,0,0.18), 0 14px 32px -7px rgba(0,0,0,0.12)',
    shadowGlow: '0 0 0 1px rgba(79,70,229,0.08), 0 0 32px rgba(79,70,229,0.15)',
    
    // Card shadows with 3D depth
    shadowCard: '0 2px 4px rgba(0,0,0,0.03), 0 8px 14px -3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)',
    shadowElevated: '0 16px 40px -8px rgba(0,0,0,0.12), 0 10px 20px -5px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
    shadowPressed: 'inset 0 3px 6px rgba(0,0,0,0.08)',
    
    // Soft layered shadows for floating elements
    shadowFloating: '0 10px 40px -8px rgba(0,0,0,0.14), 0 6px 14px -4px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)',
    shadowModal: '0 28px 72px -14px rgba(0,0,0,0.22), 0 14px 36px -8px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.05)',

    // Text
    text: '#0F172A',
    textSub: '#334155',
    textMuted: '#64748B',
    textLight: '#94A3B8',

    // Brand / primary - Modern Indigo/Violet
    primary: '#4F46E5',
    primaryDark: '#4338CA',
    primaryGrad: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    primaryLight: 'rgba(79,70,229,0.08)',

    // Secondary
    secondary: '#7C3AED',
    secondaryGrad: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',

    // Gradient backgrounds - Subtle ambient
    gradientBlob1: 'radial-gradient(circle at 20% 20%, rgba(79,70,229,0.1) 0%, transparent 50%)',
    gradientBlob2: 'radial-gradient(circle at 80% 80%, rgba(124,58,237,0.08) 0%, transparent 50%)',

    // Glass - Premium frosted glass effect
    glass: 'rgba(255,255,255,0.75)',
    glassBorder: 'rgba(255,255,255,0.6)',

    // Inputs
    inputBg: '#FAFAFA',
    inputBorder: '#E2E8F0',
    inputText: '#0F172A',
    inputPlaceholder: '#94A3B8',
    inputFocusRing: '0 0 0 3px rgba(79,70,229,0.15)',

    // Bottom nav / sidebar
    navActive: 'rgba(79,70,229,0.1)',
    navActiveDot: '#4F46E5',

    // Misc status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    errorBg: '#FEF2F2',
    errorBorder: '#FECACA',
    
    // Accent colors for modern SaaS feel
    accentCyan: '#06B6D4',
    accentEmerald: '#10B981',
    accentAmber: '#F59E0B',
    accentRose: '#F43F5E',
  },
  dark: {
    mode: 'dark',
    // Page / container
    pageBg: '#0B1120',
    containerBg: '#151E2E',
    surface: '#1A2332',
    surfaceHover: '#243048',
    surfaceAlt: '#2A3648',
    headerBg: 'rgba(21,30,46,0.88)',
    sidebarBg: 'rgba(21,30,46,0.94)',

    // Borders & Shadows - Premium SaaS layered depth (dark mode)
    border: '#2D3A50',
    borderStrong: '#3D4D68',
    borderLight: '#243048',
    
    // Layered shadows for 3D depth effect
    shadow: '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.25)',
    shadowMd: '0 6px 16px -3px rgba(0,0,0,0.35), 0 4px 8px -2px rgba(0,0,0,0.3)',
    shadowLg: '0 14px 32px -6px rgba(0,0,0,0.4), 0 8px 18px -4px rgba(0,0,0,0.35)',
    shadowXl: '0 26px 52px -10px rgba(0,0,0,0.5), 0 12px 26px -8px rgba(0,0,0,0.4)',
    shadow2xl: '0 30px 70px -16px rgba(0,0,0,0.6), 0 16px 36px -8px rgba(0,0,0,0.45)',
    shadowGlow: '0 0 0 1px rgba(129,140,248,0.12), 0 0 32px rgba(129,140,248,0.2)',
    
    // Card shadows with 3D depth
    shadowCard: '0 2px 4px rgba(0,0,0,0.3), 0 8px 14px -3px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)',
    shadowElevated: '0 18px 44px -8px rgba(0,0,0,0.45), 0 12px 22px -6px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
    shadowPressed: 'inset 0 4px 8px rgba(0,0,0,0.3)',
    
    // Soft layered shadows for floating elements
    shadowFloating: '0 12px 40px -8px rgba(0,0,0,0.5), 0 6px 16px -4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
    shadowModal: '0 30px 72px -16px rgba(0,0,0,0.65), 0 16px 40px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',

    // Text
    text: '#F1F5F9',
    textSub: '#CBD5E1',
    textMuted: '#94A3B8',
    textLight: '#64748B',

    // Brand / primary - Light mode indigo
    primary: '#818CFG',
    primaryDark: '#6366F1',
    primaryGrad: 'linear-gradient(135deg, #818CF8 0%, #A78BFA 100%)',
    primaryLight: 'rgba(129,140,248,0.15)',

    // Secondary
    secondary: '#A78BFA',
    secondaryGrad: 'linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)',

    // Gradient backgrounds - Subtle ambient
    gradientBlob1: 'radial-gradient(circle at 20% 20%, rgba(129,140,248,0.18) 0%, transparent 50%)',
    gradientBlob2: 'radial-gradient(circle at 80% 80%, rgba(167,139,250,0.12) 0%, transparent 50%)',

    // Glass - Premium frosted glass effect
    glass: 'rgba(26,35,50,0.8)',
    glassBorder: 'rgba(255,255,255,0.08)',

    // Inputs
    inputBg: '#0B1120',
    inputBorder: '#2D3A50',
    inputText: '#F1F5F9',
    inputPlaceholder: '#64748B',
    inputFocusRing: '0 0 0 3px rgba(129,140,248,0.2)',

    // Bottom nav / sidebar
    navActive: 'rgba(129,140,248,0.15)',
    navActiveDot: '#818CF8',

    // Misc status
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    errorBg: 'rgba(248,113,113,0.1)',
    errorBorder: 'rgba(248,113,113,0.3)',
    
    // Accent colors for modern SaaS feel
    accentCyan: '#22D3EE',
    accentEmerald: '#34D399',
    accentAmber: '#FBBF24',
    accentRose: '#FB7185',
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