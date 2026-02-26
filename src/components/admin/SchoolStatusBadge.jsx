import React from 'react';
import { Badge } from '@/components/ui/badge';

/**
 * Displays school status with appropriate styling
 */
export default function SchoolStatusBadge({ status, billingStatus }) {
  const getStatusColor = () => {
    if (status === 'active') return 'bg-emerald-100 text-emerald-800';
    if (status === 'onboarding') return 'bg-blue-100 text-blue-800';
    if (status === 'suspended') return 'bg-red-100 text-red-800';
    if (status === 'cancelled') return 'bg-slate-100 text-slate-800';
    return 'bg-slate-100 text-slate-800';
  };

  const getBillingColor = () => {
    if (billingStatus === 'active') return 'bg-emerald-100 text-emerald-800';
    if (billingStatus === 'trial') return 'bg-amber-100 text-amber-800';
    if (billingStatus === 'past_due') return 'bg-red-100 text-red-800';
    if (billingStatus === 'canceled') return 'bg-slate-100 text-slate-800';
    return 'bg-slate-100 text-slate-800';
  };

  const getStatusLabel = () => {
    if (status === 'onboarding') return 'In Setup';
    if (status === 'active') return 'Active';
    if (status === 'suspended') return 'Suspended';
    return status;
  };

  const getBillingLabel = () => {
    if (billingStatus === 'trial') return 'Trial';
    if (billingStatus === 'active') return 'Paid';
    if (billingStatus === 'past_due') return 'Past Due';
    if (billingStatus === 'canceled') return 'Canceled';
    if (billingStatus === 'incomplete') return 'Incomplete';
    return billingStatus || 'No Plan';
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={getStatusColor()}>{getStatusLabel()}</Badge>
      {billingStatus && (
        <Badge className={getBillingColor()}>{getBillingLabel()}</Badge>
      )}
    </div>
  );
}