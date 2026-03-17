import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, FileSpreadsheet, Printer, Star, Users } from 'lucide-react';
import SchoolAdminPageShell from '@/components/app/SchoolAdminPageShell';

import ReportsCenterOverview from '@/components/reports/ReportsCenterOverview';
import CSVExportToolkit from '@/components/reports/CSVExportToolkit';
import PDFReportBuilder from '@/components/reports/PDFReportBuilder';
import CoordinatorReports from '@/components/reports/CoordinatorReports';
import ClassProgressReport from '@/components/reports/ClassProgressReport';

export default function SchoolAdminReports() {
  const { user, school, schoolId, role } = useUser();

  const { data: memberships = [] } = useQuery({ queryKey: ['school-memberships-reports', schoolId], queryFn: () => base44.entities.SchoolMembership.filter({ school_id: schoolId, status: 'active' }), enabled: !!schoolId });
  const { data: classes = [] } = useQuery({ queryKey: ['school-classes-reports', schoolId], queryFn: () => base44.entities.Class.filter({ school_id: schoolId, status: 'active' }), enabled: !!schoolId });
  const { data: grades = [] } = useQuery({ queryKey: ['school-grades-reports', schoolId], queryFn: () => base44.entities.GradeItem.filter({ school_id: schoolId }), enabled: !!schoolId });
  const { data: attendance = [] } = useQuery({ queryKey: ['school-attendance-reports', schoolId], queryFn: () => base44.entities.AttendanceRecord.filter({ school_id: schoolId }), enabled: !!schoolId });
  const { data: behavior = [] } = useQuery({ queryKey: ['school-behavior-reports', schoolId], queryFn: () => base44.entities.BehaviorRecord.filter({ school_id: schoolId }), enabled: !!schoolId });
  const { data: predictedGrades = [] } = useQuery({ queryKey: ['school-pg-reports', schoolId], queryFn: () => base44.entities.PredictedGrade.filter({ school_id: schoolId }), enabled: !!schoolId });
  const { data: casExperiences = [] } = useQuery({ queryKey: ['school-cas-reports', schoolId], queryFn: () => base44.entities.CASExperience.filter({ school_id: schoolId }), enabled: !!schoolId });
  const { data: terms = [] } = useQuery({ queryKey: ['school-terms-reports', schoolId], queryFn: () => base44.entities.Term.filter({ school_id: schoolId }), enabled: !!schoolId });
  const { data: cohorts = [] } = useQuery({ queryKey: ['school-cohorts-reports', schoolId], queryFn: () => base44.entities.Cohort.filter({ school_id: schoolId, status: 'active' }), enabled: !!schoolId });

  const sharedProps = { memberships, classes, grades, attendance, behavior, predictedGrades, casExperiences, terms, cohorts, school, schoolId, userName: user?.full_name };
  const isCoordinator = ['ib_coordinator', 'school_admin', 'super_admin', 'admin'].includes(role);

  return (
    <RoleGuard allowedRoles={['school_admin', 'ib_coordinator', 'super_admin', 'admin']}>
      <SchoolAdminPageShell
        title="Reports"
        subtitle="Generate operational and academic reports, export datasets, and print progress documents"
        maxWidth="max-w-7xl"
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 h-10 flex-wrap">
            <TabsTrigger value="overview" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <LayoutDashboard className="w-3.5 h-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="exports" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <FileSpreadsheet className="w-3.5 h-3.5" /> CSV Exports
            </TabsTrigger>
            <TabsTrigger value="class-reports" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Users className="w-3.5 h-3.5" /> Class Reports
            </TabsTrigger>
            <TabsTrigger value="pdf" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Printer className="w-3.5 h-3.5" /> PDF Reports
            </TabsTrigger>
            {isCoordinator && (
              <TabsTrigger value="coordinator" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                <Star className="w-3.5 h-3.5" /> IB Coordinator
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview"><ReportsCenterOverview {...sharedProps} /></TabsContent>
          <TabsContent value="exports"><CSVExportToolkit {...sharedProps} /></TabsContent>
          <TabsContent value="class-reports"><ClassProgressReport {...sharedProps} /></TabsContent>
          <TabsContent value="pdf"><PDFReportBuilder {...sharedProps} /></TabsContent>
          {isCoordinator && <TabsContent value="coordinator"><CoordinatorReports {...sharedProps} /></TabsContent>}
        </Tabs>
      </SchoolAdminPageShell>
    </RoleGuard>
  );
}