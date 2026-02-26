import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  active: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Active' },
  inactive: { className: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Inactive' },
  pending: { className: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  completed: { className: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Completed' },
  cancelled: { className: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled' },
  archived: { className: 'bg-slate-100 text-slate-500 border-slate-200', label: 'Archived' },
  draft: { className: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Draft' },
  published: { className: 'bg-green-50 text-green-700 border-green-200', label: 'Published' },
};

export default function StatusBadge({ status, customLabel }) {
  const config = statusConfig[status] || statusConfig.active;
  const label = customLabel || config.label;

  return (
    <Badge variant="outline" className={`${config.className} border text-xs`}>
      {label}
    </Badge>
  );
}