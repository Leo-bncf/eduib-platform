import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { useUser } from '@/components/auth/UserContext';
import { logAudit, AuditActions, AuditLevels } from '@/components/utils/auditLogger';
import { LayoutDashboard, Users, BookOpen, Calendar, Shield, ClipboardList, Plus, Loader2, Search } from 'lucide-react';
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

export default function SchoolAdminUsers() {
  const { user, school, schoolId } = useUser();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [form, setForm] = useState({ user_email: '', user_name: '', role: 'student', grade_level: '' });

  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ['school-memberships', schoolId],
    queryFn: () => base44.entities.SchoolMembership.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.entities.SchoolMembership.create({
        ...data,
        school_id: schoolId,
        user_id: 'pending_' + Date.now(),
        status: 'pending',
      });
      
      await logAudit({
        action: AuditActions.MEMBERSHIP_CREATED,
        entityType: 'SchoolMembership',
        entityId: result.id,
        details: `Added ${data.user_email} as ${data.role}`,
        level: AuditLevels.INFO,
        schoolId,
      });
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-memberships'] });
      setShowCreate(false);
      setForm({ user_email: '', user_name: '', role: 'student', grade_level: '' });
    },
  });

  const filtered = memberships.filter(m => {
    const matchSearch = (m.user_name || m.user_email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleColors = {
    school_admin: 'bg-rose-50 text-rose-700',
    ib_coordinator: 'bg-amber-50 text-amber-700',
    teacher: 'bg-emerald-50 text-emerald-700',
    student: 'bg-blue-50 text-blue-700',
    parent: 'bg-violet-50 text-violet-700',
  };

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="school_admin" schoolName={school?.name} userName={user?.full_name} userId={user?.id} schoolId={schoolId} />
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Users</h1>
                <p className="text-sm text-slate-500 mt-1">Manage school members</p>
              </div>
              <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" /> Add User
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="school_admin">Admin</SelectItem>
                    <SelectItem value="ib_coordinator">Coordinator</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="p-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" /></div>
              ) : filtered.length === 0 ? (
                <div className="p-16 text-center text-slate-400 text-sm">No users found</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 text-left">
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3.5 text-sm font-medium text-slate-900">{m.user_name || '—'}</td>
                        <td className="px-6 py-3.5 text-sm text-slate-600">{m.user_email}</td>
                        <td className="px-6 py-3.5">
                          <Badge className={`${roleColors[m.role] || 'bg-slate-100 text-slate-600'} border-0 text-xs capitalize`}>
                            {m.role?.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge className={`${m.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} border-0 text-xs`}>
                            {m.status}
                          </Badge>
                        </td>
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
            <DialogHeader><DialogTitle>Add User to School</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
              <div><Label>Full Name *</Label><Input required value={form.user_name} onChange={e => setForm({...form, user_name: e.target.value})} className="mt-1" /></div>
              <div><Label>Email *</Label><Input required type="email" value={form.user_email} onChange={e => setForm({...form, user_email: e.target.value})} className="mt-1" /></div>
              <div>
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm({...form, role: v})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school_admin">School Admin</SelectItem>
                    <SelectItem value="ib_coordinator">IB Coordinator</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.role === 'student' && (
                <div><Label>Grade Level</Label><Input value={form.grade_level} onChange={e => setForm({...form, grade_level: e.target.value})} placeholder="e.g. DP1, DP2" className="mt-1" /></div>
              )}
              <Button type="submit" disabled={createMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Add User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}