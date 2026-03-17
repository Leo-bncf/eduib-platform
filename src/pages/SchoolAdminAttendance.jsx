import React, { useState } from 'react';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import { BarChart2, Tag, PenLine, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SchoolAdminPageShell from '@/components/app/SchoolAdminPageShell';

import AttendanceDashboard        from '@/components/attendance-admin/AttendanceDashboard';
import AttendanceCodeConfig       from '@/components/attendance-admin/AttendanceCodeConfig';
import AttendanceCorrectionWorkflow from '@/components/attendance-admin/AttendanceCorrectionWorkflow';
import AttendanceExport           from '@/components/attendance-admin/AttendanceExport';

export default function SchoolAdminAttendance() {
  const { school, schoolId } = useUser();

  return (
    <RoleGuard allowedRoles={['school_admin', 'ib_coordinator', 'super_admin', 'admin']}>
      <SchoolAdminPageShell
        title="Attendance"
        subtitle={`${school?.name} · Attendance tracking & management`}
        maxWidth="max-w-7xl"
      >
        <Tabs defaultValue="dashboard">
          <TabsList className="bg-white border border-slate-200 h-10 mb-6">
            <TabsTrigger value="dashboard" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <BarChart2 className="w-3.5 h-3.5" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="codes" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Tag className="w-3.5 h-3.5" /> Code Config
            </TabsTrigger>
            <TabsTrigger value="corrections" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <PenLine className="w-3.5 h-3.5" /> Corrections
            </TabsTrigger>
            <TabsTrigger value="exports" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Download className="w-3.5 h-3.5" /> Exports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AttendanceDashboard schoolId={schoolId} />
          </TabsContent>
          <TabsContent value="codes">
            <AttendanceCodeConfig schoolId={schoolId} />
          </TabsContent>
          <TabsContent value="corrections">
            <AttendanceCorrectionWorkflow schoolId={schoolId} />
          </TabsContent>
          <TabsContent value="exports">
            <AttendanceExport schoolId={schoolId} schoolName={school?.name} />
          </TabsContent>
        </Tabs>
      </SchoolAdminPageShell>
    </RoleGuard>
  );
}