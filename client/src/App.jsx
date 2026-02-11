import { Navigate, Route, Routes } from 'react-router-dom'
import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/SignUp.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import RegisteredCourses from './pages/RegisteredCourses.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/registered" element={<RegisteredCourses />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
