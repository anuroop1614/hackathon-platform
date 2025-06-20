import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './hooks/AuthContext'
import Login from './components/auth/Login'
import { Layout } from './components/Layout'
import { FacultyDashboard } from './components/faculty/FacultyDashboard'
import { StudentDashboard } from './components/student/StudentDashboard'
import RegisterSuccess from './components/student/RegisterSuccess'

function App() {
  const { user, userRole, loading } = useAuthContext()

  return (
    <Router>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : !user ? (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                userRole === 'faculty' ?
                <Navigate to="/dashboard" replace /> :
                <Navigate to="/dashboard" replace />
              }
            />
            <Route
              path="/dashboard"
              element={
                userRole === 'faculty' ?
                <FacultyDashboard /> :
                <StudentDashboard />
              }
            />
            <Route path="/success" element={<RegisterSuccess />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      )}
    </Router>
  )
}

export default App
