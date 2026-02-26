import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

export default function GradeStudentDialog({ gradeItem, student, existingGrade, open, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    score: existingGrade?.score || '',
    percentage: existingGrade?.percentage || '',
    ib_grade: existingGrade?.ib_grade || '',
    comment: existingGrade?.comment || '',
    status: existingGrade?.status || 'draft',
  });

  useEffect(() => {
    if (existingGrade) {
      setForm({
        score: existingGrade.score || '',
        percentage: existingGrade.percentage || '',
        ib_grade: existingGrade.ib_grade || '',
        comment: existingGrade.comment || '',
        status: existingGrade.status || 'draft',
      });
    }
  }, [existingGrade]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (existingGrade) {
        return base44.entities.GradeItem.update(existingGrade.id, data);
      }
      return base44.entities.GradeItem.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-grades'] });
      queryClient.invalidateQueries({ queryKey: ['student-grades'] });
      onClose();
    },
  });

  const handleSave = () => {
    const gradeData = {
      ...form,
      school_id: gradeItem.school_id,
      class_id: gradeItem.class_id,
      student_id: student.user_id,
      student_name: student.user_name || student.user_email,
      title: gradeItem.title,
      max_score: gradeItem.max_score,
      assignment_id: gradeItem.assignment_id,
      visible_to_student: gradeItem.visible_to_student,
      visible_to_parent: gradeItem.visible_to_parent,
      term_id: gradeItem.term_id,
    };

    // Calculate percentage if score provided
    if (form.score && gradeItem.max_score) {
      gradeData.percentage = ((form.score / gradeItem.max_score) * 100).toFixed(1);
    }

    saveMutation.mutate(gradeData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Grade: {student.user_name || student.user_email}</DialogTitle>
          <p className="text-sm text-slate-500">{gradeItem.title}</p>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Score</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input
                  type="number"
                  value={form.score}
                  onChange={e => setForm({ ...form, score: e.target.value ? Number(e.target.value) : '' })}
                  placeholder="0"
                  className="flex-1"
                />
                <span className="text-sm text-slate-500">/ {gradeItem.max_score}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">IB Grade (1-7)</Label>
              <Input
                type="number"
                min="1"
                max="7"
                value={form.ib_grade}
                onChange={e => setForm({ ...form, ib_grade: e.target.value ? Number(e.target.value) : '' })}
                placeholder="1-7"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Status</Label>
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="excused">Excused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold">Feedback</Label>
            <Textarea
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              placeholder="Add feedback for the student..."
              rows={4}
              className="mt-1.5"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Grade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}