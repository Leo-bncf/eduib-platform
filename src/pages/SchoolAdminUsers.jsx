import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import { useUser } from '@/components/auth/UserContext';
import { UserCheck, Mail, Upload, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SchoolAdminPageShell from '@/components/app/SchoolAdminPageShell';

import UserDirectoryTab    from '@/components/users/UserDirectoryTab';
import InvitationsTab      from '@/components/users/InvitationsTab';
import BulkImportTab       from '@/components/users/BulkImportTab';
import MembershipHealthTab from '@/components/users/MembershipHealthTab';

export default function SchoolAdminUsers() {
  const { school, schoolId } = useUser();

  const { data: memberships = [] } = useQuery({
    queryKey: ['school-memberships', schoolId],
    queryFn: () => base44.entities.SchoolMembership.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ['user-invitations', schoolId],
    queryFn: () => base44.entities.UserInvitation.filter({ school_id: schoolId, status: 'pending' }, '-created_date', 50),
    enabled: !!schoolId,
  });

  const pendingInviteCount = invitations.filter(
    i => i.status === 'pending' && new Date(i.expires_at) > new Date()
  ).length;

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <SchoolAdminPageShell
        title="Users & Memberships"
        subtitle={`${memberships.length} members · ${school?.name}`}
        badge={
          pendingInviteCount > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
              <Mail className="w-3 h-3" />
              {pendingInviteCount} pending
            </span>
          )
        }
      >
        <Tabs defaultValue="directory">
          <TabsList className="bg-white border border-slate-200 h-10 mb-6">
            <TabsTrigger value="directory" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <UserCheck className="w-3.5 h-3.5" /> Directory
            </TabsTrigger>
            <TabsTrigger value="invitations" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Mail className="w-3.5 h-3.5" /> Invitations
              {pendingInviteCount > 0 && (
                <span className="ml-0.5 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingInviteCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="import" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Upload className="w-3.5 h-3.5" /> Bulk Import
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <ShieldCheck className="w-3.5 h-3.5" /> Membership Health
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory">
            <UserDirectoryTab schoolId={schoolId} />
          </TabsContent>
          <TabsContent value="invitations">
            <InvitationsTab schoolId={schoolId} schoolName={school?.name} />
          </TabsContent>
          <TabsContent value="import">
            <BulkImportTab schoolId={schoolId} schoolName={school?.name} />
          </TabsContent>
          <TabsContent value="health">
            <MembershipHealthTab schoolId={schoolId} />
          </TabsContent>
        </Tabs>
      </SchoolAdminPageShell>
    </RoleGuard>
  );
}