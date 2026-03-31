import { BookOpen, GraduationCap, TrendingUp, Presentation, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon, trend }) => (
  <div className="glass-card p-6 flex items-start justify-between group hover:-translate-y-1 transition-transform duration-300">
    <div>
      <p className="text-gray-400 font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
      <p className="text-sm flex items-center gap-1">
        <span className={trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}>
          {subtitle}
        </span>
      </p>
    </div>
    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 transition-colors">
      {icon}
    </div>
  </div>
);

const TimetableWidget = () => (
  <div className="glass-card p-6 h-full flex flex-col">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-lg">Today's Schedule</h3>
      <span className="text-xs font-semibold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">
        {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
      </span>
    </div>
    <div className="space-y-4 flex-1 overflow-y-auto pr-2">
      {[
        { time: '09:00 AM', subject: 'Data Structures', faculty: 'Dr. Smith', type: 'Lecture' },
        { time: '11:00 AM', subject: 'Database Systems', faculty: 'Prof. Johnson', type: 'Lab' },
        { time: '02:00 PM', subject: 'Computer Networks', faculty: 'Dr. Alan', type: 'Lecture' },
      ].map((cls, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:bg-gray-800/60 transition-colors cursor-pointer group">
          <div className="text-right whitespace-nowrap">
            <p className="font-mono text-sm text-gray-300 group-hover:text-white transition-colors">{cls.time}</p>
          </div>
          <div className="w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <div>
            <p className="font-bold text-gray-100">{cls.subject}</p>
            <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
              {cls.faculty} <span className="w-1 h-1 bg-gray-600 rounded-full inline-block"></span> {cls.type}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AttendanceWidget = () => (
  <div className="glass-card p-6">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-lg">Quick Attendance</h3>
      <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
    </div>
    <div className="space-y-5">
      {[
        { name: 'Data Structures', p: 85, color: 'bg-emerald-500' },
        { name: 'Database Systems', p: 72, color: 'bg-amber-500' },
        { name: 'Computer Networks', p: 92, color: 'bg-indigo-500' },
        { name: 'Operating Systems', p: 60, color: 'bg-rose-500' },
      ].map((sub, i) => (
        <div key={i}>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300 font-medium">{sub.name}</span>
            <span className="font-mono text-gray-400">{sub.p}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div className={`h-2.5 rounded-full ${sub.color}`} style={{ width: `${sub.p}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Welcome back, Alex!
        </h1>
        <p className="text-gray-400 mt-2">Here is what's happening with your academic profile today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Overall Attendance" 
          value="82.5%" 
          subtitle="↑ 2.1% from last week" 
          icon={<Presentation size={24} />} 
          trend="up"
        />
        <StatCard 
          title="Current CGPA" 
          value="8.42" 
          subtitle="Top 15% of class" 
          icon={<GraduationCap size={24} />} 
          trend="up"
        />
        <StatCard 
          title="Total Credits" 
          value="112" 
          subtitle="On track to graduate" 
          icon={<BookOpen size={24} />} 
          trend="up"
        />
        <StatCard 
          title="Pending Assignments" 
          value="3" 
          subtitle="1 due tomorrow!" 
          icon={<AlertCircle size={24} />} 
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimetableWidget />
        </div>
        <div>
          <AttendanceWidget />
        </div>
      </div>
    </div>
  );
}
