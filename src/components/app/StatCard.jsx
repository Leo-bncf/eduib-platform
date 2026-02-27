import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = 'indigo', trend }) {
  const colors = {
    indigo: 'bg-blue-600 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-600 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-600 text-amber-600 border-amber-200',
    rose: 'bg-rose-600 text-rose-600 border-rose-200',
    violet: 'bg-violet-600 text-violet-600 border-violet-200',
    blue: 'bg-blue-600 text-blue-600 border-blue-200',
  };

  const [bgClass, textClass, borderClass] = colors[color].split(' ');

  return (
    <div className={`bg-white border-l-[3px] ${borderClass} border-y border-r border-slate-200 shadow-sm hover:shadow-md transition-all p-5 md:p-6`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={`w-10 h-10 ${bgClass} rounded flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div>
        <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{value}</p>
        {trend && <p className="text-xs font-semibold text-emerald-600 mt-2">{trend}</p>}
      </div>
    </div>
  );
}