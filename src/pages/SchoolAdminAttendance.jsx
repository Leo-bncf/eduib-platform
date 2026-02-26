import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Users, BookOpen, GraduationCap, Settings, Calendar, Loader2, CheckCircle2, XCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { format, subDays } from 'date-fns';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SchoolAdminDashboard', icon: LayoutDashboard },
  { label: 'Users', page: 'SchoolAdminUsers', icon: Users },
  { label: 'Classes', page: 'SchoolAdminClasses', icon: BookOpen },
  { label: 'Subjects', page: 'SchoolAdminSubjects', icon: GraduationCap },
  { label: 'Attendance', page: 'SchoolAdminAttendance', icon: Calendar },
  { label: 'Timetable', page: 'SchoolAdminTimetable', icon: Clock },
  { label: 'Reports', page: 'SchoolAdminReports', icon: FileText },
  { label: 'Settings', page: 'SchoolAdminDashboard', icon: Settings },
];

export default function SchoolAdminAttendance() {
  const { user, school, schoolId } = useUser();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['school-attendance', schoolId, selectedDate],
    queryFn: () => base44.entities.AttendanceRecord.filter({
      school_id: schoolId,
      date: selectedDate
    }),
    enabled: !!schoolId && !!selectedDate,
  });

  const { data: recentRecords = [] } = useQuery({
    queryKey: ['school-attendance-recent', schoolId],
    queryFn: async () => {
      const last7Days = [];
      for (let i = 0; i < 7; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const dayRecords = await base44.entities.AttendanceRecord.filter({
          school_id: schoolId,
          date
        });
        last7Days.push(...dayRecords);
      }
      return last7Days;
    },
    enabled: !!schoolId,
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'late': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'excused': return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const statusCounts = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const recentStatusCounts = recentRecords.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const attendanceRate = records.length > 0
    ? ((statusCounts.present || 0) / records.length * 100).toFixed(1)
    : '0';

  return (
    <RoleGuard allowedRoles={['school_admin', 'ib_coordinator', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="school_admin" schoolName={school?.name} userName={user?.full_name} userId={user?.id} schoolId={schoolId} />
        
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Attendance Overview</h1>
            <p className="text-slate-600 mb-8">Monitor school-wide attendance</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
                <p className="text-sm text-emerald-700 font-medium">Present (Last 7 days)</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">{recentStatusCounts.present || 0}</p>
              </div>
              <div className="bg-red-50 rounded-xl border border-red-200 p-5">
                <p className="text-sm text-red-700 font-medium">Absent (Last 7 days)</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{recentStatusCounts.absent || 0}</p>
              </div>
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
                <p className="text-sm text-amber-700 font-medium">Late (Last 7 days)</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">{recentStatusCounts.late || 0}</p>
              </div>
              <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-5">
                <p className="text-sm text-indigo-700 font-medium">Today's Rate</p>
                <p className="text-3xl font-bold text-indigo-900 mt-1">{attendanceRate}%</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Daily Records</h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No attendance records for this date</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Class</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Note</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records.map(record => (
                        <tr key={record.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{record.student_name}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">Class {record.class_id}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              {getStatusIcon(record.status)}
                              <Badge variant="outline" className="capitalize">{record.status}</Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{record.note || '—'}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{record.recorded_by || 'System'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}