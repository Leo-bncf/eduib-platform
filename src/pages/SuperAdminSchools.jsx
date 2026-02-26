import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { useUser } from '@/components/auth/UserContext';
import { LayoutDashboard, Building2, Shield, Plus, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SuperAdminDashboard', icon: LayoutDashboard },
  { label: 'Schools', page: 'SuperAdminSchools', icon: Building2 },
  { label: 'Audit Logs', page: 'SuperAdminAuditLogs', icon: Shield },
];

export default function SuperAdminSchools() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', city: '', country: '', email: '', plan: 'starter', status: 'onboarding' });

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: () => base44.entities.School.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.School.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      setShowCreate(false);
      setForm({ name: '', city: '', country: '', email: '', plan: 'starter', status: 'onboarding' });
    },
  });

  const filtered = schools.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Schools</h1>
                <p className="text-sm text-slate-500 mt-1">Manage all registered schools</p>
              </div>
              <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" /> Add School
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Search schools..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
              </div>

              {isLoading ? (
                <div className="p-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" /></div>
              ) : filtered.length === 0 ? (
                <div className="p-16 text-center text-slate-400 text-sm">No schools found</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 text-left">
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">School</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map(school => (
                      <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900 text-sm">{school.name}</p>
                          <p className="text-xs text-slate-400">{school.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{school.city}{school.country ? `, ${school.country}` : ''}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 capitalize">{school.plan}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${statusColors[school.status]} border-0 text-xs`}>{school.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New School</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
              <div>
                <Label>School Name *</Label>
                <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="mt-1" /></div>
                <div><Label>Country</Label><Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="mt-1" /></div>
              </div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1" /></div>
              <div>
                <Label>Plan</Label>
                <Select value={form.plan} onValueChange={v => setForm({...form, plan: v})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Create School
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}