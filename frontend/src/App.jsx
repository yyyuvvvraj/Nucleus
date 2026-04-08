import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Timetable from './pages/Timetable';
import Results from './pages/Results';
import Hostel from './pages/Hostel';
import MessMenu from './pages/MessMenu';
import Complaints from './pages/Complaints';
import VoiceEnroll from './pages/VoiceEnroll';
import Login from './pages/Login';
import RoleDashboard from './pages/AdminDashboard.jsx';
import Courses from './pages/Courses.jsx';

// Role-Based Router Guard — wraps all authenticated content
const AccessHub = () => {
  const token = localStorage.getItem('nucleusToken');
  if (!token) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(localStorage.getItem('nucleusUser') || '{}');
    if (!user.role) return <Navigate to="/login" replace />;

    // Hierarchy roles → dedicated Command Center (no child routes needed)
    if (['admin', 'director', 'recruiter', 'faculty', 'instructor', 'warden'].includes(user.role)) {
      return <RoleDashboard />;
    }

    // Students → standard portal layout with sidebar
    return <Layout><Outlet /></Layout>;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Root → login if not authenticated */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* All authenticated routes live under /app */}
        <Route path="/app" element={<AccessHub />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="results" element={<Results />} />
          <Route path="courses" element={<Courses />} />
          <Route path="hostel" element={<Hostel />} />
          <Route path="mess" element={<MessMenu />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="voice-enroll" element={<VoiceEnroll />} />
        </Route>

        {/* Legacy sidebar links (without /app prefix) → redirect into /app */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/attendance" element={<Navigate to="/app/attendance" replace />} />
        <Route path="/timetable" element={<Navigate to="/app/timetable" replace />} />
        <Route path="/results" element={<Navigate to="/app/results" replace />} />
        <Route path="/courses" element={<Navigate to="/app/courses" replace />} />
        <Route path="/hostel" element={<Navigate to="/app/hostel" replace />} />
        <Route path="/mess" element={<Navigate to="/app/mess" replace />} />
        <Route path="/complaints" element={<Navigate to="/app/complaints" replace />} />
        <Route path="/voice-enroll" element={<Navigate to="/app/voice-enroll" replace />} />
        <Route path="/admin" element={<Navigate to="/app" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

