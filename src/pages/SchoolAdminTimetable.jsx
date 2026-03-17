import React from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import { useUser } from '@/components/auth/UserContext';
import { Activity, MapPin, AlertTriangle, Link2, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SchoolAdminPageShell from '@/components/app/SchoolAdminPageShell';

import { useTimetableData, OVERRIDE_POLICY_CONFIG } from '@/components/timetable/useTimetableData';
import TimetableStructureTab from '@/components/timetable/TimetableStructureTab';
import SyncSettingsTab       from '@/components/timetable/SyncSettingsTab';
import SyncMonitorTab        from '@/components/timetable/SyncMonitorTab';
import ConflictResolutionTab from '@/components/timetable/ConflictResolutionTab';

export default function SchoolAdminTimetable() {
  const { school, schoolId } = useUser();

  const { scheduleEntries, periods, rooms, syncHistory, settings, memberships, classes } = useTimetableData(schoolId);

  const overridePolicy = settings?.override_policy || 'allow_local_edits';
  const policyCfg = OVERRIDE_POLICY_CONFIG[overridePolicy];
  const lastSync = syncHistory[0];
  const openConflicts = syncHistory.reduce((sum, s) => sum + (s.mapping_conflicts?.filter(c => !c.resolved).length || 0), 0);
  const lastSyncFailed = lastSync?.status === 'failed';

  return (
    <RoleGuard allowedRoles={['school_admin', 'ib_coordinator', 'super_admin', 'admin']}>
      <SchoolAdminPageShell
        title="Timetable"
        subtitle={`${scheduleEntries.filter(e => e.status === 'active').length} entries · ${periods.length} periods · ${rooms.length} rooms`}
        badge={
          (openConflicts > 0 || lastSyncFailed) && (
            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              {lastSyncFailed ? 'Sync failed' : `${openConflicts} conflict${openConflicts !== 1 ? 's' : ''}`}
            </span>
          )
        }
      >
        <Tabs defaultValue="structure">
          <TabsList className="bg-white border border-slate-200 h-10 mb-6 flex-wrap">
            <TabsTrigger value="structure" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <MapPin className="w-3.5 h-3.5" /> Structure
            </TabsTrigger>
            <TabsTrigger value="sync-settings" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Settings className="w-3.5 h-3.5" /> Sync Settings
            </TabsTrigger>
            <TabsTrigger value="monitor" className="text-xs gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Activity className="w-3.5 h-3.5" /> Monitor & Logs
              {(openConflicts > 0 || lastSyncFailed) && (
                <span className="ml-0.5 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">!</span>
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
            <TimetableStructureTab schoolId={schoolId} periods={periods} rooms={rooms} scheduleEntries={scheduleEntries} settings={settings} />
          </TabsContent>
          <TabsContent value="sync-settings">
            <SyncSettingsTab schoolId={schoolId} settings={settings} />
          </TabsContent>
          <TabsContent value="monitor">
            <SyncMonitorTab schoolId={schoolId} syncHistory={syncHistory} settings={settings} scheduleEntries={scheduleEntries} periods={periods} rooms={rooms} />
          </TabsContent>
          <TabsContent value="conflicts">
            <ConflictResolutionTab schoolId={schoolId} syncHistory={syncHistory} settings={settings} memberships={memberships} classes={classes} rooms={rooms} periods={periods} />
          </TabsContent>
        </Tabs>
      </SchoolAdminPageShell>
    </RoleGuard>
  );
}