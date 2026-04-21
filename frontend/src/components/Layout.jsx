import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const navigate = useNavigate();

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('nucleusUser') || '{}'); }
    catch { return {}; }
  })();

  const userName = storedUser.name || 'Student';
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem('nucleusToken');
    localStorage.removeItem('nucleusUser');
    navigate('/login');
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 py-3">
          <div className="flex items-center flex-1">
            <div className="relative w-96">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <span className="material-symbols-outlined text-sm">search</span>
              </span>
              <input className="w-full bg-surface-container-low border-none rounded-sm py-2 pl-10 text-sm focus:ring-2 focus:ring-secondary transition-all" placeholder="Search courses, results, or resources..." type="text"/>
            </div>
          </div>
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="h-16"></footer>
      </main>
    </div>
  );
};

export default Layout;
