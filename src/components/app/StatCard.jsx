import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = 'indigo', trend }) {
  const colors = {
    indigo: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    rose: 'bg-rose-600',
    violet: 'bg-violet-600',
    blue: 'bg-blue-600',
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-md p-5 md:p-6 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs md:text-sm text-slate-300 font-bold uppercase tracking-wider">{label}</p>
        <div className={`w-9 h-9 ${colors[color]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div>
        <p className="text-3xl md:text-4xl font-black text-white">{value}</p>
        {trend && <p className="text-xs font-semibold text-emerald-400 mt-2">{trend}</p>}
      </div>
    </div>
  );
}