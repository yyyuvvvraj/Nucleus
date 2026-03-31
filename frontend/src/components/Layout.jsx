import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
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
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
            <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Alex Rivera</span>
              <img alt="User Profile" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkzh1E0Zct5FijwOkpvnpHD_NGRyvAsoMgHN5WLvhbdsMHBUGrmfF-RYqxTW1O22DyPUrJX4yeaj9prw5-B-v9yPfLczvC6qlif1-DPeC3AlfASGXg5_LloSAwBYobUhNA9FryU1FwFld1MH64SmeHByPtRyj3nLw5ddV9V1Gh25xAbK8j1xRxWst8aiTN1-daneomzS2fDmYxmOSiW0Q5STJ50ADmiFiiqMqkisHVlGigNdmJZd-CeNczZleYTwMQ-nGvZXJT0EsR"/>
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
