import React from 'react';
import { AlertCircle, FileText, Users, BookOpen } from 'lucide-react';

const iconMap = {
  assignments: BookOpen,
  submissions: FileText,
  users: Users,
  default: AlertCircle,
};

export default function EmptyStateBase({
  icon = 'default',
  title,
  description,
  action = null,
}) {
  const Icon = iconMap[icon] || iconMap.default;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="p-3 rounded-full bg-slate-100 mb-4">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-600 mb-4 text-center max-w-xs">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}