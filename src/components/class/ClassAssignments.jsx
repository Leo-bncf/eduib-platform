import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function ClassAssignments({ classData, isTeacher, userId }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: 'homework', due_date: '', max_score: 100
  });

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['class-assignments', classData.id],
    queryFn: () => base44.entities.Assignment.filter({ 
      school_id: classData.school_id, 
      class_id: classData.id 
    }, '-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Assignment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-assignments'] });
      setShowCreate(false);
      setForm({ title: '', description: '', type: 'homework', due_date: '', max_score: 100 });
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      ...form,
      school_id: classData.school_id,
      class_id: classData.id,
      teacher_id: userId,
      status: 'published',
    });
  };

  const typeColors = {
    homework: 'bg-blue-50 text-blue-700',
    essay: 'bg-purple-50 text-purple-700',
    exam: 'bg-red-50 text-red-700',
    project: 'bg-emerald-50 text-emerald-700',
    quiz: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Assignments</h2>
        {isTeacher && (
          <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Create Assignment
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" /></div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No assignments yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900 text-lg">{a.title}</h3>
                    <Badge className={`${typeColors[a.type] || 'bg-slate-100 text-slate-700'} border-0 text-xs capitalize`}>
                      {a.type?.replace('_', ' ')}
                    </Badge>
                  </div>
                  {a.description && <p className="text-slate-600 text-sm mb-3">{a.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {a.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due {format(new Date(a.due_date), 'MMM d, yyyy')}
                      </span>
                    )}
                    {a.max_score && <span>{a.max_score} points</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isTeacher && (
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homework">Homework</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Max Score</Label>
                  <Input type="number" value={form.max_score} onChange={e => setForm({...form, max_score: Number(e.target.value)})} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="datetime-local" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="mt-1" />
              </div>
              <Button onClick={handleCreate} disabled={!form.title || createMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}