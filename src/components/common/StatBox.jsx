/**
 * Reusable stat box component for dashboards
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function StatBox({
  label,
  value,
  icon: Icon,
  color = 'indigo',
  subtext = null,
  onClick = null,
  className = '',
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs md:text-sm text-slate-600 font-medium">{label}</p>
            <p className="text-xl md:text-3xl font-bold text-slate-900 mt-0.5 md:mt-1">
              {value}
            </p>
            {subtext && (
              <p className="text-xs text-slate-500 mt-0.5 md:mt-1">{subtext}</p>
            )}
          </div>
          {Icon && (
            <div className={`p-2 rounded-lg ${colors[color]} flex-shrink-0`}>
              <Icon className="w-4 md:w-5 h-4 md:h-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}