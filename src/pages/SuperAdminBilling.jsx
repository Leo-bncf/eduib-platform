import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { useUser } from '@/components/auth/UserContext';
import { LayoutDashboard, Building2, Shield, DollarSign, Loader2, Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/app/StatCard';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SuperAdminDashboard', icon: LayoutDashboard },
  { label: 'Schools', page: 'SuperAdminSchools', icon: Building2 },
  { label: 'Billing', page: 'SuperAdminBilling', icon: DollarSign },
  { label: 'Audit Logs', page: 'SuperAdminAuditLogs', icon: Shield },
];

export default function SuperAdminBilling() {
  const { user } = useUser();
  const [search, setSearch] = useState('');

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools-billing'],
    queryFn: () => base44.entities.School.list('-created_date'),
  });

  const filtered = schools.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: schools.length,
    active: schools.filter(s => s.billing_status === 'active').length,
    trial: schools.filter(s => s.billing_status === 'trial').length,
    pastDue: schools.filter(s => s.billing_status === 'past_due').length,
  };

  const revenue = {
    starter: schools.filter(s => s.plan === 'starter' && ['active', 'trial'].includes(s.billing_status)).length * 99,
    professional: schools.filter(s => s.plan === 'professional' && ['active', 'trial'].includes(s.billing_status)).length * 299,
    enterprise: schools.filter(s => s.plan === 'enterprise' && ['active', 'trial'].includes(s.billing_status)).length * 799,
  };
  const totalMRR = revenue.starter + revenue.professional + revenue.enterprise;

  const statusColors = {
    trial: 'bg-blue-50 text-blue-700',
    active: 'bg-emerald-50 text-emerald-700',
    past_due: 'bg-amber-50 text-amber-700',
    canceled: 'bg-slate-100 text-slate-600',
    unpaid: 'bg-red-50 text-red-700',
    incomplete: 'bg-amber-50 text-amber-700',
  };

  const planColors = {
    starter: 'bg-blue-50 text-blue-700',
    professional: 'bg-indigo-50 text-indigo-700',
    enterprise: 'bg-violet-50 text-violet-700',
  };

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="super_admin" userName={user?.full_name} />
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Billing Overview</h1>
              <p className="text-sm text-slate-500 mt-1">Monitor subscription revenue and billing status</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <StatCard 
                label="Total MRR" 
                value={`$${totalMRR.toLocaleString()}`} 
                icon={DollarSign} 
                color="indigo"
              />
              <StatCard 
                label="Active Subscriptions" 
                value={stats.active} 
                icon={TrendingUp} 
                color="emerald"
              />
              <StatCard 
                label="Trial Accounts" 
                value={stats.trial} 
                icon={Building2} 
                color="blue"
              />
              <StatCard 
                label="Past Due" 
                value={stats.pastDue} 
                icon={Shield} 
                color="amber"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>School Subscriptions</CardTitle>
                <div className="pt-4">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search schools..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="p-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" /></div>
                ) : filtered.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 text-sm">No schools found</div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-slate-100">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 text-left bg-slate-50">
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">School</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Plan</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Billing Status</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">MRR</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Next Billing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filtered.map(school => {
                          const mrr = school.plan === 'starter' ? 99 : school.plan === 'professional' ? 299 : 799;
                          return (
                            <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-medium text-slate-900 text-sm">{school.name}</p>
                                <p className="text-xs text-slate-400">{school.city}{school.country ? `, ${school.country}` : ''}</p>
                              </td>
                              <td className="px-6 py-4">
                                <Badge className={`${planColors[school.plan]} border-0 text-xs capitalize`}>
                                  {school.plan}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                {school.billing_status ? (
                                  <Badge className={`${statusColors[school.billing_status]} border-0 text-xs capitalize`}>
                                    {school.billing_status}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-slate-400">No subscription</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                                {school.billing_status && ['active', 'trial'].includes(school.billing_status) ? `$${mrr}` : '—'}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {school.subscription_current_period_end ? (
                                  new Date(school.subscription_current_period_end).toLocaleDateString()
                                ) : school.trial_end_date ? (
                                  <span className="text-blue-600">Trial: {new Date(school.trial_end_date).toLocaleDateString()}</span>
                                ) : (
                                  '—'
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}