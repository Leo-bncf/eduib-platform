import React from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { useUser } from '@/components/auth/UserContext';
import {
  Layers, UserCheck, Users2, Archive
} from 'lucide-react';
import { SCHOOL_ADMIN_SIDEBAR_LINKS } from '@/components/app/schoolAdminSidebarLinks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useClassData } from '@/components/classes/useClassData';
import ClassSectionTab      from '@/components/classes/ClassSectionTab';
import TeacherAssignmentTab from '@/components/classes/TeacherAssignmentTab';
import StudentEnrollmentTab from '@/components/classes/StudentEnrollmentTab';
import ClassLifecycleTab    from '@/components/classes/ClassLifecycleTab';

const sidebarLinks = [
  { label: 'Dashboard',     page: 'SchoolAdminDashboard',     icon: LayoutDashboard },
  { label: 'Users',         page: 'SchoolAdminUsers',         icon: Users },
  { label: 'Classes',       page: 'SchoolAdminClasses',       icon: BookOpen },
  { label: 'Enrollments',   page: 'SchoolAdminEnrollments',   icon: Users },
  { label: 'Academic Setup',page: 'SchoolAdminAcademicSetup', icon: GraduationCap },
  { label: 'Attendance',    page: 'SchoolAdminAttendance',    icon: Calendar },
  { label: 'Timetable',     page: 'SchoolAdminTimetable',     icon: Clock },
  { label: 'Reports',       page: 'SchoolAdminReports',       icon: FileText },
  { label: 'Billing',       page: 'SchoolAdminBilling',       icon: CreditCard },
  { label: 'Settings',      page: 'SchoolAdminSettings',      icon: Settings },
];

export default function SchoolAdminClasses() {
  const { user, school, schoolId } = useUser();
  const { classes, subjects, memberships, academicYears, cohorts, isLoading } = useClassData(schoolId);

  const activeCount   = classes.filter(c => c.status === 'active').length;
  const archivedCount = classes.filter(c => c.status === 'archived').length;
  const unstaffed     = classes.filter(c => c.status === 'active' && (!c.teacher_ids || c.teacher_ids.length === 0)).length;

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
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
          <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
              <div>
                <h1 className="text-base font-black text-slate-900 tracking-tight">Class & Roster Management</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeCount} active · {archivedCount} archived
                  {unstaffed > 0 && (
                    <span className="ml-2 text-amber-600 font-medium">· {unstaffed} unstaffed</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
            <Tabs defaultValue="sections">
              <TabsList className="bg-white border border-slate-200 h-10 mb-6">
                <TabsTrigger value="sections" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                  <Layers className="w-3.5 h-3.5" /> Class Sections
                </TabsTrigger>
                <TabsTrigger value="teachers" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                  <UserCheck className="w-3.5 h-3.5" /> Staff Assignment
                  {unstaffed > 0 && (
                    <span className="ml-0.5 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unstaffed}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="students" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                  <Users2 className="w-3.5 h-3.5" /> Student Enrolment
                </TabsTrigger>
                <TabsTrigger value="lifecycle" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                  <Archive className="w-3.5 h-3.5" /> Lifecycle
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sections">
                <ClassSectionTab
                  schoolId={schoolId}
                  classes={classes}
                  subjects={subjects}
                  academicYears={academicYears}
                  cohorts={cohorts}
                />
              </TabsContent>

              <TabsContent value="teachers">
                <TeacherAssignmentTab
                  schoolId={schoolId}
                  classes={classes}
                  memberships={memberships}
                />
              </TabsContent>

              <TabsContent value="students">
                <StudentEnrollmentTab
                  schoolId={schoolId}
                  classes={classes}
                  memberships={memberships}
                />
              </TabsContent>

              <TabsContent value="lifecycle">
                <ClassLifecycleTab
                  schoolId={schoolId}
                  classes={classes}
                  memberships={memberships}
                  academicYears={academicYears}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}