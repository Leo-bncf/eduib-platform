import React from 'react';

export default function ConfigSectionCard({ title, description, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description ? <p className="text-xs text-slate-500 mt-1">{description}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}