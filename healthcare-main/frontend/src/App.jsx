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
import QuickHealthDrawer from './components/QuickHealthDrawer'
import './styles/globals.css'

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
           background: '#FFFFFF',
           display: 'flex',
           justifyContent: 'center',
           padding: '16px 12px 20px',
           boxSizing: 'border-box',
         }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            minHeight: '100vh',
            background: 'rgba(255,255,255,0.99)',
            borderRadius: '0px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: 'none',
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
            {/* DrAIWidget temporarily disabled */}
            {/* {isDashboardRoute && <DrAIWidget />} */}
          </div>
        </div>
      </ChatProvider>
    </ThemeProvider>
  )
}
