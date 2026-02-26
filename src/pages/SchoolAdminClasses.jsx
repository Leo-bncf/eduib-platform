import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { useUser } from '@/components/auth/UserContext';
import { LayoutDashboard, Users, BookOpen, Calendar, Shield, ClipboardList, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SchoolAdminDashboard', icon: LayoutDashboard },
  { label: 'Users', page: 'SchoolAdminUsers', icon: Users },
  { label: 'Classes', page: 'SchoolAdminClasses', icon: BookOpen },
  { label: 'Subjects', page: 'SchoolAdminSubjects', icon: ClipboardList },
  { label: 'Academic Years', page: 'SchoolAdminDashboard', icon: Calendar },
  { label: 'Audit Logs', page: 'SchoolAdminDashboard', icon: Shield },
];

export default function SchoolAdminClasses() {
  const { user, school, schoolId } = useUser();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', section: '', room: '' });

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['school-classes', schoolId],
    queryFn: () => base44.entities.Class.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Class.create({ ...data, school_id: schoolId, status: 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-classes'] });
      setShowCreate(false);
      setForm({ name: '', section: '', room: '' });
    },
  });

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="school_admin" schoolName={school?.name} userName={user?.full_name} />
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
                <p className="text-sm text-slate-500 mt-1">Manage school classes</p>
              </div>
              <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" /> New Class
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              {isLoading ? (
                <div className="p-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" /></div>
              ) : classes.length === 0 ? (
                <div className="p-16 text-center text-slate-400 text-sm">No classes yet</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {classes.map(c => (
                    <div key={c.id} className="p-5 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-slate-900">{c.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{c.section ? `Section ${c.section}` : ''} {c.room ? `· Room ${c.room}` : ''}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <span>{c.teacher_ids?.length || 0} teachers</span>
                        <span>{c.student_ids?.length || 0} students</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Class</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
              <div><Label>Class Name *</Label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Math HL - Section A" className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Section</Label><Input value={form.section} onChange={e => setForm({...form, section: e.target.value})} className="mt-1" /></div>
                <div><Label>Room</Label><Input value={form.room} onChange={e => setForm({...form, room: e.target.value})} className="mt-1" /></div>
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Create Class
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}