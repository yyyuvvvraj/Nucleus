import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-[#0B1120] text-gray-100">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-8 relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-blue-600/5 blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
