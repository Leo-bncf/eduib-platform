import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useAllSchools, usePlatformMetrics } from '@/components/hooks/useDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2, Users, DollarSign, AlertTriangle, Plus,
  ArrowRight, TrendingUp, Activity, ChevronRight,
  School, BookOpen, CreditCard, FileText, Settings,
  CheckCircle, Clock, XCircle, Loader2
} from 'lucide-react';
import CreateSchoolDialog from '@/components/admin/CreateSchoolDialog';

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  onboarding: { label: 'Onboarding', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const billingConfig = {
  trial: { label: 'Trial', color: 'bg-amber-100 text-amber-700' },
  active: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700' },
  past_due: { label: 'Past Due', color: 'bg-red-100 text-red-700' },
  incomplete: { label: 'Incomplete', color: 'bg-orange-100 text-orange-700' },
  canceled: { label: 'Canceled', color: 'bg-slate-100 text-slate-600' },
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { data: schools = [], isLoading, refetch } = useAllSchools();
  const metrics = usePlatformMetrics(schools);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { navigate('/'); return; }
      const user = await base44.auth.me();
      if (user?.role !== 'super_admin' && user?.role !== 'admin') { navigate('/'); return; }
      setCurrentUser(user);
    };
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  const recentSchools = [...schools].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 8);
  const atRiskSchools = schools.filter(s => s.billing_status === 'past_due' || s.billing_status === 'incomplete' || s.status === 'suspended');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Nav */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-slate-900 font-semibold text-sm">IB Platform</span>
            <span className="text-slate-500 text-xs ml-2">Super Admin Console</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm">{currentUser?.email}</span>
          <Button
            onClick={() => base44.auth.logout()}
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs"
          >
            Sign out
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 min-h-screen bg-white border-r border-slate-200 p-4 flex flex-col gap-1">
          <Link to={createPageUrl('SuperAdminDashboard')}
            className="flex items-center gap-3 px-3 py-2 rounded-md bg-slate-100 text-slate-900 text-sm font-medium">
            <Activity className="w-4 h-4" /> Overview
          </Link>
          <Link to={createPageUrl('SuperAdminSchools')}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm transition-colors">
            <School className="w-4 h-4" /> Schools
          </Link>
          <Link to={createPageUrl('SuperAdminUsers')}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm transition-colors">
            <Users className="w-4 h-4" /> Users
          </Link>
          <Link to={createPageUrl('SuperAdminBilling')}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm transition-colors">
            <CreditCard className="w-4 h-4" /> Billing
          </Link>
          <Link to={createPageUrl('SuperAdminPlans')}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm transition-colors">
            <BookOpen className="w-4 h-4" /> Plans
          </Link>
          <Link to={createPageUrl('SuperAdminAuditLogs')}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm transition-colors">
            <FileText className="w-4 h-4" /> Audit Logs
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
              <p className="text-slate-500 text-sm mt-1">Monitor and manage your IB platform</p>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> New School
            </Button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Total Schools</span>
                <Building2 className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{metrics.total}</p>
              <p className="text-slate-500 text-xs mt-1">{metrics.onboarding} in setup</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Active</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{metrics.active}</p>
              <p className="text-slate-500 text-xs mt-1">fully onboarded</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Paying</span>
                <DollarSign className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{metrics.paid}</p>
              <p className="text-slate-500 text-xs mt-1">{metrics.trial} on trial</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-md p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-red-700 text-xs font-medium uppercase tracking-wide">At Risk</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-700">{metrics.atRisk}</p>
              <p className="text-red-600 text-xs mt-1">billing or suspended</p>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Schools Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900">Recent Schools</h2>
                <Link to={createPageUrl('SuperAdminSchools')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentSchools.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No schools yet</p>
                ) : recentSchools.map(school => (
                  <div key={school.id}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(createPageUrl(`SuperAdminSchoolDetail`) + `/${school.id}`)}>
                    <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{school.name}</p>
                      <p className="text-xs text-slate-500">{school.city || '–'}, {school.country || '–'}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {school.status && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig[school.status]?.color || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {statusConfig[school.status]?.label || school.status}
                        </span>
                      )}
                      {school.billing_status && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${billingConfig[school.billing_status]?.color || 'bg-slate-100 text-slate-600'}`}>
                          {billingConfig[school.billing_status]?.label || school.billing_status}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* At Risk */}
              {atRiskSchools.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm font-semibold text-red-800">Needs Attention ({atRiskSchools.length})</h3>
                  </div>
                  <div className="divide-y divide-red-100 max-h-48 overflow-auto">
                    {atRiskSchools.map(school => (
                      <div key={school.id}
                        className="px-5 py-3 cursor-pointer hover:bg-red-100/50 transition-colors"
                        onClick={() => navigate(createPageUrl(`SuperAdminSchoolDetail`) + `/${school.id}`)}>
                        <p className="text-sm font-medium text-red-900 truncate">{school.name}</p>
                        <p className="text-xs text-red-600 mt-0.5">
                          {school.status === 'suspended' ? 'Suspended' : `Billing: ${school.billing_status}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to={createPageUrl('SuperAdminSchools')}
                    className="flex items-center justify-between w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-md text-sm text-slate-700 hover:text-slate-900 transition-colors">
                    <span>Manage Schools</span> <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link to={createPageUrl('SuperAdminUsers')}
                    className="flex items-center justify-between w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-md text-sm text-slate-700 hover:text-slate-900 transition-colors">
                    <span>Manage Users</span> <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link to={createPageUrl('SuperAdminBilling')}
                    className="flex items-center justify-between w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-md text-sm text-slate-700 hover:text-slate-900 transition-colors">
                    <span>Billing Overview</span> <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link to={createPageUrl('SuperAdminAuditLogs')}
                    className="flex items-center justify-between w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-md text-sm text-slate-700 hover:text-slate-900 transition-colors">
                    <span>Audit Logs</span> <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Platform Health */}
              <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Subscription Split</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Paid', value: metrics.paid, color: 'bg-emerald-500' },
                    { label: 'Trial', value: metrics.trial, color: 'bg-amber-500' },
                    { label: 'Onboarding', value: metrics.onboarding, color: 'bg-blue-500' },
                    { label: 'Suspended', value: metrics.suspended, color: 'bg-red-500' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-slate-600 text-xs flex-1">{item.label}</span>
                      <span className="text-slate-900 text-sm font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateSchoolDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSchoolCreated={() => refetch()}
      />
    </div>
  );
}