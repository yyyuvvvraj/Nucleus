import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, BookOpen, GraduationCap, Building, Clock, FileText, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  const links = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Attendance', path: '/attendance', icon: <Calendar size={20} /> },
    { name: 'Timetable', path: '/timetable', icon: <Clock size={20} /> },
    { name: 'Results', path: '/results', icon: <GraduationCap size={20} /> },
    { name: 'Courses', path: '/courses', icon: <BookOpen size={20} /> },
    { name: 'Hostel', path: '/hostel', icon: <Building size={20} /> },
    { name: 'Mess', path: '/mess', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg> },
    { name: 'Complaints', path: '/complaints', icon: <FileText size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 border-r border-gray-800 p-4 fixed left-0 top-0 hidden md:block">
      <div className="flex items-center gap-3 mb-10 px-2 mt-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
          N
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Nucleus Portal
        </h1>
      </div>
      
      <nav className="space-y-1">
        {links.map((link) => {
          const isActive = path === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-500 font-medium' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <span className={`${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
