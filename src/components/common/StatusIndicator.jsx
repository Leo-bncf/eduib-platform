/**
 * Reusable status indicator with color coding
 */
import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusColors = {
  active: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-slate-100 text-slate-800',
  pending: 'bg-amber-100 text-amber-800',
  draft: 'bg-slate-100 text-slate-800',
  published: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  suspended: 'bg-red-100 text-red-800',
  trial: 'bg-blue-100 text-blue-800',
  overdue: 'bg-orange-100 text-orange-800',
};

export default function StatusIndicator({
  status,
  label = null,
  size = 'sm',
}) {
  const color = statusColors[status] || 'bg-slate-100 text-slate-800';
  const display = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge className={`${color} text-${size === 'sm' ? 'xs' : 'sm'}`}>
      {display}
    </Badge>
  );
}