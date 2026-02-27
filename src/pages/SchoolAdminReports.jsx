import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, Settings, 
  Calendar, Clock, FileText, Download, Loader2, FileSpreadsheet,
  BarChart3, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { logAudit, AuditActions } from '@/components/utils/auditLogger';

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

export default function SchoolAdminReports() {
  const { user, school, schoolId } = useUser();
  const [exporting, setExporting] = useState(null);

  const { data: memberships = [] } = useQuery({
    queryKey: ['school-memberships-reports', schoolId],
    queryFn: () => base44.entities.SchoolMembership.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['school-classes-reports', schoolId],
    queryFn: () => base44.entities.Class.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['school-grades-reports', schoolId],
    queryFn: () => base44.entities.GradeItem.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['school-attendance-reports', schoolId],
    queryFn: () => base44.entities.AttendanceRecord.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const { data: behavior = [] } = useQuery({
    queryKey: ['school-behavior-reports', schoolId],
    queryFn: () => base44.entities.BehaviorRecord.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const exportToCSV = async (data, filename, type) => {
    try {
      setExporting(type);
      
      if (!data || data.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = Object.keys(data[0]).filter(key => !key.includes('_id') || key === 'id');
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
            if (Array.isArray(value)) return `"${value.join('; ')}"`;
            return value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await logAudit({
        action: AuditActions.DATA_EXPORT,
        entityType: type,
        entityId: schoolId,
        details: `Exported ${data.length} ${type} records to CSV`,
        schoolId,
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const students = memberships.filter(m => m.role === 'student');
  const teachers = memberships.filter(m => m.role === 'teacher');

  return (
    <RoleGuard allowedRoles={['school_admin', 'ib_coordinator', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="school_admin" schoolName={school?.name} userName={user?.full_name} userId={user?.id} schoolId={schoolId} />
        
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Reports & Exports</h1>
              <p className="text-slate-600">Generate and export operational reports</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white border border-slate-200">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <Users className="w-8 h-8 text-indigo-600 mb-3" />
                    <p className="text-sm text-slate-500 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-slate-900">{memberships.length}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <BookOpen className="w-8 h-8 text-emerald-600 mb-3" />
                    <p className="text-sm text-slate-500 mb-1">Active Classes</p>
                    <p className="text-3xl font-bold text-slate-900">{classes.length}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <BarChart3 className="w-8 h-8 text-amber-600 mb-3" />
                    <p className="text-sm text-slate-500 mb-1">Grades Recorded</p>
                    <p className="text-3xl font-bold text-slate-900">{grades.length}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <Calendar className="w-8 h-8 text-rose-600 mb-3" />
                    <p className="text-sm text-slate-500 mb-1">Attendance Records</p>
                    <p className="text-3xl font-bold text-slate-900">{attendance.length}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users">
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Student Directory</h3>
                        <p className="text-sm text-slate-500 mt-1">{students.length} students</p>
                      </div>
                      <Button 
                        onClick={() => exportToCSV(students, 'students', 'students')}
                        disabled={exporting === 'students' || students.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {exporting === 'students' ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</>
                        ) : (
                          <><Download className="w-4 h-4 mr-2" /> Export Students</>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600">Export complete student directory with contact information, grade levels, and enrollment status.</p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Teacher Directory</h3>
                        <p className="text-sm text-slate-500 mt-1">{teachers.length} teachers</p>
                      </div>
                      <Button 
                        onClick={() => exportToCSV(teachers, 'teachers', 'teachers')}
                        disabled={exporting === 'teachers' || teachers.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {exporting === 'teachers' ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</>
                        ) : (
                          <><Download className="w-4 h-4 mr-2" /> Export Teachers</>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600">Export teacher directory with department assignments and contact information.</p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">All Users</h3>
                        <p className="text-sm text-slate-500 mt-1">{memberships.length} total users</p>
                      </div>
                      <Button 
                        onClick={() => exportToCSV(memberships, 'all_users', 'users')}
                        disabled={exporting === 'users' || memberships.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {exporting === 'users' ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</>
                        ) : (
                          <><Download className="w-4 h-4 mr-2" /> Export All Users</>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600">Export complete user list including all roles and status information.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="academic">
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Class Enrollments</h3>
                        <p className="text-sm text-slate-500 mt-1">{classes.length} classes</p>
                      </div>
                      <Button 
                        onClick={() => exportToCSV(classes, 'classes', 'classes')}
                        disabled={exporting === 'classes' || classes.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {exporting === 'classes' ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</>
                        ) : (
                          <><Download className="w-4 h-4 mr-2" /> Export Classes</>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600">Export class rosters with teacher assignments and student enrollments.</p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Grade Records</h3>
                        <p className="text-sm text-slate-500 mt-1">{grades.length} grades</p>
                      </div>
                      <Button 
                        onClick={() => exportToCSV(grades, 'grades', 'grades')}
                        disabled={exporting === 'grades' || grades.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {exporting === 'grades' ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</>
                        ) : (
                          <><Download className="w-4 h-4 mr-2" /> Export Grades</>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600">Export all grade records including scores, IB grades, and visibility status.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attendance">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Attendance Records</h3>
                      <p className="text-sm text-slate-500 mt-1">{attendance.length} records</p>
                    </div>
                    <Button 
                      onClick={() => exportToCSV(attendance, 'attendance', 'attendance')}
                      disabled={exporting === 'attendance' || attendance.length === 0}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {exporting === 'attendance' ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</>
                      ) : (
                        <><Download className="w-4 h-4 mr-2" /> Export Attendance</>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">Export complete attendance history by student, class, and date.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 mb-1">Present</p>
                      <p className="text-2xl font-bold text-green-600">{attendance.filter(a => a.status === 'present').length}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 mb-1">Absent</p>
                      <p className="text-2xl font-bold text-red-600">{attendance.filter(a => a.status === 'absent').length}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 mb-1">Late</p>
                      <p className="text-2xl font-bold text-amber-600">{attendance.filter(a => a.status === 'late').length}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 mb-1">Excused</p>
                      <p className="text-2xl font-bold text-blue-600">{attendance.filter(a => a.status === 'excused').length}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="behavior">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Behavior Records</h3>
                      <p className="text-sm text-slate-500 mt-1">{behavior.length} records</p>
                    </div>
                    <Button 
                      onClick={() => exportToCSV(behavior, 'behavior', 'behavior')}
                      disabled={exporting === 'behavior' || behavior.length === 0}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {exporting === 'behavior' ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</>
                      ) : (
                        <><Download className="w-4 h-4 mr-2" /> Export Behavior</>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">Export behavior records including incidents, notes, and actions taken.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-xs text-green-700 mb-1">Positive</p>
                      <p className="text-2xl font-bold text-green-600">{behavior.filter(b => b.type === 'positive').length}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <p className="text-xs text-amber-700 mb-1">Concerns</p>
                      <p className="text-2xl font-bold text-amber-600">{behavior.filter(b => b.type === 'concern').length}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-xs text-red-700 mb-1">Incidents</p>
                      <p className="text-2xl font-bold text-red-600">{behavior.filter(b => b.type === 'incident').length}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 mb-1">Notes</p>
                      <p className="text-2xl font-bold text-slate-600">{behavior.filter(b => b.type === 'note').length}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}