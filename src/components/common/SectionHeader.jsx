/**
 * Reusable section header component
 */
import React from 'react';

export default function SectionHeader({
  title,
  description = null,
  action = null,
  divider = true,
}) {
  return (
    <div className={`mb-4 md:mb-6 ${divider ? 'pb-4 md:pb-6 border-b border-slate-200' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">{title}</h2>
          {description && (
            <p className="text-xs md:text-sm text-slate-600 mt-1">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}