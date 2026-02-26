import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Building2, MapPin, Globe, CheckCircle, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function SchoolOnboarding() {
  const [step, setStep] = useState(1);
  const [schoolData, setSchoolData] = useState({
    name: '',
    country: '',
    city: '',
    address: '',
    email: '',
    phone: '',
    timezone: 'UTC',
    academic_year_start_month: 9,
  });

  const [adminData, setAdminData] = useState({
    email: '',
    full_name: '',
  });

  const createSchoolMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      // Only super admin can create schools
      if (user.role !== 'super_admin') {
        throw new Error('Only super admins can create schools');
      }

      // Create school
      const school = await base44.entities.School.create({
        ...schoolData,
        slug: schoolData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        status: 'onboarding',
        plan: 'professional',
        max_users: 500,
        modules_enabled: ['attendance', 'behavior', 'cas', 'ee', 'tok', 'timetable', 'messaging'],
      });

      // Send invitation to first admin
      const invitationToken = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14); // 14 days for first admin

      await base44.entities.UserInvitation.create({
        school_id: school.id,
        email: adminData.email,
        role: 'school_admin',
        invited_by: user.id,
        invited_by_name: user.full_name || user.email,
        status: 'pending',
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString(),
        metadata: {
          first_name: adminData.full_name.split(' ')[0] || '',
          last_name: adminData.full_name.split(' ').slice(1).join(' ') || '',
        },
      });

      // Send invitation email
      const inviteUrl = `${window.location.origin}?page=AcceptInvitation&token=${invitationToken}`;
      
      await base44.integrations.Core.SendEmail({
        to: adminData.email,
        from_name: 'AtlasIB',
        subject: `You've been invited to set up ${schoolData.name} on AtlasIB`,
        body: `
          <h2>Welcome to AtlasIB!</h2>
          <p>You've been invited to set up and manage <strong>${schoolData.name}</strong> as the primary school administrator.</p>
          <p>Click the link below to accept your invitation and complete the setup:</p>
          <p><a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Accept Invitation & Set Up School</a></p>
          <p>Or copy this link: ${inviteUrl}</p>
          <p style="color:#666;font-size:14px;">This invitation expires in 14 days.</p>
        `,
      });

      return school;
    },
    onSuccess: () => {
      setStep(3);
    },
  });

  const handleNext = () => {
    if (step === 1 && schoolData.name && schoolData.country && schoolData.email) {
      setStep(2);
    } else if (step === 2 && adminData.email && adminData.full_name) {
      createSchoolMutation.mutate();
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">School Created Successfully!</h1>
          <p className="text-slate-600 mb-2">
            <strong>{schoolData.name}</strong> has been set up on AtlasIB.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            An invitation has been sent to <strong>{adminData.email}</strong> to complete the onboarding process.
          </p>
          <Button 
            onClick={() => window.location.href = createPageUrl('SuperAdminDashboard')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6">
          <h1 className="text-2xl font-bold text-white mb-2">School Onboarding</h1>
          <p className="text-indigo-100 text-sm">Step {step} of 2</p>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">School Information</h2>
                  <p className="text-sm text-slate-500">Basic details about the school</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">School Name *</Label>
                <Input
                  value={schoolData.name}
                  onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
                  placeholder="e.g., International School of Paris"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Country *</Label>
                  <Input
                    value={schoolData.country}
                    onChange={(e) => setSchoolData({ ...schoolData, country: e.target.value })}
                    placeholder="France"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">City</Label>
                  <Input
                    value={schoolData.city}
                    onChange={(e) => setSchoolData({ ...schoolData, city: e.target.value })}
                    placeholder="Paris"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Address</Label>
                <Input
                  value={schoolData.address}
                  onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
                  placeholder="123 Education Avenue"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">School Email *</Label>
                  <Input
                    type="email"
                    value={schoolData.email}
                    onChange={(e) => setSchoolData({ ...schoolData, email: e.target.value })}
                    placeholder="admin@school.edu"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Phone</Label>
                  <Input
                    value={schoolData.phone}
                    onChange={(e) => setSchoolData({ ...schoolData, phone: e.target.value })}
                    placeholder="+33 1 23 45 67 89"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Timezone</Label>
                  <Select 
                    value={schoolData.timezone} 
                    onValueChange={(value) => setSchoolData({ ...schoolData, timezone: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                      <SelectItem value="America/New_York">America/New York</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Academic Year Start</Label>
                  <Select 
                    value={schoolData.academic_year_start_month.toString()} 
                    onValueChange={(value) => setSchoolData({ ...schoolData, academic_year_start_month: parseInt(value) })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">January</SelectItem>
                      <SelectItem value="8">August</SelectItem>
                      <SelectItem value="9">September</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">First Administrator</h2>
                  <p className="text-sm text-slate-500">Who will manage this school?</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Administrator Name *</Label>
                <Input
                  value={adminData.full_name}
                  onChange={(e) => setAdminData({ ...adminData, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Administrator Email *</Label>
                <Input
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  placeholder="admin@school.edu"
                  className="mt-1.5"
                />
                <p className="text-xs text-slate-500 mt-2">
                  An invitation email will be sent to this address
                </p>
              </div>

              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-sm text-indigo-900 font-medium mb-2">What happens next?</p>
                <ul className="text-xs text-indigo-700 space-y-1">
                  <li>• The administrator will receive an invitation email</li>
                  <li>• They'll create their account and access the platform</li>
                  <li>• They can then invite other staff, students, and parents</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mt-8 pt-6 border-t">
            {step === 2 && (
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={
                createSchoolMutation.isPending ||
                (step === 1 && (!schoolData.name || !schoolData.country || !schoolData.email)) ||
                (step === 2 && (!adminData.email || !adminData.full_name))
              }
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {createSchoolMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating School...
                </>
              ) : step === 1 ? (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                'Create School & Send Invitation'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}