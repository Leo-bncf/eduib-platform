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
  AlertTriangle, Zap, UserCheck, Bell, Shield, UserX
} from 'lucide-react';
import AppSidebar from '@/components/app/AppSidebar';
import LoadingStateBase from '@/components/common/LoadingStateBase';
import { format } from 'date-fns';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SchoolAdminDashboard', icon: LayoutDashboard },
  { label: 'Users', page: 'SchoolAdminUsers', icon: Users },
  { label: 'Classes', page: 'SchoolAdminClasses', icon: BookOpen },
  { label: 'Enrollments', page: 'SchoolAdminEnrollments', icon: Users },
  { label: 'Subjects', page: 'SchoolAdminSubjects', icon: GraduationCap },
  { label: 'Attendance', page: 'SchoolAdminAttendance', icon: Calendar },
  { label: 'Timetable', page: 'SchoolAdminTimetable', icon: Clock },
  { label: 'Reports', page: 'SchoolAdminReports', icon: FileText },
  { label: 'Billing', page: 'SchoolAdminBilling', icon: CreditCard },
  { label: 'Settings', page: 'SchoolAdminSettings', icon: Settings },
];

const MODULE_LINKS = [
  { label: 'User Directory', sub: 'Staff, students & parents', page: 'SchoolAdminUsers', icon: Users },
  { label: 'Class Setup', sub: 'Courses & sections', page: 'SchoolAdminClasses', icon: BookOpen },
  { label: 'Enrollments', sub: 'Rosters & teachers', page: 'SchoolAdminEnrollments', icon: UserCheck },
  { label: 'Subject Catalogue', sub: 'IB subjects & levels', page: 'SchoolAdminSubjects', icon: GraduationCap },
  { label: 'Attendance', sub: 'Daily records', page: 'SchoolAdminAttendance', icon: Calendar },
  { label: 'Reports & Exports', sub: 'Analytics & grades', page: 'SchoolAdminReports', icon: BarChart3 },
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

  const { data: memberships = [], isLoading: membersLoading } = useQuery({
    queryKey: ['dashboard-memberships', schoolId],
    queryFn: () => base44.entities.SchoolMembership.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['dashboard-classes', schoolId],
    queryFn: () => base44.entities.Class.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  useEffect(() => {
    if (!userLoading && !user) {
      base44.auth.redirectToLogin(createPageUrl('AppHome'));
    }
  }, [user, userLoading]);

  if (userLoading || !user || schoolLoading || metricsLoading || membersLoading || classesLoading) {
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

  const students = memberships.filter(m => m.role === 'student');
  const teachers = memberships.filter(m => ['teacher', 'ib_coordinator', 'school_admin'].includes(m.role));

  const enrolledStudentIds = new Set(classes.flatMap(c => c.student_ids || []));
  const studentsWithoutClasses = students.filter(s => !enrolledStudentIds.has(s.user_id));

  const classesWithoutTeachers = classes.filter(c => {
    if (c.teacher_ids && c.teacher_ids.length > 0) return false;
    if (c.subject_teacher_assignments && c.subject_teacher_assignments.some(a => a.teacher_ids && a.teacher_ids.length > 0)) return false;
    return true;
  });

  const alerts = [];
  if (studentsWithoutClasses.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Unenrolled Students',
      desc: `${studentsWithoutClasses.length} student(s) are not enrolled in any classes.`,
      action: 'Manage Enrollments',
      link: 'SchoolAdminEnrollments',
      icon: UserX,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    });
  }
  if (classesWithoutTeachers.length > 0) {
    alerts.push({
      type: 'error',
      title: 'Classes Missing Teachers',
      desc: `${classesWithoutTeachers.length} class(es) have no teachers assigned.`,
      action: 'Assign Teachers',
      link: 'SchoolAdminEnrollments',
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    });
  }

  const kpiCards = [
    { label: 'Enrolled Students', value: students.length, sub: 'Active accounts', icon: Users },
    { label: 'Faculty & Staff', value: teachers.length, sub: 'Active accounts', icon: UserCheck },
    { label: 'Active Classes', value: classes.length, sub: 'Current academic year', icon: BookOpen },
    { label: 'Subject Catalogue', value: metrics?.subjects ?? 0, sub: 'Configured courses', icon: GraduationCap },
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

      <main className="md:ml-64 min-h-screen flex flex-col">
        {/* Top header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Director Overview</h1>
            <p className="text-sm text-slate-500 mt-1">{school?.name} • {today}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
              school?.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : school?.status === 'onboarding'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-slate-50 text-slate-700 border border-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${school?.status === 'active' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              {school?.status || 'onboarding'}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">

          {/* Setup progress banner */}
          {!isSetupComplete && (
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
              <div className="flex items-center gap-4 p-4 border-b border-slate-100 bg-slate-50">
                <div className="w-8 h-8 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
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
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-md transition-colors uppercase tracking-wider"
                >
                  Continue Setup <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {kpiCards.map(({ label, value, sub, icon: Icon }) => (
              <div
                key={label}
                className="bg-white border-l-[3px] border-l-blue-600 border-y border-r border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                  <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tight">{value}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            <div className="xl:col-span-2 space-y-6">
              {/* Action Center */}
              {alerts.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs md:text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Action Center
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {alerts.map((alert, i) => (
                      <div key={i} className={`p-4 rounded-md border ${alert.bg} ${alert.border} flex flex-col shadow-sm`}>
                        <div className="flex items-start gap-3 mb-3">
                          <alert.icon className={`w-5 h-5 ${alert.color} flex-shrink-0 mt-0.5`} />
                          <div>
                            <h3 className={`font-semibold text-sm ${alert.color}`}>{alert.title}</h3>
                            <p className="text-sm text-slate-700 mt-1 leading-snug">{alert.desc}</p>
                          </div>
                        </div>
                        <div className="mt-auto pt-3 flex justify-end">
                          <Link 
                            to={createPageUrl(alert.link)} 
                            className={`text-sm font-semibold ${alert.color} hover:underline flex items-center gap-1`}
                          >
                            {alert.action} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Module access grid */}
              <div className="space-y-3">
                <h2 className="text-xs md:text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  Platform Modules
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MODULE_LINKS.map(({ label, sub, page, icon: Icon }) => (
                    <Link
                      key={page}
                      to={createPageUrl(page)}
                      className="group bg-white border border-slate-200 rounded-md p-4 hover:border-blue-600 hover:shadow-sm transition-all flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                        <Icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Quick actions */}
              <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Director Actions</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: 'Manage Enrollments', page: 'SchoolAdminEnrollments', icon: UserCheck },
                    { label: 'Create new class', page: 'SchoolAdminClasses', icon: BookOpen },
                    { label: 'Invite staff or students', page: 'SchoolAdminUsers', icon: Users },
                    { label: 'Review school reports', page: 'SchoolAdminReports', icon: BarChart3 },
                    { label: 'Billing & subscription', page: 'SchoolAdminBilling', icon: CreditCard },
                    { label: 'System settings', page: 'SchoolAdminSettings', icon: Settings },
                  ].map(({ label, page, icon: Icon }) => (
                    <Link
                      key={label}
                      to={createPageUrl(page)}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                    >
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-blue-600 transition-colors" />
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