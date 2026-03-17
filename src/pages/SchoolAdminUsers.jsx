import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { useUser } from '@/components/auth/UserContext';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Clock, GraduationCap,
  Settings, FileText, CreditCard, UserCheck, Mail, Upload, ShieldCheck
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import UserDirectoryTab    from '@/components/users/UserDirectoryTab';
import InvitationsTab      from '@/components/users/InvitationsTab';
import BulkImportTab       from '@/components/users/BulkImportTab';
import MembershipHealthTab from '@/components/users/MembershipHealthTab';

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

export default function SchoolAdminUsers() {
  const { user, school, schoolId } = useUser();

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
          {/* Page header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
              <div>
                <h1 className="text-base font-black text-slate-900 tracking-tight">User & Membership Administration</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {memberships.length} members · {school?.name}
                </p>
              </div>
              {pendingInviteCount > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                  <Mail className="w-3.5 h-3.5" />
                  {pendingInviteCount} pending invitation{pendingInviteCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
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
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}