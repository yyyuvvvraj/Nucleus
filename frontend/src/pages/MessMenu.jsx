import React, { useState, useEffect } from 'react';
import { Utensils, Download, Repeat, Salad, Coffee, ChefHat } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function MessMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nucleusToken');
    fetch(`${API_BASE_URL}/api/admin/mess-menu`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setMenu(data);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sortedMenu = menu.sort((a,b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayMenu = sortedMenu.find(m => m.day === today) || sortedMenu[0];

  if (loading) return <div className="p-8 text-center animate-pulse">Fetching Current Menu...</div>;

  return (
    <div className="p-8 min-h-screen bg-surface animate-fade-in">
      <section className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="label-md uppercase font-bold tracking-[0.2em] text-secondary text-xs mb-2 block">Student Dining Portal</span>
          <h2 className="text-4xl font-bold text-primary tracking-tight">Mess Menu</h2>
          <p className="text-on-surface-variant mt-1 max-w-lg">Weekly nutritional schedule for campus dinning halls.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-xl font-bold text-xs transition-all hover:bg-slate-200 flex items-center gap-2">
            <Download size={14} /> EXPORT
          </button>
        </div>
      </section>

      {todayMenu && (
        <section className="grid grid-cols-12 gap-8 mb-12">
          <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border border-outline-variant/20 overflow-hidden flex shadow-sm">
            <div className="w-3 bg-secondary h-full"></div>
            <div className="p-8 flex-1 flex flex-col md:flex-row gap-10">
              <div className="flex-shrink-0 text-center px-4">
                <p className="text-[10px] font-black uppercase text-secondary tracking-widest mb-1">Current Day</p>
                <p className="text-5xl font-black text-primary">{new Date().getDate()}</p>
                <p className="text-sm font-bold text-on-surface-variant uppercase mt-1">{today}</p>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Utensils size={14} /> Breakfast
                  </h4>
                  <p className="text-sm font-bold text-primary leading-relaxed">{todayMenu.breakfast}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Utensils size={14} /> Lunch
                  </h4>
                  <p className="text-sm font-bold text-primary leading-relaxed">{todayMenu.lunch}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Utensils size={14} /> Dinner
                  </h4>
                  <p className="text-sm font-bold text-primary leading-relaxed">{todayMenu.dinner}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-4 bg-primary text-white rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-primary/20">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ChefHat size={20} className="text-blue-200" />
                  <h3 className="text-lg font-black uppercase tracking-tighter">Chef's Special</h3>
                </div>
                <p className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest mb-6">Today's Highlight</p>
                <p className="text-2xl font-bold mb-2 leading-tight">{todayMenu.special || 'Daily Classics'}</p>
              </div>
              <button className="w-full bg-white/10 hover:bg-white/20 transition-all py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/10">Rate This Meal</button>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-10">
               <ChefHat size={180} />
            </div>
          </div>
        </section>
      )}

      {/* Weekly Grid */}
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Full Weekly Schedule</h3>
      <div className="space-y-4">
        {sortedMenu.map(item => (
          <div key={item._id} className={`bg-white rounded-2xl border ${item.day === today ? 'border-secondary ring-1 ring-secondary/20' : 'border-outline-variant/20'} p-6 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="w-28 flex flex-col items-center md:items-start">
               <span className={`text-sm font-black ${item.day === today ? 'text-secondary' : 'text-primary uppercase'}`}>{item.day}</span>
               {item.day === today && <span className="bg-secondary/10 text-secondary text-[8px] font-bold px-2 py-0.5 rounded-full mt-1">TODAY</span>}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
               <p className="text-xs font-medium text-on-surface-variant"><span className="font-bold text-on-surface block text-[10px] uppercase mb-1">Breakfast</span> {item.breakfast}</p>
               <p className="text-xs font-medium text-on-surface-variant"><span className="font-bold text-on-surface block text-[10px] uppercase mb-1">Lunch</span> {item.lunch}</p>
               <p className="text-xs font-medium text-on-surface-variant"><span className="font-bold text-on-surface block text-[10px] uppercase mb-1">Dinner</span> {item.dinner}</p>
            </div>
          </div>
        ))}
        {menu.length === 0 && <div className="p-12 text-center text-on-surface-variant italic border border-dashed rounded-3xl">No menu data uploaded to server.</div>}
      </div>
    </div>
  );
}
