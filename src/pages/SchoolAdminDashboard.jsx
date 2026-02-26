import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import StatCard from '@/components/app/StatCard';
import { useUser } from '@/components/auth/UserContext';
import { 
  LayoutDashboard, Users, BookOpen, Calendar, Settings, 
  FileText, Shield, GraduationCap, Loader2, UserPlus, 
  ClipboardList, Link2
} from 'lucide-react';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SchoolAdminDashboard', icon: LayoutDashboard },
  { label: 'Users', page: 'SchoolAdminUsers', icon: Users },
  { label: 'Classes', page: 'SchoolAdminClasses', icon: BookOpen },
  { label: 'Subjects', page: 'SchoolAdminSubjects', icon: ClipboardList },
  { label: 'Academic Years', page: 'SchoolAdminDashboard', icon: Calendar },
  { label: 'Audit Logs', page: 'SchoolAdminDashboard', icon: Shield },
];

export default function SchoolAdminDashboard() {
  const { user, school, schoolId } = useUser();

  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ['school-memberships', schoolId],
    queryFn: () => base44.entities.SchoolMembership.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['school-classes', schoolId],
    queryFn: () => base44.entities.Class.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  const students = memberships.filter(m => m.role === 'student');
  const teachers = memberships.filter(m => m.role === 'teacher');
  const parents = memberships.filter(m => m.role === 'parent');

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="school_admin" schoolName={school?.name} userName={user?.full_name} />
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">{school?.name || 'School'} Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">Overview of your school's operations</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard label="Students" value={students.length} icon={GraduationCap} color="indigo" />
                  <StatCard label="Teachers" value={teachers.length} icon={Users} color="emerald" />
                  <StatCard label="Parents" value={parents.length} icon={UserPlus} color="violet" />
                  <StatCard label="Active Classes" value={classes.length} icon={BookOpen} color="amber" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h2 className="font-semibold text-slate-900">Recent Members</h2>
                    </div>
                    {memberships.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-sm">No members yet</div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {memberships.slice(0, 8).map(m => (
                          <div key={m.id} className="px-6 py-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{m.user_name || m.user_email}</p>
                              <p className="text-xs text-slate-400">{m.user_email}</p>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">{m.role?.replace('_', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h2 className="font-semibold text-slate-900">Active Classes</h2>
                    </div>
                    {classes.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-sm">No classes yet</div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {classes.slice(0, 8).map(c => (
                          <div key={c.id} className="px-6 py-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{c.name}</p>
                              <p className="text-xs text-slate-400">{c.section || ''} {c.room ? `· Room ${c.room}` : ''}</p>
                            </div>
                            <span className="text-xs text-slate-400">{c.student_ids?.length || 0} students</span>
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