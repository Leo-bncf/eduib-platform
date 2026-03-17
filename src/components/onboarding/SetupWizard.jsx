import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/components/auth/UserContext';
import { useOnboardingStatus } from './useOnboardingStatus';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, ChevronRight, ChevronLeft, Calendar, Clock,
  BookOpen, Layers, UserCheck, Mail, GraduationCap, Sparkles, ArrowRight
} from 'lucide-react';
import WizardStepAcademicYear from './wizard-steps/WizardStepAcademicYear';
import WizardStepTerms from './wizard-steps/WizardStepTerms';
import WizardStepSubjects from './wizard-steps/WizardStepSubjects';
import WizardStepClasses from './wizard-steps/WizardStepClasses';
import WizardStepInviteUsers from './wizard-steps/WizardStepInviteUsers';

const STEPS = [
  { id: 'academic_year',  label: 'Academic Year',     icon: Calendar,      component: WizardStepAcademicYear, description: 'Define your school year dates' },
  { id: 'terms',          label: 'Terms',              icon: Clock,         component: WizardStepTerms,        description: 'Add reporting periods and terms' },
  { id: 'subjects',       label: 'Subjects',           icon: BookOpen,      component: WizardStepSubjects,     description: 'Build your subject catalogue' },
  { id: 'classes',        label: 'Classes',            icon: Layers,        component: WizardStepClasses,      description: 'Create your first class groups' },
  { id: 'invite',         label: 'Invite Users',       icon: Mail,          component: WizardStepInviteUsers,  description: 'Invite teachers and students' },
];

function StepNav({ steps, currentIndex, completedStepIds }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isDone = completedStepIds.has(step.id);
        const isCurrent = i === currentIndex;
        const isPast = i < currentIndex;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                isDone || isPast
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : isCurrent
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {isDone || isPast
                  ? <CheckCircle2 className="w-4 h-4" />
                  : <Icon className="w-4 h-4" />
                }
              </div>
              <p className={`text-xs mt-1 font-medium hidden md:block ${
                isCurrent ? 'text-indigo-700' : isDone || isPast ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {step.label}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${isPast || isDone ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function SetupWizard({ onComplete }) {
  const { schoolId } = useUser();
  const queryClient = useQueryClient();
  const { data: status } = useOnboardingStatus(schoolId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [academicYearId, setAcademicYearId] = useState(null);

  const completedStepIds = new Set((status?.steps || []).filter(s => s.completed).map(s => s.id));

  // Find the first incomplete step index on mount
  const firstIncompleteIndex = STEPS.findIndex(s => !completedStepIds.has(s.id));

  const currentStep = STEPS[currentIndex];
  const StepComponent = currentStep.component;
  const isLastStep = currentIndex === STEPS.length - 1;

  const handleStepDone = () => {
    queryClient.invalidateQueries({ queryKey: ['onboarding-status', schoolId] });
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const handleSkip = () => {
    if (!isLastStep) setCurrentIndex(i => i + 1);
    else onComplete?.();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Wizard header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-5 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-200" />
          <div>
            <h2 className="text-base font-bold">School Setup Wizard</h2>
            <p className="text-indigo-200 text-xs">Step {currentIndex + 1} of {STEPS.length} — {currentStep.description}</p>
          </div>
          <div className="ml-auto">
            <Badge className="bg-white/20 text-white border-0 text-xs">
              {completedStepIds.size}/{STEPS.length} complete
            </Badge>
          </div>
        </div>
        <StepNav steps={STEPS} currentIndex={currentIndex} completedStepIds={completedStepIds} />
        <Progress
          value={((currentIndex) / STEPS.length) * 100}
          className="h-1 mt-4 bg-indigo-400/50"
          indicatorClassName="bg-white"
        />
      </div>

      {/* Step content */}
      <div className="p-6">
        <StepComponent
          schoolId={schoolId}
          academicYearId={academicYearId}
          onAcademicYearCreated={setAcademicYearId}
          onDone={handleStepDone}
        />
      </div>

      {/* Footer nav */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="gap-1.5 text-slate-500"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-slate-400 text-xs">
            Skip this step
          </Button>
          {isLastStep ? (
            <Button size="sm" onClick={onComplete} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Finish Setup
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setCurrentIndex(i => i + 1)}
              className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}