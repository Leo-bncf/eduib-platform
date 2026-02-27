import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = 'indigo', trend }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4 md:p-5 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs md:text-sm text-slate-600 font-semibold uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-md ${colors[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl md:text-3xl font-bold text-slate-900">{value}</p>
        {trend && <p className="text-xs font-medium text-emerald-600 mt-1">{trend}</p>}
      </div>
    </div>
  );
}