import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

/**
 * Displays school onboarding progress with visual indicators
 */
export default function OnboardingProgress({ 
  currentStep, 
  totalSteps, 
  completedSteps,
  steps 
}) {
  const progressPercent = (completedSteps / totalSteps) * 100;
  const isComplete = completedSteps === totalSteps;

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Setup Progress</CardTitle>
          <span className="text-sm font-semibold text-indigo-600">
            {completedSteps} of {totalSteps} completed
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressPercent} className="h-2" />

        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm">
              {step.completed ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : step.id === currentStep ? (
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 animate-pulse" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
              )}
              <span className={step.completed ? 'text-slate-600 line-through' : 'text-slate-700 font-medium'}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {isComplete && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm font-semibold text-emerald-900">✓ Setup Complete!</p>
            <p className="text-xs text-emerald-700 mt-1">Your school is ready to use. Start inviting staff and students.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}