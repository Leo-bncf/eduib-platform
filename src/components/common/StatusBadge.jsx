import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusStyles = {
  // General statuses
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-slate-100 text-slate-700 border-slate-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  suspended: 'bg-red-100 text-red-700 border-red-200',
  archived: 'bg-slate-100 text-slate-600 border-slate-200',
  
  // Assignment/Task statuses
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  published: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
  
  // Submission statuses
  submitted: 'bg-blue-100 text-blue-700 border-blue-200',
  graded: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  late: 'bg-amber-100 text-amber-700 border-amber-200',
  returned: 'bg-purple-100 text-purple-700 border-purple-200',
  
  // Attendance statuses
  present: 'bg-green-100 text-green-700 border-green-200',
  absent: 'bg-red-100 text-red-700 border-red-200',
  excused: 'bg-blue-100 text-blue-700 border-blue-200',
  
  // Approval statuses
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  needs_revision: 'bg-amber-100 text-amber-700 border-amber-200',
  reviewed: 'bg-purple-100 text-purple-700 border-purple-200',
  
  // CAS statuses
  planned: 'bg-blue-100 text-blue-700 border-blue-200',
  ongoing: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
};

export default function StatusBadge({ status, className = '' }) {
  const style = statusStyles[status] || statusStyles.inactive;
  const label = status?.replace(/_/g, ' ');
  
  return (
    <Badge variant="outline" className={`${style} ${className} capitalize`}>
      {label}
    </Badge>
  );
}