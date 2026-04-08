import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// ── Role-specific nav definitions ──
const NAV_BY_ROLE = {
  admin: [
    { name: 'Overview',       tab: 'overview',     icon: 'dashboard' },
    { name: 'Add Student',    tab: 'add_student',  icon: 'person_add' },
    { name: 'Student List',   tab: 'students',     icon: 'group' },
    { name: 'Grade Entry',    tab: 'results',      icon: 'grade' },
    { name: 'Attendance',     tab: 'attendance',   icon: 'event_available' },
    { name: 'Timetable',      tab: 'timetable',    icon: 'calendar_month' },
    { name: 'Hostel',         tab: 'hostel',       icon: 'hotel' },
  ],
  director: [
    { name: 'Overview',       tab: 'overview',     icon: 'dashboard' },
    { name: 'Student List',   tab: 'students',     icon: 'group' },
    { name: 'Timetable',      tab: 'timetable',    icon: 'calendar_month' },
  ],
  recruiter: [
    { name: 'Add Student',    tab: 'add_student',  icon: 'person_add' },
    { name: 'Student List',   tab: 'students',     icon: 'group' },
  ],
  faculty: [
    { name: 'Overview',       tab: 'overview',     icon: 'dashboard' },
    { name: 'Student List',   tab: 'students',     icon: 'group' },
    { name: 'Grade Entry',    tab: 'results',      icon: 'grade' },
    { name: 'Attendance',     tab: 'attendance',   icon: 'event_available' },
  ],
  warden: [
    { name: 'Overview',       tab: 'overview',     icon: 'dashboard' },
    { name: 'Student List',   tab: 'students',     icon: 'group' },
    { name: 'Hostel',         tab: 'hostel',       icon: 'hotel' },
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
  const [genBranch, setGenBranch] = useState('');
  const [genSemester, setGenSemester] = useState('1');
  const [genBatch, setGenBatch] = useState('');
  const [generatedCreds, setGeneratedCreds] = useState(null);

  // Results form
  const [selectedStudent, setSelectedStudent] = useState('');
  const [resSubject, setResSubject] = useState('');
  const [resMarks, setResMarks] = useState('');
  const [resGrade, setResGrade] = useState('');
  const [resCredits, setResCredits] = useState('4');

  // Attendance form
  const [attSubject, setAttSubject] = useState('');
  const [attTotal, setAttTotal] = useState('');
  const [attAttended, setAttAttended] = useState('');

  // Timetable form
  const [timeDay, setTimeDay] = useState('Monday');
  const [timeSlot, setTimeSlot] = useState('');
  const [timeSubject, setTimeSubject] = useState('');
  const [timeFaculty, setTimeFaculty] = useState('');
  const [timeBranch, setTimeBranch] = useState('');
  const [timeSemester, setTimeSemester] = useState('1');

  useEffect(() => {
    const token = localStorage.getItem('nucleusToken');
    const u = JSON.parse(localStorage.getItem('nucleusUser') || '{}');
    if (!token || !u.role || u.role === 'student') { navigate('/login'); return; }
    setUser(u);

    const defaultTabs = { admin: 'overview', director: 'overview', recruiter: 'add_student', faculty: 'overview', warden: 'overview' };
    setActiveTab(defaultTabs[u.role] || 'overview');
    fetchStudents(token, {});
  }, [navigate]);

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
        setGenName(''); setGenEmail(''); setGenBranch(''); setGenBatch('');
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

  const submitAttendance = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return showError('Select a student');
    try {
      const token = localStorage.getItem('nucleusToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedStudent, subject_name: attSubject, total_classes: Number(attTotal), attended_classes: Number(attAttended) })
      });
      if (res.ok) { showSuccess('Attendance recorded!'); setAttSubject(''); setAttTotal(''); setAttAttended(''); }
      else { const d = await res.json(); showError(d.message); }
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
                    <label className={labelCls}>Email Address</label>
                    <input type="email" className={fieldCls} value={genEmail} onChange={e => setGenEmail(e.target.value)} placeholder="aarav@college.edu" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Branch</label>
                      <input type="text" className={fieldCls} value={genBranch} onChange={e => setGenBranch(e.target.value)} placeholder="Computer Science" required />
                    </div>
                    <div>
                      <label className={labelCls}>Semester</label>
                      <select className={fieldCls} value={genSemester} onChange={e => setGenSemester(e.target.value)} required>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Batch / Year</label>
                    <input type="text" className={fieldCls} value={genBatch} onChange={e => setGenBatch(e.target.value)} placeholder="e.g. 2024-2028" />
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
                    <input type="text" className={fieldCls} value={filterBranch} onChange={e => setFilterBranch(e.target.value)} placeholder="e.g. Computer Science" />
                  </div>
                  <div>
                    <label className={labelCls}>Semester</label>
                    <select className={fieldCls} value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
                      <option value="">All Semesters</option>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Batch</label>
                    <input type="text" className={fieldCls} value={filterBatch} onChange={e => setFilterBatch(e.target.value)} placeholder="e.g. 2024-2028" />
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
                <h2 className="text-4xl font-bold text-primary-container tracking-tight">Attendance</h2>
                <p className="mt-1 text-on-surface-variant">Record subject attendance for students.</p>
              </section>
              <div className={cardCls + ' max-w-xl'}>
                <form onSubmit={submitAttendance} className="space-y-4">
                  <div>
                    <label className={labelCls}>Student</label>
                    <select className={fieldCls} value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required>
                      <option value="">— Select Student —</option>
                      {allStudents.map(s => <option key={s._id} value={s._id}>{s.name} ({s.enrollment_number})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Subject</label>
                    <input type="text" className={fieldCls} value={attSubject} onChange={e => setAttSubject(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Total Classes</label>
                      <input type="number" className={fieldCls} value={attTotal} onChange={e => setAttTotal(e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Attended</label>
                      <input type="number" className={fieldCls} value={attAttended} onChange={e => setAttAttended(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-base">event_available</span> Record Attendance
                  </button>
                </form>
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
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Day</label>
                      <select className={fieldCls} value={timeDay} onChange={e => setTimeDay(e.target.value)} required>
                        {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => <option key={d}>{d}</option>)}
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

          {/* ── HOSTEL (placeholder) ── */}
          {activeTab === 'hostel' && (
            <>
              <section>
                <h2 className="text-4xl font-bold text-primary-container tracking-tight">Hostel Management</h2>
                <p className="mt-1 text-on-surface-variant">Room allocation and hostel metrics.</p>
              </section>
              <div className={cardCls + ' flex flex-col items-center py-20 text-center'}>
                <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">hotel</span>
                <p className="text-on-surface font-bold text-lg">Hostel Module</p>
                <p className="text-on-surface-variant text-sm mt-2">Room allocation and warden tools coming soon.</p>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
