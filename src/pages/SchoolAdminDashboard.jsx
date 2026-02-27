import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@/components/auth/UserContext';
import { useSchoolData, useSchoolMetrics } from '@/components/hooks/useDashboardData';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import {
  Users, BookOpen, GraduationCap, Calendar, Clock, FileText,
  CreditCard, Settings, ArrowRight, CheckCircle2, AlertCircle,
  LayoutDashboard, TrendingUp, Activity, Shield, ChevronRight,
  BarChart3, Bell, Zap, Globe, UserCheck, AlertTriangle
} from 'lucide-react';
import AppSidebar from '@/components/app/AppSidebar';
import LoadingStateBase from '@/components/common/LoadingStateBase';
import { Badge } from '@/components/ui/badge';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SchoolAdminDashboard', icon: LayoutDashboard },
  { label: 'Users', page: 'SchoolAdminUsers', icon: Users },
  { label: 'Classes', page: 'SchoolAdminClasses', icon: BookOpen },
  { label: 'Subjects', page: 'SchoolAdminSubjects', icon: GraduationCap },
  { label: 'Attendance', page: 'SchoolAdminAttendance', icon: Calendar },
  { label: 'Timetable', page: 'SchoolAdminTimetable', icon: Clock },
  { label: 'Reports', page: 'SchoolAdminReports', icon: FileText },
  { label: 'Billing', page: 'SchoolAdminBilling', icon: CreditCard },
  { label: 'Settings', page: 'SchoolAdminSettings', icon: Settings },
];

function StatCard({ label, value, sub, icon: Icon, accent, trend }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
        <p className="text-xs font-medium text-slate-500 mt-0.5 uppercase tracking-wide">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function ModuleCard({ label, description, page, icon: Icon, status, badge }) {
  return (
    <Link
      to={createPageUrl(page)}
      className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all flex items-start gap-3.5"
    >
      <div className="w-8 h-8 rounded-md bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center flex-shrink-0 transition-colors">
        <Icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-900 text-sm leading-tight">{label}</p>
          {badge && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-600 text-white">{badge}</span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0 mt-0.5" />
    </Link>
  );
}

export default function SchoolAdminDashboard() {
  const navigate = useNavigate();
  const { user, schoolId, loading: userLoading } = useUser();
  const { data: school, isLoading: schoolLoading } = useSchoolData(schoolId);
  const { data: metrics, isLoading: metricsLoading } = useSchoolMetrics(schoolId);

  const { data: recentMembers = [] } = useQuery({
    queryKey: ['dashboard-recent-members', schoolId],
    queryFn: () => base44.entities.SchoolMembership.filter({ school_id: schoolId }, '-created_date', 5),
    enabled: !!schoolId,
  });

  const { data: recentClasses = [] } = useQuery({
    queryKey: ['dashboard-recent-classes', schoolId],
    queryFn: () => base44.entities.Class.filter({ school_id: schoolId }, '-created_date', 5),
    enabled: !!schoolId,
  });

  useEffect(() => {
    if (!userLoading && !user) {
      base44.auth.redirectToLogin(createPageUrl('AppHome'));
    }
  }, [user, userLoading]);

  if (userLoading || !user || schoolLoading || metricsLoading) {
    return <LoadingStateBase />;
  }

  const isSetupComplete = metrics && metrics.setupProgress.completed === metrics.setupProgress.total;
  const setupPct = metrics ? Math.round((metrics.setupProgress.completed / metrics.setupProgress.total) * 100) : 0;

  const planBadge = {
    enterprise: { label: 'Enterprise', cls: 'bg-violet-600 text-white' },
    professional: { label: 'Professional', cls: 'bg-indigo-600 text-white' },
    starter: { label: 'Starter', cls: 'bg-slate-600 text-white' },
  }[school?.plan || 'starter'];

  const statusBadge = {
    active: 'bg-emerald-100 text-emerald-800',
    onboarding: 'bg-amber-100 text-amber-800',
    suspended: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-600',
  }[school?.status || 'onboarding'];

  const roleColors = {
    school_admin: 'bg-rose-100 text-rose-700',
    teacher: 'bg-emerald-100 text-emerald-700',
    student: 'bg-blue-100 text-blue-700',
    parent: 'bg-violet-100 text-violet-700',
    ib_coordinator: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <AppSidebar
        links={sidebarLinks}
        role="school_admin"
        schoolName={school?.name}
        userName={user?.full_name}
        userId={user?.id}
        schoolId={schoolId}
      />

      <main className="md:ml-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-slate-900">{school?.name || 'School Dashboard'}</h1>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${planBadge.cls}`}>{planBadge.label}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">School Administration Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${statusBadge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${school?.status === 'active' ? 'bg-emerald-600' : 'bg-amber-500'}`} />
              {school?.status || 'onboarding'}
            </span>
            <Link
              to={createPageUrl('SchoolAdminSettings')}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-5">
          {/* Setup alert */}
          {!isSetupComplete && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">School setup is incomplete</p>
                <p className="text-xs text-amber-700 mt-0.5">{metrics.setupProgress.completed} of {metrics.setupProgress.total} configuration steps complete</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 max-w-[200px] bg-amber-200 rounded-full h-1">
                    <div className="bg-amber-500 h-1 rounded-full transition-all" style={{ width: `${setupPct}%` }} />
                  </div>
                  <span className="text-xs text-amber-700 font-medium">{setupPct}%</span>
                </div>
              </div>
              <Link
                to={createPageUrl('SchoolOnboarding')}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors px-3.5 py-2 rounded-lg whitespace-nowrap"
              >
                Continue Setup <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Welcome + Stats row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Welcome panel */}
            <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-xl p-5 text-white flex flex-col justify-between min-h-[160px]">
              <div>
                <p className="text-xs text-indigo-300 uppercase tracking-widest font-medium mb-1">Good day</p>
                <h2 className="text-lg font-bold leading-tight">{user.full_name}</h2>
                <p className="text-xs text-slate-400 mt-1">School Administrator</p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Plan</p>
                  <p className="text-sm font-semibold mt-0.5 capitalize">{school?.plan || 'Starter'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Status</p>
                  <p className="text-sm font-semibold mt-0.5 capitalize">{school?.status || 'Onboarding'}</p>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Academic Years" value={metrics?.academicYears ?? 0} icon={TrendingUp} accent="bg-indigo-50 text-indigo-600" />
              <StatCard label="Subjects" value={metrics?.subjects ?? 0} icon={GraduationCap} accent="bg-emerald-50 text-emerald-600" />
              <StatCard label="Classes" value={metrics?.classes ?? 0} icon={BookOpen} accent="bg-blue-50 text-blue-600" />
              <StatCard label="Staff" value={metrics?.staff ?? 0} icon={Users} accent="bg-violet-50 text-violet-600" />
            </div>
          </div>

          {/* Modules + Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Module grid */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Platform Modules</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <ModuleCard label="User Management" description="Staff, students, parents & invitations" page="SchoolAdminUsers" icon={Users} />
                <ModuleCard label="Class Manager" description="Classes, rosters & assignments" page="SchoolAdminClasses" icon={BookOpen} />
                <ModuleCard label="IB Subjects" description="Subject configuration & groupings" page="SchoolAdminSubjects" icon={GraduationCap} />
                <ModuleCard label="Attendance" description="Daily records & attendance rates" page="SchoolAdminAttendance" icon={Calendar} />
                <ModuleCard label="Timetable" description="Schedules, periods & room management" page="SchoolAdminTimetable" icon={Clock} />
                <ModuleCard label="Reports & Exports" description="Academic, behavior & attendance data" page="SchoolAdminReports" icon={BarChart3} />
                <ModuleCard label="Billing" description="Subscription & payment management" page="SchoolAdminBilling" icon={CreditCard} badge="Manage" />
                <ModuleCard label="School Settings" description="Profile, timezone & preferences" page="SchoolAdminSettings" icon={Settings} />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Recent members */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Recent Members</p>
                  <Link to={createPageUrl('SchoolAdminUsers')} className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium">View all →</Link>
                </div>
                <div className="divide-y divide-slate-50">
                  {recentMembers.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-400">No members yet</div>
                  ) : recentMembers.map(m => (
                    <div key={m.id} className="px-4 py-2.5 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                        {(m.user_name || m.user_email || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">{m.user_name || m.user_email || 'Unknown'}</p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${roleColors[m.role] || 'bg-slate-100 text-slate-600'}`}>
                          {m.role?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System status */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">System Status</p>
                {[
                  { label: 'IB Platform', ok: true },
                  { label: 'Data Sync', ok: true },
                  { label: 'Billing', ok: !!school?.billing_status },
                  { label: 'School Setup', ok: isSetupComplete },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center justify-between">
                    <p className="text-xs text-slate-600">{label}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      <span className={`text-[10px] font-medium ${ok ? 'text-emerald-600' : 'text-amber-600'}`}>{ok ? 'Operational' : 'Action needed'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* IB compliance */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <p className="text-xs font-semibold text-indigo-900">IB Compliance</p>
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed">Your school data is managed in accordance with IB programme standards and GDPR requirements.</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] text-emerald-700 font-medium">All systems compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}