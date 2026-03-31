import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const ComingSoon = ({ title }) => <div className="p-8 text-2xl font-bold text-gray-300">{title} Module Coming Soon</div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
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
      </Routes>
    </Router>
  );
}

export default App;
