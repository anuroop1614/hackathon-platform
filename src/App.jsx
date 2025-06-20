import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AuthForm } from './components/auth/AuthForm'
import { Layout } from './components/Layout'
import { FacultyDashboard } from './components/faculty/FacultyDashboard'
import { StudentDashboard } from './components/student/StudentDashboard'

function App() {
  const { user, loading } = useAuth()
  const [isLogin, setIsLogin] = useState(true)

  return (
    <Router>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : !user ? (
        <AuthForm isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/student" replace />} />
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
          </Routes>
        </Layout>
      )}
    </Router>
  )
}

export default App
