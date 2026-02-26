import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import StatCard from '@/components/app/StatCard';
import { useUser } from '@/components/auth/UserContext';
import { 
  LayoutDashboard, BarChart3, ClipboardCheck, 
  MessageSquare, Users, Loader2, ChevronDown, GraduationCap, BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sidebarLinks = [
  { label: 'Dashboard', page: 'ParentDashboard', icon: LayoutDashboard },
  { label: 'Grades', page: 'ParentDashboard', icon: BarChart3 },
  { label: 'Assignments', page: 'ParentDashboard', icon: ClipboardCheck },
  { label: 'Messages', page: 'ParentDashboard', icon: MessageSquare },
];

export default function ParentDashboard() {
  const { user, school, schoolId } = useUser();
  const [selectedChild, setSelectedChild] = useState(null);

  const { data: links = [], isLoading: loadingLinks } = useQuery({
    queryKey: ['parent-links', schoolId, user?.id],
    queryFn: () => base44.entities.ParentStudentLink.filter({ school_id: schoolId, parent_id: user.id }),
    enabled: !!schoolId && !!user?.id,
  });

  const activeChild = selectedChild || links[0]?.student_id;

  const { data: childGrades = [] } = useQuery({
    queryKey: ['child-grades', activeChild],
    queryFn: () => base44.entities.GradeItem.filter({ student_id: activeChild, visible_to_parent: true }),
    enabled: !!activeChild,
  });

  const { data: childClasses = [] } = useQuery({
    queryKey: ['child-classes', schoolId, activeChild],
    queryFn: async () => {
      const all = await base44.entities.Class.filter({ school_id: schoolId, status: 'active' });
      return all.filter(c => c.student_ids?.includes(activeChild));
    },
    enabled: !!schoolId && !!activeChild,
  });

  return (
    <RoleGuard allowedRoles={['parent', 'school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="parent" schoolName={school?.name} userName={user?.full_name} userId={user?.id} schoolId={schoolId} />
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Parent Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
              </div>
              {links.length > 1 && (
                <Select value={activeChild || ''} onValueChange={setSelectedChild}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select child" />
                  </SelectTrigger>
                  <SelectContent>
                    {links.map(l => (
                      <SelectItem key={l.student_id} value={l.student_id}>{l.student_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {loadingLinks ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
            ) : links.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 p-16 text-center">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-slate-900 mb-1">No children linked</h2>
                <p className="text-slate-500 text-sm">Please contact your school administrator to link your children to your account.</p>
              </div>
            ) : (
              <>
                {links.length > 0 && activeChild && (
                  <div className="bg-indigo-50 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-900">
                      Viewing: {links.find(l => l.student_id === activeChild)?.student_name || 'Child'}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <StatCard label="Classes" value={childClasses.length} icon={BookOpen} color="indigo" />
                  <StatCard label="Grades Published" value={childGrades.length} icon={BarChart3} color="emerald" />
                  <StatCard label="Average IB Grade" value={childGrades.length > 0 ? (childGrades.reduce((s, g) => s + (g.ib_grade || 0), 0) / childGrades.length).toFixed(1) : '—'} icon={GraduationCap} color="violet" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-100">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h2 className="font-semibold text-slate-900">Recent Grades</h2>
                    </div>
                    {childGrades.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-sm">No visible grades yet</div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {childGrades.slice(0, 8).map(g => (
                          <div key={g.id} className="px-6 py-3.5 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{g.title}</p>
                              <p className="text-xs text-slate-400">{g.comment || ''}</p>
                            </div>
                            <div className="text-right">
                              {g.ib_grade && <span className="text-lg font-bold text-slate-900">{g.ib_grade}</span>}
                              <span className="text-xs text-slate-400 ml-1">/7</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-slate-100">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h2 className="font-semibold text-slate-900">Enrolled Classes</h2>
                    </div>
                    {childClasses.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-sm">No classes found</div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {childClasses.map(c => (
                          <div key={c.id} className="px-6 py-3.5">
                            <p className="text-sm font-medium text-slate-900">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.section ? `Section ${c.section}` : ''}</p>
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