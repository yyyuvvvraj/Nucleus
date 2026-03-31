import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <section>
        <h2 className="text-4xl font-bold text-primary-container tracking-tight">Good Evening, Student</h2>
        <p className="mt-1 text-on-surface-variant font-body">Overview of your academic progress.</p>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Attendance Rate</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-bold text-primary">88%</span>
              <span className="text-secondary font-semibold text-sm">+2% this month</span>
            </div>
          </div>
          <div className="mt-6 w-full bg-surface-container h-2 rounded-full overflow-hidden">
            <div className="bg-secondary h-full w-[88%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Cumulative GPA</span>
              <div className="mt-4">
                <span className="text-5xl font-bold text-primary tracking-tighter">3.80</span>
                <p className="text-xs text-on-surface-variant mt-2">Top 5% of Department</p>
              </div>
            </div>
            <div className="p-3 bg-secondary-fixed rounded-lg text-on-secondary-fixed">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Today's Remainder</span>
          <div className="mt-4 flex items-center gap-4">
            <div className="text-5xl font-bold text-primary">03</div>
            <div className="text-sm font-medium text-on-surface leading-tight">
              Lectures<br />Remaining
            </div>
          </div>
          <div className="mt-6 flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">CS</div>
            <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[10px] font-bold">MA</div>
            <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center text-[10px] font-bold">PH</div>
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
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subject & Course Code</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Location</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Instructor</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-5"><span className="font-mono text-sm text-on-surface font-medium">09:00 - 10:30</span></td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-secondary rounded-full"></div>
                    <div>
                      <p className="font-bold text-on-surface">Advanced Algorithms</p>
                      <p className="text-xs font-mono text-on-surface-variant">CS-402</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="text-sm">Lab 4, West Wing</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface">Dr. Sarah Jenkins</td>
                <td className="px-6 py-5"><span className="px-2 py-1 bg-surface-container-high text-[10px] font-bold rounded uppercase text-on-surface-variant">Completed</span></td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-5"><span className="font-mono text-sm text-on-surface font-medium">11:00 - 12:30</span></td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-error rounded-full"></div>
                    <div>
                      <p className="font-bold text-on-surface">Quantum Mechanics</p>
                      <p className="text-xs font-mono text-on-surface-variant">PH-210</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="text-sm">Room 302, Sci Block</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface">Prof. Michael Chen</td>
                <td className="px-6 py-5"><span className="px-2 py-1 bg-secondary text-[10px] font-bold rounded uppercase text-white">Ongoing</span></td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-5"><span className="font-mono text-sm text-on-surface font-medium">14:00 - 15:30</span></td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-surface-variant rounded-full"></div>
                    <div>
                      <p className="font-bold text-on-surface">Linear Algebra</p>
                      <p className="text-xs font-mono text-on-surface-variant">MA-105</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="text-sm">Auditorium B</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface">Dr. Elena Rodriguez</td>
                <td className="px-6 py-5"><span className="px-2 py-1 border border-outline-variant text-[10px] font-bold rounded uppercase text-on-surface-variant">Upcoming</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6">
          <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">campaign</span> Important Announcements
          </h4>
          <div className="space-y-4">
            <div className="flex gap-4 p-3 hover:bg-surface rounded-md transition-colors">
              <div className="text-center bg-surface-container-high px-2 py-1 rounded w-12 h-12 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Oct</span>
                <span className="text-lg font-bold text-primary">24</span>
              </div>
              <div>
                <h5 className="text-sm font-bold text-on-surface">Revised Mid-Term Examination Schedule</h5>
                <p className="text-xs text-on-surface-variant mt-1">Please check the portal for updated dates for CS-402 and MA-105.</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 hover:bg-surface rounded-md transition-colors">
              <div className="text-center bg-surface-container-high px-2 py-1 rounded w-12 h-12 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Oct</span>
                <span className="text-lg font-bold text-primary">21</span>
              </div>
              <div>
                <h5 className="text-sm font-bold text-on-surface">Scholarship Applications Open</h5>
                <p className="text-xs text-on-surface-variant mt-1">Applications for the Merit Scholarship 2024 are now being accepted.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-primary-container text-white rounded-lg p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-sm font-bold mb-2">Hostel Registration</h4>
            <p className="text-xs text-slate-400 mb-6">Complete your mess fee payment for the upcoming month to avoid late charges.</p>
            <button className="bg-secondary text-white text-xs font-bold py-2 px-6 rounded-sm hover:brightness-110 transition-all">Pay Now</button>
          </div>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-white/5 pointer-events-none">payments</span>
        </div>
      </section>
    </div>
  );
}
