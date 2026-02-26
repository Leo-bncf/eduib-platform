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
    <div className="bg-white rounded-lg md:rounded-xl border border-slate-100 p-3 md:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-xl md:text-3xl font-bold text-slate-900 mt-0.5 md:mt-1">{value}</p>
          {trend && <p className="text-xs text-emerald-600 mt-0.5 md:mt-1">{trend}</p>}
        </div>
        <div className={`w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl ${colors[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 md:w-5 h-4 md:h-5" />
        </div>
      </div>
    </div>
  );
}