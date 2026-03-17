import React, { useState } from 'react';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import LoadingStateBase from '@/components/common/LoadingStateBase';
import { CalendarDays, BookMarked, UsersRound, Library } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SchoolAdminPageShell from '@/components/app/SchoolAdminPageShell';

import AcademicYearsTab  from '@/components/academic-setup/AcademicYearsTab';
import TermsTab          from '@/components/academic-setup/TermsTab';
import CohortsTab        from '@/components/academic-setup/CohortsTab';
import SubjectCatalogTab from '@/components/academic-setup/SubjectCatalogTab';

export default function SchoolAdminAcademicSetup() {
  const { user, school, schoolId, loading } = useUser();

  if (loading || !user) return <LoadingStateBase />;

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <SchoolAdminPageShell
        title="Academic Setup"
        subtitle={`${school?.name} · School structure & academic framework configuration`}
        maxWidth="max-w-5xl"
      >
        <Tabs defaultValue="years">
          <TabsList className="bg-white border border-slate-200 h-10 mb-6">
            <TabsTrigger value="years" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <CalendarDays className="w-3.5 h-3.5" /> Academic Years
            </TabsTrigger>
            <TabsTrigger value="terms" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <BookMarked className="w-3.5 h-3.5" /> Terms & Reporting
            </TabsTrigger>
            <TabsTrigger value="cohorts" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <UsersRound className="w-3.5 h-3.5" /> Cohorts & Groups
            </TabsTrigger>
            <TabsTrigger value="subjects" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Library className="w-3.5 h-3.5" /> Subject Catalogue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="years"><AcademicYearsTab schoolId={schoolId} /></TabsContent>
          <TabsContent value="terms"><TermsTab schoolId={schoolId} /></TabsContent>
          <TabsContent value="cohorts"><CohortsTab schoolId={schoolId} /></TabsContent>
          <TabsContent value="subjects"><SubjectCatalogTab schoolId={schoolId} /></TabsContent>
        </Tabs>
      </SchoolAdminPageShell>
    </RoleGuard>
  );
}