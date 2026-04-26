import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ChatProvider } from './context/ChatContext'
import Intro from './pages/Intro'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import HospitalDetail from './pages/HospitalDetail'
import NewsList from './pages/NewsList'
import NewsDetail from './pages/NewsDetail'
import DrAIWidget from './components/DrAIWidget'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/register" />
}

export default function App() {
  const location = useLocation()
  const pathname = location.pathname
  const isDashboardRoute = pathname.startsWith('/dashboard')

  return (
    <ThemeProvider>
      <ChatProvider>
         <div style={{
           minHeight: '100vh',
           background: 'radial-gradient(circle at top left, rgba(33,150,243,0.12), transparent 24%), radial-gradient(circle at bottom right, rgba(25,118,210,0.1), transparent 28%), #E3F2FD',
           display: 'flex',
           justifyContent: 'center',
           padding: '20px 12px 24px',
           boxSizing: 'border-box',
         }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            minHeight: '100vh',
            background: 'rgba(255,255,255,0.98)',
            borderRadius: '38px',
            boxShadow: '0 40px 110px rgba(15, 23, 42, 0.14)',
            overflow: 'hidden',
            border: '1px solid rgba(15, 23, 42, 0.06)',
            position: 'relative',
          }}>
            <Routes>
              <Route path="/" element={<Intro />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/hospital/:id" element={
                <ProtectedRoute>
                  <HospitalDetail />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/news" element={
                <ProtectedRoute>
                  <NewsList />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/news/*" element={
                <ProtectedRoute>
                  <NewsList />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/news/:id" element={
                <ProtectedRoute>
                  <NewsDetail />
                </ProtectedRoute>
              } />
            </Routes>
            {isDashboardRoute && <DrAIWidget />}
          </div>
        </div>
      </ChatProvider>
    </ThemeProvider>
  )
}
