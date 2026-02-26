import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import StatCard from '@/components/app/StatCard';
import TodaySchedule from '@/components/timetable/TodaySchedule';
import { useUser } from '@/components/auth/UserContext';
import { 
  LayoutDashboard, BookOpen, ClipboardCheck, BarChart3, 
  MessageSquare, Star, Loader2, Clock, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';

const sidebarLinks = [
  { label: 'Dashboard', page: 'StudentDashboard', icon: LayoutDashboard },
  { label: 'My Classes', page: 'StudentDashboard', icon: BookOpen },
  { label: 'Assignments', page: 'StudentDashboard', icon: ClipboardCheck },
  { label: 'My Grades', page: 'StudentDashboard', icon: BarChart3 },
  { label: 'Messages', page: 'StudentDashboard', icon: MessageSquare },
  { label: 'IB Core', page: 'StudentDashboard', icon: Star },
];

export default function StudentDashboard() {
  const { user, school, schoolId } = useUser();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['student-classes', schoolId, user?.id],
    queryFn: async () => {
      const all = await base44.entities.Class.filter({ school_id: schoolId, status: 'active' });
      return all.filter(c => c.student_ids?.includes(user.id));
    },
    enabled: !!schoolId && !!user?.id,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['student-assignments', schoolId, user?.id],
    queryFn: async () => {
      const classIds = classes.map(c => c.id);
      if (classIds.length === 0) return [];
      const all = await base44.entities.Assignment.filter({ school_id: schoolId, status: 'published' });
      return all.filter(a => classIds.includes(a.class_id));
    },
    enabled: !!schoolId && classes.length > 0,
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['student-grades', schoolId, user?.id],
    queryFn: () => base44.entities.GradeItem.filter({ school_id: schoolId, student_id: user.id, visible_to_student: true }),
    enabled: !!schoolId && !!user?.id,
  });

  const upcomingAssignments = assignments.filter(a => a.due_date && new Date(a.due_date) > new Date()).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return (
    <RoleGuard allowedRoles={['student', 'school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="student" schoolName={school?.name} userName={user?.full_name} userId={user?.id} schoolId={schoolId} />
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}</h1>
              <p className="text-sm text-slate-500 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard label="My Classes" value={classes.length} icon={BookOpen} color="indigo" />
                  <StatCard label="Assignments Due" value={upcomingAssignments.length} icon={ClipboardCheck} color="amber" />
                  <StatCard label="Grades" value={grades.length} icon={BarChart3} color="emerald" />
                  <StatCard label="Average" value={grades.length > 0 ? (grades.reduce((s, g) => s + (g.ib_grade || 0), 0) / grades.length).toFixed(1) : '—'} icon={Star} color="violet" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-100">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        Today's Schedule
                      </h2>
                    </div>
                    <div className="p-6">
                      <TodaySchedule schoolId={schoolId} userId={user?.id} userRole="student" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-100">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h2 className="font-semibold text-slate-900">Upcoming Assignments</h2>
                    </div>
                    {upcomingAssignments.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-sm">No upcoming assignments</div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {upcomingAssignments.slice(0, 6).map(a => (
                          <div key={a.id} className="px-6 py-4 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{a.title}</p>
                              <p className="text-xs text-slate-400 capitalize">{a.type?.replace('_', ' ')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs text-slate-500">{format(new Date(a.due_date), 'MMM d')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-slate-100">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h2 className="font-semibold text-slate-900">My Classes</h2>
                    </div>
                    {classes.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-sm">No classes enrolled</div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {classes.map(c => (
                          <a key={c.id} href={createPageUrl('ClassWorkspace') + `?class_id=${c.id}`}>
                            <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                              <div>
                                <p className="font-medium text-slate-900 text-sm">{c.name}</p>
                                <p className="text-xs text-slate-400">{c.room ? `Room ${c.room}` : ''}</p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}