import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { supabase } from './lib/supabase'

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = React.useState(true)
  const [authorized, setAuthorized] = React.useState(false)

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setAuthorized(false)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('is_master')
      .eq('id', user.id)
      .single()

    if (data?.is_master) {
      setAuthorized(true)
    } else {
      setAuthorized(false)
    }
    setLoading(false)
  }

  React.useEffect(() => {
    checkAuth()
  }, [])

  if (loading) return null
  if (!authorized) return <Navigate to="/login" />
  return children
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  )
}

export default App
