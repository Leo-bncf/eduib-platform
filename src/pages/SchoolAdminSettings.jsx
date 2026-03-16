import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, Calendar, Clock,
  FileText, CreditCard, Settings, Loader2, CheckCircle2, AlertCircle, Building2, Globe, Bell, Database
} from 'lucide-react';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SchoolAdminDashboard', icon: LayoutDashboard },
  { label: 'Users', page: 'SchoolAdminUsers', icon: Users },
  { label: 'Classes', page: 'SchoolAdminClasses', icon: BookOpen },
  { label: 'Enrollments', page: 'SchoolAdminEnrollments', icon: Users },
  { label: 'Subjects', page: 'SchoolAdminSubjects', icon: GraduationCap },
  { label: 'Attendance', page: 'SchoolAdminAttendance', icon: Calendar },
  { label: 'Timetable', page: 'SchoolAdminTimetable', icon: Clock },
  { label: 'Reports', page: 'SchoolAdminReports', icon: FileText },
  { label: 'Billing', page: 'SchoolAdminBilling', icon: CreditCard },
  { label: 'Settings', page: 'SchoolAdminSettings', icon: Settings },
  { label: 'Data Tools', page: 'SchoolAdminDataTools', icon: Database },
];

const TIMEZONES = [
  'UTC', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'Africa/Cairo',
];

export default function SchoolAdminSettings() {
  const { user, school: contextSchool, schoolId } = useUser();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState(null);

  const { data: school, isLoading } = useQuery({
    queryKey: ['school-settings', schoolId],
    queryFn: async () => {
      const results = await base44.entities.School.filter({ id: schoolId });
      return results[0];
    },
    enabled: !!schoolId,
  });

  const [form, setForm] = useState(null);

  React.useEffect(() => {
    if (school && !form) {
      setForm({
        name: school.name || '',
        email: school.email || '',
        phone: school.phone || '',
        city: school.city || '',
        country: school.country || '',
        address: school.address || '',
        timezone: school.timezone || 'UTC',
        academic_year_start_month: school.academic_year_start_month || 9,
        billing_email: school.billing_email || '',
      });
    }
  }, [school]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.School.update(schoolId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-settings'] });
      queryClient.invalidateQueries({ queryKey: ['school', schoolId] });
      setMessage({ type: 'success', text: 'Settings saved successfully.' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: () => {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar
          links={sidebarLinks}
          role="school_admin"
          schoolName={contextSchool?.name}
          userName={user?.full_name}
          userId={user?.id}
          schoolId={schoolId}
        />

        <main className="md:ml-64 min-h-screen">
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <h1 className="text-xl font-semibold text-slate-900">School Settings</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your school profile and preferences</p>
          </div>

          <div className="p-6 max-w-3xl space-y-6">
            {message && (
              <Alert className={message.type === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}>
                {message.type === 'success'
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  : <AlertCircle className="w-4 h-4 text-red-600" />
                }
                <AlertDescription className={message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {isLoading || !form ? (
              <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* School Profile */}
                <Card className="shadow-none">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <CardTitle className="text-base">School Profile</CardTitle>
                    </div>
                    <CardDescription>Basic information about your school</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">School Name *</Label>
                      <Input
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="mt-1"
                        placeholder="e.g. International School of Paris"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Contact Email</Label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          className="mt-1"
                          placeholder="admin@school.edu"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <Input
                          value={form.phone}
                          onChange={e => setForm({ ...form, phone: e.target.value })}
                          className="mt-1"
                          placeholder="+1 234 567 890"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <Input
                        value={form.address}
                        onChange={e => setForm({ ...form, address: e.target.value })}
                        className="mt-1"
                        placeholder="123 School Street"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">City</Label>
                        <Input
                          value={form.city}
                          onChange={e => setForm({ ...form, city: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Country</Label>
                        <Input
                          value={form.country}
                          onChange={e => setForm({ ...form, country: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Configuration */}
                <Card className="shadow-none">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-500" />
                      <CardTitle className="text-base">Academic Configuration</CardTitle>
                    </div>
                    <CardDescription>Set timezone and academic calendar preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Timezone</Label>
                      <Select value={form.timezone} onValueChange={v => setForm({ ...form, timezone: v })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map(tz => (
                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Academic Year Start Month</Label>
                      <Select
                        value={String(form.academic_year_start_month)}
                        onValueChange={v => setForm({ ...form, academic_year_start_month: Number(v) })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((m, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Contact */}
                <Card className="shadow-none">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-slate-500" />
                      <CardTitle className="text-base">Billing Contact</CardTitle>
                    </div>
                    <CardDescription>Email for billing notifications and invoices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label className="text-sm font-medium">Billing Email</Label>
                      <Input
                        type="email"
                        value={form.billing_email}
                        onChange={e => setForm({ ...form, billing_email: e.target.value })}
                        className="mt-1"
                        placeholder="billing@school.edu"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 px-8"
                  >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}