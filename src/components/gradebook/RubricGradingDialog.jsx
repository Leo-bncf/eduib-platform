import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { logAudit, AuditActions, AuditLevels } from '@/components/utils/auditLogger';

export default function RubricGradingDialog({ gradeTemplate, student, existingGrade, open, onClose }) {
  const queryClient = useQueryClient();
  const [criterionScores, setCriterionScores] = useState({});
  const [overallComment, setOverallComment] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    if (existingGrade?.criterion_scores) {
      const scores = {};
      existingGrade.criterion_scores.forEach(cs => {
        scores[cs.criterion_id] = {
          score: cs.score,
          feedback: cs.feedback || ''
        };
      });
      setCriterionScores(scores);
      setOverallComment(existingGrade.comment || '');
      setStatus(existingGrade.status || 'draft');
    } else {
      // Initialize empty scores
      const scores = {};
      gradeTemplate.rubric_criteria?.forEach(c => {
        scores[c.id] = { score: '', feedback: '' };
      });
      setCriterionScores(scores);
      setOverallComment('');
      setStatus('draft');
    }
  }, [existingGrade, gradeTemplate]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      let result;
      if (existingGrade) {
        result = await base44.entities.GradeItem.update(existingGrade.id, data);
        await logAudit({
          action: AuditActions.GRADE_UPDATED,
          entityType: 'GradeItem',
          entityId: existingGrade.id,
          details: `Updated rubric grade for ${student.user_name} in ${gradeTemplate.title}`,
          level: AuditLevels.INFO,
          schoolId: gradeTemplate.school_id,
        });
      } else {
        result = await base44.entities.GradeItem.create(data);
        await logAudit({
          action: AuditActions.GRADE_CREATED,
          entityType: 'GradeItem',
          entityId: result.id,
          details: `Created rubric grade for ${student.user_name} in ${gradeTemplate.title}`,
          level: AuditLevels.INFO,
          schoolId: gradeTemplate.school_id,
        });
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-grades'] });
      queryClient.invalidateQueries({ queryKey: ['student-grades'] });
      onClose();
    },
  });

  const updateCriterionScore = (criterionId, field, value) => {
    setCriterionScores({
      ...criterionScores,
      [criterionId]: {
        ...criterionScores[criterionId],
        [field]: value
      }
    });
  };

  const calculateTotalScore = () => {
    return Object.entries(criterionScores).reduce((sum, [id, data]) => {
      return sum + (Number(data.score) || 0);
    }, 0);
  };

  const calculatePercentage = () => {
    const total = calculateTotalScore();
    return gradeTemplate.max_score > 0 
      ? ((total / gradeTemplate.max_score) * 100).toFixed(1)
      : 0;
  };

  const handleSave = () => {
    const totalScore = calculateTotalScore();
    const percentage = calculatePercentage();

    // Build criterion_scores array
    const criterion_scores = Object.entries(criterionScores)
      .filter(([id, data]) => data.score !== '')
      .map(([criterion_id, data]) => ({
        criterion_id,
        score: Number(data.score),
        feedback: data.feedback || ''
      }));

    const gradeData = {
      school_id: gradeTemplate.school_id,
      class_id: gradeTemplate.class_id,
      student_id: student.user_id,
      student_name: student.user_name || student.user_email,
      title: gradeTemplate.title,
      grading_type: 'rubric',
      criterion_scores,
      score: totalScore,
      max_score: gradeTemplate.max_score,
      percentage,
      comment: overallComment,
      status,
      visible_to_student: gradeTemplate.visible_to_student,
      visible_to_parent: gradeTemplate.visible_to_parent,
      is_template: false,
    };

    saveMutation.mutate(gradeData);
  };

  const totalScore = calculateTotalScore();
  const percentage = calculatePercentage();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grade: {student.user_name || student.user_email}</DialogTitle>
          <p className="text-sm text-slate-500">{gradeTemplate.title}</p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-900">Current Total Score</p>
                <p className="text-3xl font-bold text-indigo-700 mt-1">
                  {totalScore} / {gradeTemplate.max_score}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-indigo-900">Percentage</p>
                <p className="text-3xl font-bold text-indigo-700 mt-1">{percentage}%</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Criterion-Level Assessment</Label>
            
            {gradeTemplate.rubric_criteria?.map((criterion, idx) => {
              const criterionData = criterionScores[criterion.id] || { score: '', feedback: '' };
              const isScored = criterionData.score !== '';

              return (
                <div key={criterion.id} className="bg-white border border-slate-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          Criterion {String.fromCharCode(65 + idx)}
                        </span>
                        {isScored && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <h4 className="font-semibold text-slate-900">{criterion.name}</h4>
                      {criterion.description && (
                        <p className="text-sm text-slate-600 mt-1">{criterion.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label className="text-xs font-semibold text-slate-600">Score *</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          min="0"
                          max={criterion.max_score}
                          value={criterionData.score}
                          onChange={e => updateCriterionScore(criterion.id, 'score', e.target.value)}
                          placeholder="0"
                          className="flex-1"
                        />
                        <span className="text-sm text-slate-500">/ {criterion.max_score}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs font-semibold text-slate-600">Criterion Feedback</Label>
                      <Textarea
                        value={criterionData.feedback}
                        onChange={e => updateCriterionScore(criterion.id, 'feedback', e.target.value)}
                        placeholder="Specific feedback for this criterion..."
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <Label className="text-sm font-semibold">Overall Feedback</Label>
            <Textarea
              value={overallComment}
              onChange={e => setOverallComment(e.target.value)}
              placeholder="General comments and overall feedback for the student..."
              rows={4}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Status</Label>
            <Select value={status} onValueChange={setStatus}>
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

          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || totalScore === 0}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Rubric Grade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}