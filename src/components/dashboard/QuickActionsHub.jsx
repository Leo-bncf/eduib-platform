import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  UserPlus, BookOpen, UserCheck, RefreshCw, FileDown, Upload,
  ChevronRight
} from 'lucide-react';

const QUICK_ACTIONS = [
  {
    label: 'Add User',
    sub: 'Invite staff or student',
    icon: UserPlus,
    link: 'SchoolAdminUsers',
    accent: 'bg-blue-600',
  },
  {
    label: 'Create Class',
    sub: 'New course or section',
    icon: BookOpen,
    link: 'SchoolAdminClasses',
    accent: 'bg-violet-600',
  },
  {
    label: 'Assign Teachers',
    sub: 'Enroll staff into classes',
    icon: UserCheck,
    link: 'SchoolAdminEnrollments',
    accent: 'bg-emerald-600',
  },
  {
    label: 'Import CSV',
    sub: 'Bulk upload users',
    icon: Upload,
    link: 'SchoolAdminUsers',
    accent: 'bg-amber-600',
  },
  {
    label: 'Sync Timetable',
    sub: 'Run schedule sync',
    icon: RefreshCw,
    link: 'SchoolAdminTimetable',
    accent: 'bg-cyan-600',
  },
  {
    label: 'Export Reports',
    sub: 'Download school data',
    icon: FileDown,
    link: 'SchoolAdminReports',
    accent: 'bg-rose-600',
  },
];

export default function QuickActionsHub() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {QUICK_ACTIONS.map(({ label, sub, icon: Icon, link, accent }) => (
        <Link
          key={label}
          to={createPageUrl(link)}
          className="group bg-white border border-slate-200 rounded-md p-4 hover:border-slate-300 hover:shadow-md transition-all flex flex-col items-center text-center gap-3"
        >
          <div className={`w-10 h-10 ${accent} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-slate-900">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-tight">{sub}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}