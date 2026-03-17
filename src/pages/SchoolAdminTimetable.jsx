import React from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { useUser } from '@/components/auth/UserContext';
import {
  Activity, MapPin, AlertTriangle, Link2, Settings,
} from 'lucide-react';
import { SCHOOL_ADMIN_SIDEBAR_LINKS } from '@/components/app/schoolAdminSidebarLinks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { useTimetableData, OVERRIDE_POLICY_CONFIG } from '@/components/timetable/useTimetableData';
import TimetableStructureTab from '@/components/timetable/TimetableStructureTab';
import SyncSettingsTab       from '@/components/timetable/SyncSettingsTab';
import SyncMonitorTab        from '@/components/timetable/SyncMonitorTab';
import ConflictResolutionTab from '@/components/timetable/ConflictResolutionTab';



export default function SchoolAdminTimetable() {
  const { user, school, schoolId } = useUser();

  const {
    scheduleEntries, periods, rooms, syncHistory, settings,
    memberships, classes, isLoading, refetchAll,
  } = useTimetableData(schoolId);

  const overridePolicy = settings?.override_policy || 'allow_local_edits';
  const policyCfg = OVERRIDE_POLICY_CONFIG[overridePolicy];

  const lastSync = syncHistory[0];
  const openConflicts = syncHistory.reduce(
    (sum, s) => sum + (s.mapping_conflicts?.filter(c => !c.resolved).length || 0),
    0
  );
  const lastSyncFailed = lastSync?.status === 'failed';

  return (
    <RoleGuard allowedRoles={['school_admin', 'ib_coordinator', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar
          links={SCHOOL_ADMIN_SIDEBAR_LINKS}
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
                <h1 className="text-base font-black text-slate-900 tracking-tight">Timetable & Integration Controls</h1>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <p className="text-xs text-slate-400">
                    {scheduleEntries.filter(e => e.status === 'active').length} schedule entries · {periods.length} periods · {rooms.length} rooms
                  </p>
                  {settings?.sync_enabled && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${policyCfg.color}`}>
                      {policyCfg.icon} {policyCfg.label}
                    </span>
                  )}
                  {openConflicts > 0 && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />{openConflicts} conflict{openConflicts !== 1 ? 's' : ''}
                    </span>
                  )}
                  {lastSyncFailed && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                      Last sync failed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
            <Tabs defaultValue="structure">
              <TabsList className="bg-white border border-slate-200 h-10 mb-6 flex-wrap h-auto gap-0">
                <TabsTrigger value="structure" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                  <MapPin className="w-3.5 h-3.5" /> Structure
                </TabsTrigger>
                <TabsTrigger value="sync-settings" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                  <Settings className="w-3.5 h-3.5" /> Sync Settings
                </TabsTrigger>
                <TabsTrigger value="monitor" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                  <Activity className="w-3.5 h-3.5" /> Monitor & Logs
                  {(openConflicts > 0 || lastSyncFailed) && (
                    <span className="ml-0.5 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      !
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="conflicts" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                  <Link2 className="w-3.5 h-3.5" /> Conflict Resolution
                  {openConflicts > 0 && (
                    <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {openConflicts > 9 ? '9+' : openConflicts}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="structure">
                <TimetableStructureTab
                  schoolId={schoolId}
                  periods={periods}
                  rooms={rooms}
                  scheduleEntries={scheduleEntries}
                  settings={settings}
                />
              </TabsContent>

              <TabsContent value="sync-settings">
                <SyncSettingsTab
                  schoolId={schoolId}
                  settings={settings}
                />
              </TabsContent>

              <TabsContent value="monitor">
                <SyncMonitorTab
                  schoolId={schoolId}
                  syncHistory={syncHistory}
                  settings={settings}
                  scheduleEntries={scheduleEntries}
                  periods={periods}
                  rooms={rooms}
                />
              </TabsContent>

              <TabsContent value="conflicts">
                <ConflictResolutionTab
                  schoolId={schoolId}
                  syncHistory={syncHistory}
                  settings={settings}
                  memberships={memberships}
                  classes={classes}
                  rooms={rooms}
                  periods={periods}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}