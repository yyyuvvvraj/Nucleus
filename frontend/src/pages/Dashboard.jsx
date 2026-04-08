import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Dashboard() {
  const [attendance, setAttendance] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('nucleusToken');
    if (!token) return;

    try {
      const u = JSON.parse(localStorage.getItem('nucleusUser') || '{}');
      setUser(u);
    } catch (e) {}

    // Fetch Attendance
    fetch(`${API_BASE_URL}/api/attendance`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          let total = 0;
          let attended = 0;
          data.forEach(item => {
            total += item.total_classes || 0;
            attended += item.attended_classes || 0;
          });
          const rate = total > 0 ? ((attended / total) * 100).toFixed(0) : 0;
          setAttendance({ rate, total, attended });
        } else {
          setAttendance({ rate: 0, total: 0, attended: 0 });
        }
      })
      .catch(console.error);

    // Fetch Today's Timetable
    fetch(`${API_BASE_URL}/api/timetable/today`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTimetable(data);
        }
      })
      .catch(console.error);
  }, []);

  const getInitials = (subject) => subject ? subject.substring(0, 2).toUpperCase() : 'NA';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <section>
        <h2 className="text-4xl font-bold text-primary-container tracking-tight">
          Good Evening, {user?.name ? user.name.split(' ')[0] : 'Student'}
        </h2>
        <p className="mt-1 text-on-surface-variant font-body">Overview of your academic progress.</p>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Attendance Rate</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-bold text-primary">
                {attendance !== null ? attendance.rate : '--'}%
              </span>
            </div>
          </div>
          <div className="mt-6 w-full bg-surface-container h-2 rounded-full overflow-hidden">
            <div 
              className="bg-secondary h-full rounded-full transition-all duration-1000" 
              style={{ width: `${attendance ? attendance.rate : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Cumulative GPA</span>
              <div className="mt-4">
                <span className="text-5xl font-bold text-primary tracking-tighter">--</span>
                <p className="text-xs text-on-surface-variant mt-2">Data syncing...</p>
              </div>
            </div>
            <div className="p-3 bg-secondary-fixed rounded-lg text-on-secondary-fixed">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Today's Lectures</span>
          <div className="mt-4 flex items-center gap-4">
            <div className="text-5xl font-bold text-primary">{timetable.length}</div>
            <div className="text-sm font-medium text-on-surface leading-tight">
              Classes<br />Scheduled
            </div>
          </div>
          <div className="mt-6 flex -space-x-2">
            {timetable.slice(0, 4).map((t, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-700" title={t.subject}>
                {getInitials(t.subject)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary tracking-tight">Today's Timetable</h3>
          <button className="text-sm font-bold text-secondary hover:underline transition-all">View Full Calendar</button>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-high">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Time Slot</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subject</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Instructor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {timetable.length > 0 ? timetable.map((t, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-5"><span className="font-mono text-sm text-on-surface font-medium">{t.time}</span></td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-secondary rounded-full"></div>
                      <div>
                        <p className="font-bold text-on-surface">{t.subject}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface">{t.faculty}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-on-surface-variant text-sm">
                    No classes scheduled for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
