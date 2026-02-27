import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { useUser } from '@/components/auth/UserContext';
import { createPageUrl } from '@/utils';
import { logAudit, AuditActions, AuditLevels } from '@/components/utils/auditLogger';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Clock, GraduationCap,
  Settings, FileText, Plus, Loader2, Search, CreditCard, ChevronRight,
  Pencil, Trash2, UserPlus, X, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SchoolAdminDashboard', icon: LayoutDashboard },
  { label: 'Users', page: 'SchoolAdminUsers', icon: Users },
  { label: 'Classes', page: 'SchoolAdminClasses', icon: BookOpen },
  { label: 'Enrollments', page: 'SchoolAdminEnrollments', icon: Users },
  { label: 'Subjects', page: 'SchoolAdminSubjects', icon: GraduationCap },
  { label: 'Attendance', page: 'SchoolAdminAttendance', icon: Calendar },
  { label: 'Timetable', page: 'SchoolAdminTimetable', icon: Clock },
  { label: 'Reports', page: 'SchoolAdminReports', icon: FileText },
  { label: 'Billing', page: 'SchoolAdminBilling', icon: CreditCard },
  { label: 'Settings', page: 'SchoolAdminSettings', icon: Settings },
];

const EMPTY_FORM = { name: '', section: '', room: '', subject_id: '', schedule_info: '' };

export default function SchoolAdminClasses() {
  const { user, school, schoolId } = useUser();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [assignDialog, setAssignDialog] = useState(null); // { classObj, mode: 'teachers'|'students' }
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['school-classes', schoolId],
    queryFn: () => base44.entities.Class.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['school-subjects-list', schoolId],
    queryFn: () => base44.entities.Subject.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['school-memberships', schoolId],
    queryFn: () => base44.entities.SchoolMembership.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  const teachers = memberships.filter(m => ['teacher', 'ib_coordinator', 'school_admin'].includes(m.role));
  const students = memberships.filter(m => m.role === 'student');

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, school_id: schoolId, status: 'active' };
      if (!payload.subject_id) delete payload.subject_id;
      const result = await base44.entities.Class.create(payload);
      await logAudit({ action: AuditActions.CLASS_CREATED, entityType: 'Class', entityId: result.id, details: `Created class: ${data.name}`, level: AuditLevels.INFO, schoolId });
      return result;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['school-classes'] }); setShowCreate(false); setForm(EMPTY_FORM); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Class.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['school-classes'] }); setEditingClass(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Class.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['school-classes'] }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ classId, data }) => base44.entities.Class.update(classId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['school-classes'] }),
  });

  const filteredClasses = classes.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.room?.toLowerCase().includes(search.toLowerCase())
  );

  const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || '—';

  const openEdit = (c) => { setForm({ name: c.name, section: c.section || '', room: c.room || '', subject_id: c.subject_id || '', schedule_info: c.schedule_info || '' }); setEditingClass(c); };

  const handleDelete = (c) => {
    if (!window.confirm(`Delete class "${c.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(c.id);
  };

  const toggleMember = (classObj, userId, mode) => {
    const field = mode === 'teachers' ? 'teacher_ids' : 'student_ids';
    const current = classObj[field] || [];
    const updated = current.includes(userId) ? current.filter(id => id !== userId) : [...current, userId];
    assignMutation.mutate({ classId: classObj.id, data: { [field]: updated } });
    // optimistic UI update for dialog
    setAssignDialog(prev => prev ? { ...prev, classObj: { ...prev.classObj, [field]: updated } } : null);
  };

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-[#f1f5f9]">
        <AppSidebar links={sidebarLinks} role="school_admin" schoolName={school?.name} userName={user?.full_name} userId={user?.id} schoolId={schoolId} />

        <main className="md:ml-64 min-h-screen flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div>
              <h1 className="text-base font-semibold text-slate-900">Class Management</h1>
              <p className="text-xs text-slate-400 mt-0.5">{classes.length} classes configured</p>
            </div>
            <Button onClick={() => { setForm(EMPTY_FORM); setShowCreate(true); }} className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Class
            </Button>
          </div>

          <div className="p-6 space-y-4">
            {/* Search */}
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search classes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white" />
            </div>

            {/* Classes grid */}
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : filteredClasses.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
                <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">No classes yet</p>
                <p className="text-xs text-slate-400 mt-1">Create your first class to get started</p>
                <Button onClick={() => setShowCreate(true)} className="mt-4 bg-indigo-600 hover:bg-indigo-700 h-8 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Class
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredClasses.map(c => (
                  <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* Class header */}
                    <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate text-sm">{c.name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {c.subject_id && (
                              <span className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">{getSubjectName(c.subject_id)}</span>
                            )}
                            {c.section && <span className="text-xs text-slate-500">§ {c.section}</span>}
                            {c.room && <span className="text-xs text-slate-500">📍 {c.room}</span>}
                          </div>
                        </div>
                        <Badge className={`text-xs border-0 flex-shrink-0 ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {c.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="px-5 py-3 grid grid-cols-2 gap-3 border-b border-slate-100">
                      <button
                        onClick={() => setAssignDialog({ classObj: c, mode: 'teachers' })}
                        className="flex items-center gap-2 text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{c.teacher_ids?.length || 0}</p>
                          <p className="text-[10px] text-slate-400">Teachers</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setAssignDialog({ classObj: c, mode: 'students' })}
                        className="flex items-center gap-2 text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center">
                          <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{c.student_ids?.length || 0}</p>
                          <p className="text-[10px] text-slate-400">Students</p>
                        </div>
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(c)} className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(c)} className="h-7 w-7 p-0 text-slate-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => setAssignDialog({ classObj: c, mode: 'students' })}
                          className="h-7 px-2 text-xs text-slate-500 hover:text-indigo-600 gap-1"
                        >
                          <UserPlus className="w-3 h-3" /> Enrol
                        </Button>
                      </div>
                      <Link
                        to={createPageUrl('ClassWorkspace') + `?class_id=${c.id}`}
                        className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Open Class <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Create / Edit Dialog */}
        <Dialog open={showCreate || !!editingClass} onOpenChange={(o) => { if (!o) { setShowCreate(false); setEditingClass(null); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingClass ? 'Edit Class' : 'Create New Class'}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                editingClass ? updateMutation.mutate({ id: editingClass.id, data: form }) : createMutation.mutate(form);
              }}
              className="space-y-4 pt-2"
            >
              <div>
                <Label className="text-xs font-semibold text-slate-700">Class Name *</Label>
                <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mathematics HL – Group A" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Subject</Label>
                <Select value={form.subject_id || 'none'} onValueChange={v => setForm({ ...form, subject_id: v === 'none' ? '' : v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select subject…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No subject</SelectItem>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name} {s.level !== 'na' ? `(${s.level})` : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Section</Label>
                  <Input value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} placeholder="A, B, 1…" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Room</Label>
                  <Input value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} placeholder="101, Lab 3…" className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Schedule Info</Label>
                <Input value={form.schedule_info} onChange={e => setForm({ ...form, schedule_info: e.target.value })} placeholder="e.g. Mon/Wed 09:00–10:30" className="mt-1" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowCreate(false); setEditingClass(null); }}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingClass ? 'Save Changes' : 'Create Class'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Assign Members Dialog */}
        {assignDialog && (
          <Dialog open onOpenChange={() => setAssignDialog(null)}>
            <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {assignDialog.mode === 'teachers' ? 'Assign Teachers' : 'Enrol Students'} — {assignDialog.classObj.name}
                </DialogTitle>
              </DialogHeader>
              <p className="text-xs text-slate-500 mt-1">Click a person to toggle their assignment. Changes save instantly.</p>
              <div className="overflow-y-auto flex-1 mt-3 space-y-1.5">
                {(assignDialog.mode === 'teachers' ? teachers : students).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">
                    No {assignDialog.mode === 'teachers' ? 'teachers' : 'students'} found in school directory.
                    Add them first via Users.
                  </p>
                ) : (assignDialog.mode === 'teachers' ? teachers : students).map(m => {
                  const field = assignDialog.mode === 'teachers' ? 'teacher_ids' : 'student_ids';
                  const assigned = assignDialog.classObj[field]?.includes(m.user_id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMember(assignDialog.classObj, m.user_id, assignDialog.mode)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                        assigned ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${assigned ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {m.user_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{m.user_name || m.user_email}</p>
                        <p className="text-xs text-slate-500 truncate">{m.user_email} {m.grade_level ? `· ${m.grade_level}` : ''}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${assigned ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                        {assigned && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="pt-3 border-t border-slate-100 mt-2">
                <Button onClick={() => setAssignDialog(null)} className="w-full bg-indigo-600 hover:bg-indigo-700">Done</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </RoleGuard>
  );
}