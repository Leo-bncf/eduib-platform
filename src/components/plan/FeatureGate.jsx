import React, { useState } from 'react';
import { usePlan } from './PlanProvider';
import { Button } from '@/components/ui/button';
import { Shield, ArrowUpCircle } from 'lucide-react';
import UpgradePrompt from './UpgradePrompt';

export default function FeatureGate({ feature, module, limit, currentCount, fallback, children }) {
  const plan = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);

  let hasAccess = true;
  let reason = null;

  if (plan.isBlocked) {
    hasAccess = false;
    reason = plan.isCanceled ? 'Your subscription has been canceled.' : 'Your account has been suspended due to payment issues.';
  } else if (feature && !plan.canAccessFeature(feature)) {
    hasAccess = false;
    reason = 'This feature is not available on your current plan.';
  } else if (module && !plan.canAccessModule(module)) {
    hasAccess = false;
    reason = 'This module is not included in your current plan.';
  } else if (limit && currentCount !== undefined && !plan.canCreateMore(limit, currentCount)) {
    hasAccess = false;
    const limitValue = plan.getLimit(limit);
    reason = `You've reached the limit of ${limitValue} for your current plan.`;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <div className="p-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Upgrade Required</h3>
        <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">{reason}</p>
        <Button onClick={() => setShowUpgrade(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <ArrowUpCircle className="w-4 h-4 mr-2" />
          Upgrade Plan
        </Button>
      </div>
      <UpgradePrompt open={showUpgrade} onClose={() => setShowUpgrade(false)} reason={reason} />
    </>
  );
}