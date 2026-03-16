import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/components/auth/UserContext';
import { useSchoolOperationsData } from '@/components/hooks/useSchoolOperationsData';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, Calendar, Clock,
  FileText, CreditCard, Settings, UserCheck, Activity, ShieldCheck, Zap
} from 'lucide-react';
import AppSidebar from '@/components/app/AppSidebar';
import LoadingStateBase from '@/components/common/LoadingStateBase';
import SchoolHealthOverview from '@/components/dashboard/SchoolHealthOverview';
import OperationalAlerts from '@/components/dashboard/OperationalAlerts';
import QuickActionsHub from '@/components/dashboard/QuickActionsHub';
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

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function SchoolAdminDashboard() {
  const navigate = useNavigate();
  const { user, schoolId, loading: userLoading } = useUser();
  const { data, isLoading } = useSchoolOperationsData(schoolId);

  useEffect(() => {
    if (!userLoading && !user) {
      base44.auth.redirectToLogin(createPageUrl('AppHome'));
    }
  }, [user, userLoading]);

  if (userLoading || !user || isLoading || !data) {
    return <LoadingStateBase />;
  }

  const { school } = data;
  const today = format(new Date(), 'EEEE, d MMMM yyyy');

  const statusColors = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    onboarding: 'bg-blue-50 text-blue-700 border-blue-200',
    suspended: 'bg-red-50 text-red-700 border-red-200',
  };
  const statusDot = {
    active: 'bg-emerald-500',
    onboarding: 'bg-blue-500',
    suspended: 'bg-red-500',
  };
  const statusKey = school?.status || 'onboarding';

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
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">School Operations</h1>
            <p className="text-xs text-slate-500 mt-0.5">{school?.name} • {today}</p>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border rounded ${statusColors[statusKey] || statusColors.onboarding}`}>
            <span className={`w-2 h-2 rounded-full ${statusDot[statusKey] || statusDot.onboarding}`} />
            {statusKey}
          </div>
        </div>

        <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">

          {/* Quick Actions Hub */}
          <section>
            <SectionHeader
              icon={Zap}
              title="Quick Actions"
              subtitle="One-click entry to common admin tasks"
            />
            <QuickActionsHub />
          </section>

          {/* Operational Alerts */}
          <section>
            <SectionHeader
              icon={ShieldCheck}
              title="Operational Alerts"
              subtitle="Issues that need your attention"
            />
            <OperationalAlerts data={data} />
          </section>

          {/* School Health Overview */}
          <section>
            <SectionHeader
              icon={Activity}
              title="School Health Overview"
              subtitle="Key metrics and activity signals scoped to your school"
            />
            <SchoolHealthOverview data={data} />
          </section>

        </div>
      </main>
    </div>
  );
}