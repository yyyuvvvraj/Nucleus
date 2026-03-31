import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/', icon: 'dashboard' },
    { name: 'Attendance', path: '/attendance', icon: 'calendar_today' },
    { name: 'Timetable', path: '/timetable', icon: 'schedule' },
    { name: 'Results', path: '/results', icon: 'grade' },
    { name: 'Courses', path: '/courses', icon: 'school' },
    { name: 'Hostel', path: '/hostel', icon: 'hotel' },
    { name: 'Mess Menu', path: '/mess', icon: 'restaurant' },
    { name: 'Complaints', path: '/complaints', icon: 'report_problem' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 dark:bg-slate-950 flex flex-col border-r border-slate-200 dark:border-slate-800">
      <div className="px-6 py-8">
        <h1 className="text-xl font-bold text-white tracking-tight">Nucleus</h1>
        <p className="text-xs text-slate-400 font-medium tracking-tight">University ERP</p>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return isActive ? (
            <Link key={link.name} className="bg-blue-600 text-white rounded-md mx-2 px-4 py-2 flex items-center gap-3 font-sans text-sm font-medium tracking-tight scale-95 active:scale-100 transition-transform" to={link.path}>
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ) : (
            <Link key={link.name} className="text-slate-400 hover:text-white mx-2 px-4 py-2 flex items-center gap-3 transition-colors font-sans text-sm font-medium tracking-tight hover:bg-slate-700 dark:hover:bg-slate-800" to={link.path}>
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden">
            <img className="w-full h-full object-cover" alt="University Logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA00zbxoBWRJD-ajx8etaIcQ_Xttn4mp1rMAKUF6KmClwKqxoF7bW2aos99mvaVMSWVjMXyo_vylstlSdef-nJa5it67c8-P3I3ZGKNNiLT21X2Ky2DEwwfB8gW99ivYA4HypjzYB49M1rXwTzVIfhmAgEKc7HqGz0Ut7tKC9S5NASXuB2YwRZMfqHGFgTQdrMfyJptj8ISsPYHpm5zCaJ6PswhjCTIsctywyBGhIj7b82KFHTAIt-wwZXQ4iJRJZXe9qJFYye3QY3"/>
          </div>
          <div>
            <p className="text-xs font-bold text-white">Alex Rivera</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">U-2024-8821</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
