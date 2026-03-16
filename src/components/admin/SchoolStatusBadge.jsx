import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getBillingStatusMeta, getSchoolStatusMeta } from '@/components/admin/super-admin/superAdminConfig';

export default function SchoolStatusBadge({ status, billingStatus }) {
  const statusMeta = getSchoolStatusMeta(status, 'light');
  const billingMeta = getBillingStatusMeta(billingStatus, 'light');

  return (
    <div className="flex items-center gap-2">
      <Badge className={statusMeta.color}>{statusMeta.label}</Badge>
      {billingStatus && <Badge className={billingMeta.color}>{billingMeta.label}</Badge>}
    </div>
  );
}