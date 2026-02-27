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
  LayoutDashboard, TrendingUp, Activity, ChevronRight, BarChart3,
  AlertTriangle, Zap, UserCheck, Bell, Shield
} from 'lucide-react';
import AppSidebar from '@/components/app/AppSidebar';
import LoadingStateBase from '@/components/common/LoadingStateBase';
import { format } from 'date-fns';

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

const MODULE_LINKS = [
  { label: 'User Management', sub: 'Staff, students & parents', page: 'SchoolAdminUsers', icon: Users, accent: '#6366f1' },
  { label: 'Class Management', sub: 'Courses & enrollments', page: 'SchoolAdminClasses', icon: BookOpen, accent: '#0ea5e9' },
  { label: 'Subject Catalogue', sub: 'IB subject groups', page: 'SchoolAdminSubjects', icon: GraduationCap, accent: '#10b981' },
  { label: 'Attendance', sub: 'Daily records & overview', page: 'SchoolAdminAttendance', icon: Calendar, accent: '#f59e0b' },
  { label: 'Timetable', sub: 'Period scheduling', page: 'SchoolAdminTimetable', icon: Clock, accent: '#ef4444' },
  { label: 'Reports & Exports', sub: 'Analytics & CSV exports', page: 'SchoolAdminReports', icon: BarChart3, accent: '#8b5cf6' },
];

const SETUP_STEPS = [
  { key: 'academicYears', label: 'Academic Year configured', page: 'SchoolOnboarding' },
  { key: 'terms', label: 'Terms / semesters added', page: 'SchoolOnboarding' },
  { key: 'subjects', label: 'Subjects catalogued', page: 'SchoolAdminSubjects' },
  { key: 'classes', label: 'Classes created', page: 'SchoolAdminClasses' },
  { key: 'staff', label: 'Staff members invited', page: 'SchoolAdminUsers' },
];

export default function SchoolAdminDashboard() {
  const navigate = useNavigate();
  const { user, schoolId, loading: userLoading } = useUser();
  const { data: school, isLoading: schoolLoading } = useSchoolData(schoolId);
  const { data: metrics, isLoading: metricsLoading } = useSchoolMetrics(schoolId);

  const { data: recentAttendance = [] } = useQuery({
    queryKey: ['dashboard-attendance', schoolId],
    queryFn: () => base44.entities.AttendanceRecord.filter({ school_id: schoolId }),
    enabled: !!schoolId,
    select: (data) => data.slice(0, 5),
  });

  useEffect(() => {
    if (!userLoading && !user) {
      base44.auth.redirectToLogin(createPageUrl('AppHome'));
    }
  }, [user, userLoading]);

  if (userLoading || !user || schoolLoading || metricsLoading) {
    return <LoadingStateBase />;
  }

  const setupStepsDone = metrics ? [
    (metrics.academicYears ?? 0) > 0,
    (metrics.terms ?? 0) > 0,
    (metrics.subjects ?? 0) > 0,
    (metrics.classes ?? 0) > 0,
    (metrics.staff ?? 0) > 0,
  ] : [];
  const setupDoneCount = setupStepsDone.filter(Boolean).length;
  const setupTotal = SETUP_STEPS.length;
  const isSetupComplete = setupDoneCount === setupTotal;
  const setupPct = Math.round((setupDoneCount / setupTotal) * 100);

  const today = format(new Date(), 'EEEE, d MMMM yyyy');

  const kpiCards = [
    {
      label: 'Students Enrolled',
      value: (metrics?.staff ?? 0),
      sub: 'active members',
      icon: UserCheck,
      trend: '+0',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      label: 'Active Classes',
      value: metrics?.classes ?? 0,
      sub: 'this academic year',
      icon: BookOpen,
      trend: null,
      color: 'from-sky-500 to-sky-600',
    },
    {
      label: 'Subjects',
      value: metrics?.subjects ?? 0,
      sub: 'in catalogue',
      icon: GraduationCap,
      trend: null,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Academic Years',
      value: metrics?.academicYears ?? 0,
      sub: `${metrics?.terms ?? 0} terms configured`,
      icon: TrendingUp,
      trend: null,
      color: 'from-violet-500 to-violet-600',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <AppSidebar
        links={sidebarLinks}
        role="school_admin"
        schoolName={school?.name}
        userName={user?.full_name}
        userId={user?.id}
        schoolId={schoolId}
      />

      <main className="md:ml-64 min-h-screen flex flex-col">
        {/* Top header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-tight">{school?.name || 'School Dashboard'}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
              school?.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : school?.status === 'onboarding'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${school?.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              {school?.status || 'onboarding'}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
              <Zap className="w-3 h-3" />
              {school?.plan || 'starter'} plan
            </div>
            <div className="text-xs text-slate-500 pl-3 border-l border-slate-200 hidden md:block">
              <span className="text-slate-400">Signed in as</span>{' '}
              <span className="font-medium text-slate-700">{user.full_name}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6">

          {/* Setup progress banner */}
          {!isSetupComplete && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-4 p-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Complete your school setup — {setupDoneCount}/{setupTotal} steps done</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${setupPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{setupPct}%</span>
                  </div>
                </div>
                <Link
                  to={createPageUrl('SchoolOnboarding')}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Continue Setup <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                {SETUP_STEPS.map((step, i) => (
                  <Link key={step.key} to={createPageUrl(step.page)} className="flex items-center gap-2 group">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      setupStepsDone[i] ? 'bg-emerald-100' : 'bg-slate-100'
                    }`}>
                      {setupStepsDone[i]
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        : <span className="w-2 h-2 rounded-full bg-slate-300" />
                      }
                    </div>
                    <span className={`text-xs truncate ${setupStepsDone[i] ? 'text-slate-500 line-through' : 'text-slate-700 group-hover:text-indigo-600'}`}>
                      {step.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {kpiCards.map(({ label, value, sub, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
                <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Module access grid */}
            <div className="xl:col-span-2 space-y-3">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Platform Modules</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MODULE_LINKS.map(({ label, sub, page, icon: Icon, accent }) => (
                  <Link
                    key={page}
                    to={createPageUrl(page)}
                    className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-md transition-all flex items-center gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: accent + '18' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>
                    </div>
                    <div className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-50 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* School info card */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">School Info</span>
                  <Link to={createPageUrl('SchoolAdminSettings')} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    Edit <Settings className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: 'Status', value: school?.status || '—', badge: true },
                    { label: 'Plan', value: school?.plan || 'starter', badge: false },
                    { label: 'City', value: school?.city || '—', badge: false },
                    { label: 'Country', value: school?.country || '—', badge: false },
                    { label: 'Timezone', value: school?.timezone || 'UTC', badge: false },
                    { label: 'Billing', value: school?.billing_status || '—', badge: false },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{label}</span>
                      <span className="text-xs font-medium text-slate-800 capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quick Actions</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {[
                    { label: 'Invite a user', page: 'SchoolAdminUsers', icon: Users },
                    { label: 'Create a class', page: 'SchoolAdminClasses', icon: BookOpen },
                    { label: 'View reports', page: 'SchoolAdminReports', icon: BarChart3 },
                    { label: 'Billing & plan', page: 'SchoolAdminBilling', icon: CreditCard },
                    { label: 'Security & settings', page: 'SchoolAdminSettings', icon: Shield },
                  ].map(({ label, page, icon: Icon }) => (
                    <Link
                      key={page}
                      to={createPageUrl(page)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group"
                    >
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}