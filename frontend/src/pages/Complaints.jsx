import React from 'react';

export default function Complaints() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      {/* Page Heading Section */}
      <header className="flex flex-col gap-1">
        <span className="text-on-surface-variant label-md uppercase tracking-[0.1em] font-semibold text-xs">Support & Grievances</span>
        <h2 className="text-4xl font-bold text-primary tracking-tight">Complaints</h2>
        <p className="text-on-surface-variant text-sm mt-2 max-w-2xl leading-relaxed">
          Submit your concerns regarding academic, hostel, or campus facilities. Our administrative team will review and respond to your ticket within 24-48 business hours.
        </p>
      </header>
      
      {/* Asymmetric Bento Grid Layout for Form and Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Complaint Form Section */}
        <section className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/20">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">edit_note</span>
            New Formal Complaint
          </h3>
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface">Complaint Subject</label>
              <input className="w-full bg-white border border-outline-variant rounded-sm px-4 py-3 text-sm focus:border-2 focus:border-secondary focus:ring-0 transition-all outline-none" placeholder="Brief title of the issue (e.g., Hostel WiFi connectivity)" type="text" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface">Category</label>
                <select className="w-full bg-white border border-outline-variant rounded-sm px-4 py-3 text-sm focus:border-2 focus:border-secondary focus:ring-0 transition-all outline-none">
                  <option>Academic Affairs</option>
                  <option>Hostel / Accommodation</option>
                  <option>Financial / Fees</option>
                  <option>Campus Facilities</option>
                  <option>Technical Support</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface">Urgency Level</label>
                <select className="w-full bg-white border border-outline-variant rounded-sm px-4 py-3 text-sm focus:border-2 focus:border-secondary focus:ring-0 transition-all outline-none">
                  <option>Standard</option>
                  <option>Urgent</option>
                  <option>Immediate Attention Required</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface">Detailed Description</label>
              <textarea className="w-full bg-white border border-outline-variant rounded-sm px-4 py-3 text-sm focus:border-2 focus:border-secondary focus:ring-0 transition-all outline-none resize-none" placeholder="Please provide specific details including dates, locations, and any previous attempts to resolve the issue." rows="5"></textarea>
            </div>
            <div className="flex justify-end items-center gap-4 pt-2">
              <button className="px-6 py-2.5 text-sm font-semibold text-on-surface bg-surface-container-highest rounded-lg transition-all hover:bg-surface-dim" type="button">Save Draft</button>
              <button className="px-8 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all" type="submit">Submit Complaint</button>
            </div>
          </form>
        </section>

        {/* Information/Support Sidebar */}
        <aside className="space-y-6">
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[2px] h-full bg-secondary"></div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Grievance Protocol</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">check_circle</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">Ensure all details are accurate before submission to avoid delays.</p>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">check_circle</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">Reference IDs are generated immediately upon submission.</p>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">check_circle</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">Direct escalation is available if no response after 72 hours.</p>
              </li>
            </ul>
          </div>
          <div className="bg-primary text-white rounded-xl p-6 relative overflow-hidden">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary-fixed mb-4">Emergency Contact</h4>
            <div className="flex items-center gap-4 mb-2">
              <span className="material-symbols-outlined text-primary-fixed">phone_in_talk</span>
              <span className="font-mono text-lg font-bold">+91 1800 456 789</span>
            </div>
            <p className="text-[10px] text-primary-fixed-dim leading-relaxed italic">For immediate security or health emergencies on campus, call the 24/7 helpline.</p>
          </div>
        </aside>
      </div>

      {/* Previous Complaints Table Section */}
      <section className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/20">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Previous Complaints</h3>
            <p className="text-xs text-on-surface-variant mt-1">History of all tickets submitted in the current academic cycle.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 border border-outline-variant rounded-md text-xs font-semibold hover:bg-surface-container transition-colors">Export PDF</button>
            <button className="px-4 py-1.5 border border-outline-variant rounded-md text-xs font-semibold hover:bg-surface-container transition-colors">Filter Status</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-high">
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Reference ID</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subject</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Department</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {/* Row 1 */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-8 py-5 font-mono text-xs text-secondary font-semibold">#NUC-88291</td>
                <td className="px-8 py-5 text-sm text-on-surface">Oct 12, 2023</td>
                <td className="px-8 py-5">
                  <div className="text-sm font-medium text-on-surface">Slow WiFi in Block B Library</div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">Reported: 09:45 AM</div>
                </td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">IT Support</td>
                <td className="px-8 py-5 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-tighter">Resolved</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-on-surface-variant hover:text-secondary p-1">
                    <span className="material-symbols-outlined text-xl">visibility</span>
                  </button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-8 py-5 font-mono text-xs text-secondary font-semibold">#NUC-88304</td>
                <td className="px-8 py-5 text-sm text-on-surface">Oct 24, 2023</td>
                <td className="px-8 py-5">
                  <div className="text-sm font-medium text-on-surface">Water leakage in Room 402, Hostel A</div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">Reported: 02:15 PM</div>
                </td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">Maintenance</td>
                <td className="px-8 py-5 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 uppercase tracking-tighter">Pending</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-on-surface-variant hover:text-secondary p-1">
                    <span className="material-symbols-outlined text-xl">visibility</span>
                  </button>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-8 py-5 font-mono text-xs text-secondary font-semibold">#NUC-88312</td>
                <td className="px-8 py-5 text-sm text-on-surface">Oct 26, 2023</td>
                <td className="px-8 py-5">
                  <div className="text-sm font-medium text-on-surface">Incorrect grade entry for CS302</div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">Reported: 11:30 AM</div>
                </td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">Exam Cell</td>
                <td className="px-8 py-5 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 uppercase tracking-tighter">Pending</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-on-surface-variant hover:text-secondary p-1">
                    <span className="material-symbols-outlined text-xl">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Table Footer/Pagination */}
        <div className="px-8 py-4 bg-surface-container-low flex items-center justify-between">
          <p className="text-xs text-on-surface-variant">Showing <span className="font-bold text-on-surface">1-3</span> of 12 complaints</p>
          <div className="flex gap-1">
            <button className="p-1 border border-outline-variant rounded-md hover:bg-white disabled:opacity-30" disabled={true}>
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button className="p-1 border border-outline-variant rounded-md hover:bg-white">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
