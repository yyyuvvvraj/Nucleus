import React from 'react';

export default function Attendance() {
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
          <p className="text-on-surface-variant mt-1 font-medium">Academic Year 2023-24 • Current Aggregate: <span className="text-secondary">84.2%</span></p>
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
        <div className="col-span-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 flex items-center justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Overall Progress</span>
            <h3 className="text-4xl font-bold text-primary">84.2% <span className="text-sm font-medium text-green-600 ml-2">↑ 2.1% from last month</span></h3>
            <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full w-[84.2%]"></div>
            </div>
          </div>
          <div className="pl-8 border-l border-outline-variant/20">
            <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Requirement</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-error"></div>
              <span className="text-sm font-bold text-primary">75% Threshold</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-2 max-w-[140px]">You need 12 more attendances to maintain 85%.</p>
          </div>
        </div>
        <div className="col-span-4 bg-primary p-6 rounded-xl text-white flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Streak</span>
          <div>
            <p className="text-5xl font-bold">14</p>
            <p className="text-sm text-slate-300 font-medium mt-1">Consecutive Days Present</p>
          </div>
          <div className="flex -space-x-2 mt-4">
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-primary flex items-center justify-center text-[10px] font-bold">M</div>
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-primary flex items-center justify-center text-[10px] font-bold">T</div>
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-primary flex items-center justify-center text-[10px] font-bold">W</div>
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-primary flex items-center justify-center text-[10px] font-bold">T</div>
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-primary flex items-center justify-center text-[10px] font-bold">F</div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subject</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subject Code</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Total Classes</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Attended</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Percentage</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Row 1 */}
            <tr className="hover:bg-surface-container transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-secondary rounded-full"></div>
                  <div>
                    <p className="font-bold text-primary">Advanced Algorithms</p>
                    <p className="text-xs text-on-surface-variant">Prof. Sarah Jenkins</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 font-mono text-xs font-semibold text-on-surface-variant">CS-401</td>
              <td className="px-6 py-5 text-center font-bold text-on-surface">45</td>
              <td className="px-6 py-5 text-center font-bold text-on-surface">42</td>
              <td className="px-6 py-5 w-64">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full w-[93.3%]"></div>
                  </div>
                  <span className="text-xs font-bold text-primary">93.3%</span>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">Excellent</span>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className="hover:bg-surface-container transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-secondary rounded-full"></div>
                  <div>
                    <p className="font-bold text-primary">Database Systems</p>
                    <p className="text-xs text-on-surface-variant">Dr. Michael Chen</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 font-mono text-xs font-semibold text-on-surface-variant">CS-302</td>
              <td className="px-6 py-5 text-center font-bold text-on-surface">38</td>
              <td className="px-6 py-5 text-center font-bold text-on-surface">31</td>
              <td className="px-6 py-5 w-64">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full w-[81.5%]"></div>
                  </div>
                  <span className="text-xs font-bold text-primary">81.5%</span>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded">Good</span>
              </td>
            </tr>
            {/* Row 3 */}
            <tr className="hover:bg-surface-container transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-error rounded-full"></div>
                  <div>
                    <p className="font-bold text-primary">Distributed Computing</p>
                    <p className="text-xs text-on-surface-variant">Prof. Elena Rodriguez</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 font-mono text-xs font-semibold text-on-surface-variant">CS-405</td>
              <td className="px-6 py-5 text-center font-bold text-on-surface">42</td>
              <td className="px-6 py-5 text-center font-bold text-on-surface">29</td>
              <td className="px-6 py-5 w-64">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className="bg-[#2563EB] h-full w-[69.0%]"></div>
                  </div>
                  <span className="text-xs font-bold text-error">69.0%</span>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded">Shortage</span>
              </td>
            </tr>
            {/* Row 4 */}
            <tr className="hover:bg-surface-container transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-secondary rounded-full"></div>
                  <div>
                    <p className="font-bold text-primary">Network Security</p>
                    <p className="text-xs text-on-surface-variant">Dr. Alan Turing</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 font-mono text-xs font-semibold text-on-surface-variant">CS-410</td>
              <td className="px-6 py-5 text-center font-bold text-on-surface">36</td>
              <td className="px-6 py-5 text-center font-bold text-on-surface">32</td>
              <td className="px-6 py-5 w-64">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full w-[88.8%]"></div>
                  </div>
                  <span className="text-xs font-bold text-primary">88.8%</span>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">Excellent</span>
              </td>
            </tr>
            {/* Row 5 */}
            <tr className="hover:bg-surface-container transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-secondary rounded-full"></div>
                  <div>
                    <p className="font-bold text-primary">Machine Learning</p>
                    <p className="text-xs text-on-surface-variant">Dr. Fei-Fei Li</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 font-mono text-xs font-semibold text-on-surface-variant">CS-350</td>
              <td className="px-6 py-5 text-center font-bold text-on-surface">50</td>
              <td className="px-6 py-5 text-center font-bold text-on-surface">44</td>
              <td className="px-6 py-5 w-64">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full w-[88.0%]"></div>
                  </div>
                  <span className="text-xs font-bold text-primary">88.0%</span>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">Excellent</span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div className="bg-surface-container-low px-6 py-3 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Showing 5 of 5 Subjects</p>
          <div className="flex gap-2">
            <button className="p-1 hover:bg-white rounded transition-colors disabled:opacity-30" disabled={true}>
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button className="p-1 hover:bg-white rounded transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Help Note */}
      <div className="mt-10 p-6 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
        <span className="material-symbols-outlined text-blue-600">info</span>
        <div>
          <h4 className="text-sm font-bold text-blue-900">Medical Absence Reporting</h4>
          <p className="text-xs text-blue-800/80 leading-relaxed mt-1">If you have been absent due to medical reasons, please submit your medical certificate within 7 working days to the Academic Affairs office to receive attendance waivers. Late submissions will not be entertained.</p>
        </div>
      </div>
    </div>
  );
}
