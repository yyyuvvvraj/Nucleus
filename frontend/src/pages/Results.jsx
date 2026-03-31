import React from 'react';

export default function Results() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      {/* Page Header */}
      <header className="mb-10 flex flex-col gap-1">
        <span className="text-secondary label-md uppercase tracking-[0.2em] font-semibold text-[10px]">Academic Performance</span>
        <h2 className="text-4xl font-black text-primary tracking-tight font-headline">Semester Results</h2>
        <p className="text-on-surface-variant text-sm mt-2 max-w-2xl leading-relaxed font-body">
          Comprehensive overview of your grades, SGPA, and cumulative progress for B.Tech Computer Science Engineering.
        </p>
      </header>

      {/* Action Bar & Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-none">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Select Semester</label>
          <select className="bg-surface-container text-primary font-bold px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-secondary text-sm">
            <option>Semester 6 (Current)</option>
            <option>Semester 5</option>
            <option>Semester 4</option>
            <option>Semester 3</option>
          </select>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none border border-outline-variant bg-transparent text-primary hover:bg-surface-container px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span> Transcript
          </button>
          <button className="flex-1 md:flex-none bg-secondary text-white hover:brightness-110 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm shadow-secondary/20">
            <span className="material-symbols-outlined text-sm">share</span> Share Link
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-primary p-6 rounded-2xl relative overflow-hidden group shadow-md shadow-primary/10">
          <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-6xl text-white">workspace_premium</span>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-fixed-dim/80 mb-2">Semester Grade Point</p>
            <h3 className="text-5xl font-black text-white tracking-tighter">8.84<span className="text-lg font-medium text-white/60 ml-1">/ 10</span></h3>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
              <span className="material-symbols-outlined text-[10px] text-green-300">trending_up</span>
              <span className="text-[10px] font-bold text-green-100">+0.42 from Sem 5</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-on-surface-variant mb-2">Cumulative (CGPA)</p>
            <h3 className="text-4xl font-bold text-primary tracking-tighter">8.62<span className="text-sm font-medium text-on-surface-variant ml-1">/ 10</span></h3>
          </div>
          <div className="mt-6 w-full bg-surface-container h-2 rounded-full overflow-hidden">
             <div className="bg-secondary h-full rounded-full w-[86.2%] rounded-r-none"></div>
          </div>
          <p className="text-[10px] font-semibold text-on-surface-variant mt-2 text-right">Top 15% of Batch</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 flex flex-col justify-between">
           <div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-on-surface-variant mb-2">Total Credits</p>
            <h3 className="text-4xl font-bold text-primary tracking-tighter">134<span className="text-sm font-medium text-on-surface-variant ml-1">Earned</span></h3>
          </div>
          <div className="flex gap-4 mt-6">
            <div>
              <p className="text-[10px] uppercase font-bold text-secondary">Sem 6</p>
              <p className="text-lg font-bold text-primary">24.0</p>
            </div>
            <div className="w-px bg-outline-variant/20"></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">Required</p>
              <p className="text-lg font-bold text-primary">160</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Grades Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-outline-variant/10 bg-surface/30">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Course Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/10">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant w-16">Code</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Course Title</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center w-24">Credits</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center w-24">Grade</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center w-24">Points</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right w-32">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              <tr className="hover:bg-surface-container-lowest/80 transition-colors">
                <td className="px-6 py-5 font-mono text-xs font-semibold text-secondary">CS601</td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-primary">Artificial Intelligence</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Core Theory</p>
                </td>
                <td className="px-6 py-5 text-center text-sm font-bold text-on-surface">4.0</td>
                <td className="px-6 py-5 text-center">
                  <div className="inline-flex w-8 h-8 rounded-lg bg-green-50 text-green-700 items-center justify-center font-bold text-sm border border-green-200">A+</div>
                </td>
                <td className="px-6 py-5 text-center font-mono text-sm font-semibold text-primary">10.0</td>
                <td className="px-6 py-5 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded">Pass</span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-lowest/80 transition-colors">
                <td className="px-6 py-5 font-mono text-xs font-semibold text-secondary">CS602</td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-primary">Compiler Design</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Core Theory</p>
                </td>
                <td className="px-6 py-5 text-center text-sm font-bold text-on-surface">4.0</td>
                <td className="px-6 py-5 text-center">
                  <div className="inline-flex w-8 h-8 rounded-lg bg-blue-50 text-blue-700 items-center justify-center font-bold text-sm border border-blue-200">A</div>
                </td>
                <td className="px-6 py-5 text-center font-mono text-sm font-semibold text-primary">9.0</td>
                <td className="px-6 py-5 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded">Pass</span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-lowest/80 transition-colors">
                <td className="px-6 py-5 font-mono text-xs font-semibold text-secondary">CS603</td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-primary">Computer Networks Security</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Core Theory</p>
                </td>
                <td className="px-6 py-5 text-center text-sm font-bold text-on-surface">3.0</td>
                <td className="px-6 py-5 text-center">
                  <div className="inline-flex w-8 h-8 rounded-lg bg-orange-50 text-orange-700 items-center justify-center font-bold text-sm border border-orange-200">B+</div>
                </td>
                <td className="px-6 py-5 text-center font-mono text-sm font-semibold text-primary">8.0</td>
                <td className="px-6 py-5 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded">Pass</span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-lowest/80 transition-colors">
                <td className="px-6 py-5 font-mono text-xs font-semibold text-secondary">CS651</td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-primary">AI Lab</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Practical</p>
                </td>
                <td className="px-6 py-5 text-center text-sm font-bold text-on-surface">1.5</td>
                <td className="px-6 py-5 text-center">
                  <div className="inline-flex w-8 h-8 rounded-lg bg-green-50 text-green-700 items-center justify-center font-bold text-sm border border-green-200">A+</div>
                </td>
                <td className="px-6 py-5 text-center font-mono text-sm font-semibold text-primary">10.0</td>
                <td className="px-6 py-5 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded">Pass</span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-lowest/80 transition-colors">
                <td className="px-6 py-5 font-mono text-xs font-semibold text-secondary">HU601</td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-primary">Engineering Economics</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Humanities Elective</p>
                </td>
                <td className="px-6 py-5 text-center text-sm font-bold text-on-surface">3.0</td>
                <td className="px-6 py-5 text-center">
                  <div className="inline-flex w-8 h-8 rounded-lg bg-blue-50 text-blue-700 items-center justify-center font-bold text-sm border border-blue-200">A</div>
                </td>
                <td className="px-6 py-5 text-center font-mono text-sm font-semibold text-primary">9.0</td>
                <td className="px-6 py-5 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded">Pass</span>
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-surface/50 border-t border-outline-variant/20">
              <tr>
                <td colSpan="2" className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface text-right pr-8">Semester Totals:</td>
                <td className="px-6 py-4 text-center font-black text-primary">15.5</td>
                <td className="px-6 py-4 text-center"></td>
                <td className="px-6 py-4 text-center text-sm font-black text-primary">137.0</td>
                <td className="px-6 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mt-8 flex gap-2 justify-center">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          <span className="material-symbols-outlined text-[14px]">verified</span> Officially verified by University Examination Cell
        </span>
      </div>
    </div>
  );
}
