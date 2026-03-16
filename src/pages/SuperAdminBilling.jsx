import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  DollarSign,
  Search,
  TrendingUp,
} from 'lucide-react';
import SuperAdminLoadingState from '@/components/admin/super-admin/SuperAdminLoadingState';
import SuperAdminPageHeader from '@/components/admin/super-admin/SuperAdminPageHeader';
import SuperAdminShell from '@/components/admin/super-admin/SuperAdminShell';
import { useSuperAdminAccess } from '@/components/hooks/useSuperAdminAccess';
import {
  getSuperAdminBillingMetrics,
  SUPER_ADMIN_PLAN_PRICES,
  useSuperAdminSchoolsQuery,
} from '@/components/hooks/useSuperAdminData';

const billingColors = {
  trial: 'bg-amber-900/50 text-amber-300 border-amber-800',
  active: 'bg-emerald-900/50 text-emerald-300 border-emerald-800',
  past_due: 'bg-red-900/50 text-red-300 border-red-800',
  incomplete: 'bg-orange-900/50 text-orange-300 border-orange-800',
  canceled: 'bg-slate-700/50 text-slate-400 border-slate-600',
  unpaid: 'bg-red-900/50 text-red-300 border-red-800',
};

const planColors = {
  starter: 'bg-blue-900/50 text-blue-300 border-blue-800',
  professional: 'bg-indigo-900/50 text-indigo-300 border-indigo-800',
  enterprise: 'bg-violet-900/50 text-violet-300 border-violet-800',
};

export default function SuperAdminBilling() {
  const navigate = useNavigate();
  const { currentUser, isChecking } = useSuperAdminAccess(navigate);
  const [search, setSearch] = useState('');
  const { data: schools = [], isLoading } = useSuperAdminSchoolsQuery({ enabled: !!currentUser });

  if (isChecking || isLoading) {
    return <SuperAdminLoadingState />;
  }

  if (!currentUser) {
    return null;
  }

  const filtered = schools.filter((school) => school.name?.toLowerCase().includes(search.toLowerCase()));
  const { totalMRR, stats } = getSuperAdminBillingMetrics(schools);

  return (
    <SuperAdminShell activeItem="billing" currentUser={currentUser}>
      <SuperAdminPageHeader
        title="Billing Overview"
        subtitle="Monitor subscription revenue and billing status"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Est. MRR</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">${totalMRR.toLocaleString()}</p>
          <p className="text-slate-500 text-xs mt-1">from active subs</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Active</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.active}</p>
          <p className="text-slate-500 text-xs mt-1">paid subscriptions</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Trial</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.trial}</p>
          <p className="text-slate-500 text-xs mt-1">trial accounts</p>
        </div>
        <div className="bg-red-50 border border-red-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-red-700 text-xs font-medium uppercase tracking-wide">Past Due</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-700">{stats.pastDue}</p>
          <p className="text-red-600 text-xs mt-1">need attention</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">School Subscriptions</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search schools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No schools found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">School</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Plan</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Billing Status</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">MRR</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Next Billing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((school) => {
                const mrr = SUPER_ADMIN_PLAN_PRICES[school.plan] || SUPER_ADMIN_PLAN_PRICES.starter;

                return (
                  <tr
                    key={school.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/SuperAdminSchoolDetail/${school.id}`)}
                  >
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-900">{school.name}</p>
                      <p className="text-xs text-slate-500">{school.city}{school.country ? `, ${school.country}` : ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${planColors[school.plan] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {school.plan || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {school.billing_status ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${billingColors[school.billing_status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {school.billing_status}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-slate-700 font-medium">
                        {school.billing_status && ['active', 'trial'].includes(school.billing_status) ? `$${mrr}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-slate-500">
                        {school.subscription_current_period_end
                          ? new Date(school.subscription_current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : school.trial_end_date
                            ? `Trial: ${new Date(school.trial_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                            : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </SuperAdminShell>
  );
}