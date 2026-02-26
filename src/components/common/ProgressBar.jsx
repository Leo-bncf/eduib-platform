/**
 * Reusable progress bar component
 */
import React from 'react';

export default function ProgressBar({
  completed,
  total,
  color = 'indigo',
  showLabel = true,
  className = '',
}) {
  const colors = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    blue: 'bg-blue-600',
  };

  const percentage = (completed / total) * 100;

  return (
    <div className={className}>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`${colors[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-600 mt-1">
          {completed} of {total} complete
        </p>
      )}
    </div>
  );
}