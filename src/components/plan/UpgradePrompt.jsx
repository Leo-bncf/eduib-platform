import React from 'react';
import { usePlan } from './PlanProvider';
import { useUser } from '@/components/auth/UserContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import StudentPricingUpgrade from './StudentPricingUpgrade';

export default function UpgradePrompt({ open, onClose, reason }) {
  const plan = usePlan();
  const { schoolId, school } = useUser();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
          <DialogDescription>
            {reason || 'Per-student annual pricing — unlimited teachers and classes on all plans'}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <StudentPricingUpgrade
            schoolId={schoolId}
            currentPlan={plan.plan}
            currentStudents={school?.max_students || 0}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}