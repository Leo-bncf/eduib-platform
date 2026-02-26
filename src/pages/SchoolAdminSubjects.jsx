import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { useUser } from '@/components/auth/UserContext';
import { LayoutDashboard, Users, BookOpen, Calendar, Shield, ClipboardList, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SchoolAdminDashboard', icon: LayoutDashboard },
  { label: 'Users', page: 'SchoolAdminUsers', icon: Users },
  { label: 'Classes', page: 'SchoolAdminClasses', icon: BookOpen },
  { label: 'Subjects', page: 'SchoolAdminSubjects', icon: ClipboardList },
  { label: 'Academic Years', page: 'SchoolAdminDashboard', icon: Calendar },
  { label: 'Audit Logs', page: 'SchoolAdminDashboard', icon: Shield },
];

export default function SchoolAdminSubjects() {
  const { user, school, schoolId } = useUser();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', level: 'na', ib_group: '' });

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['school-subjects', schoolId],
    queryFn: () => base44.entities.Subject.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Subject.create({ ...data, school_id: schoolId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-subjects'] });
      setShowCreate(false);
      setForm({ name: '', code: '', level: 'na', ib_group: '' });
    },
  });

  const levelColors = { HL: 'bg-rose-50 text-rose-700', SL: 'bg-blue-50 text-blue-700', core: 'bg-amber-50 text-amber-700' };

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="school_admin" schoolName={school?.name} userName={user?.full_name} />
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
                <p className="text-sm text-slate-500 mt-1">Manage IB subjects</p>
              </div>
              <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" /> New Subject
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              {isLoading ? (
                <div className="p-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" /></div>
              ) : subjects.length === 0 ? (
                <div className="p-16 text-center text-slate-400 text-sm">No subjects yet</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 text-left">
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Subject</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Level</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">IB Group</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {subjects.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3.5 text-sm font-medium text-slate-900">{s.name}</td>
                        <td className="px-6 py-3.5 text-sm text-slate-600 font-mono">{s.code || '—'}</td>
                        <td className="px-6 py-3.5">
                          {s.level !== 'na' && <Badge className={`${levelColors[s.level] || 'bg-slate-100 text-slate-600'} border-0 text-xs`}>{s.level}</Badge>}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-slate-600 capitalize">{s.ib_group?.replace(/_/g, ' ') || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Subject</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
              <div><Label>Subject Name *</Label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1" /></div>
              <div><Label>Code</Label><Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. MATH_HL" className="mt-1" /></div>
              <div>
                <Label>Level</Label>
                <Select value={form.level} onValueChange={v => setForm({...form, level: v})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HL">Higher Level (HL)</SelectItem>
                    <SelectItem value="SL">Standard Level (SL)</SelectItem>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="na">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Create Subject
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}