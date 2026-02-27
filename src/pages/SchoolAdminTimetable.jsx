import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Users, BookOpen, GraduationCap, Settings, Calendar, Loader2, Clock, MapPin, Plus, RefreshCw, FileText, Activity } from 'lucide-react';
import TimetableIntegrationStatus from '@/components/timetable/TimetableIntegrationStatus';
import TimetableSyncHistory from '@/components/timetable/TimetableSyncHistory';
import TimetableImportDialog from '@/components/timetable/TimetableImportDialog';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SchoolAdminDashboard', icon: LayoutDashboard },
  { label: 'Users', page: 'SchoolAdminUsers', icon: Users },
  { label: 'Classes', page: 'SchoolAdminClasses', icon: BookOpen },
  { label: 'Subjects', page: 'SchoolAdminSubjects', icon: GraduationCap },
  { label: 'Attendance', page: 'SchoolAdminAttendance', icon: Calendar },
  { label: 'Timetable', page: 'SchoolAdminTimetable', icon: Clock },
  { label: 'Reports', page: 'SchoolAdminReports', icon: FileText },
  { label: 'Billing', page: 'SchoolAdminBilling', icon: FileText },
  { label: 'Settings', page: 'SchoolAdminSettings', icon: Settings },
];

export default function SchoolAdminTimetable() {
  const { user, school, schoolId } = useUser();
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const { data: scheduleEntries = [], isLoading } = useQuery({
    queryKey: ['school-schedule', schoolId, selectedDay],
    queryFn: () => base44.entities.ScheduleEntry.filter({
      school_id: schoolId,
      day_of_week: selectedDay,
      status: 'active'
    }),
    enabled: !!schoolId,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['school-rooms', schoolId],
    queryFn: () => base44.entities.Room.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const { data: periods = [] } = useQuery({
    queryKey: ['school-periods', schoolId],
    queryFn: () => base44.entities.Period.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <RoleGuard allowedRoles={['school_admin', 'ib_coordinator', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="school_admin" schoolName={school?.name} userName={user?.full_name} userId={user?.id} schoolId={schoolId} />
        
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Timetable Management</h1>
                <p className="text-slate-600">Manage school schedule and sync with external systems</p>
              </div>
              <Button 
                onClick={() => setImportDialogOpen(true)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <RefreshCw className="w-4 h-4" />
                Import from External System
              </Button>
            </div>

            <Tabs defaultValue="integration" className="space-y-6">
              <TabsList className="bg-white border border-slate-200">
                <TabsTrigger value="integration">
                  <Activity className="w-4 h-4 mr-2" />
                  Integration
                </TabsTrigger>
                <TabsTrigger value="schedule">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="periods">
                  <Clock className="w-4 h-4 mr-2" />
                  Periods
                </TabsTrigger>
                <TabsTrigger value="rooms">
                  <MapPin className="w-4 h-4 mr-2" />
                  Rooms
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="integration">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <TimetableIntegrationStatus schoolId={schoolId} />
                  </div>
                  <div className="lg:col-span-2">
                    <TimetableSyncHistory schoolId={schoolId} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    {dayNames.map((day, idx) => (
                      <Button
                        key={idx}
                        variant={selectedDay === idx ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedDay(idx)}
                        className={selectedDay === idx ? 'bg-indigo-600' : ''}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                  ) : scheduleEntries.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No schedule entries for {dayNames[selectedDay]}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {scheduleEntries.sort((a, b) => a.start_time.localeCompare(b.start_time)).map(entry => (
                        <div key={entry.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-slate-900">{entry.class_name}</h4>
                                {entry.external_sync_id && (
                                  <Badge className="bg-indigo-50 text-indigo-700 border-0 text-xs">
                                    Synced
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {entry.start_time} - {entry.end_time}
                                </span>
                                {entry.room_name && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {entry.room_name}
                                  </span>
                                )}
                                {entry.teacher_name && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {entry.teacher_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline">Active</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="periods">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Time Periods</h2>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Period
                    </Button>
                  </div>
                  {periods.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No periods configured</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {periods.sort((a, b) => (a.period_order || 0) - (b.period_order || 0)).map(period => (
                        <div key={period.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-900">{period.name}</h4>
                                {period.external_sync_id && (
                                  <Badge className="bg-indigo-50 text-indigo-700 border-0 text-xs">
                                    Synced
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600">
                                {period.start_time} - {period.end_time}
                                {period.is_break && <Badge className="ml-2 bg-amber-50 text-amber-700 border-0">Break</Badge>}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="rooms">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Rooms & Facilities</h2>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Room
                    </Button>
                  </div>
                  {rooms.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No rooms configured</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rooms.map(room => (
                        <div key={room.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-900">{room.name}</h4>
                                {room.external_sync_id && (
                                  <Badge className="bg-indigo-50 text-indigo-700 border-0 text-xs">
                                    Synced
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className="capitalize">{room.room_type}</Badge>
                          </div>
                          {room.building && (
                            <p className="text-sm text-slate-600 mb-1">{room.building}</p>
                          )}
                          {room.capacity && (
                            <p className="text-xs text-slate-500">Capacity: {room.capacity}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Timetable Integration Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-slate-200 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-2">External System Sync</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Connect to your external timetable generation system for automatic schedule updates.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-slate-700">Sync Status</label>
                          <p className="text-sm text-slate-500 mt-1">Ready for integration</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Last Sync</label>
                          <p className="text-sm text-slate-500 mt-1">Never synced</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-2">Schedule Settings</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Configure how timetable data is displayed and managed across the platform.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="show_room" className="w-4 h-4" defaultChecked />
                          <label htmlFor="show_room" className="text-sm text-slate-700">Show room information</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="show_teacher" className="w-4 h-4" defaultChecked />
                          <label htmlFor="show_teacher" className="text-sm text-slate-700">Show teacher names to students</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="link_attendance" className="w-4 h-4" defaultChecked />
                          <label htmlFor="link_attendance" className="text-sm text-slate-700">Link attendance to schedule sessions</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <TimetableImportDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          schoolId={schoolId}
        />
      </div>
    </RoleGuard>
  );
}