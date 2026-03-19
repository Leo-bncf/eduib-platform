import React, { createContext, useContext, useMemo } from 'react';
import { useUser } from '@/components/auth/UserContext';
import { canAccessFeature, canAccessModule, getPlanLimit } from './PlanConfig';

const PlanContext = createContext(null);

export function PlanProvider({ children }) {
  const { school } = useUser();

  const planState = useMemo(() => {
    if (!school) {
      return {
        plan: 'starter',
        billingStatus: null,
        isActive: false,
        isTrial: false,
        isPastDue: false,
        isCanceled: false,
        isBlocked: false,
        trialEndsAt: null,
        daysLeftInTrial: null,
        canAccessFeature: () => false,
        canAccessModule: () => false,
        canCreateMore: () => false,
        getLimit: () => 0,
      };
    }

    const plan = school.plan || 'starter';
    const billingStatus = school.billing_status;
    const isTrial = billingStatus === 'trial';
    const isActive = billingStatus === 'active';
    const isPastDue = billingStatus === 'past_due';
    const isCanceled = billingStatus === 'canceled';
    const isBlocked = ['canceled', 'unpaid'].includes(billingStatus);

    let trialEndsAt = null;
    let daysLeftInTrial = null;
    if (isTrial && school.trial_end_date) {
      trialEndsAt = new Date(school.trial_end_date);
      const now = new Date();
      daysLeftInTrial = Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24));
    }

    return {
      plan,
      billingStatus,
      isActive,
      isTrial,
      isPastDue,
      isCanceled,
      isBlocked,
      trialEndsAt,
      daysLeftInTrial,
      school,
      canAccessFeature: (feature) => {
        if (isBlocked) return false;
        return canAccessFeature(plan, feature);
      },
      canAccessModule: (module) => {
        if (isBlocked) return false;
        return canAccessModule(plan, module);
      },
      canCreateMore: (limitKey, currentCount) => {
        if (isBlocked) return false;
        return isWithinLimit(plan, limitKey, currentCount);
      },
      getLimit: (limitKey) => getPlanLimit(plan, limitKey),
    };
  }, [school]);

  return <PlanContext.Provider value={planState}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within PlanProvider');
  }
  return context;
}