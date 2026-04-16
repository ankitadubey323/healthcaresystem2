import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../context/ChatContext'

const AGENT_URL = 'https://ai-agent-9-nnzd.onrender.com/'

export default function DrAIWidget() {
  const { isChatOpen, openChat, closeChat, toggleChat } = useChat()
  const [isMobile, setIsMobile] = useState(false)
  const [buttonLeft, setButtonLeft] = useState(20)
  const [buttonTop, setButtonTop] = useState(24)
  const [dragState, setDragState] = useState({ active: false, startX: 0, startY: 0, startLeft: 20, startTop: 24 })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!dragState.active) return
      const clientX = event.clientX ?? (event.touches && event.touches[0]?.clientX)
      const clientY = event.clientY ?? (event.touches && event.touches[0]?.clientY)
      if (clientX == null || clientY == null) return

      const deltaX = clientX - dragState.startX
      const deltaY = clientY - dragState.startY
      const maxLeft = Math.max(16, Math.min(window.innerWidth - 96, 360))
      const maxTop = Math.max(16, Math.min(window.innerHeight - 96, window.innerHeight - 96))

      setButtonLeft(Math.min(Math.max(dragState.startLeft + deltaX, 16), maxLeft))
      setButtonTop(Math.min(Math.max(dragState.startTop + deltaY, 16), maxTop))
    }

    const handlePointerUp = () => {
      if (!dragState.active) return
      setDragState(prev => ({ ...prev, active: false }))
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragState])

  const handleDragStart = (event) => {
    const clientX = event.clientX ?? (event.touches && event.touches[0]?.clientX)
    const clientY = event.clientY ?? (event.touches && event.touches[0]?.clientY)
    if (clientX == null || clientY == null) return
    event.preventDefault()
    setDragState({
      active: true,
      startX: clientX,
      startY: clientY,
      startLeft: buttonLeft,
      startTop: buttonTop,
    })
  }

  const widgetStyle = {
    position: 'absolute',
    bottom: isMobile ? 0 : '20px',
    right: isMobile ? 0 : '20px',
    left: isMobile ? 0 : 'auto',
    top: isMobile ? 0 : 'auto',
    width: isMobile ? '100%' : '360px',
    height: isMobile ? '100%' : '640px',
    maxHeight: isMobile ? '100vh' : '640px',
    background: 'linear-gradient(180deg, #ffffff, #eef6ff)',
    borderRadius: isMobile ? '0' : '38px',
    border: isMobile ? 'none' : '1px solid rgba(15, 23, 42, 0.08)',
    boxShadow: isMobile ? 'none' : '0 30px 80px rgba(15, 23, 42, 0.16)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9999,
  }

  const headerStyle = {
    padding: isMobile ? '18px 18px 10px' : '22px 22px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: isMobile ? 'rgba(255,255,255,0.92)' : 'transparent',
    borderBottom: isMobile ? '1px solid rgba(15, 23, 42, 0.08)' : 'none',
    backdropFilter: isMobile ? 'blur(12px)' : 'none',
  }

  return (
    <>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: isMobile ? 1 : 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: isMobile ? 1 : 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={widgetStyle}
          >
            <div style={headerStyle}>
              <button
                onClick={toggleChat}
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #70c7ff, #3b82f6)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#ffffff',
                  fontSize: '26px',
                  boxShadow: '0 12px 26px rgba(59, 130, 246, 0.22)',
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                🩺
              </button>

              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  DrAI Assistant
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569' }}>
                  Talk to your AI doctor.
                </p>
              </div>

              <button
                onClick={closeChat}
                style={{
                  marginLeft: 'auto',
                  width: '38px',
                  height: '38px',
                  borderRadius: '14px',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              flex: 1,
              overflow: 'hidden',
              margin: isMobile ? '0' : '0 20px 20px',
              borderRadius: isMobile ? '0' : '32px',
              border: isMobile ? 'none' : '1px solid rgba(15, 23, 42, 0.08)',
            }}>
              <iframe
                title="Dr. AI Agent"
                src={AGENT_URL}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isChatOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={openChat}
          onPointerDown={handleDragStart}
          style={{
            position: 'absolute',
            top: `${buttonTop}px`,
            left: `${buttonLeft}px`,
            width: '64px',
            height: '64px',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
            color: '#ffffff',
            fontSize: '22px',
            border: 'none',
            cursor: dragState.active ? 'grabbing' : 'grab',
            boxShadow: '0 18px 48px rgba(14, 165, 233, 0.28)',
            zIndex: 10000,
            touchAction: 'none',
          }}
        >
          🩺
        </motion.button>
      )}
    </>
  )
}
