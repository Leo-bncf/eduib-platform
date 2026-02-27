import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Loader2, Search, Activity, School, Users, CreditCard, BookOpen,
  FileText, Building2, DollarSign, TrendingUp, AlertTriangle
} from 'lucide-react';

const planPrices = { starter: 99, professional: 299, enterprise: 799 };

const billingColors = {
  trial:    'bg-amber-900/50 text-amber-300 border-amber-800',
  active:   'bg-emerald-900/50 text-emerald-300 border-emerald-800',
  past_due: 'bg-red-900/50 text-red-300 border-red-800',
  incomplete:'bg-orange-900/50 text-orange-300 border-orange-800',
  canceled: 'bg-slate-700/50 text-slate-400 border-slate-600',
  unpaid:   'bg-red-900/50 text-red-300 border-red-800',
};

const planColors = {
  starter:      'bg-blue-900/50 text-blue-300 border-blue-800',
  professional: 'bg-indigo-900/50 text-indigo-300 border-indigo-800',
  enterprise:   'bg-violet-900/50 text-violet-300 border-violet-800',
};

export default function SuperAdminBilling() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const check = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { navigate('/'); return; }
      const user = await base44.auth.me();
      if (user?.role !== 'super_admin') { navigate('/'); return; }
    };
    check();
  }, [navigate]);

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools-billing'],
    queryFn: () => base44.entities.School.list('-created_date'),
  });

  const filtered = schools.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  const totalMRR = schools
    .filter(s => s.billing_status === 'active')
    .reduce((sum, s) => sum + (planPrices[s.plan] || 99), 0);

  const stats = {
    active: schools.filter(s => s.billing_status === 'active').length,
    trial:  schools.filter(s => s.billing_status === 'trial').length,
    pastDue:schools.filter(s => s.billing_status === 'past_due').length,
  };

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
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium">
            <CreditCard className="w-4 h-4" /> Billing
          </Link>
          <Link to={createPageUrl('SuperAdminPlans')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors">
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
            <h1 className="text-2xl font-bold text-white">Billing Overview</h1>
            <p className="text-slate-400 text-sm mt-1">Monitor subscription revenue and billing status</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Est. MRR</span>
                <DollarSign className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-3xl font-bold text-white">${totalMRR.toLocaleString()}</p>
              <p className="text-slate-500 text-xs mt-1">from active subs</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Active</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.active}</p>
              <p className="text-slate-500 text-xs mt-1">paid subscriptions</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Trial</span>
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.trial}</p>
              <p className="text-slate-500 text-xs mt-1">trial accounts</p>
            </div>
            <div className="bg-slate-900 border border-red-900 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Past Due</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-red-400">{stats.pastDue}</p>
              <p className="text-slate-500 text-xs mt-1">need attention</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">School Subscriptions</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search schools..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No schools found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">School</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Plan</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Billing Status</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">MRR</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Next Billing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map(school => {
                    const mrr = planPrices[school.plan] || 99;
                    return (
                      <tr key={school.id}
                        className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                        onClick={() => navigate(`/SuperAdminSchoolDetail/${school.id}`)}>
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-white">{school.name}</p>
                          <p className="text-xs text-slate-500">{school.city}{school.country ? `, ${school.country}` : ''}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${planColors[school.plan] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                            {school.plan || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {school.billing_status ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${billingColors[school.billing_status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                              {school.billing_status}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-slate-300 font-medium">
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
        </div>
      </div>
    </div>
  );
}