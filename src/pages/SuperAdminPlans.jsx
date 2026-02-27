import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  Loader2, Activity, School, Users, CreditCard, BookOpen,
  FileText, Building2, TrendingUp, Zap, DollarSign
} from 'lucide-react';

const planPrices = { starter: 0, professional: 99, enterprise: 299 };

const billingStatusColors = {
  active:     'bg-emerald-900/50 text-emerald-300 border-emerald-800',
  trial:      'bg-amber-900/50 text-amber-300 border-amber-800',
  past_due:   'bg-red-900/50 text-red-300 border-red-800',
  canceled:   'bg-slate-700/50 text-slate-400 border-slate-600',
  incomplete: 'bg-orange-900/50 text-orange-300 border-orange-800',
  none:       'bg-slate-700/50 text-slate-400 border-slate-600',
};

export default function SuperAdminPlans() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { navigate('/'); return; }
      const user = await base44.auth.me();
      if (user?.role !== 'super_admin') { navigate('/'); return; }

      const allSchools = await base44.entities.School.list();
      setSchools(allSchools);

      const byPlan = {};
      const byBilling = {};
      allSchools.forEach(s => {
        const plan = s.plan || 'unknown';
        const billing = s.billing_status || 'none';
        byPlan[plan] = (byPlan[plan] || 0) + 1;
        byBilling[billing] = (byBilling[billing] || 0) + 1;
      });

      const mrrEstimate = allSchools
        .filter(s => s.billing_status === 'active')
        .reduce((sum, s) => sum + (planPrices[s.plan] || 99), 0);

      setMetrics({ byPlan, byBilling, mrrEstimate });
      setLoading(false);
    };
    loadData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Nav */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">IB Platform</span>
          <span className="text-slate-400 text-xs">Super Admin Console</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-1 flex-shrink-0">
          <Link to={createPageUrl('SuperAdminDashboard')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors">
            <Activity className="w-4 h-4" /> Overview
          </Link>
          <Link to={createPageUrl('SuperAdminSchools')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors">
            <School className="w-4 h-4" /> Schools
          </Link>
          <Link to={createPageUrl('SuperAdminUsers')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors">
            <Users className="w-4 h-4" /> Users
          </Link>
          <Link to={createPageUrl('SuperAdminBilling')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors">
            <CreditCard className="w-4 h-4" /> Billing
          </Link>
          <Link to={createPageUrl('SuperAdminPlans')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium">
            <BookOpen className="w-4 h-4" /> Plans
          </Link>
          <Link to={createPageUrl('SuperAdminAuditLogs')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors">
            <FileText className="w-4 h-4" /> Audit Logs
          </Link>
        </div>

        {/* Main */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Plan Management</h1>
            <p className="text-slate-400 text-sm mt-1">Manage school plans and subscriptions</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Est. MRR</span>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-3xl font-bold text-white">${metrics?.mrrEstimate || 0}</p>
              <p className="text-slate-500 text-xs mt-1">from active plans</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Paid Schools</span>
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-white">{schools.filter(s => s.billing_status === 'active').length}</p>
              <p className="text-slate-500 text-xs mt-1">active subscriptions</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">On Trial</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-white">{schools.filter(s => s.billing_status === 'trial').length}</p>
              <p className="text-slate-500 text-xs mt-1">trial accounts</p>
            </div>
          </div>

          {/* Distribution Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800">
                <h2 className="text-sm font-semibold text-white">Schools by Plan</h2>
              </div>
              <div className="p-4 space-y-2">
                {Object.entries(metrics?.byPlan || {}).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between px-3 py-2.5 bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-slate-300 capitalize font-medium">{plan}</span>
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800">
                <h2 className="text-sm font-semibold text-white">Billing Status</h2>
              </div>
              <div className="p-4 space-y-2">
                {Object.entries(metrics?.byBilling || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between px-3 py-2.5 bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-slate-300 capitalize font-medium">{status || 'None'}</span>
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* All Schools Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-white">All Schools</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">School</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Plan</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Billing</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Trial End</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Period End</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {schools.map(school => (
                  <tr key={school.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/SuperAdminSchoolDetail/${school.id}`)}>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-white">{school.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-300 capitalize">{school.plan || 'None'}</span>
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
        </div>
      </div>
    </div>
  );
}