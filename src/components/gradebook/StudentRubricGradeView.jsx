import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentRubricGradeView({ grade }) {
  if (!grade || grade.grading_type !== 'rubric') return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-lg">{grade.title}</h3>
          {grade.description && (
            <p className="text-sm text-slate-600 mt-1">{grade.description}</p>
          )}
          {grade.created_date && (
            <p className="text-xs text-slate-400 mt-1">
              {format(new Date(grade.created_date), 'MMM d, yyyy')}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-900">
            {grade.score}
            <span className="text-lg text-slate-400 ml-1">/ {grade.max_score}</span>
          </div>
          {grade.percentage && (
            <div className="text-sm text-slate-500 mt-1">{grade.percentage}%</div>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {grade.criterion_scores?.map((cs, idx) => {
          const criterion = grade.rubric_criteria?.find(c => c.id === cs.criterion_id);
          if (!criterion) return null;

          return (
            <div key={cs.criterion_id} className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-indigo-50 text-indigo-700 border-0 text-xs">
                      Criterion {String.fromCharCode(65 + idx)}
                    </Badge>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{criterion.name}</h4>
                  {criterion.description && (
                    <p className="text-xs text-slate-600 mt-1">{criterion.description}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="text-xl font-bold text-slate-900">
                    {cs.score}
                    <span className="text-sm text-slate-400 ml-1">/ {criterion.max_score}</span>
                  </div>
                </div>
              </div>

              {cs.feedback && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-700 mb-1">Feedback</p>
                  <p className="text-sm text-slate-600">{cs.feedback}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {grade.comment && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Overall Feedback</p>
              <p className="text-sm text-slate-600">{grade.comment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}