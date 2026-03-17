import React, { useState } from 'react';
import { usePlan } from './PlanProvider';
import { Button } from '@/components/ui/button';
import { Lock, ArrowUpCircle, XCircle, AlertTriangle } from 'lucide-react';
import UpgradePrompt from './UpgradePrompt';
import { PLAN_NAMES, PLAN_LIMITS, getUpgradePlans } from './PlanConfig';

function findUnlockPlan(feature, module) {
  const order = ['starter', 'professional', 'enterprise'];
  for (const p of order) {
    const limits = PLAN_LIMITS[p];
    const featureOk = !feature || limits.features[feature] === true;
    const moduleOk = !module || limits.modules.includes(module);
    if (featureOk && moduleOk) return p;
  }
  return null;
}

// ── Inline gate: shows a subtle locked badge inline instead of blocking the UI ──
export function InlineFeatureGate({ feature, module, children, label }) {
  const plan = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);

  let hasAccess = true;
  if (plan.isBlocked) hasAccess = false;
  else if (feature && !plan.canAccessFeature(feature)) hasAccess = false;
  else if (module && !plan.canAccessModule(module)) hasAccess = false;

  if (hasAccess) return <>{children}</>;

  const unlockPlan = findUnlockPlan(feature, module);

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setShowUpgrade(true)}>
        <div className="pointer-events-none opacity-40 select-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
          <span className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm group-hover:border-indigo-300 group-hover:text-indigo-700 transition-colors">
            <Lock className="w-3 h-3" />
            {label || 'Upgrade Required'}
            {unlockPlan && <span className="text-indigo-500">· {PLAN_NAMES[unlockPlan]}+</span>}
          </span>
        </div>
      </div>
      <UpgradePrompt open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}

// ── Standard block gate ───────────────────────────────────────────────────────
export default function FeatureGate({ feature, module, limit, currentCount, fallback, children, compact = false }) {
  const plan = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);

  let hasAccess = true;
  let reason = null;
  let reasonType = 'plan'; // 'plan' | 'blocked' | 'limit'

  if (plan.isBlocked) {
    hasAccess = false;
    reasonType = 'blocked';
    reason = plan.isCanceled
      ? 'Your subscription has been canceled. Re-subscribe to restore access.'
      : 'Your account is suspended due to payment issues. Update billing to restore access.';
  } else if (feature && !plan.canAccessFeature(feature)) {
    hasAccess = false;
    reason = `This feature requires a higher plan.`;
  } else if (module && !plan.canAccessModule(module)) {
    hasAccess = false;
    reason = `This module is not included in your current plan.`;
  } else if (limit && currentCount !== undefined && !plan.canCreateMore(limit, currentCount)) {
    hasAccess = false;
    reasonType = 'limit';
    const limitValue = plan.getLimit(limit);
    reason = `You've reached the limit of ${limitValue} on your current plan.`;
  }

  if (hasAccess) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  const unlockPlan = reasonType === 'plan' ? findUnlockPlan(feature, module) : null;
  const upgradePlans = getUpgradePlans(plan.plan);

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-500">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1">{reason}</span>
          {upgradePlans.length > 0 && (
            <button onClick={() => setShowUpgrade(true)} className="text-indigo-600 font-medium hover:underline whitespace-nowrap text-xs">
              Upgrade
            </button>
          )}
        </div>
        <UpgradePrompt open={showUpgrade} onClose={() => setShowUpgrade(false)} reason={reason} />
      </>
    );
  }

  return (
    <>
      <div className="p-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${reasonType === 'blocked' ? 'bg-red-100' : 'bg-indigo-100'}`}>
          {reasonType === 'blocked'
            ? <XCircle className="w-6 h-6 text-red-600" />
            : reasonType === 'limit'
            ? <AlertTriangle className="w-6 h-6 text-amber-600" />
            : <Lock className="w-6 h-6 text-indigo-600" />
          }
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1.5">
          {reasonType === 'blocked' ? 'Account Suspended' : reasonType === 'limit' ? 'Plan Limit Reached' : 'Feature Locked'}
        </h3>
        <p className="text-sm text-slate-500 mb-1 max-w-sm mx-auto">{reason}</p>
        {unlockPlan && (
          <p className="text-xs text-indigo-600 mb-4">Available on <strong>{PLAN_NAMES[unlockPlan]}</strong> and above</p>
        )}
        {upgradePlans.length > 0 && (
          <Button onClick={() => setShowUpgrade(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
            <ArrowUpCircle className="w-4 h-4" />
            {reasonType === 'blocked' ? 'Manage Billing' : 'View Upgrade Options'}
          </Button>
        )}
      </div>
      <UpgradePrompt open={showUpgrade} onClose={() => setShowUpgrade(false)} reason={reason} />
    </>
  );
}