import React from 'react';

export default function Hostel() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-8">
        <p className="label-md uppercase text-secondary font-semibold tracking-wider mb-1">Accommodation Services</p>
        <h2 className="text-3xl font-bold text-primary tracking-tight">Hostel Details</h2>
        <p className="text-on-surface-variant mt-2 text-md">Official record of your campus residence and associated services for the Academic Year 2023-24.</p>
      </div>

      {/* Bento Grid Layout for Hostel Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Room Allocation Card */}
        <div className="md:col-span-2 bg-surface-container-lowest rounded-lg border border-outline-variant/20 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-primary">Current Residency</h3>
              <p className="text-sm text-on-surface-variant">Allocated via University Housing Portal</p>
            </div>
            <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full border border-secondary/20">CONFIRMED</span>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-surface-container rounded-lg flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-3xl">door_front</span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Room Number</p>
                <p className="text-2xl font-bold text-primary font-mono tracking-tight">402-B</p>
              </div>
            </div>
            <div className="flex items-center gap-4 border-l border-outline-variant/20 pl-8">
              <div className="h-12 w-12 bg-surface-container rounded-lg flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-3xl">apartment</span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Block / Wing</p>
                <p className="text-2xl font-bold text-primary tracking-tight">Ganga Wing</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-surface rounded-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-primary-container">info</span>
              <span className="text-sm text-on-surface-variant">Check-in: <span className="font-semibold text-on-surface">15th Aug 2023</span></span>
            </div>
            <button className="text-secondary text-sm font-semibold hover:underline">View Policy</button>
          </div>
        </div>

        {/* Fees Card */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 p-6 flex flex-col relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-primary">Annual Fees</h3>
            <p className="text-sm text-on-surface-variant">Academic Cycle 2023-24</p>
          </div>
          <div className="my-auto">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter mb-1">Total Outstanding</p>
            <p className="text-4xl font-bold text-primary tracking-tighter">₹ 1,25,000</p>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Hostel Rent</span>
              <span className="font-medium">₹ 85,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Mess Charges</span>
              <span className="font-medium">₹ 40,000</span>
            </div>
            <div className="pt-3 border-t border-outline-variant/20">
              <button className="w-full bg-secondary text-white py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">Pay Now</button>
            </div>
          </div>
        </div>

        {/* Roommate Details */}
        <div className="md:col-span-3 bg-surface-container-lowest rounded-lg border border-outline-variant/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-high flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Roommate Directory</h3>
            <span className="text-xs text-on-surface-variant">Shared Occupancy: 3 Total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-on-surface-variant">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Program</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Emergency Contact</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                <tr>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary-container text-[10px] flex items-center justify-center text-white font-bold">RK</div>
                      <span className="text-sm font-semibold text-primary">Rohan Kapoor</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-on-surface-variant">2021BTCS012</td>
                  <td className="px-6 py-4 text-sm text-on-surface">B.Tech CSE</td>
                  <td className="px-6 py-4 text-sm text-on-surface">+91 98765 43210</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-secondary text-xs font-bold hover:underline">Message</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-500 text-[10px] flex items-center justify-center text-white font-bold">SM</div>
                      <span className="text-sm font-semibold text-primary">Siddharth Mehta</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-on-surface-variant">2021BTEC088</td>
                  <td className="px-6 py-4 text-sm text-on-surface">B.Tech ECE</td>
                  <td className="px-6 py-4 text-sm text-on-surface">+91 91234 56789</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-secondary text-xs font-bold hover:underline">Message</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Secondary Info Cards */}
        <div className="bg-white p-6 rounded-lg border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-on-surface-variant">verified_user</span>
            <h4 className="text-sm font-bold text-primary uppercase tracking-tight">Warden Information</h4>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase">Main Warden</p>
              <p className="text-sm font-semibold text-primary">Dr. Rajesh Khanna</p>
              <p className="text-xs text-on-surface-variant">Office: Block A, Ground Floor</p>
            </div>
            <div className="pt-3 border-t border-outline-variant/10">
              <button className="flex items-center gap-2 text-secondary text-sm font-bold">
                <span className="material-symbols-outlined text-sm">call</span>
                +91 011-2345-678
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-on-surface-variant">cleaning_services</span>
            <h4 className="text-sm font-bold text-primary uppercase tracking-tight">Facility Services</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">Room Cleaning</span>
              <span className="text-xs font-bold text-secondary">MON, WED, FRI</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">Laundry Pickup</span>
              <span className="text-xs font-bold text-secondary">TUE, SAT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">Wi-Fi Status</span>
              <span className="text-xs font-bold text-green-600">ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-on-surface-variant">event_note</span>
            <h4 className="text-sm font-bold text-primary uppercase tracking-tight">Upcoming Inspections</h4>
          </div>
          <div className="flex items-start gap-3 bg-surface-container-low p-3 rounded-md">
            <div className="text-center bg-white px-2 py-1 rounded border border-outline-variant/20">
              <p className="text-[8px] font-bold text-on-surface-variant uppercase">Nov</p>
              <p className="text-sm font-bold text-primary">24</p>
            </div>
            <div>
              <p className="text-xs font-bold text-primary">Fire Safety Audit</p>
              <p className="text-[10px] text-on-surface-variant">Mandatory Room Presence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
