import React from 'react';

const CircularProgress = ({ value, colorClass }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="48" cy="48" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle 
          cx="48" cy="48" r={radius} 
          fill="transparent" 
          stroke="currentColor" 
          className={colorClass}
          strokeWidth="8" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-bold text-lg">{value}%</span>
    </div>
  );
};

export default function Attendance() {
  const data = [
    { subject: 'Data Structures and Algorithms', total: 40, attended: 34, required: 75 },
    { subject: 'Database Management Systems', total: 35, attended: 25, required: 75 },
    { subject: 'Computer Networks', total: 38, attended: 35, required: 75 },
    { subject: 'Operating Systems', total: 42, attended: 25, required: 75 },
    { subject: 'Software Engineering', total: 30, attended: 28, required: 75 },
  ];

  const getColor = (percent, required) => {
    if (percent >= 85) return "text-emerald-500";
    if (percent >= required) return "text-amber-500";
    return "text-rose-500";
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Attendance Records</h1>
          <p className="text-gray-400 mt-2">Track your subject-wise attendance for the current semester.</p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-3">
          <span className="text-sm text-gray-400">Total Avg:</span>
          <span className="text-xl font-bold text-emerald-400">81.4%</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, i) => {
          const percentage = Math.round((item.attended / item.total) * 100);
          const colorClass = getColor(percentage, item.required);
          
          return (
            <div key={i} className="glass-card p-6 flex flex-col items-center justify-center text-center hover:bg-gray-800/40 transition-colors">
              <h3 className="font-semibold text-lg mb-6 h-14 flex items-center overflow-hidden">{item.subject}</h3>
              <CircularProgress value={percentage} colorClass={colorClass} />
              
              <div className="w-full mt-8 grid grid-cols-2 gap-4 text-left p-4 bg-gray-900/50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 font-medium tracking-wider uppercase mb-1">Attended</p>
                  <p className="text-xl font-mono text-gray-200">{item.attended}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium tracking-wider uppercase mb-1">Total</p>
                  <p className="text-xl font-mono text-gray-200">{item.total}</p>
                </div>
              </div>
              
              {percentage < item.required && (
                <div className="w-full mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
                  <span className="font-bold">Warning:</span> Below {item.required}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
