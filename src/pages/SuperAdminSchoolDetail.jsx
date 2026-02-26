import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ChevronLeft, AlertCircle, CheckCircle, Users, Zap } from 'lucide-react';
import SchoolStatusBadge from '@/components/admin/SchoolStatusBadge';
import SchoolOnboardingProgress from '@/components/admin/SchoolOnboardingProgress';

/**
 * School detail view for super admin
 * Shows complete school lifecycle and operational state
 */
export default function SuperAdminSchoolDetail() {
  const navigate = useNavigate();
  const { schoolId } = useParams();

  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const loadSchoolDetail = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          navigate('/');
          return;
        }

        const user = await base44.auth.me();
        if (user.role !== 'admin') {
          navigate('/dashboard');
          return;
        }

        // Load school
        const schools = await base44.entities.School.filter({ id: schoolId });
        if (schools.length === 0) {
          navigate('/super-admin-schools');
          return;
        }

        setSchool(schools[0]);

        // Load school stats
        const [
          academicYears,
          terms,
          subjects,
          classes,
          schoolMembers
        ] = await Promise.all([
          base44.entities.AcademicYear.filter({ school_id: schoolId }),
          base44.entities.Term.filter({ school_id: schoolId }),
          base44.entities.Subject.filter({ school_id: schoolId }),
          base44.entities.Class.filter({ school_id: schoolId }),
          base44.entities.SchoolMembership.filter({ school_id: schoolId })
        ]);

        setStats({
          academicYears: academicYears.length,
          terms: terms.length,
          subjects: subjects.length,
          classes: classes.length,
          staff: schoolMembers.length
        });

        setMembers(schoolMembers);
        setLoading(false);
      } catch (error) {
        console.error('Error loading school detail:', error);
        setLoading(false);
      }
    };

    loadSchoolDetail();
  }, [schoolId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Button onClick={() => navigate('/super-admin-schools')} variant="outline" className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Schools
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-slate-600">School not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Determine health status
  const healthIssues = [];
  if (school.status === 'suspended') {
    healthIssues.push('School is suspended');
  }
  if (school.billing_status === 'past_due') {
    healthIssues.push('Payment is past due');
  }
  if (school.billing_status === 'incomplete') {
    healthIssues.push('Billing setup incomplete');
  }
  if (school.status === 'onboarding') {
    healthIssues.push('School is still in setup phase');
  }

  const isAtRisk = healthIssues.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Button
          onClick={() => navigate('/super-admin-schools')}
          variant="outline"
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Schools
        </Button>

        {/* School Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{school.name}</h1>
                <p className="text-slate-600 mt-1">
                  {school.city}, {school.country} • Created {new Date(school.created_date).toLocaleDateString()}
                </p>
              </div>
              <SchoolStatusBadge
                status={school.status}
                billingStatus={school.billing_status}
              />
            </div>

            {isAtRisk && (
              <Alert className="bg-red-50 border-red-200 mt-4">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800 ml-3">
                  <strong>Attention needed:</strong> {healthIssues.join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Onboarding Status */}
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Status</CardTitle>
              </CardHeader>
              <CardContent>
                <SchoolOnboardingProgress schoolId={schoolId} />
              </CardContent>
            </Card>

            {/* Core Data */}
            <Card>
              <CardHeader>
                <CardTitle>School Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 font-semibold">Academic Years</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {stats?.academicYears || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-semibold">Terms</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {stats?.terms || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-semibold">Subjects</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {stats?.subjects || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-semibold">Classes</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {stats?.classes || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-semibold">Staff Members</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {stats?.staff || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 font-semibold">Plan</p>
                    <p className="text-lg font-bold text-slate-900 mt-1 capitalize">
                      {school.plan || 'Starter'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 font-semibold">Billing Status</p>
                    <p className="text-lg font-bold text-slate-900 mt-1 capitalize">
                      {school.billing_status || 'No Plan'}
                    </p>
                  </div>

                  {school.billing_status === 'trial' && school.trial_end_date && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-slate-600 font-semibold">Trial Ends</p>
                      <p className="text-lg font-bold text-blue-900 mt-1">
                        {new Date(school.trial_end_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {Math.ceil((new Date(school.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
                      </p>
                    </div>
                  )}

                  {school.subscription_current_period_end && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 font-semibold">Billing Period Ends</p>
                      <p className="text-lg font-bold text-slate-900 mt-1">
                        {new Date(school.subscription_current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {school.stripe_subscription_id && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 font-semibold">Stripe Subscription ID</p>
                    <p className="text-sm font-mono text-slate-900 mt-1 break-all">
                      {school.stripe_subscription_id}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Staff Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Staff & Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <p className="text-sm text-slate-600">No staff members added yet</p>
                ) : (
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 border border-slate-200 rounded"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{member.user_name || 'Unknown'}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{member.user_email}</p>
                        </div>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* School Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Email</p>
                  <p className="font-semibold text-slate-900">{school.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-600">Phone</p>
                  <p className="font-semibold text-slate-900">{school.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-600">Address</p>
                  <p className="font-semibold text-slate-900">{school.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-600">Timezone</p>
                  <p className="font-semibold text-slate-900">{school.timezone || 'UTC'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {school.status === 'onboarding' && (
                  <Button className="w-full justify-start" variant="outline">
                    <Zap className="w-4 h-4 mr-2" />
                    Activate School
                  </Button>
                )}
                {school.status === 'active' && school.billing_status === 'trial' && (
                  <Button className="w-full justify-start" variant="outline">
                    <Zap className="w-4 h-4 mr-2" />
                    Extend Trial
                  </Button>
                )}
                {school.status === 'suspended' && (
                  <Button className="w-full justify-start" variant="outline">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Reactivate
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div>
                  <p className="text-slate-600">School ID</p>
                  <p className="font-mono text-slate-900 break-all">{school.id}</p>
                </div>
                <div>
                  <p className="text-slate-600">Stripe Customer ID</p>
                  <p className="font-mono text-slate-900 break-all">
                    {school.stripe_customer_id || 'None'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}