import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Zap,
} from 'lucide-react';
import SuperAdminLoadingState from '@/components/admin/super-admin/SuperAdminLoadingState';
import SuperAdminPageHeader from '@/components/admin/super-admin/SuperAdminPageHeader';
import SuperAdminShell from '@/components/admin/super-admin/SuperAdminShell';
import { useSuperAdminAccess } from '@/components/hooks/useSuperAdminAccess';
import {
  getSuperAdminPlanMetrics,
  useSuperAdminSchoolsQuery,
} from '@/components/hooks/useSuperAdminData';

const billingStatusColors = {
  active: 'bg-emerald-900/50 text-emerald-300 border-emerald-800',
  trial: 'bg-amber-900/50 text-amber-300 border-amber-800',
  past_due: 'bg-red-900/50 text-red-300 border-red-800',
  canceled: 'bg-slate-700/50 text-slate-400 border-slate-600',
  incomplete: 'bg-orange-900/50 text-orange-300 border-orange-800',
  none: 'bg-slate-700/50 text-slate-400 border-slate-600',
};

export default function SuperAdminPlans() {
  const navigate = useNavigate();
  const { currentUser, isChecking } = useSuperAdminAccess(navigate);
  const { data: schools = [], isLoading } = useSuperAdminSchoolsQuery({ enabled: !!currentUser });
  const metrics = getSuperAdminPlanMetrics(schools);

  if (isChecking || isLoading) {
    return <SuperAdminLoadingState />;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <SuperAdminShell activeItem="plans" currentUser={currentUser}>
      <SuperAdminPageHeader
        title="Plan Management"
        subtitle="Manage school plans and subscriptions"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Est. MRR</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">${metrics.mrrEstimate || 0}</p>
          <p className="text-slate-500 text-xs mt-1">from active plans</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Paid Schools</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{metrics.paidSchools}</p>
          <p className="text-slate-500 text-xs mt-1">active subscriptions</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">On Trial</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{metrics.trialSchools}</p>
          <p className="text-slate-500 text-xs mt-1">trial accounts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">Schools by Plan</h2>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(metrics.byPlan).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700 capitalize font-medium">{plan}</span>
                <span className="text-sm font-bold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">Billing Status</h2>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(metrics.byBilling).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700 capitalize font-medium">{status || 'None'}</span>
                <span className="text-sm font-bold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">All Schools</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">School</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Plan</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Billing</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Trial End</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Period End</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schools.map((school) => (
              <tr
                key={school.id}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/SuperAdminSchoolDetail/${school.id}`)}
              >
                <td className="px-5 py-3">
                  <p className="text-sm font-medium text-slate-900">{school.name}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-slate-700 capitalize">{school.plan || 'None'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${billingStatusColors[school.billing_status || 'none']}`}>
                    {school.billing_status || 'none'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs text-slate-500">
                    {school.trial_end_date ? new Date(school.trial_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-slate-500">
                    {school.subscription_current_period_end ? new Date(school.subscription_current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SuperAdminShell>
  );
}