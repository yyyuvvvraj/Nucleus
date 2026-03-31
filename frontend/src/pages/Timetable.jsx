import React from 'react';

export default function Timetable() {
  return (
    <div className="flex-1 p-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <span className="label-md text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-2 block">Student Schedule</span>
          <h2 className="text-3xl font-bold text-primary tracking-tight font-headline">Weekly Timetable</h2>
          <p className="text-on-surface-variant text-sm mt-1 max-w-md">Your organized academic itinerary for the current semester. All classes are displayed in the local timezone.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:bg-surface-dim">
            <span className="material-symbols-outlined text-sm">download</span>
            Export PDF
          </button>
          <button className="bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">print</span>
            Print View
          </button>
        </div>
      </div>

      {/* Timetable Container */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-none border border-outline-variant/20">
        {/* Days Header */}
        <div className="grid grid-cols-[80px_repeat(6,_1fr)] bg-surface-container-high border-b border-outline-variant/30">
          <div className="border-r border-outline-variant/30 flex items-center justify-center h-12">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">Time</span>
          </div>
          <div className="border-r border-outline-variant/30 flex flex-col items-center justify-center h-12">
            <span className="text-xs font-bold text-primary">MON</span>
          </div>
          <div className="border-r border-outline-variant/30 flex flex-col items-center justify-center h-12">
            <span className="text-xs font-bold text-primary">TUE</span>
          </div>
          <div className="border-r border-outline-variant/30 flex flex-col items-center justify-center h-12">
            <span className="text-xs font-bold text-primary">WED</span>
          </div>
          <div className="border-r border-outline-variant/30 flex flex-col items-center justify-center h-12">
            <span className="text-xs font-bold text-primary">THU</span>
          </div>
          <div className="border-r border-outline-variant/30 flex flex-col items-center justify-center h-12">
            <span className="text-xs font-bold text-primary">FRI</span>
          </div>
          <div className="flex flex-col items-center justify-center h-12">
            <span className="text-xs font-bold text-primary">SAT</span>
          </div>
        </div>

        {/* Timetable Body */}
        {/* 09:00 AM */}
        <div className="grid grid-cols-[80px_repeat(6,_1fr)] border-b border-outline-variant/30">
          <div className="border-r border-outline-variant/30 flex items-center justify-center min-h-[100px]">
            <span className="text-[10px] font-mono font-medium text-on-surface-variant">09:00 AM</span>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]">
            <div className="border-l-2 border-secondary bg-surface p-3 rounded-r h-full">
              <span className="text-[10px] font-mono text-secondary font-bold">CS401</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">Algorithms</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Room 302 • Dr. Rao</p>
            </div>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]">
            <div className="border-l-2 border-on-surface-variant bg-surface p-3 rounded-r h-full">
              <span className="text-[10px] font-mono text-on-surface-variant font-bold">HS102</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">Ethics</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Auditorium B</p>
            </div>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]">
            <div className="border-l-2 border-secondary bg-surface p-3 rounded-r h-full">
              <span className="text-[10px] font-mono text-secondary font-bold">CS401</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">Algorithms</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Room 302</p>
            </div>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]"></div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]">
            <div className="border-l-2 border-secondary bg-surface p-3 rounded-r h-full">
              <span className="text-[10px] font-mono text-secondary font-bold">CS401</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">Algorithms</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Room 302</p>
            </div>
          </div>
          <div className="p-2 min-h-[100px]"></div>
        </div>

        {/* 10:30 AM */}
        <div className="grid grid-cols-[80px_repeat(6,_1fr)] border-b border-outline-variant/30">
          <div className="border-r border-outline-variant/30 flex items-center justify-center min-h-[100px]">
            <span className="text-[10px] font-mono font-medium text-on-surface-variant">10:30 AM</span>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]"></div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]">
            <div className="border-l-2 border-primary bg-surface p-3 rounded-r h-full">
              <span className="text-[10px] font-mono text-primary font-bold">CS450</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">Networks</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Lab 04 • Prof. Gupta</p>
            </div>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]">
            <div className="border-l-2 border-on-surface-variant bg-surface p-3 rounded-r h-full">
              <span className="text-[10px] font-mono text-on-surface-variant font-bold">MA201</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">Calculus III</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Hall 01</p>
            </div>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]">
             <div className="border-l-2 border-primary bg-surface p-3 rounded-r h-full">
              <span className="text-[10px] font-mono text-primary font-bold">CS450</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">Networks</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Lab 04</p>
            </div>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]"></div>
          <div className="p-2 min-h-[100px]">
            <div className="border-l-2 border-on-surface-variant bg-surface p-3 rounded-r h-full opacity-60">
              <span className="text-[10px] font-mono text-on-surface-variant font-bold">EXTRA</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">Seminar</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Virtual</p>
            </div>
          </div>
        </div>

        {/* 12:00 PM - BREAK */}
        <div className="grid grid-cols-[80px_1fr] bg-surface-container-low border-b border-outline-variant/30">
          <div className="flex items-center justify-center h-10 border-r border-outline-variant/30">
            <span className="text-[10px] font-mono font-medium text-on-surface-variant">12:00 PM</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-on-surface-variant/40">Lunch Interval & Campus Transit</span>
          </div>
        </div>

        {/* 01:30 PM */}
        <div className="grid grid-cols-[80px_repeat(6,_1fr)] border-b border-outline-variant/30">
          <div className="border-r border-outline-variant/30 flex items-center justify-center min-h-[100px]">
            <span className="text-[10px] font-mono font-medium text-on-surface-variant">01:30 PM</span>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]">
            <div className="border-l-2 border-on-surface-variant bg-surface p-3 rounded-r h-full">
              <span className="text-[10px] font-mono text-on-surface-variant font-bold">MA201</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">Calculus III</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Hall 01</p>
            </div>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]"></div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]">
            <div className="border-l-2 border-secondary bg-surface p-3 rounded-r h-full">
              <span className="text-[10px] font-mono text-secondary font-bold">CS405</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">AI Ethics</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Room 201</p>
            </div>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]">
            <div className="border-l-2 border-on-surface-variant bg-surface p-3 rounded-r h-full">
              <span className="text-[10px] font-mono text-on-surface-variant font-bold">MA201</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">Calculus III</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Hall 01</p>
            </div>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]">
            <div className="border-l-2 border-primary bg-surface p-3 rounded-r h-full">
              <span className="text-[10px] font-mono text-primary font-bold">CS450</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">Networks</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Lab 04</p>
            </div>
          </div>
          <div className="p-2 min-h-[100px]"></div>
        </div>

        {/* 03:00 PM */}
        <div className="grid grid-cols-[80px_repeat(6,_1fr)]">
          <div className="border-r border-outline-variant/30 flex items-center justify-center min-h-[100px]">
            <span className="text-[10px] font-mono font-medium text-on-surface-variant">03:00 PM</span>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]">
            <div className="border-l-2 border-primary bg-surface p-3 rounded-r h-full">
              <span className="text-[10px] font-mono text-primary font-bold">PE202</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">Sports Elective</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Main Arena</p>
            </div>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]"></div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]"></div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]">
            <div className="border-l-2 border-secondary bg-surface p-3 rounded-r h-full">
              <span className="text-[10px] font-mono text-secondary font-bold">CS405</span>
              <h4 className="text-sm font-bold text-primary leading-tight mt-1">AI Ethics</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Room 201</p>
            </div>
          </div>
          <div className="border-r border-outline-variant/30 p-2 min-h-[100px]"></div>
          <div className="p-2 min-h-[100px]"></div>
        </div>
      </div>

      {/* Bottom Insights Grid */}
      <div className="grid grid-cols-12 gap-8 mt-12">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
          <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">info</span>
            Faculty Announcements
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-outline-variant/20">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-secondary">record_voice_over</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Dr. Rao (Algorithms)</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Monday's lecture shifted to Room 505 for guest presentation.</p>
                <span className="text-[10px] font-mono text-secondary mt-2 block">2 HOURS AGO</span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary">lab_profile</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Prof. Gupta (Networks)</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Lab reports for Experiments 4-6 are due by Friday midnight.</p>
                <span className="text-[10px] font-mono text-secondary mt-2 block">YESTERDAY</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-4 bg-primary text-white p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary-fixed/60 mb-6">Upcoming Class</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary">history_toggle_off</span>
              <span className="text-sm font-mono text-secondary font-bold">Starts in 45m</span>
            </div>
            <h2 className="text-2xl font-bold leading-tight">Advanced Operating Systems</h2>
            <p className="text-primary-fixed/80 text-sm mt-1">Block C, Hall 42 • Prof. Mehta</p>
            <div className="mt-8 flex items-center gap-4">
              <div className="bg-primary-container p-3 rounded-lg border border-white/10">
                <p className="text-[10px] text-primary-fixed/60 uppercase font-bold">Attendance</p>
                <p className="text-xl font-bold">92%</p>
              </div>
              <div className="bg-primary-container p-3 rounded-lg border border-white/10">
                <p className="text-[10px] text-primary-fixed/60 uppercase font-bold">Credits</p>
                <p className="text-xl font-bold">4.0</p>
              </div>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
