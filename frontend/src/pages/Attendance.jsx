import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Attendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('nucleusToken');
      const user = JSON.parse(localStorage.getItem('nucleusUser') || '{}');
      const res = await fetch(`${API_BASE_URL}/api/attendance/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAttendanceData(data);
      } else {
        setError(data.message || 'Failed to load attendance');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const totalClasses = attendanceData.reduce((acc, curr) => acc + curr.total_classes, 0);
  const attendedClasses = attendanceData.reduce((acc, curr) => acc + curr.attended_classes, 0);
  const aggregatePercentage = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : '0.0';

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-500">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-2">
        <span className="label-md uppercase text-[10px] font-bold tracking-widest text-on-surface-variant">Portal</span>
        <span className="material-symbols-outlined text-sm text-on-surface-variant">chevron_right</span>
        <span className="label-md uppercase text-[10px] font-bold tracking-widest text-secondary">Attendance History</span>
      </nav>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Attendance</h2>
          <p className="text-on-surface-variant mt-1 font-medium">Academic Year 2023-24 • Current Aggregate: <span className="text-secondary">{aggregatePercentage}%</span></p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-surface-container-highest text-on-surface text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-surface-dim transition-colors">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filter
          </button>
          <button className="px-4 py-2 bg-secondary text-on-secondary text-sm font-semibold rounded-lg flex items-center gap-2 transition-transform active:scale-95">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="grid grid-cols-12 gap-6 mb-10">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 flex-1 w-full">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Overall Progress</span>
            <h3 className="text-4xl font-bold text-primary">{aggregatePercentage}% <span className={`${Number(aggregatePercentage) >= 75 ? 'text-green-600' : 'text-error'} text-sm font-medium ml-2`}>
              {Number(aggregatePercentage) >= 75 ? '↑ On Track' : '↓ Below Threshold'}
            </span></h3>
            <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full transition-all duration-1000" style={{ width: `${aggregatePercentage}%` }}></div>
            </div>
          </div>
          <div className="md:pl-8 md:border-l border-outline-variant/20 min-w-[200px]">
            <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Requirement</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${Number(aggregatePercentage) >= 75 ? 'bg-secondary' : 'bg-error'}`}></div>
              <span className="text-sm font-bold text-primary">75% Threshold</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-2 max-w-[140px]">
              {Number(aggregatePercentage) >= 75 
                ? "You are maintaining good attendance. Keep it up!" 
                : "You need to attend more classes to meet the criteria."}
            </p>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 bg-primary p-6 rounded-xl text-white flex flex-col justify-between min-h-[160px]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Streak</span>
          <div>
            <p className="text-5xl font-bold">{Math.floor(attendedClasses / 5) || 0}</p>
            <p className="text-sm text-slate-300 font-medium mt-1">Estimated Weeks Active</p>
          </div>
          <div className="flex -space-x-2 mt-4 text-xs font-bold">
             <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-primary flex items-center justify-center">M</div>
             <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-primary flex items-center justify-center">T</div>
             <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-primary flex items-center justify-center">W</div>
             <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-primary flex items-center justify-center">T</div>
             <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-primary flex items-center justify-center">F</div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subject</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Total Classes</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Attended</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Percentage</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {attendanceData.map((row, idx) => {
              const perc = row.percentage.toFixed(1);
              const isShortage = row.percentage < 75;
              
              return (
                <tr key={idx} className="hover:bg-surface-container transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-8 ${isShortage ? 'bg-error' : 'bg-secondary'} rounded-full`}></div>
                      <div>
                        <p className="font-bold text-primary">{row.subject_name}</p>
                        <p className="text-xs text-on-surface-variant uppercase tracking-tighter">Academic Course</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-on-surface">{row.total_classes}</td>
                  <td className="px-6 py-5 text-center font-bold text-on-surface">{row.attended_classes}</td>
                  <td className="px-6 py-5 w-64">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-surface-container h-2 rounded-full overflow-hidden">
                        <div className={`${isShortage ? 'bg-error' : 'bg-secondary'} h-full transition-all duration-500`} style={{ width: `${perc}%` }}></div>
                      </div>
                      <span className={`text-xs font-bold ${isShortage ? 'text-error' : 'text-primary'}`}>{perc}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`px-2 py-1 ${isShortage ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} text-[10px] font-bold uppercase rounded`}>
                      {isShortage ? 'Shortage' : perc > 90 ? 'Excellent' : 'Good'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {attendanceData.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-20">inventory_2</span>
                  <p>No attendance records found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="bg-surface-container-low px-6 py-3 border-t border-outline-variant/10 flex justify-between items-center">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Showing {attendanceData.length} Subjects
          </p>
        </div>
      </div>

      {/* Footer Help Note */}
      <div className="mt-10 p-6 bg-blue-50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-500/20 rounded-xl flex items-start gap-4">
        <span className="material-symbols-outlined text-blue-600">info</span>
        <div>
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Medical Absence Reporting</h4>
          <p className="text-xs text-blue-800/80 dark:text-blue-400 leading-relaxed mt-1">If you have been absent due to medical reasons, please submit your medical certificate within 7 working days to the Academic Affairs office to receive attendance waivers. Late submissions will not be entertained.</p>
        </div>
      </div>
    </div>
  );
}
