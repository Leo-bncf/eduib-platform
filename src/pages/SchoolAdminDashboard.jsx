import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@/components/auth/UserContext';
import { useSchoolData, useSchoolMetrics } from '@/components/hooks/useDashboardData';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users, BookOpen, GraduationCap, Calendar, Clock, FileText,
  CreditCard, Settings, ArrowRight, CheckCircle2, AlertCircle,
  LayoutDashboard, TrendingUp, Activity
} from 'lucide-react';
import AppSidebar from '@/components/app/AppSidebar';
import LoadingStateBase from '@/components/common/LoadingStateBase';

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

const quickActions = [
  { label: 'Manage Users', description: 'Add staff, students & parents', page: 'SchoolAdminUsers', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Classes', description: 'Create and manage classes', page: 'SchoolAdminClasses', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Subjects', description: 'Configure IB subjects', page: 'SchoolAdminSubjects', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Attendance', description: 'View attendance records', page: 'SchoolAdminAttendance', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Timetable', description: 'Manage schedules', page: 'SchoolAdminTimetable', icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
  { label: 'Reports', description: 'Export and generate reports', page: 'SchoolAdminReports', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

export default function SchoolAdminDashboard() {
  const navigate = useNavigate();
  const { user, schoolId, loading: userLoading } = useUser();
  const { data: school, isLoading: schoolLoading } = useSchoolData(schoolId);
  const { data: metrics, isLoading: metricsLoading } = useSchoolMetrics(schoolId);

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

  const statCards = [
    { label: 'Academic Years', value: metrics?.academicYears ?? 0, icon: TrendingUp, color: 'text-indigo-600', border: 'border-l-indigo-500' },
    { label: 'Subjects', value: metrics?.subjects ?? 0, icon: GraduationCap, color: 'text-emerald-600', border: 'border-l-emerald-500' },
    { label: 'Classes', value: metrics?.classes ?? 0, icon: BookOpen, color: 'text-blue-600', border: 'border-l-blue-500' },
    { label: 'Staff Members', value: metrics?.staff ?? 0, icon: Users, color: 'text-violet-600', border: 'border-l-violet-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar
        links={sidebarLinks}
        role="school_admin"
        schoolName={school?.name}
        userName={user?.full_name}
        userId={user?.id}
        schoolId={schoolId}
      />

      <main className="md:ml-64 min-h-screen">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{school?.name || 'School Dashboard'}</h1>
              <p className="text-sm text-slate-500 mt-0.5">Welcome back, {user.full_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                school?.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                school?.status === 'onboarding' ? 'bg-amber-50 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                <Activity className="w-3 h-3" />
                {school?.status || 'onboarding'}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                {school?.plan || 'starter'} plan
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Setup banner */}
          {!isSetupComplete && (
            <div className="bg-white border border-amber-200 rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">Complete your school setup</p>
                  <p className="text-xs text-slate-500 mt-0.5">{metrics.setupProgress.completed} of {metrics.setupProgress.total} steps done — {setupPct}% complete</p>
                  <div className="mt-2 w-full max-w-xs bg-slate-200 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${setupPct}%` }} />
                  </div>
                </div>
              </div>
              <Link
                to={createPageUrl('SchoolOnboarding')}
                className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 whitespace-nowrap"
              >
                Continue setup <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {isSetupComplete && (
            <div className="bg-white border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-sm font-medium text-slate-700">School setup is complete. All features are available.</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color, border }) => (
              <Card key={label} className={`border-l-4 ${border} shadow-none`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickActions.map(({ label, description, page, icon: Icon, color, bg }) => (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}