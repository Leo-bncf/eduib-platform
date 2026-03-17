import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Users, UserCheck, Users2, BookOpen, TrendingUp, TrendingDown,
  MessageSquare, Minus, CalendarDays, AlertTriangle, CheckCircle2,
} from 'lucide-react';

function KpiCard({ label, value, sub, icon: Icon, accent, linkTo }) {
  const accents = {
    blue:    { border: 'border-l-blue-500',   icon: 'bg-blue-500',   text: 'text-blue-600' },
    emerald: { border: 'border-l-emerald-500', icon: 'bg-emerald-500', text: 'text-emerald-600' },
    violet:  { border: 'border-l-violet-500',  icon: 'bg-violet-500',  text: 'text-violet-600' },
    amber:   { border: 'border-l-amber-500',   icon: 'bg-amber-500',   text: 'text-amber-600' },
  };
  const a = accents[accent] || accents.blue;

  const inner = (
    <div className={`bg-white border border-slate-200 border-l-4 ${a.border} rounded-md shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all`}>
      <div className={`w-11 h-11 ${a.icon} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 truncate">{label}</p>
        <p className="text-2xl font-black text-slate-900 tabular-nums leading-tight mt-0.5">{value ?? '—'}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={createPageUrl(linkTo)} className="block">{inner}</Link>;
  }
  return inner;
}

function SignalRow({ label, value, max = 100, color, suffix = '%', nullLabel = 'No data yet' }) {
  if (value === null || value === undefined) {
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-xs text-slate-400 italic">{nullLabel}</span>
      </div>
    );
  }
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-700 font-medium">{label}</span>
        <span className="text-sm font-black text-slate-900 tabular-nums">{value}{suffix}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AttendanceBadge({ rate }) {
  if (rate === null || rate === undefined) return null;
  if (rate >= 90) return <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-3 h-3" /> Good</span>;
  if (rate >= 75) return <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600"><AlertTriangle className="w-3 h-3" /> Needs attention</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600"><AlertTriangle className="w-3 h-3" /> Critical</span>;
}

function MissingWorkBadge({ rate }) {
  if (rate === null || rate === undefined) return null;
  if (rate <= 10) return <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-3 h-3" /> Low</span>;
  if (rate <= 30) return <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600"><AlertTriangle className="w-3 h-3" /> Moderate</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600"><AlertTriangle className="w-3 h-3" /> High</span>;
}

export default function SchoolHealthOverview({ data }) {
  const { members, classes, attendanceRate, missingWorkRate, messagingVolume, upcomingTerms } = data;

  const kpis = [
    { label: 'Students',         value: members.students.length,  sub: 'Active enrollments', icon: Users,     accent: 'blue',    linkTo: 'SchoolAdminUsers' },
    { label: 'Teachers & Staff', value: members.teachers.length,  sub: 'Active accounts',    icon: UserCheck, accent: 'emerald', linkTo: 'SchoolAdminUsers' },
    { label: 'Parents',          value: members.parents.length,   sub: 'Linked accounts',    icon: Users2,    accent: 'violet',  linkTo: 'SchoolAdminUsers' },
    { label: 'Active Classes',   value: classes.length,           sub: 'Current year',       icon: BookOpen,  accent: 'amber',   linkTo: 'SchoolAdminClasses' },
  ];

  const attendanceColor = attendanceRate >= 90 ? 'bg-emerald-500' : attendanceRate >= 75 ? 'bg-amber-400' : 'bg-red-400';
  const missingColor = missingWorkRate <= 10 ? 'bg-emerald-500' : missingWorkRate <= 30 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Activity signals + Reporting windows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Activity Signals */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Activity Signals</h3>
              <p className="text-xs text-slate-400 mt-0.5">Rolling 30-day window</p>
            </div>
          </div>

          <SignalRow
            label="Attendance Rate"
            value={attendanceRate}
            color={attendanceColor}
            suffix="%"
            nullLabel="No attendance records yet"
          />
          {attendanceRate !== null && (
            <div className="-mt-2 mb-1 flex justify-end">
              <AttendanceBadge rate={attendanceRate} />
            </div>
          )}

          <SignalRow
            label="Missing Work Rate"
            value={missingWorkRate}
            color={missingColor}
            suffix="%"
            nullLabel="No assignments published yet"
          />
          {missingWorkRate !== null && (
            <div className="-mt-2 mb-1 flex justify-end">
              <MissingWorkBadge rate={missingWorkRate} />
            </div>
          )}

          <div className="flex items-center justify-between py-2.5 mt-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-700">Messaging Volume</span>
            </div>
            <span className="text-sm font-black text-slate-900 tabular-nums">
              {messagingVolume} <span className="font-normal text-slate-400 text-xs">messages</span>
            </span>
          </div>
        </div>

        {/* Upcoming Reporting Windows */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Upcoming Reporting Windows</h3>
          </div>

          {upcomingTerms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 text-center">
              <CalendarDays className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">No upcoming terms configured</p>
              <Link to={createPageUrl('SchoolOnboarding')} className="text-xs text-indigo-600 hover:underline mt-1">
                Set up academic calendar →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingTerms.map(term => {
                const end = new Date(term.end_date);
                const daysLeft = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
                const urgent = daysLeft <= 14;
                const soon = daysLeft <= 30;
                return (
                  <div key={term.id} className={`flex items-center justify-between p-3 rounded-md border ${urgent ? 'bg-red-50 border-red-200' : soon ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{term.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ends {end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black tabular-nums ${urgent ? 'text-red-600' : soon ? 'text-amber-600' : 'text-slate-600'}`}>
                        {daysLeft}d
                      </span>
                      <p className="text-xs text-slate-400">left</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}