import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const ComingSoon = ({ title }) => (
  <div className="p-8 text-2xl font-bold text-gray-300">
    {title} Module Coming Soon
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public — login/register (voice-gated) */}
        <Route path="/login" element={<Login />} />

        {/* Default: redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected app routes (Layout wraps sidebar + outlet) */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
        </Route>
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="results" element={<Results />} />
          <Route path="courses" element={<ComingSoon title="Courses" />} />
          <Route path="hostel" element={<Hostel />} />
          <Route path="mess" element={<MessMenu />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="voice-enroll" element={<VoiceEnroll />} />
        </Route>

        {/* Legacy paths — keep old sidebar links working */}
        <Route element={<Layout />}>
          <Route path="attendance" element={<Attendance />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="results" element={<Results />} />
          <Route path="courses" element={<ComingSoon title="Courses" />} />
          <Route path="hostel" element={<Hostel />} />
          <Route path="mess" element={<MessMenu />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="voice-enroll" element={<VoiceEnroll />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
