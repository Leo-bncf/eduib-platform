import React, { useState } from 'react';
import { usePlan } from './PlanProvider';
import { useUser } from '@/components/auth/UserContext';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { PLAN_LIMITS, PLAN_NAMES, PLAN_PRICES, getUpgradePlans } from './PlanConfig';

export default function UpgradePrompt({ open, onClose, reason }) {
  const plan = usePlan();
  const { schoolId } = useUser();
  const [loading, setLoading] = useState(false);
  const availablePlans = getUpgradePlans(plan.plan);

  const handleUpgrade = async (targetPlan) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        schoolId,
        plan: targetPlan,
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Upgrade error:', error);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            {reason || 'Unlock more features and capabilities for your school'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Current Plan:</strong> {PLAN_NAMES[plan.plan]} (${PLAN_PRICES[plan.plan]}/month)
            </p>
          </div>

          {availablePlans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">You're already on the highest plan!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {availablePlans.map((targetPlan) => {
                const limits = PLAN_LIMITS[targetPlan];
                const features = Object.entries(limits.features)
                  .filter(([_, enabled]) => enabled)
                  .map(([key]) => key.replace(/_/g, ' '));

                return (
                  <div
                    key={targetPlan}
                    className="border-2 border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          {PLAN_NAMES[targetPlan]}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-slate-900">
                            ${PLAN_PRICES[targetPlan]}
                          </span>
                          <span className="text-slate-600">/month</span>
                        </div>
                      </div>
                      {targetPlan === 'professional' && (
                        <Badge className="bg-indigo-100 text-indigo-700 border-0">Popular</Badge>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="text-sm text-slate-600">
                        <strong>Limits:</strong>
                        <ul className="mt-2 space-y-1">
                          <li>• Users: {limits.max_users === -1 ? 'Unlimited' : limits.max_users}</li>
                          <li>• Classes: {limits.max_classes === -1 ? 'Unlimited' : limits.max_classes}</li>
                        </ul>
                      </div>
                      <div className="text-sm text-slate-600">
                        <strong>Premium Features:</strong>
                        <ul className="mt-2 space-y-1">
                          {features.slice(0, 5).map((f) => (
                            <li key={f} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              <span className="capitalize">{f}</span>
                            </li>
                          ))}
                          {features.length > 5 && (
                            <li className="text-slate-400 italic">+ {features.length - 5} more features</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleUpgrade(targetPlan)}
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <ArrowRight className="w-4 h-4 mr-2" />
                      )}
                      Upgrade to {PLAN_NAMES[targetPlan]}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}