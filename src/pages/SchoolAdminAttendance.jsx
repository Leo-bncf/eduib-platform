import React, { useState } from 'react';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, Settings,
  Calendar, Clock, FileText, CreditCard, CalendarDays,
  BarChart2, Tag, PenLine, Download, ShieldCheck,
} from 'lucide-react';

import AttendanceDashboard from '@/components/attendance-admin/AttendanceDashboard';
import AttendanceCodeConfig from '@/components/attendance-admin/AttendanceCodeConfig';
import AttendanceCorrectionWorkflow from '@/components/attendance-admin/AttendanceCorrectionWorkflow';
import AttendanceExport from '@/components/attendance-admin/AttendanceExport';

const sidebarLinks = [
  { label: 'Dashboard',     page: 'SchoolAdminDashboard',     icon: LayoutDashboard },
  { label: 'Users',         page: 'SchoolAdminUsers',          icon: Users },
  { label: 'Classes',       page: 'SchoolAdminClasses',        icon: BookOpen },
  { label: 'Enrollments',   page: 'SchoolAdminEnrollments',    icon: Users },
  { label: 'Academic Setup',page: 'SchoolAdminAcademicSetup',  icon: CalendarDays },
  { label: 'Subjects',      page: 'SchoolAdminSubjects',       icon: GraduationCap },
  { label: 'Attendance',    page: 'SchoolAdminAttendance',     icon: Calendar },
  { label: 'Timetable',     page: 'SchoolAdminTimetable',      icon: Clock },
  { label: 'Reports',       page: 'SchoolAdminReports',        icon: FileText },
  { label: 'Billing',       page: 'SchoolAdminBilling',        icon: CreditCard },
  { label: 'Settings',      page: 'SchoolAdminSettings',       icon: Settings },
];

const TABS = [
  { id: 'dashboard',   label: 'Dashboard',    icon: BarChart2,  desc: 'Trends, patterns & alerts' },
  { id: 'codes',       label: 'Code Config',  icon: Tag,        desc: 'Attendance codes & reasons' },
  { id: 'corrections', label: 'Corrections',  icon: PenLine,    desc: 'Controlled correction workflow' },
  { id: 'exports',     label: 'Exports',      icon: Download,   desc: 'Reports & regulatory exports' },
];

export default function SchoolAdminAttendance() {
  const { user, school, schoolId } = useUser();
  const [tab, setTab] = useState('dashboard');

  return (
    <RoleGuard allowedRoles={['school_admin', 'ib_coordinator', 'super_admin', 'admin']}>
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
          {/* Page Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Attendance Administration
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">{school?.name} · Governed attendance operations</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                School-scoped
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border-b border-slate-200 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-1 -mb-px">
                {TABS.map(t => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                        active
                          ? 'border-indigo-600 text-indigo-700'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto p-6">
            {tab === 'dashboard' && <AttendanceDashboard schoolId={schoolId} />}
            {tab === 'codes' && <AttendanceCodeConfig schoolId={schoolId} />}
            {tab === 'corrections' && <AttendanceCorrectionWorkflow schoolId={schoolId} />}
            {tab === 'exports' && <AttendanceExport schoolId={schoolId} schoolName={school?.name} />}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}