import React from 'react';

export default function MessMenu() {
  return (
    <div className="p-8 min-h-screen bg-surface animate-in fade-in duration-500">
      {/* Header Section */}
      <section className="mb-10 flex justify-between items-end">
        <div>
          <span className="label-md uppercase font-semibold tracking-widest text-secondary text-xs mb-2 block">Student Dining Portal</span>
          <h2 className="text-[1.75rem] font-semibold text-primary leading-tight">Mess Menu</h2>
          <p className="text-on-surface-variant text-sm mt-1 max-w-lg">Weekly nutritional schedule for North and South Wings. Valid from Sept 16 - Sept 22.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg font-medium text-sm transition-all hover:bg-slate-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">download</span> PDF Export
          </button>
          <button className="bg-secondary text-on-secondary px-4 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-90 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">event_repeat</span> View Future
          </button>
        </div>
      </section>

      {/* Current Day Highlight - Bento Feature */}
      <section className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-outline-variant/20 overflow-hidden flex">
          <div className="w-2 bg-secondary h-full"></div> {/* Status Pillar */}
          <div className="p-6 flex-1 flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="bg-surface-container-low p-4 rounded-lg text-center min-w-[100px]">
                <p className="text-xs font-bold uppercase text-secondary tracking-tighter">Today</p>
                <p className="text-3xl font-bold text-primary">18</p>
                <p className="text-sm font-medium text-on-surface-variant">Wednesday</p>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Venue Status</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-medium">Main Hall Open</span>
                </div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">breakfast_dining</span> Breakfast
                </h4>
                <p className="text-sm font-semibold text-primary">Idli Sambhar & Vada</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">Filter Coffee, Milk, Fresh Banana, Masala Omelet</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">lunch_dining</span> Lunch
                </h4>
                <p className="text-sm font-semibold text-primary">Paneer Butter Masala</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">Jeera Rice, Butter Roti, Dal Tadka, Boondi Raita, Salad</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">dinner_dining</span> Dinner
                </h4>
                <p className="text-sm font-semibold text-primary">Mutton Curry / Mix Veg</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">Tandoori Roti, Steam Rice, Gulab Jamun, Papad</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-4 bg-primary text-white rounded-xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-1">Chef's Special</h3>
            <p className="text-blue-200 text-xs mb-4">Upcoming on Friday Night</p>
            <div className="flex items-center gap-4 mb-4">
              <img alt="Chef Special Dish" className="w-20 h-20 rounded-lg object-[cover_center] border-2 border-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSnRfrX6rD72-B7r4Lp-JZJ8bpEWIsmBOL8nI5o3gy8O8HTs8dGdiDgeEfOYdhDMumfGZMJFs8lpHFXFeKjdLYndnqW8FLlEwcHdLKAXlftYPj6F-ZBvR9qL3UxvSdgJA_-SZHQXXHjDYAe3jxmabiokrCrfp3bsCs-6Juhgb9hNEXxT-ouVnM2OBYWzyOC_jn69GUf0fE8MFpSq5mUIW4QdytxPafEghmJ8S_PbzGc4diWkBhgYvT9w-GHo5AEtyLFpQY3k2FveX6" />
              <div>
                <p className="text-sm font-bold">Classic Lasagna</p>
                <p className="text-xs text-slate-300">Handcrafted pasta with slow-cooked ragu</p>
              </div>
            </div>
            <button className="w-full bg-white/10 hover:bg-white/20 transition-all py-2 rounded-md text-xs font-bold uppercase tracking-widest">Rate Last Meal</button>
          </div>
          {/* Abstract Design Element */}
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
          </div>
        </div>
      </section>

      {/* Weekly Grid Layout */}
      <div className="space-y-4">
        {/* Table Header */}
        <div className="bg-surface-container-high rounded-t-lg flex px-6 py-3">
          <div className="w-32 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Day / Date</div>
          <div className="flex-1 grid grid-cols-3 gap-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Breakfast (07:30 - 09:00)</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Lunch (12:30 - 14:00)</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Dinner (19:30 - 21:00)</div>
          </div>
        </div>
        
        {/* Sunday */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex px-6 py-5 transition-all hover:bg-slate-50 group">
          <div className="w-32 flex flex-col justify-center">
            <span className="text-sm font-bold text-primary">Sunday</span>
            <span className="text-xs font-mono text-slate-400">Sept 15</span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-6">
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Aloo Paratha</span>
              <span className="text-on-surface-variant">Curd, Pickle, Tea, Milk, Sprouted Grains</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Veg Biryani</span>
              <span className="text-on-surface-variant">Salad, Onion Raita, Salan, Roasted Papad</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Chole Bhature</span>
              <span className="text-on-surface-variant">Sweet Lassi, Pickle, Onion Rings, Custard</span>
            </div>
          </div>
        </div>
        
        {/* Monday */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex px-6 py-5 transition-all hover:bg-slate-50 group">
          <div className="w-32 flex flex-col justify-center">
            <span className="text-sm font-bold text-primary">Monday</span>
            <span className="text-xs font-mono text-slate-400">Sept 16</span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-6">
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Poha & Jalebi</span>
              <span className="text-on-surface-variant">Seo, Tea, Coffee, Milk, Hard Boiled Egg</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Rajma Chawal</span>
              <span className="text-on-surface-variant">Plain Rice, Roti, Seasonal Veg, Salad</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Dal Makhani</span>
              <span className="text-on-surface-variant">Tandoori Roti, Mix Veg Sabzi, Rice, Halwa</span>
            </div>
          </div>
        </div>
        
        {/* Tuesday */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex px-6 py-5 transition-all hover:bg-slate-50 group">
          <div className="w-32 flex flex-col justify-center">
            <span className="text-sm font-bold text-primary">Tuesday</span>
            <span className="text-xs font-mono text-slate-400">Sept 17</span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-6">
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Bread Omlette</span>
              <span className="text-on-surface-variant">Butter, Jam, Tea, Milk, Seasonal Fruit</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Kadahi Paneer</span>
              <span className="text-on-surface-variant">Butter Roti, Fried Rice, Dal Fry, Raita</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Chicken Roast / Veg Cutlet</span>
              <span className="text-on-surface-variant">Phulka, Khichdi, Salad, Ice Cream</span>
            </div>
          </div>
        </div>

        {/* Wednesday (Selected Highlight) */}
        <div className="bg-blue-50/30 rounded-lg border border-secondary/30 flex px-6 py-5 ring-1 ring-secondary/20">
          <div className="w-32 flex flex-col justify-center">
            <span className="text-sm font-bold text-secondary">Wednesday</span>
            <span className="text-xs font-mono text-secondary/60">Sept 18</span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-6">
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-primary mb-1">Idli Sambhar</span>
              <span className="text-on-surface-variant">Coconut Chutney, Vada, Milk, Coffee</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-primary mb-1">Paneer Butter Masala</span>
              <span className="text-on-surface-variant">Jeera Rice, Butter Roti, Dal Tadka</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-primary mb-1">Mutton / Mix Veg</span>
              <span className="text-on-surface-variant">Tandoori Roti, Steam Rice, Gulab Jamun</span>
            </div>
          </div>
        </div>

        {/* Thursday */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex px-6 py-5 transition-all hover:bg-slate-50 group">
          <div className="w-32 flex flex-col justify-center">
            <span className="text-sm font-bold text-primary">Thursday</span>
            <span className="text-xs font-mono text-slate-400">Sept 19</span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-6">
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Uttapam</span>
              <span className="text-on-surface-variant">Sambhar, Tea, Milk, Cornflakes</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Bhindi Masala</span>
              <span className="text-on-surface-variant">Arhar Dal, Plain Rice, Roti, Buttermilk</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Egg Curry / Shahi Paneer</span>
              <span className="text-on-surface-variant">Roti, Rice, Veg Salad, Kheer</span>
            </div>
          </div>
        </div>

        {/* Friday */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex px-6 py-5 transition-all hover:bg-slate-50 group">
          <div className="w-32 flex flex-col justify-center">
            <span className="text-sm font-bold text-primary">Friday</span>
            <span className="text-xs font-mono text-slate-400">Sept 20</span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-6">
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Puri Bhaji</span>
              <span className="text-on-surface-variant">Tea, Coffee, Milk, Banana</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Mix Veg</span>
              <span className="text-on-surface-variant">Dal Fry, Rice, Roti, Salad, Curd</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Lasagna (Special)</span>
              <span className="text-on-surface-variant">Garlic Bread, Herb Rice, Soft Drink</span>
            </div>
          </div>
        </div>
        
        {/* Saturday */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex px-6 py-5 transition-all hover:bg-slate-50 group">
          <div className="w-32 flex flex-col justify-center">
            <span className="text-sm font-bold text-primary">Saturday</span>
            <span className="text-xs font-mono text-slate-400">Sept 21</span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-6">
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Upma</span>
              <span className="text-on-surface-variant">Peanut Chutney, Tea, Milk, Boiled Egg</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Aloo Matar</span>
              <span className="text-on-surface-variant">Dal Tadka, Rice, Roti, Fruit Salad</span>
            </div>
            <div className="text-xs leading-relaxed">
              <span className="block font-semibold text-on-surface mb-1">Pav Bhaji</span>
              <span className="text-on-surface-variant">Extra Pav, Butter, Onion, Moong Dal Halwa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        <div className="bg-surface-container p-6 rounded-lg border border-outline-variant/10">
          <h5 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-4">Timings Disclaimer</h5>
          <p className="text-xs text-on-surface-variant leading-relaxed">Entry is permitted up to 15 minutes before the end of each session. Please carry your University ID card for biometric validation at the gate.</p>
        </div>
        <div className="bg-surface-container p-6 rounded-lg border border-outline-variant/10">
          <h5 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-4">Nutritional Focus</h5>
          <p className="text-xs text-on-surface-variant leading-relaxed">All meals are prepared with 100% sunflower oil. Low sodium options are available at Counter 4. High protein diet (extra eggs/milk) requires pre-registration.</p>
        </div>
        <div className="bg-surface-container p-6 rounded-lg border border-outline-variant/10">
          <h5 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-4">Contact Mess Manager</h5>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">support_agent</span>
            </div>
            <div className="text-xs">
              <p className="font-bold text-primary">Mr. R. K. Sharma</p>
              <p className="text-on-surface-variant">Ext: 4055 | mess@nucleus.univ</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
