import React, { useState } from 'react';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import ChildSelector from '@/components/parent/ChildSelector';
import ChildGradesOverview from '@/components/parent/ChildGradesOverview';
import ChildAssignmentsOverview from '@/components/parent/ChildAssignmentsOverview';
import ChildAttendanceOverview from '@/components/parent/ChildAttendanceOverview';
import ChildBehaviorOverview from '@/components/parent/ChildBehaviorOverview';
import ParentMessaging from '@/components/parent/ParentMessaging';
import { LayoutDashboard, Users, MessageSquare, BarChart3, ClipboardCheck, Calendar, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const sidebarLinks = [
  { label: 'Dashboard', page: 'ParentDashboard', icon: LayoutDashboard },
  { label: 'Messages', page: 'Messages', icon: MessageSquare },
];

const sidebarLinks = [
  { label: 'Dashboard', page: 'ParentDashboard', icon: LayoutDashboard },
  { label: 'Messages', page: 'Messages', icon: MessageSquare },
];

export default function ParentDashboard() {
  const { user, school, schoolId } = useUser();
  const [selectedChildId, setSelectedChildId] = useState(null);

  return (
    <RoleGuard allowedRoles={['parent', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="parent" schoolName={school?.name} userName={user?.full_name} userId={user?.id} schoolId={schoolId} />
        
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Parent Portal</h1>
              <p className="text-slate-600 mb-6">Monitor your child's academic progress and school activities</p>
              
              <ChildSelector
                parentId={user?.id}
                schoolId={schoolId}
                selectedChildId={selectedChildId}
                onSelectChild={setSelectedChildId}
              />
            </div>

            {selectedChildId ? (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white border border-slate-200">
                  <TabsTrigger value="overview">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="grades">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Grades
                  </TabsTrigger>
                  <TabsTrigger value="assignments">
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Assignments
                  </TabsTrigger>
                  <TabsTrigger value="attendance">
                    <Calendar className="w-4 h-4 mr-2" />
                    Attendance
                  </TabsTrigger>
                  <TabsTrigger value="messages">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </TabsTrigger>
                  <TabsTrigger value="behavior">
                    <FileText className="w-4 h-4 mr-2" />
                    Behavior
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Grades</h2>
                      <ChildGradesOverview schoolId={schoolId} studentId={selectedChildId} />
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-4">Assignments</h2>
                      <ChildAssignmentsOverview schoolId={schoolId} studentId={selectedChildId} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="grades">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Grades & Feedback</h2>
                    <ChildGradesOverview schoolId={schoolId} studentId={selectedChildId} />
                  </div>
                </TabsContent>

                <TabsContent value="assignments">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Assignments Overview</h2>
                    <ChildAssignmentsOverview schoolId={schoolId} studentId={selectedChildId} />
                  </div>
                </TabsContent>

                <TabsContent value="attendance">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Attendance Records</h2>
                    <ChildAttendanceOverview schoolId={schoolId} studentId={selectedChildId} />
                  </div>
                </TabsContent>

                <TabsContent value="messages">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Teacher Communication</h2>
                    <ParentMessaging
                      parentId={user?.id}
                      parentName={user?.full_name}
                      schoolId={schoolId}
                      studentId={selectedChildId}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="behavior">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Behavior & Notes</h2>
                    <ChildBehaviorOverview schoolId={schoolId} studentId={selectedChildId} />
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Select a Child</h2>
                <p className="text-slate-600">Choose a child from the dropdown above to view their information</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}