import React from 'react';
import { Users, UserCheck, Users2, BookOpen, GraduationCap, TrendingUp, TrendingDown, MessageSquare, CheckSquare, Minus } from 'lucide-react';

function MetricCard({ label, value, sub, icon: Icon, accent = 'blue', trend, trendLabel }) {
  const accentMap = {
    blue: 'border-l-blue-600 bg-blue-600',
    emerald: 'border-l-emerald-500 bg-emerald-500',
    violet: 'border-l-violet-500 bg-violet-500',
    amber: 'border-l-amber-500 bg-amber-500',
  };
  const [borderClass, bgClass] = accentMap[accent].split(' ');

  return (
    <div className={`bg-white border-l-[3px] ${borderClass} border-y border-r border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[110px]`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">{label}</p>
        <div className={`w-9 h-9 ${bgClass} rounded flex items-center justify-center shadow-sm flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tight leading-none">{value ?? '—'}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-slate-500 font-medium">{sub}</p>
          {trendLabel && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {trendLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SignalBar({ label, value, max = 100, color = 'bg-blue-500', suffix = '%', nullLabel = 'No data' }) {
  if (value === null || value === undefined) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-xs text-slate-400">{nullLabel}</span>
      </div>
    );
  }
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">{value}{suffix}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SchoolHealthOverview({ data }) {
  const { members, classes, attendanceRate, missingWorkRate, messagingVolume, upcomingTerms } = data;

  const metrics = [
    { label: 'Students', value: members.students.length, sub: 'Active enrollments', icon: Users, accent: 'blue' },
    { label: 'Teachers & Staff', value: members.teachers.length, sub: 'Active accounts', icon: UserCheck, accent: 'emerald' },
    { label: 'Parents', value: members.parents.length, sub: 'Linked accounts', icon: Users2, accent: 'violet' },
    { label: 'Active Classes', value: classes.length, sub: 'Current year', icon: BookOpen, accent: 'amber' },
  ];

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {metrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Activity signals + upcoming terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-md shadow-sm p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Activity Signals</h3>
          <p className="text-xs text-slate-400 mb-3">Last 30 days</p>
          <SignalBar
            label="Attendance Rate"
            value={attendanceRate}
            max={100}
            color={attendanceRate >= 90 ? 'bg-emerald-500' : attendanceRate >= 75 ? 'bg-amber-400' : 'bg-red-400'}
            suffix="%"
            nullLabel="No records yet"
          />
          <SignalBar
            label="Missing Work Rate"
            value={missingWorkRate}
            max={100}
            color={missingWorkRate <= 10 ? 'bg-emerald-500' : missingWorkRate <= 30 ? 'bg-amber-400' : 'bg-red-400'}
            suffix="%"
            nullLabel="No assignments yet"
          />
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-slate-700">Messaging Volume</span>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-sm font-bold text-slate-900">{messagingVolume} messages</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-sm p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Upcoming Reporting Windows</h3>
          {upcomingTerms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <GraduationCap className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">No upcoming terms configured</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTerms.map(term => {
                const end = new Date(term.end_date);
                const daysLeft = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
                const urgent = daysLeft <= 14;
                return (
                  <div key={term.id} className={`flex items-center justify-between p-3 rounded-md border ${urgent ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{term.name}</p>
                      <p className="text-xs text-slate-500">Ends {end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${urgent ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {daysLeft}d left
                    </span>
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