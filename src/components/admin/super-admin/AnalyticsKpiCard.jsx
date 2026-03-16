import React from 'react';

export default function AnalyticsKpiCard({ title, value, description, icon: Icon, iconClassName = 'text-slate-500' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{title}</span>
        {Icon ? <Icon className={`w-4 h-4 ${iconClassName}`} /> : null}
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {description ? <p className="text-slate-500 text-xs mt-1">{description}</p> : null}
    </div>
  );
}