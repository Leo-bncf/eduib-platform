import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { useUser } from '@/components/auth/UserContext';
import { logAudit, AuditActions, AuditLevels } from '@/components/utils/auditLogger';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Clock, GraduationCap,
  Settings, FileText, Plus, Loader2, Search, Mail, CreditCard,
  Pencil, Trash2, UserCheck, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InvitationsManager from '@/components/onboarding/InvitationsManager';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SchoolAdminDashboard', icon: LayoutDashboard },
  { label: 'Users', page: 'SchoolAdminUsers', icon: Users },
  { label: 'Classes', page: 'SchoolAdminClasses', icon: BookOpen },
  { label: 'Subjects', page: 'SchoolAdminSubjects', icon: GraduationCap },
  { label: 'Attendance', page: 'SchoolAdminAttendance', icon: Calendar },
  { label: 'Timetable', page: 'SchoolAdminTimetable', icon: Clock },
  { label: 'Reports', page: 'SchoolAdminReports', icon: FileText },
  { label: 'Billing', page: 'SchoolAdminBilling', icon: CreditCard },
  { label: 'Settings', page: 'SchoolAdminSettings', icon: Settings },
];

const ROLE_CONFIG = {
  school_admin: { label: 'Admin', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ib_coordinator: { label: 'IB Coordinator', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  teacher: { label: 'Teacher', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  student: { label: 'Student', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  parent: { label: 'Parent', color: 'bg-violet-50 text-violet-700 border-violet-200' },
};

const EMPTY_FORM = { user_email: '', user_name: '', role: 'student', grade_level: '', department: '' };

export default function SchoolAdminUsers() {
  const { user, school, schoolId } = useUser();
  const queryClient = useQueryClient();
  const [editingMember, setEditingMember] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ['school-memberships', schoolId],
    queryFn: () => base44.entities.SchoolMembership.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SchoolMembership.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['school-memberships'] }); setEditingMember(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SchoolMembership.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['school-memberships'] }),
  });

  const filtered = memberships.filter(m => {
    const matchSearch = (m.user_name || m.user_email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleEdit = (m) => {
    setForm({ user_email: m.user_email || '', user_name: m.user_name || '', role: m.role || 'student', grade_level: m.grade_level || '', department: m.department || '' });
    setEditingMember(m);
  };

  const handleDelete = (m) => {
    if (!window.confirm(`Remove ${m.user_name || m.user_email} from school?`)) return;
    deleteMutation.mutate(m.id);
  };

  const roleSummary = Object.keys(ROLE_CONFIG).map(role => ({
    role,
    count: memberships.filter(m => m.role === role).length,
    ...ROLE_CONFIG[role],
  }));

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-[#f1f5f9]">
        <AppSidebar links={sidebarLinks} role="school_admin" schoolName={school?.name} userName={user?.full_name} userId={user?.id} schoolId={schoolId} />

        <main className="md:ml-64 min-h-screen flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
            <h1 className="text-base font-semibold text-slate-900">User Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">{memberships.length} members in this school</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Role summary pills */}
            <div className="flex flex-wrap gap-2">
              {roleSummary.map(({ role, label, color, count }) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    roleFilter === role ? 'ring-2 ring-indigo-400 ring-offset-1' : ''
                  } ${color}`}
                >
                  {label}
                  <span className="font-bold">{count}</span>
                </button>
              ))}
              {roleFilter !== 'all' && (
                <button onClick={() => setRoleFilter('all')} className="text-xs text-slate-400 hover:text-slate-600 px-2">Clear filter ×</button>
              )}
            </div>

            <Tabs defaultValue="members">
              <TabsList className="bg-white border border-slate-200 h-9">
                <TabsTrigger value="members" className="text-xs gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" /> Members
                </TabsTrigger>
                <TabsTrigger value="invitations" className="text-xs gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Invitations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="mt-4">
                {/* Search */}
                <div className="relative max-w-xs mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white" />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {isLoading ? (
                    <div className="p-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" /></div>
                  ) : filtered.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 text-sm">No users found</div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Member</th>
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Details</th>
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                          <th className="px-5 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filtered.map(m => (
                          <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${ROLE_CONFIG[m.role]?.color || 'bg-slate-100 text-slate-600'}`}>
                                  {m.user_name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <span className="text-sm font-medium text-slate-900">{m.user_name || '—'}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 hidden sm:table-cell text-sm text-slate-500">{m.user_email}</td>
                            <td className="px-5 py-3">
                              <Badge className={`${ROLE_CONFIG[m.role]?.color || 'bg-slate-100 text-slate-500'} border text-[11px] font-medium`}>
                                {ROLE_CONFIG[m.role]?.label || m.role}
                              </Badge>
                            </td>
                            <td className="px-5 py-3 hidden md:table-cell text-xs text-slate-500">
                              {m.grade_level ? `Grade: ${m.grade_level}` : m.department ? `Dept: ${m.department}` : '—'}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                m.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                                m.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                'bg-slate-100 text-slate-500'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                {m.status}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(m)} className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600">
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(m)} className="h-7 w-7 p-0 text-slate-400 hover:text-red-600">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="invitations" className="mt-4">
                <InvitationsManager schoolId={schoolId} schoolName={school?.name} />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Edit Member Dialog */}
        {editingMember && (
          <Dialog open onOpenChange={() => setEditingMember(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Edit Member — {editingMember.user_name || editingMember.user_email}</DialogTitle></DialogHeader>
              <form
                onSubmit={e => { e.preventDefault(); updateMutation.mutate({ id: editingMember.id, data: form }); }}
                className="space-y-4 pt-2"
              >
                <div>
                  <Label className="text-xs font-semibold">Full Name</Label>
                  <Input value={form.user_name} onChange={e => setForm({ ...form, user_name: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Role</Label>
                  <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
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
                <div>
                  <Label className="text-xs font-semibold">Status</Label>
                  <Select value={editingMember.status} onValueChange={v => setEditingMember({ ...editingMember, status: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.role === 'student' && (
                  <div>
                    <Label className="text-xs font-semibold">Grade Level</Label>
                    <Input value={form.grade_level} onChange={e => setForm({ ...form, grade_level: e.target.value })} placeholder="DP1, DP2, MYP3…" className="mt-1" />
                  </div>
                )}
                {form.role === 'teacher' && (
                  <div>
                    <Label className="text-xs font-semibold">Department</Label>
                    <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Sciences, Humanities…" className="mt-1" />
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingMember(null)}>Cancel</Button>
                  <Button type="submit" disabled={updateMutation.isPending} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save Changes
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </RoleGuard>
  );
}