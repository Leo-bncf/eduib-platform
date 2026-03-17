import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  UserPlus, BookOpen, UserCheck, RefreshCw, FileDown, Upload,
  ArrowRight,
} from 'lucide-react';

const QUICK_ACTIONS = [
  {
    label: 'Add User',
    sub: 'Invite staff or student',
    icon: UserPlus,
    link: 'SchoolAdminUsers',
    accent: 'blue',
  },
  {
    label: 'Create Class',
    sub: 'New course or section',
    icon: BookOpen,
    link: 'SchoolAdminClasses',
    accent: 'violet',
  },
  {
    label: 'Assign Teachers',
    sub: 'Enroll staff into classes',
    icon: UserCheck,
    link: 'SchoolAdminEnrollments',
    accent: 'emerald',
  },
  {
    label: 'Import CSV',
    sub: 'Bulk upload users',
    icon: Upload,
    link: 'SchoolAdminUsers',
    accent: 'amber',
  },
  {
    label: 'Sync Timetable',
    sub: 'Run schedule sync',
    icon: RefreshCw,
    link: 'SchoolAdminTimetable',
    accent: 'cyan',
  },
  {
    label: 'Export Reports',
    sub: 'Download school data',
    icon: FileDown,
    link: 'SchoolAdminReports',
    accent: 'rose',
  },
];

const accentMap = {
  blue:    { bg: 'bg-blue-600',    light: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    hover: 'hover:border-blue-300 hover:bg-blue-50' },
  violet:  { bg: 'bg-violet-600',  light: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  hover: 'hover:border-violet-300 hover:bg-violet-50' },
  emerald: { bg: 'bg-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', hover: 'hover:border-emerald-300 hover:bg-emerald-50' },
  amber:   { bg: 'bg-amber-600',   light: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   hover: 'hover:border-amber-300 hover:bg-amber-50' },
  cyan:    { bg: 'bg-cyan-600',    light: 'bg-cyan-50',    border: 'border-cyan-200',    text: 'text-cyan-700',    hover: 'hover:border-cyan-300 hover:bg-cyan-50' },
  rose:    { bg: 'bg-rose-600',    light: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    hover: 'hover:border-rose-300 hover:bg-rose-50' },
};

export default function QuickActionsHub() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {QUICK_ACTIONS.map(({ label, sub, icon: Icon, link, accent }) => {
        const a = accentMap[accent];
        return (
          <Link
            key={label}
            to={createPageUrl(link)}
            className={`group bg-white border border-slate-200 rounded-lg p-4 transition-all duration-150 hover:shadow-md ${a.hover} flex flex-col gap-3`}
          >
            <div className={`w-10 h-10 ${a.bg} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-150`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-tight">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">{sub}</p>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${a.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
              Go <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}