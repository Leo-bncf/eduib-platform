import React from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import { Layers, UserCheck, Users2, Archive } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SchoolAdminPageShell from '@/components/app/SchoolAdminPageShell';
import { useUser } from '@/components/auth/UserContext';

import { useClassData } from '@/components/classes/useClassData';
import ClassSectionTab      from '@/components/classes/ClassSectionTab';
import TeacherAssignmentTab from '@/components/classes/TeacherAssignmentTab';
import StudentEnrollmentTab from '@/components/classes/StudentEnrollmentTab';
import ClassLifecycleTab    from '@/components/classes/ClassLifecycleTab';

export default function SchoolAdminClasses() {
  const { school, schoolId } = useUser();
  const { classes, subjects, memberships, academicYears, cohorts } = useClassData(schoolId);

  const activeCount   = classes.filter(c => c.status === 'active').length;
  const archivedCount = classes.filter(c => c.status === 'archived').length;
  const unstaffed     = classes.filter(c => c.status === 'active' && (!c.teacher_ids || c.teacher_ids.length === 0)).length;

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <SchoolAdminPageShell
        title="Classes & Rosters"
        subtitle={`${activeCount} active · ${archivedCount} archived${unstaffed > 0 ? ` · ${unstaffed} unstaffed` : ''}`}
        badge={
          unstaffed > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {unstaffed} unstaffed
            </span>
          )
        }
      >
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
            <ClassSectionTab schoolId={schoolId} classes={classes} subjects={subjects} academicYears={academicYears} cohorts={cohorts} />
          </TabsContent>
          <TabsContent value="teachers">
            <TeacherAssignmentTab schoolId={schoolId} classes={classes} memberships={memberships} />
          </TabsContent>
          <TabsContent value="students">
            <StudentEnrollmentTab schoolId={schoolId} classes={classes} memberships={memberships} />
          </TabsContent>
          <TabsContent value="lifecycle">
            <ClassLifecycleTab schoolId={schoolId} classes={classes} memberships={memberships} academicYears={academicYears} />
          </TabsContent>
        </Tabs>
      </SchoolAdminPageShell>
    </RoleGuard>
  );
}