import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// ── Role-specific nav definitions ──
const NAV_BY_ROLE = {
  admin: [
    { name: 'Shlok', tab: 'overview', icon: 'dashboard' },
    { name: 'Add Student', tab: 'add_student', icon: 'person_add' },
    { name: 'Student List', tab: 'students', icon: 'group' },
    { name: 'Grade Entry', tab: 'results', icon: 'grade' },
    { name: 'Attendance', tab: 'attendance', icon: 'event_available' },
    { name: 'Timetable', tab: 'timetable', icon: 'calendar_month' },
    { name: 'Hostel', tab: 'hostel', icon: 'hotel' },
    { name: 'Courses', tab: 'courses', icon: 'school' },
    { name: 'Mess Menu', tab: 'mess_menu', icon: 'restaurant' },
    { name: 'Security', tab: 'security', icon: 'security' },
  ],
  director: [
    { name: 'Overview', tab: 'overview', icon: 'dashboard' },
    { name: 'Student List', tab: 'students', icon: 'group' },
    { name: 'Timetable', tab: 'timetable', icon: 'calendar_month' },
    { name: 'Security', tab: 'security', icon: 'security' },
  ],
  recruiter: [
    { name: 'Add Student', tab: 'add_student', icon: 'person_add' },
    { name: 'Student List', tab: 'students', icon: 'group' },
    { name: 'Security', tab: 'security', icon: 'security' },
  ],
  faculty: [
    { name: 'Overview', tab: 'overview', icon: 'dashboard' },
    { name: 'Student List', tab: 'students', icon: 'group' },
    { name: 'Grade Entry', tab: 'results', icon: 'grade' },
    { name: 'Attendance', tab: 'attendance', icon: 'event_available' },
    { name: 'Security', tab: 'security', icon: 'security' },
  ],
  warden: [
    { name: 'Overview', tab: 'overview', icon: 'dashboard' },
    { name: 'Student List', tab: 'students', icon: 'group' },
    { name: 'Hostel', tab: 'hostel', icon: 'hotel' },
    { name: 'Security', tab: 'security', icon: 'security' },
  ],
};

export default function RoleDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState('');
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filter state
  const [filterBranch, setFilterBranch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterBatch, setFilterBatch] = useState('');

  // Add Student form
  const [genName, setGenName] = useState('');
  const [genEmail, setGenEmail] = useState('');
  const [genBranch, setGenBranch] = useState('CSE');
  const [genSemester, setGenSemester] = useState('1');
  const [genBatch, setGenBatch] = useState('2024');
  const [generatedCreds, setGeneratedCreds] = useState(null);

  // Results form
  const [selectedStudent, setSelectedStudent] = useState('');
  const [resSubject, setResSubject] = useState('');
  const [resMarks, setResMarks] = useState('');
  const [resGrade, setResGrade] = useState('');
  const [resCredits, setResCredits] = useState('4');

  // Attendance form
  const [attSubject, setAttSubject] = useState('');
  const [attStatusMap, setAttStatusMap] = useState({}); // { [userId]: true/false }

  // Timetable form
  const [timeDay, setTimeDay] = useState('Monday');
  const [timeSlot, setTimeSlot] = useState('');
  const [timeSubject, setTimeSubject] = useState('');
  const [timeFaculty, setTimeFaculty] = useState('');
  const [timeBranch, setTimeBranch] = useState('');
  const [timeSemester, setTimeSemester] = useState('1');

  // 2FA state
  const [mfaSecret, setMfaSecret] = useState(null);
  const [mfaQR, setMfaQR] = useState(null);
  const [mfaToken, setMfaToken] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // New Management States
  const [courses, setCourses] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [hostelData, setHostelData] = useState([]);

  // Form States
  const [newCourse, setNewCourse] = useState({ name: '', code: '', credits: 4, faculty: '', branch: 'CSE', semester: 1 });
  const [editMenu, setEditMenu] = useState({ day: 'Monday', breakfast: '', lunch: '', dinner: '', special: '' });
  const [hostelAssignment, setHostelAssignment] = useState({ userId: '', hostelBlock: '', roomNumber: '', hostelFeePaid: false, messFeePaid: false });

  useEffect(() => {
    const token = localStorage.getItem('nucleusToken');
    const u = JSON.parse(localStorage.getItem('nucleusUser') || '{}');
    if (!token || !u.role || u.role === 'student') { navigate('/login'); return; }
    setUser(u);
    setIs2FAEnabled(u.isTwoFactorEnabled || false);

    const defaultTabs = { admin: 'overview', director: 'overview', recruiter: 'add_student', faculty: 'overview', warden: 'overview' };
    setActiveTab(defaultTabs[u.role] || 'overview');
    fetchStudents(token, {});
    fetchCourses(token);
    fetchMessMenu(token);
    if (u.role === 'admin' || u.role === 'warden') {
      fetchHostelData(token);
    }
  }, [navigate]);

  // Auto-generate email based on name and year
  useEffect(() => {
    if (!genName) {
      setGenEmail('');
      return;
    }
    const parts = genName.trim().split(/\s+/);
    const firstName = parts[0].toLowerCase();
    const lastName = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    const yearSuffix = genBatch.slice(-2);

    let generatedEmail = '';
    if (lastName) {
      generatedEmail = `${lastName}.${firstName}${yearSuffix}@st.niituniversity.in`;
    } else {
      generatedEmail = `${firstName}${yearSuffix}@st.niituniversity.in`;
    }
    setGenEmail(generatedEmail);
  }, [genName, genBatch]);

  const fetchStudents = async (token, filters) => {
    try {
      const params = new URLSearchParams();
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.batch) params.append('batch', filters.batch);
      const query = params.toString() ? `?${params}` : '';
      const res = await fetch(`${API_BASE_URL}/api/admin/students${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) { setStudents(data); if (!params.toString()) setAllStudents(data); }
    } catch (err) { console.error(err); }
  };

  const fetchCourses = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/courses`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setCourses(data);
    } catch (err) { console.error(err); }
  };

  const fetchMessMenu = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/mess-menu`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setMenuItems(data);
    } catch (err) { console.error(err); }
  };

  const fetchHostelData = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hostel/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setHostelData(data);
    } catch (err) { console.error(err); }
  };

  const applyFilters = () => {
    const token = localStorage.getItem('nucleusToken');
    fetchStudents(token, { branch: filterBranch, semester: filterSemester, batch: filterBatch });
  };

  const clearFilters = () => {
    setFilterBranch(''); setFilterSemester(''); setFilterBatch('');
    const token = localStorage.getItem('nucleusToken');
    fetchStudents(token, {});
  };

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 5000); };
  const showError = (msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 4000); };
  const handleLogout = () => { localStorage.removeItem('nucleusToken'); localStorage.removeItem('nucleusUser'); navigate('/login'); };

  const submitStudent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: genName, email: genEmail, branch: genBranch, semester: Number(genSemester), batch: genBatch })
      });
      const d = await res.json();
      if (res.ok) {
        setGeneratedCreds({ email: d.email, password: d.generatedPassword, enrollment: d.enrollment_number, batch: d.batch });
        showSuccess('Student account created!');
        setGenName(''); setGenEmail(''); setGenBranch('CSE'); setGenBatch('2024');
        fetchStudents(token, {});
      } else showError(d.message || 'Failed');
    } catch { showError('Network error'); }
  };

  const submitResult = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return showError('Select a student');
    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedStudent, subject: resSubject, marks: Number(resMarks), grade: resGrade, credits: Number(resCredits) })
      });
      if (res.ok) { showSuccess('Result saved!'); setResSubject(''); setResMarks(''); setResGrade(''); }
      else { const d = await res.json(); showError(d.message); }
    } catch { showError('Network error'); }
  };

  const submitBulkAttendance = async (e) => {
    e.preventDefault();
    if (!attSubject) return showError('Enter subject name');
    const studentIds = students.map(s => s._id);
    if (studentIds.length === 0) return showError('No students to mark');

    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/attendance/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentIds, subject_name: attSubject, statusMap: attStatusMap })
      });
      if (res.ok) {
        showSuccess('Bulk attendance recorded!');
        setAttSubject('');
        setAttStatusMap({});
      } else {
        const d = await res.json();
        showError(d.message);
      }
    } catch { showError('Network error'); }
  };

  const submitTimetable = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/timetable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ day: timeDay, time: timeSlot, subject: timeSubject, faculty: timeFaculty, branch: timeBranch, semester: Number(timeSemester) })
      });
      if (res.ok) { showSuccess('Timetable slot added!'); setTimeSlot(''); setTimeSubject(''); setTimeFaculty(''); }
      else { const d = await res.json(); showError(d.message); }
    } catch { showError('Network error'); }
  };

  const init2FASetup = async () => {
    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/auth/2fa/setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) { setMfaQR(data.qrCode); setMfaSecret(data.secret); }
      else showError(data.message);
    } catch { showError('Network error'); }
  };

  const confirm2FA = async () => {
    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/auth/2fa/verify-enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ token: mfaToken })
      });
      if (res.ok) {
        showSuccess('Two-Factor Authentication Enabled!');
        setIs2FAEnabled(true);
        setMfaQR(null);
        // Update local user object
        const u = JSON.parse(localStorage.getItem('nucleusUser') || '{}');
        u.isTwoFactorEnabled = true;
        localStorage.setItem('nucleusUser', JSON.stringify(u));
      } else {
        const d = await res.json();
        showError(d.message);
      }
    } catch { showError('Network error'); }
  };

  const disable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) return;
    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/auth/2fa/disable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('2FA Disabled');
        setIs2FAEnabled(false);
        const u = JSON.parse(localStorage.getItem('nucleusUser') || '{}');
        u.isTwoFactorEnabled = false;
        localStorage.setItem('nucleusUser', JSON.stringify(u));
      }
    } catch { showError('Network error'); }
  };

  const handleReset2FA = async (studentId) => {
    if (!window.confirm('Reset 2FA for this student? They will be able to login with just their password.')) return;
    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/student/${studentId}/reset-2fa`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('MFA reset for student');
        fetchStudents(token, { branch: filterBranch, semester: filterSemester, batch: filterBatch });
      } else {
        const d = await res.json();
        showError(d.message);
      }
    } catch { showError('Network error'); }
  };

  const handleResetRegistration = async (studentId) => {
    if (!window.confirm('WARNING: This will clear ALL biometric data (Face/Voice) and reset the student to "First Login" status. Continue?')) return;
    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/student/${studentId}/reset-registration`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('Student registration reset');
        fetchStudents(token, { branch: filterBranch, semester: filterSemester, batch: filterBatch });
      } else {
        const d = await res.json();
        showError(d.message);
      }
    } catch { showError('Network error'); }
  };

  const submitCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newCourse)
      });
      if (res.ok) {
        showSuccess('Course added successfully!');
        setNewCourse({ name: '', code: '', credits: 4, faculty: '', branch: 'CSE', semester: 1 });
        fetchCourses(token);
      } else {
        const d = await res.json();
        showError(d.message);
      }
    } catch { showError('Network error'); }
  };

  const submitMessUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/mess-menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editMenu)
      });
      if (res.ok) {
        showSuccess('Mess menu updated!');
        fetchMessMenu(token);
      } else {
        const d = await res.json();
        showError(d.message || 'Update failed');
      }
    } catch (err) {
      console.error('Mess Update Error:', err);
      showError('Network error: ' + err.message);
    }
  };

  const submitHostelAssignment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/hostel/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(hostelAssignment)
      });
      if (res.ok) {
        showSuccess('Hostel details updated!');
        fetchHostelData(token);
        setHostelAssignment({ userId: '', hostelBlock: '', roomNumber: '', hostelFeePaid: false, messFeePaid: false });
      } else {
        const d = await res.json();
        showError(d.message || 'Assignment failed');
      }
    } catch (err) {
      console.error('Hostel Update Error:', err);
      showError('Network error: ' + err.message);
    }
  };

  const deleteCourseItem = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('Course removed');
        fetchCourses(token);
      }
    } catch { showError('Network error'); }
  };

  if (!user.role) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex items-center gap-3 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin">sync</span>
        Loading...
      </div>
    </div>
  );

  const navLinks = NAV_BY_ROLE[user.role] || [];
  const userName = user.name || 'Staff';
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const fieldCls = "w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary transition-all";
  const labelCls = "block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5";
  const cardCls = "bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6";

  return (
    <div className="bg-surface text-on-surface min-h-screen">

      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 dark:bg-slate-950 flex flex-col border-r border-slate-700">
        <div className="px-6 py-8">
          <h1 className="text-xl font-bold text-white tracking-tight">Nucleus</h1>
          <p className="text-xs text-slate-400 font-medium tracking-tight capitalize">{user.role} Portal</p>
        </div>

        <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
          {navLinks.map(link => {
            const active = activeTab === link.tab;
            return (
              <button
                key={link.tab}
                onClick={() => setActiveTab(link.tab)}
                className={`w-full flex items-center gap-3 mx-2 px-4 py-2 rounded-md text-sm font-medium tracking-tight transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                <span className="material-symbols-outlined text-base">{link.icon}</span>
                <span>{link.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-red-600/20 border border-transparent transition-all duration-200">
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ml-64 min-h-screen flex flex-col">

        {/* Top Bar */}
        <header className="sticky top-0 z-10 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-base text-on-surface-variant">
              {navLinks.find(n => n.tab === activeTab)?.icon || 'dashboard'}
            </span>
            <span className="text-sm font-semibold capitalize">
              {navLinks.find(n => n.tab === activeTab)?.name || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {successMsg && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-600 rounded-full text-sm font-medium">
                <span className="material-symbols-outlined text-sm">check_circle</span> {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-sm font-medium">
                <span className="material-symbols-outlined text-sm">error</span> {errorMsg}
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <>
              <section>
                <h2 className="text-4xl font-bold text-primary-container tracking-tight capitalize">
                  Welcome, {userName.split(' ')[0]}
                </h2>
                <p className="mt-1 text-on-surface-variant font-body capitalize">{user.role} Control Center · Nucleus ERP</p>
              </section>
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={cardCls}>
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Total Students</span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-primary">{allStudents.length}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">Registered in system</p>
                </div>
                <div className={cardCls}>
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Branches</span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-primary">
                      {[...new Set(allStudents.map(s => s.branch).filter(Boolean))].length || 0}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">Active departments</p>
                </div>
                <div className={cardCls}>
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Setup Pending</span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-primary">
                      {allStudents.filter(s => s.isFirstLogin).length}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">Awaiting first login</p>
                </div>
              </section>
              <section className={cardCls}>
                <h3 className="text-base font-bold text-on-surface mb-4">Recent Students</h3>
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high">
                      <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Name</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Enrollment</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Branch</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {allStudents.slice(0, 5).map(s => (
                      <tr key={s._id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-3 font-medium">{s.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{s.enrollment_number}</td>
                        <td className="px-4 py-3">{s.branch || '—'} {s.semester ? `· Sem ${s.semester}` : ''}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.isFirstLogin ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'}`}>
                            {s.isFirstLogin ? 'Pending Setup' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {allStudents.length === 0 && <tr><td colSpan="4" className="px-4 py-8 text-center text-on-surface-variant text-sm">No students yet.</td></tr>}
                  </tbody>
                </table>
              </section>
            </>
          )}

          {/* ── ADD STUDENT ── */}
          {activeTab === 'add_student' && (
            <>
              <section>
                <h2 className="text-4xl font-bold text-primary-container tracking-tight">Add Student</h2>
                <p className="mt-1 text-on-surface-variant">Create a new student account and generate credentials.</p>
              </section>

              {generatedCreds && (
                <div className="border border-green-500/30 bg-green-500/5 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    <h3 className="font-bold text-green-600">Account Created — Credential Package</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4">Share these credentials with the student. Their password is also stored in the system for reference.</p>
                  <div className="grid grid-cols-2 gap-4 font-mono text-sm">
                    <div className={cardCls + ' col-span-2 md:col-span-1'}>
                      <p className={labelCls}>Email</p>
                      <p className="text-on-surface font-medium">{generatedCreds.email}</p>
                    </div>
                    <div className={cardCls + ' col-span-2 md:col-span-1'}>
                      <p className={labelCls}>Initial Password</p>
                      <p className="text-on-surface font-medium tracking-widest">{generatedCreds.password}</p>
                    </div>
                    <div className={cardCls}>
                      <p className={labelCls}>Enrollment No.</p>
                      <p className="text-on-surface font-medium">{generatedCreds.enrollment}</p>
                    </div>
                    {generatedCreds.batch && (
                      <div className={cardCls}>
                        <p className={labelCls}>Batch</p>
                        <p className="text-on-surface font-medium">{generatedCreds.batch}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className={cardCls + ' max-w-xl'}>
                <h3 className="font-bold text-on-surface mb-6">Student Information</h3>
                <form onSubmit={submitStudent} className="space-y-4">
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input type="text" className={fieldCls} value={genName} onChange={e => setGenName(e.target.value)} placeholder="e.g. Aarav Sharma" required />
                  </div>
                  <div>
                    <label className={labelCls}>Email Address (Auto-generated)</label>
                    <input type="email" className={fieldCls + " opacity-70 cursor-not-allowed"} value={genEmail} readOnly placeholder="sharma.aarav25@st.niituniversity.in" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Course</label>
                      <select className={fieldCls} value={genBranch} onChange={e => setGenBranch(e.target.value)} required>
                        <option value="CSE">CSE</option>
                        <option value="IMBA">IMBA</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Semester</label>
                      <select className={fieldCls} value={genSemester} onChange={e => setGenSemester(e.target.value)} required>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Year</label>
                    <select className={fieldCls} value={genBatch} onChange={e => setGenBatch(e.target.value)} required>
                      {['2023', '2024', '2025', '2026', '2027', '2028'].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors mt-2">
                    <span className="material-symbols-outlined text-base">person_add</span>
                    Generate Account
                  </button>
                </form>
              </div>
            </>
          )}

          {/* ── STUDENT LIST ── */}
          {activeTab === 'students' && (
            <>
              <section>
                <h2 className="text-4xl font-bold text-primary-container tracking-tight">Student Registry</h2>
                <p className="mt-1 text-on-surface-variant">Browse and filter all registered students.</p>
              </section>

              {/* Filters */}
              <div className={cardCls}>
                <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-on-surface-variant">filter_list</span>
                  Filter Students
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className={labelCls}>Branch</label>
                    <select className={fieldCls} value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
                      <option value="">All Branches</option>
                      <option value="CSE">CSE</option>
                      <option value="IMBA">IMBA</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Semester</label>
                    <select className={fieldCls} value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
                      <option value="">All Semesters</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Batch</label>
                    <select className={fieldCls} value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
                      <option value="">All Batches</option>
                      {['2023', '2024', '2025', '2026', '2027', '2028'].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={applyFilters} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-3 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">search</span> Apply
                    </button>
                    <button onClick={clearFilters} className="flex items-center justify-center gap-1 px-4 bg-surface-container-high hover:bg-surface-container text-on-surface text-sm font-medium py-3 rounded-lg transition-colors border border-outline-variant">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                  <h3 className="font-bold text-on-surface">Students ({students.length})</h3>
                </div>
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high">
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Name</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Enrollment</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Branch · Sem</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Batch</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Initial Pass</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {students.map(s => (
                      <tr key={s._id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-6 py-4 font-medium">{s.name}</td>
                        <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{s.enrollment_number}</td>
                        <td className="px-6 py-4">{s.branch || '—'} {s.semester ? `· Sem ${s.semester}` : ''}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{s.batch || '—'}</td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {s.initialPassword
                            ? <span className="text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">{s.initialPassword}</span>
                            : <span className="text-on-surface-variant">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.isFirstLogin ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'}`}>
                            {s.isFirstLogin ? 'Pending Setup' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleReset2FA(s._id)}
                              className="p-1.5 text-amber-600 hover:bg-amber-500/10 rounded-lg transition-colors"
                              title="Reset 2FA"
                            >
                              <span className="material-symbols-outlined text-sm">lock_reset</span>
                            </button>
                            <button
                              onClick={() => handleResetRegistration(s._id)}
                              className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Reset Full Registration"
                            >
                              <span className="material-symbols-outlined text-sm">restart_alt</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr><td colSpan="6" className="px-6 py-10 text-center text-on-surface-variant text-sm">No students found matching filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── GRADE ENTRY ── */}
          {activeTab === 'results' && (
            <>
              <section>
                <h2 className="text-4xl font-bold text-primary-container tracking-tight">Grade Entry</h2>
                <p className="mt-1 text-on-surface-variant">Assign subject results to students.</p>
              </section>
              <div className={cardCls + ' max-w-xl'}>
                <form onSubmit={submitResult} className="space-y-4">
                  <div>
                    <label className={labelCls}>Student</label>
                    <select className={fieldCls} value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required>
                      <option value="">— Select Student —</option>
                      {allStudents.map(s => <option key={s._id} value={s._id}>{s.name} ({s.enrollment_number})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Subject</label>
                    <input type="text" className={fieldCls} value={resSubject} onChange={e => setResSubject(e.target.value)} placeholder="Data Structures" required />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Marks</label>
                      <input type="number" className={fieldCls} value={resMarks} onChange={e => setResMarks(e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Grade</label>
                      <input type="text" className={fieldCls} value={resGrade} onChange={e => setResGrade(e.target.value)} placeholder="A+" required />
                    </div>
                    <div>
                      <label className={labelCls}>Credits</label>
                      <input type="number" className={fieldCls} value={resCredits} onChange={e => setResCredits(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-base">save</span> Save Result
                  </button>
                </form>
              </div>
            </>
          )}

          {/* ── ATTENDANCE ── */}
          {activeTab === 'attendance' && (
            <>
              <section>
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-bold text-primary-container tracking-tight">Bulk Attendance</h2>
                    <p className="mt-1 text-on-surface-variant font-medium">Mark attendance for an entire class at once.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      const newMap = {};
                      students.forEach(s => newMap[s._id] = true);
                      setAttStatusMap(newMap);
                    }} className="text-xs font-bold text-blue-600 hover:text-blue-500 uppercase tracking-widest">Mark All Present</button>
                    <span className="text-outline-variant">|</span>
                    <button onClick={() => setAttStatusMap({})} className="text-xs font-bold text-on-surface-variant hover:text-on-surface uppercase tracking-widest">Clear All</button>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-4 space-y-4">
                  <div className={cardCls}>
                    <h3 className="font-bold text-on-surface mb-4">Class Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>Subject Name</label>
                        <input type="text" className={fieldCls} value={attSubject} onChange={e => setAttSubject(e.target.value)} placeholder="e.g. Operating Systems" required />
                      </div>
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          <span className="font-bold text-primary">Pro Tip:</span> Use the filter bar at the top to select the specific branch and semester before marking attendance.
                        </p>
                      </div>
                      <button onClick={submitBulkAttendance} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-md active:scale-95">
                        <span className="material-symbols-outlined text-base">save</span>
                        Submit Attendance
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-8">
                  <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                      <h3 className="font-bold text-on-surface">Mark Sheets ({students.length} Students)</h3>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="sticky top-0 bg-surface-container-high z-10">
                          <tr>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Name</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Enrollment</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {students.map(s => (
                            <tr key={s._id} className="hover:bg-surface-container-low transition-colors group">
                              <td className="px-6 py-4 font-medium">{s.name}</td>
                              <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{s.enrollment_number}</td>
                              <td className="px-6 py-4 text-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={attStatusMap[s._id] || false}
                                    onChange={(e) => {
                                      setAttStatusMap({ ...attStatusMap, [s._id]: e.target.checked });
                                    }}
                                  />
                                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                  <span className="ml-3 text-xs font-bold text-on-surface-variant group-hover:text-primary transition-colors">
                                    {attStatusMap[s._id] ? 'Present' : 'Absent'}
                                  </span>
                                </label>
                              </td>
                            </tr>
                          ))}
                          {students.length === 0 && (
                            <tr><td colSpan="3" className="px-6 py-20 text-center text-on-surface-variant">No students found for current filters.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── TIMETABLE ── */}
          {activeTab === 'timetable' && (
            <>
              <section>
                <h2 className="text-4xl font-bold text-primary-container tracking-tight">Timetable</h2>
                <p className="mt-1 text-on-surface-variant">Add lectures to the global schedule.</p>
              </section>
              <div className={cardCls + ' max-w-xl'}>
                <form onSubmit={submitTimetable} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Branch</label>
                      <input type="text" className={fieldCls} value={timeBranch} onChange={e => setTimeBranch(e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Semester</label>
                      <select className={fieldCls} value={timeSemester} onChange={e => setTimeSemester(e.target.value)} required>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Day</label>
                      <select className={fieldCls} value={timeDay} onChange={e => setTimeDay(e.target.value)} required>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Time Slot</label>
                      <input type="text" className={fieldCls} value={timeSlot} onChange={e => setTimeSlot(e.target.value)} placeholder="09:00 - 10:30" required />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Subject</label>
                    <input type="text" className={fieldCls} value={timeSubject} onChange={e => setTimeSubject(e.target.value)} required />
                  </div>
                  <div>
                    <label className={labelCls}>Faculty Name</label>
                    <input type="text" className={fieldCls} value={timeFaculty} onChange={e => setTimeFaculty(e.target.value)} required />
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-base">calendar_month</span> Add Slot
                  </button>
                </form>
              </div>
            </>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <>
              <section>
                <h2 className="text-4xl font-bold text-primary-container tracking-tight">Security Settings</h2>
                <p className="mt-1 text-on-surface-variant font-medium">Protect your account with multi-factor authentication.</p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={cardCls}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-3xl text-blue-600">verified_user</span>
                    <div>
                      <h3 className="font-bold text-on-surface">Two-Factor Authentication (2FA)</h3>
                      <p className="text-xs text-on-surface-variant">Standard TOTP (Google Authenticator, Authy, etc.)</p>
                    </div>
                  </div>

                  {!is2FAEnabled ? (
                    <div className="space-y-6">
                      <div className="p-4 bg-blue-600/5 rounded-lg border border-blue-600/10">
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          2FA adds an extra layer of security to your account. In addition to your password and biometrics, you'll need to enter a 6-digit code from your authenticator app.
                        </p>
                      </div>

                      {!mfaQR ? (
                        <button onClick={init2FASetup} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all">
                          <span className="material-symbols-outlined text-base">add_moderator</span>
                          Setup 2FA Now
                        </button>
                      ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                          <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-xl border border-outline-variant">
                            <img src={mfaQR} alt="QR Code" className="w-48 h-48" />
                            <div className="text-center">
                              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Secret Key</p>
                              <code className="text-sm bg-surface-container px-3 py-1 rounded font-mono">{mfaSecret}</code>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className={labelCls}>Verification Code</label>
                            <input
                              type="text"
                              className={fieldCls}
                              placeholder="000 000"
                              value={mfaToken}
                              onChange={e => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            />
                            <button onClick={confirm2FA} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">
                              Verify & Enable
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-600">check_circle</span>
                        <p className="text-sm font-bold text-green-600">2FA is currently ACTIVE</p>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        Your account is protected by an additional security layer. You can disable it here if you no longer have access to your authenticator app.
                      </p>
                      <button onClick={disable2FA} className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white font-bold py-3 rounded-lg border border-red-600/20 transition-all">
                        <span className="material-symbols-outlined text-base">no_encryption</span>
                        Disable 2FA
                      </button>
                    </div>
                  )}
                </div>

                <div className={cardCls + ' opacity-50'}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">history</span>
                    <h3 className="font-bold text-on-surface">Login History</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant">Session tracking and device management coming soon in a future security update.</p>
                </div>
              </div>
            </>
          )}

          {/* ── HOSTEL MANAGEMENT ── */}
          {activeTab === 'hostel' && (
            <>
              <section>
                <h2 className="text-4xl font-bold text-primary-container tracking-tight">Hostel & Housing</h2>
                <p className="mt-1 text-on-surface-variant font-medium">Manage student room allocations and fee status.</p>
              </section>

              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-4">
                  <div className={cardCls}>
                    <h3 className="font-bold text-on-surface mb-6">Assign Room</h3>
                    <form onSubmit={submitHostelAssignment} className="space-y-4">
                      <div>
                        <label className={labelCls}>Select Student</label>
                        <select className={fieldCls} value={hostelAssignment.userId} onChange={e => setHostelAssignment({ ...hostelAssignment, userId: e.target.value })} required>
                          <option value="">— Choose Student —</option>
                          {allStudents.map(s => <option key={s._id} value={s._id}>{s.name} ({s.enrollment_number})</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Block</label>
                          <input type="text" className={fieldCls} value={hostelAssignment.hostelBlock} onChange={e => setHostelAssignment({ ...hostelAssignment, hostelBlock: e.target.value })} placeholder="e.g. Ganga" required />
                        </div>
                        <div>
                          <label className={labelCls}>Room No.</label>
                          <input type="text" className={fieldCls} value={hostelAssignment.roomNumber} onChange={e => setHostelAssignment({ ...hostelAssignment, roomNumber: e.target.value })} placeholder="e.g. 402-B" required />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={hostelAssignment.hostelFeePaid} onChange={e => setHostelAssignment({ ...hostelAssignment, hostelFeePaid: e.target.checked })} className="rounded text-blue-600" />
                          <span className="text-sm text-on-surface-variant">Hostel Fee Paid</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={hostelAssignment.messFeePaid} onChange={e => setHostelAssignment({ ...hostelAssignment, messFeePaid: e.target.checked })} className="rounded text-blue-600" />
                          <span className="text-sm text-on-surface-variant">Mess Fee Paid</span>
                        </label>
                      </div>
                      <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors">Assign & Save</button>
                    </form>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-8">
                  <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-surface-container-high">
                          <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Student</th>
                          <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Room</th>
                          <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Hostel Fee</th>
                          <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Mess Fee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {hostelData.map(s => (
                          <tr key={s._id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-primary">{s.name}</p>
                              <p className="text-[10px] text-on-surface-variant uppercase">{s.enrollment_number}</p>
                            </td>
                            <td className="px-6 py-4">
                              {s.roomNumber ? (
                                <span className="bg-blue-600/10 text-blue-600 px-2 py-1 rounded font-mono text-xs font-bold">{s.hostelBlock} / {s.roomNumber}</span>
                              ) : (
                                <span className="text-on-surface-variant italic text-xs">Unassigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {s.hostelFeePaid ? <span className="text-green-600 font-bold">✓ Paid</span> : <span className="text-red-500 font-bold">Pending</span>}
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {s.messFeePaid ? <span className="text-green-600 font-bold">✓ Paid</span> : <span className="text-red-500 font-bold">Pending</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── COURSE MANAGEMENT ── */}
          {activeTab === 'courses' && (
            <>
              <section>
                <h2 className="text-4xl font-bold text-primary-container tracking-tight">University Courses</h2>
                <p className="mt-1 text-on-surface-variant font-medium">Manage the global syllabus and faculty assignments.</p>
              </section>

              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-4">
                  <div className={cardCls}>
                    <h3 className="font-bold text-on-surface mb-6">Add New Course</h3>
                    <form onSubmit={submitCourse} className="space-y-4">
                      <div>
                        <label className={labelCls}>Course Name</label>
                        <input type="text" className={fieldCls} value={newCourse.name} onChange={e => setNewCourse({ ...newCourse, name: e.target.value })} placeholder="e.g. Data Structures" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Course Code</label>
                          <input type="text" className={fieldCls} value={newCourse.code} onChange={e => setNewCourse({ ...newCourse, code: e.target.value })} placeholder="CS101" required />
                        </div>
                        <div>
                          <label className={labelCls}>Credits</label>
                          <input type="number" className={fieldCls} value={newCourse.credits} onChange={e => setNewCourse({ ...newCourse, credits: Number(e.target.value) })} required />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Faculty Name</label>
                        <input type="text" className={fieldCls} value={newCourse.faculty} onChange={e => setNewCourse({ ...newCourse, faculty: e.target.value })} placeholder="Dr. Jane Doe" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Branch</label>
                          <select className={fieldCls} value={newCourse.branch} onChange={e => setNewCourse({ ...newCourse, branch: e.target.value })}>
                            <option value="CSE">CSE</option>
                            <option value="IMBA">IMBA</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Semester</label>
                          <select className={fieldCls} value={newCourse.semester} onChange={e => setNewCourse({ ...newCourse, semester: Number(e.target.value) })}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors">Create Course</button>
                    </form>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map(course => (
                      <div key={course._id} className={cardCls + ' relative group'}>
                        <button onClick={() => deleteCourseItem(course._id)} className="absolute top-2 right-2 p-1 text-on-surface-variant hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded">{course.code}</span>
                          <span className="text-[10px] font-bold text-on-surface-variant">{course.credits} Credits</span>
                        </div>
                        <h4 className="font-bold text-primary">{course.name}</h4>
                        <p className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">person</span> {course.faculty}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">{course.branch}</span>
                          <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">Sem {course.semester}</span>
                        </div>
                      </div>
                    ))}
                    {courses.length === 0 && <div className="col-span-2 py-12 text-center text-on-surface-variant italic">No courses created yet.</div>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── MESS MENU MANAGEMENT ── */}
          {activeTab === 'mess_menu' && (
            <>
              <section>
                <h2 className="text-4xl font-bold text-primary-container tracking-tight">Mess Menu Management</h2>
                <p className="mt-1 text-on-surface-variant font-medium">Configure the daily nutritional schedule.</p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className={cardCls}>
                  <h3 className="font-bold text-on-surface mb-6">Update Daily Recipes</h3>
                  <form onSubmit={submitMessUpdate} className="space-y-4">
                    <div>
                      <label className={labelCls}>Select Day</label>
                      <select className={fieldCls} value={editMenu.day} onChange={e => setEditMenu({ ...editMenu, day: e.target.value })}>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Breakfast</label>
                      <textarea className={fieldCls + ' h-20 resize-none'} value={editMenu.breakfast} onChange={e => setEditMenu({ ...editMenu, breakfast: e.target.value })} placeholder="e.g. Idli Sambhar" required />
                    </div>
                    <div>
                      <label className={labelCls}>Lunch</label>
                      <textarea className={fieldCls + ' h-20 resize-none'} value={editMenu.lunch} onChange={e => setEditMenu({ ...editMenu, lunch: e.target.value })} placeholder="e.g. Paneer Butter Masala" required />
                    </div>
                    <div>
                      <label className={labelCls}>Dinner</label>
                      <textarea className={fieldCls + ' h-20 resize-none'} value={editMenu.dinner} onChange={e => setEditMenu({ ...editMenu, dinner: e.target.value })} placeholder="e.g. Mutton Curry" required />
                    </div>
                    <div>
                      <label className={labelCls}>Special Dish (Optional)</label>
                      <input type="text" className={fieldCls} value={editMenu.special} onChange={e => setEditMenu({ ...editMenu, special: e.target.value })} placeholder="e.g. Classic Lasagna" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors">Push Update</button>
                  </form>
                </div>

                <div className="md:col-span-2 space-y-4">
                  {menuItems.sort((a, b) => {
                    const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    return order.indexOf(a.day) - order.indexOf(b.day);
                  }).map(item => (
                    <div key={item._id} className={cardCls + ' flex gap-6 hover:border-blue-600/30 transition-all'}>
                      <div className="w-24 flex-shrink-0">
                        <h4 className="font-bold text-primary">{item.day}</h4>
                        <p className="text-[10px] text-green-600 font-bold uppercase mt-1">PUBLISHED</p>
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Breakfast</p>
                          <p className="text-xs text-on-surface">{item.breakfast}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Lunch</p>
                          <p className="text-xs text-on-surface">{item.lunch}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Dinner</p>
                          <p className="text-xs text-on-surface">{item.dinner}</p>
                        </div>
                      </div>
                      {item.special && (
                        <div className="w-24 text-right">
                          <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Special</p>
                          <p className="text-xs font-bold text-primary">{item.special}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {menuItems.length === 0 && <div className="py-12 text-center text-on-surface-variant italic">No menu items published.</div>}
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
