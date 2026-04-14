import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  // Read logged-in user from localStorage (set on login/register)
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('nucleusUser') || '{}'); }
    catch { return {}; }
  })();

  const userName       = storedUser.name             || 'Student';
  const enrollmentNo   = storedUser.enrollment_number || '—';
  // Initials avatar fallback
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const links = [
    { name: 'Dashboard',  path: '/dashboard', icon: 'dashboard' },
    { name: 'Attendance', path: '/attendance', icon: 'calendar_today' },
    { name: 'Timetable',  path: '/timetable',  icon: 'schedule' },
    { name: 'Results',    path: '/results',    icon: 'grade' },
    { name: 'Courses',    path: '/courses',    icon: 'school' },
    { name: 'Hostel',     path: '/hostel',     icon: 'hotel' },
    { name: 'Mess Menu',  path: '/mess',       icon: 'restaurant' },
    { name: 'Complaints', path: '/complaints', icon: 'report_problem' },
    { name: 'Voice ID',   path: '/voice-enroll', icon: 'mic' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('nucleusToken');
    localStorage.removeItem('nucleusUser');
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 dark:bg-slate-950 flex flex-col border-r border-slate-200 dark:border-slate-800">
      {/* Logo */}
      <div className="px-6 py-8">
        <h1 className="text-xl font-bold text-white tracking-tight">Nucleus</h1>
        <p className="text-xs text-slate-400 font-medium tracking-tight">University ERP</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path ||
            (link.path === '/dashboard' && location.pathname === '/');
          return isActive ? (
            <Link
              key={link.name}
              className="bg-blue-600 text-white rounded-md mx-2 px-4 py-2 flex items-center gap-3 font-sans text-sm font-medium tracking-tight transition-transform"
              to={link.path}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ) : (
            <Link
              key={link.name}
              className="text-slate-400 hover:text-white mx-2 px-4 py-2 flex items-center gap-3 transition-colors font-sans text-sm font-medium tracking-tight hover:bg-slate-700 dark:hover:bg-slate-800 rounded-md"
              to={link.path}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User card + Logout */}
      <div className="p-4 border-t border-slate-700">
        {/* User info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate">{enrollmentNo}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-red-600/20 hover:border-red-600/40 border border-transparent transition-all duration-200"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
