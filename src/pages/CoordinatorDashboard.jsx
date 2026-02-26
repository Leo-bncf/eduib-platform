import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import StatCard from '@/components/app/StatCard';
import { useUser } from '@/components/auth/UserContext';
import { 
  LayoutDashboard, Users, BarChart3, Star, FileText, 
  Loader2, GraduationCap, BookOpen, TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

const sidebarLinks = [
  { label: 'Dashboard', page: 'CoordinatorDashboard', icon: LayoutDashboard },
  { label: 'Cohorts', page: 'CoordinatorDashboard', icon: Users },
  { label: 'Predicted Grades', page: 'CoordinatorDashboard', icon: BarChart3 },
  { label: 'Reporting', page: 'CoordinatorDashboard', icon: FileText },
  { label: 'IB Core', page: 'CoordinatorIBCore', icon: Star },
];

export default function CoordinatorDashboard() {
  const { user, school, schoolId } = useUser();

  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ['school-memberships-coord', schoolId],
    queryFn: () => base44.entities.SchoolMembership.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['school-classes-coord', schoolId],
    queryFn: () => base44.entities.Class.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['school-subjects-coord', schoolId],
    queryFn: () => base44.entities.Subject.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  const students = memberships.filter(m => m.role === 'student');
  const teachers = memberships.filter(m => m.role === 'teacher');

  return (
    <RoleGuard allowedRoles={['ib_coordinator', 'school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="ib_coordinator" schoolName={school?.name} userName={user?.full_name} userId={user?.id} schoolId={schoolId} />
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">IB Coordinator Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">{school?.name} · {format(new Date(), 'MMMM d, yyyy')}</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard label="Students" value={students.length} icon={GraduationCap} color="indigo" />
                  <StatCard label="Teachers" value={teachers.length} icon={Users} color="emerald" />
                  <StatCard label="Active Classes" value={classes.length} icon={BookOpen} color="amber" />
                  <StatCard label="Subjects" value={subjects.length} icon={TrendingUp} color="violet" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-100">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h2 className="font-semibold text-slate-900">Student Cohorts</h2>
                    </div>
                    {students.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-sm">No students enrolled</div>
                    ) : (
                      <div className="p-6">
                        {Object.entries(students.reduce((acc, s) => {
                          const level = s.grade_level || 'Unassigned';
                          acc[level] = (acc[level] || 0) + 1;
                          return acc;
                        }, {})).map(([level, count]) => (
                          <div key={level} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                            <span className="text-sm font-medium text-slate-900">{level}</span>
                            <span className="text-sm text-slate-500">{count} students</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-slate-100">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h2 className="font-semibold text-slate-900">Subjects Overview</h2>
                    </div>
                    {subjects.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-sm">No subjects configured</div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {subjects.slice(0, 10).map(s => (
                          <div key={s.id} className="px-6 py-3.5 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{s.name}</p>
                              <p className="text-xs text-slate-400 capitalize">{s.ib_group?.replace(/_/g, ' ') || ''}</p>
                            </div>
                            {s.level !== 'na' && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${s.level === 'HL' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>{s.level}</span>
                            )}
                          </div>
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