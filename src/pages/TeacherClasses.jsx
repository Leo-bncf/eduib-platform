import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { useUser } from '@/components/auth/UserContext';
import { LayoutDashboard, BookOpen, ClipboardCheck, BarChart3, MessageSquare, Loader2, Users } from 'lucide-react';

const sidebarLinks = [
  { label: 'Dashboard', page: 'TeacherDashboard', icon: LayoutDashboard },
  { label: 'My Classes', page: 'TeacherClasses', icon: BookOpen },
  { label: 'Assignments', page: 'TeacherDashboard', icon: ClipboardCheck },
  { label: 'Gradebook', page: 'TeacherDashboard', icon: BarChart3 },
  { label: 'Messages', page: 'TeacherDashboard', icon: MessageSquare },
];

export default function TeacherClasses() {
  const { user, school, schoolId } = useUser();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['teacher-classes', schoolId, user?.id],
    queryFn: async () => {
      const all = await base44.entities.Class.filter({ school_id: schoolId, status: 'active' });
      return all.filter(c => c.teacher_ids?.includes(user.id));
    },
    enabled: !!schoolId && !!user?.id,
  });

  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-blue-500'];

  return (
    <RoleGuard allowedRoles={['teacher', 'school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="teacher" schoolName={school?.name} userName={user?.full_name} />
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">My Classes</h1>
              <p className="text-sm text-slate-500 mt-1">Classes you're teaching</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
            ) : classes.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 p-16 text-center">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500">No classes assigned yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {classes.map((c, i) => (
                  <div key={c.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className={`h-2 ${colors[i % colors.length]}`} />
                    <div className="p-6">
                      <h3 className="font-bold text-slate-900 text-lg">{c.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{c.section ? `Section ${c.section}` : ''} {c.room ? `· Room ${c.room}` : ''}</p>
                      <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
                        <Users className="w-4 h-4" />
                        <span>{c.student_ids?.length || 0} students</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}