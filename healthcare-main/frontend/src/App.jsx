import { Routes, Route, Navigate } from 'react-router-dom'
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
  return (
    <ThemeProvider>
      <ChatProvider>
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
        <DrAIWidget />
      </ChatProvider>
    </ThemeProvider>
  )
}
