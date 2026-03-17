import React, { useState } from 'react';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import { BarChart2, Tag, Shield, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SchoolAdminPageShell from '@/components/app/SchoolAdminPageShell';

import BehaviorDashboard    from '@/components/behavior-admin/BehaviorDashboard';
import BehaviorPolicyConfig from '@/components/behavior-admin/BehaviorPolicyConfig';
import PastoralOversight    from '@/components/behavior-admin/PastoralOversight';
import BehaviorExport       from '@/components/behavior-admin/BehaviorExport';

export default function SchoolAdminBehavior() {
  const { school, schoolId, role } = useUser();
  const isPastoral = ['school_admin', 'ib_coordinator', 'super_admin', 'admin'].includes(role);

  return (
    <RoleGuard allowedRoles={['school_admin', 'ib_coordinator', 'super_admin', 'admin']}>
      <SchoolAdminPageShell
        title="Behaviour & Pastoral"
        subtitle={`${school?.name} · Behaviour records & pastoral oversight`}
        maxWidth="max-w-7xl"
      >
        <Tabs defaultValue="dashboard">
          <TabsList className="bg-white border border-slate-200 h-10 mb-6">
            <TabsTrigger value="dashboard" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <BarChart2 className="w-3.5 h-3.5" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="pastoral" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Shield className="w-3.5 h-3.5" /> Pastoral Oversight
            </TabsTrigger>
            <TabsTrigger value="policy" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Tag className="w-3.5 h-3.5" /> Policy Config
            </TabsTrigger>
            <TabsTrigger value="exports" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Download className="w-3.5 h-3.5" /> Exports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <BehaviorDashboard schoolId={schoolId} isPastoral={isPastoral} />
          </TabsContent>
          <TabsContent value="pastoral">
            <PastoralOversight schoolId={schoolId} />
          </TabsContent>
          <TabsContent value="policy">
            <BehaviorPolicyConfig schoolId={schoolId} />
          </TabsContent>
          <TabsContent value="exports">
            <BehaviorExport schoolId={schoolId} schoolName={school?.name} />
          </TabsContent>
        </Tabs>
      </SchoolAdminPageShell>
    </RoleGuard>
  );
}