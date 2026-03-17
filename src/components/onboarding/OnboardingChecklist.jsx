import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStatus } from './useOnboardingStatus';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, Circle, ChevronRight, Sparkles, X,
  Calendar, Clock, BookOpen, Layers, UserCheck, Mail, GraduationCap
} from 'lucide-react';

const ICON_MAP = {
  calendar: Calendar,
  clock: Clock,
  book: BookOpen,
  layers: Layers,
  'user-check': UserCheck,
  mail: Mail,
  'graduation-cap': GraduationCap,
};

export default function OnboardingChecklist({ schoolId, onDismiss, showWizard }) {
  const navigate = useNavigate();
  const { data, isLoading } = useOnboardingStatus(schoolId);
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading || !data) return null;
  if (data.isComplete) return null;

  const { steps, completedCount, totalCount, progressPct, nextIncomplete } = data;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">School Setup Checklist</p>
              <p className="text-xs text-slate-500">{completedCount} of {totalCount} steps complete</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-indigo-600">{progressPct}%</span>
            <button
              onClick={() => setCollapsed(c => !c)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-90'}`} />
            </button>
            {onDismiss && (
              <button onClick={onDismiss} className="text-slate-300 hover:text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <Progress value={progressPct} className="h-1.5 mt-3" indicatorClassName="bg-indigo-500" />
      </div>

      {!collapsed && (
        <div className="divide-y divide-slate-50">
          {steps.map((step) => {
            const Icon = ICON_MAP[step.icon] || Circle;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                  step.completed ? 'opacity-60' : 'hover:bg-slate-50 cursor-pointer'
                }`}
                onClick={() => !step.completed && navigate(`/${step.page}`)}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  step.completed ? 'bg-emerald-100' : 'bg-slate-100'
                }`}>
                  {step.completed
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    : <Icon className="w-3.5 h-3.5 text-slate-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${step.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{step.detail}</p>
                </div>
                {!step.completed && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CTA footer */}
      {!collapsed && nextIncomplete && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Next: <span className="font-semibold text-slate-700">{nextIncomplete.label}</span>
          </p>
          <div className="flex gap-2">
            {showWizard && (
              <Button size="sm" variant="outline" onClick={showWizard} className="text-xs h-7 px-3">
                Open Wizard
              </Button>
            )}
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-xs h-7 px-3"
              onClick={() => navigate(`/${nextIncomplete.page}`)}
            >
              Continue Setup <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}