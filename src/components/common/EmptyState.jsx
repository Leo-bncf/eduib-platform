import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && <Icon className="w-12 h-12 text-slate-300 mb-4" />}
      {title && <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>}
      {description && <p className="text-sm text-slate-500 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}