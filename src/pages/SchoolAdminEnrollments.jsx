import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import { useUser } from '@/components/auth/UserContext';
import { Plus, Loader2, Search, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SchoolAdminPageShell from '@/components/app/SchoolAdminPageShell';

export default function SchoolAdminEnrollments() {
  const { school, schoolId } = useUser();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [expandedClass, setExpandedClass] = useState(null);
  const [assignDialog, setAssignDialog] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [newSubjectTeachers, setNewSubjectTeachers] = useState({ subject_id: '', teacher_ids: [] });

  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['enroll-classes', schoolId],
    queryFn: () => base44.entities.Class.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['enroll-subjects', schoolId],
    queryFn: () => base44.entities.Subject.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['enroll-members', schoolId],
    queryFn: () => base44.entities.SchoolMembership.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  const updateClassMutation = useMutation({
    mutationFn: ({ classId, data }) => base44.entities.Class.update(classId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['enroll-classes'] }); setAssignDialog(null); },
  });

  const teachers = memberships.filter(m => ['teacher', 'ib_coordinator', 'school_admin'].includes(m.role));
  const students = memberships.filter(m => m.role === 'student');
  const filteredClasses = classes.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || 'Unknown';
  const getTeacherNames = (ids) => ids?.map(id => memberships.find(m => m.user_id === id)?.user_name || 'Unknown').join(', ') || 'Unassigned';

  const toggleStudent = (userId) => {
    setSelectedStudents(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const enrollSelectedStudents = (classId) => {
    const classData = classes.find(c => c.id === classId);
    const updated = [...new Set([...(classData.student_ids || []), ...selectedStudents])];
    updateClassMutation.mutate({ classId, data: { student_ids: updated } });
    setSelectedStudents([]);
  };

  const removeStudentFromClass = (classId, studentId) => {
    const classData = classes.find(c => c.id === classId);
    updateClassMutation.mutate({ classId, data: { student_ids: (classData.student_ids || []).filter(id => id !== studentId) } });
  };

  const addSubjectTeacherAssignment = (classId) => {
    if (!newSubjectTeachers.subject_id) return;
    const classData = classes.find(c => c.id === classId);
    const assignments = classData.subject_teacher_assignments || [];
    updateClassMutation.mutate({
      classId,
      data: { subject_teacher_assignments: [...assignments, { id: `assign_${Date.now()}`, subject_id: newSubjectTeachers.subject_id, teacher_ids: newSubjectTeachers.teacher_ids }] }
    });
    setNewSubjectTeachers({ subject_id: '', teacher_ids: [] });
  };

  const removeSubjectAssignment = (classId, assignmentId) => {
    const classData = classes.find(c => c.id === classId);
    updateClassMutation.mutate({ classId, data: { subject_teacher_assignments: (classData.subject_teacher_assignments || []).filter(a => a.id !== assignmentId) } });
  };

  const toggleTeacherForAssignment = (teacherId) => {
    setNewSubjectTeachers(prev => ({
      ...prev,
      teacher_ids: prev.teacher_ids.includes(teacherId) ? prev.teacher_ids.filter(id => id !== teacherId) : [...prev.teacher_ids, teacherId]
    }));
  };

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <SchoolAdminPageShell
        title="Enrollments & Curriculum"
        subtitle="Manage class rosters, assign students, and map subjects to teachers"
      >
        <div className="space-y-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search classes…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white" />
          </div>

          {loadingClasses ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : filteredClasses.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
              <p className="text-sm text-slate-500">No classes found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClasses.map(classItem => (
                <div key={classItem.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <Collapsible open={expandedClass === classItem.id} onOpenChange={isOpen => setExpandedClass(isOpen ? classItem.id : null)}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="text-left flex-1">
                          <h3 className="font-semibold text-slate-900 text-sm">{classItem.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {classItem.student_ids?.length || 0} students
                            {classItem.subject_teacher_assignments?.length > 0 && ` · ${classItem.subject_teacher_assignments.length} subjects`}
                          </p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedClass === classItem.id ? 'rotate-180' : ''}`} />
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="border-t border-slate-100 bg-slate-50 p-5 space-y-5">
                      {/* Subjects & Teachers */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-900 text-sm">Subjects & Teachers</h4>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setAssignDialog({ classId: classItem.id, mode: 'subject' })}>
                            <Plus className="w-3 h-3" /> Assign Subject
                          </Button>
                        </div>
                        {!classItem.subject_teacher_assignments || classItem.subject_teacher_assignments.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No subjects assigned yet</p>
                        ) : (
                          <div className="space-y-2">
                            {classItem.subject_teacher_assignments.map(assign => (
                              <div key={assign.id} className="bg-white rounded-lg border border-slate-200 p-3 flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{getSubjectName(assign.subject_id)}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{getTeacherNames(assign.teacher_ids) || 'No teacher assigned'}</p>
                                </div>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-red-600" onClick={() => removeSubjectAssignment(classItem.id, assign.id)}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Students */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-900 text-sm">Enrolled Students ({classItem.student_ids?.length || 0})</h4>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setAssignDialog({ classId: classItem.id, mode: 'student' })}>
                            <Plus className="w-3 h-3" /> Enrol Student
                          </Button>
                        </div>
                        {!classItem.student_ids || classItem.student_ids.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No students enrolled</p>
                        ) : (
                          <div className="grid gap-2">
                            {classItem.student_ids.map(studentId => {
                              const student = memberships.find(m => m.user_id === studentId);
                              return (
                                <div key={studentId} className="bg-white rounded-lg border border-slate-200 p-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                      {student?.user_name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-900">{student?.user_name || 'Unknown'}</p>
                                      <p className="text-xs text-slate-500">{student?.grade_level || '—'}</p>
                                    </div>
                                  </div>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-red-600" onClick={() => removeStudentFromClass(classItem.id, studentId)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assign Subject Dialog */}
        {assignDialog?.mode === 'subject' && (
          <Dialog open onOpenChange={() => setAssignDialog(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Assign Subject to Class</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-xs font-semibold">Select Subject *</Label>
                  <Select value={newSubjectTeachers.subject_id} onValueChange={v => setNewSubjectTeachers({ ...newSubjectTeachers, subject_id: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Choose subject…" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-2 block">Assign Teachers (optional)</Label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {teachers.map(t => (
                      <label key={t.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" checked={newSubjectTeachers.teacher_ids.includes(t.user_id)} onChange={() => toggleTeacherForAssignment(t.user_id)} className="rounded" />
                        <span className="text-sm text-slate-700">{t.user_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setAssignDialog(null)}>Cancel</Button>
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={!newSubjectTeachers.subject_id} onClick={() => addSubjectTeacherAssignment(assignDialog.classId)}>
                    Assign Subject
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Enrol Students Dialog */}
        {assignDialog?.mode === 'student' && (
          <Dialog open onOpenChange={() => { setAssignDialog(null); setSelectedStudents([]); }}>
            <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
              <DialogHeader><DialogTitle>Enrol Students</DialogTitle></DialogHeader>
              <p className="text-xs text-slate-500">Click students to select them for enrollment</p>
              <div className="flex-1 overflow-y-auto space-y-1.5 mt-3">
                {students.length === 0 ? (
                  <p className="text-sm text-slate-400">No students found</p>
                ) : students.map(s => (
                  <button key={s.id} onClick={() => toggleStudent(s.user_id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${selectedStudents.includes(s.user_id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  >
                    <input type="checkbox" checked={selectedStudents.includes(s.user_id)} onChange={() => {}} className="rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{s.user_name}</p>
                      <p className="text-xs text-slate-500">{s.grade_level || '—'}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" className="flex-1" onClick={() => { setAssignDialog(null); setSelectedStudents([]); }}>Cancel</Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={selectedStudents.length === 0} onClick={() => enrollSelectedStudents(assignDialog.classId)}>
                  Enrol {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </SchoolAdminPageShell>
    </RoleGuard>
  );
}