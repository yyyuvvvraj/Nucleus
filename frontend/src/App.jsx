import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
// Adding basic text pages for rest of requirements to show it works
const ComingSoon = ({ title }) => <div className="p-8 text-2xl font-bold text-gray-300">{title} Module Coming Soon</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="timetable" element={<ComingSoon title="Timetable" />} />
          <Route path="results" element={<ComingSoon title="Results" />} />
          <Route path="courses" element={<ComingSoon title="Courses" />} />
          <Route path="hostel" element={<ComingSoon title="Hostel" />} />
          <Route path="mess" element={<ComingSoon title="Mess" />} />
          <Route path="complaints" element={<ComingSoon title="Complaints" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
