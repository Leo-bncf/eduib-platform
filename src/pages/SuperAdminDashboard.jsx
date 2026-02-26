import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import StatCard from '@/components/app/StatCard';
import { useUser } from '@/components/auth/UserContext';
import { 
  LayoutDashboard, Building2, Users, CreditCard, BarChart3, 
  LifeBuoy, FileText, Loader2, Plus, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SuperAdminDashboard', icon: LayoutDashboard },
  { label: 'Schools', page: 'SuperAdminSchools', icon: Building2 },
  { label: 'Platform Analytics', page: 'SuperAdminDashboard', icon: BarChart3 },
];

export default function SuperAdminDashboard() {
  const { user } = useUser();

  const { data: schools = [], isLoading: loadingSchools } = useQuery({
    queryKey: ['schools'],
    queryFn: () => base44.entities.School.list('-created_date'),
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['all-memberships'],
    queryFn: () => base44.entities.SchoolMembership.list(),
  });

  const { data: demoRequests = [] } = useQuery({
    queryKey: ['demo-requests'],
    queryFn: () => base44.entities.DemoRequest.filter({ status: 'new' }),
  });

  const activeSchools = schools.filter(s => s.status === 'active').length;
  const totalUsers = memberships.length;

  const statusColors = {
    active: 'bg-emerald-50 text-emerald-700',
    onboarding: 'bg-amber-50 text-amber-700',
    suspended: 'bg-red-50 text-red-700',
    cancelled: 'bg-slate-100 text-slate-600',
  };

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="super_admin" userName={user?.full_name} />
        
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
              <p className="text-sm text-slate-500 mt-1">Manage all schools and monitor the platform</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Schools" value={schools.length} icon={Building2} color="indigo" />
              <StatCard label="Active Schools" value={activeSchools} icon={Building2} color="emerald" />
              <StatCard label="Total Users" value={totalUsers} icon={Users} color="blue" />
              <StatCard label="New Demo Requests" value={demoRequests.length} icon={FileText} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Schools</h2>
                  <a href={createPageUrl('SuperAdminSchools')}>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8">
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add School
                    </Button>
                  </a>
                </div>
                {loadingSchools ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" />
                  </div>
                ) : schools.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm">No schools yet</div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {schools.slice(0, 8).map(school => (
                      <div key={school.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{school.name}</p>
                          <p className="text-xs text-slate-400">{school.city}{school.country ? `, ${school.country}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${statusColors[school.status]} border-0 text-xs`}>
                            {school.status}
                          </Badge>
                          <span className="text-xs text-slate-400">{school.plan}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900">Recent Demo Requests</h2>
                </div>
                {demoRequests.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm">No pending requests</div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {demoRequests.slice(0, 6).map(req => (
                      <div key={req.id} className="px-6 py-3.5">
                        <p className="font-medium text-slate-900 text-sm">{req.school_name}</p>
                        <p className="text-xs text-slate-400">{req.contact_name} · {req.email}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{req.created_date ? format(new Date(req.created_date), 'MMM d, yyyy') : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}