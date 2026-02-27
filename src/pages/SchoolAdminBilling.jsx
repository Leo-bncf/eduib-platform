import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { useUser } from '@/components/auth/UserContext';
import { LayoutDashboard, Users, BookOpen, Calendar, Shield, ClipboardList, CreditCard, CheckCircle2, AlertCircle, Loader2, ExternalLink, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PlanUsageCard from '@/components/plan/PlanUsageCard';
import TrialBanner from '@/components/plan/TrialBanner';
import { usePlan } from '@/components/plan/PlanProvider';
import { PLAN_LIMITS } from '@/components/plan/PlanConfig';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SchoolAdminDashboard', icon: LayoutDashboard },
  { label: 'Users', page: 'SchoolAdminUsers', icon: Users },
  { label: 'Classes', page: 'SchoolAdminClasses', icon: BookOpen },
  { label: 'Subjects', page: 'SchoolAdminSubjects', icon: ClipboardList },
  { label: 'Attendance', page: 'SchoolAdminAttendance', icon: Calendar },
  { label: 'Timetable', page: 'SchoolAdminTimetable', icon: Shield },
  { label: 'Reports', page: 'SchoolAdminReports', icon: FileText },
  { label: 'Billing', page: 'SchoolAdminBilling', icon: CreditCard },
  { label: 'Settings', page: 'SchoolAdminSettings', icon: Settings },
];

const PLAN_DETAILS = {
  starter: {
    name: 'Starter',
    price: '$99',
    features: ['Up to 100 users', 'Basic features', 'Email support', '14-day free trial'],
  },
  professional: {
    name: 'Professional',
    price: '$299',
    features: ['Up to 500 users', 'Advanced features', 'Priority support', 'Custom integrations', '14-day free trial'],
  },
  enterprise: {
    name: 'Enterprise',
    price: '$799',
    features: ['Unlimited users', 'All features', 'Dedicated support', 'Custom development', 'SLA guarantees', '14-day free trial'],
  },
};

export default function SchoolAdminBilling() {
  const { user, school, schoolId } = useUser();
  const plan = usePlan();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const { data: schoolData, refetch } = useQuery({
    queryKey: ['school', schoolId],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ id: schoolId });
      return schools[0];
    },
    enabled: !!schoolId,
  });

  const { data: usageCounts } = useQuery({
    queryKey: ['usage-counts', schoolId],
    queryFn: async () => {
      const [memberships, classes] = await Promise.all([
        base44.entities.SchoolMembership.filter({ school_id: schoolId, status: 'active' }),
        base44.entities.Class.filter({ school_id: schoolId, status: 'active' }),
      ]);
      return { userCount: memberships.length, classCount: classes.length };
    },
    enabled: !!schoolId,
    initialData: { userCount: 0, classCount: 0 },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      setMessage({ type: 'success', text: 'Subscription activated successfully!' });
      refetch();
    } else if (params.get('canceled')) {
      setMessage({ type: 'error', text: 'Checkout canceled' });
    }
  }, [refetch]);

  const handleUpgrade = async (plan) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        schoolId,
        plan,
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      setMessage({ type: 'error', text: 'Failed to start checkout. Please try again.' });
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('createCustomerPortalSession', {
        schoolId,
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Portal error:', error);
      setMessage({ type: 'error', text: 'Failed to open billing portal. Please try again.' });
      setLoading(false);
    }
  };

  const currentPlan = schoolData?.plan || 'starter';
  const planDetails = PLAN_DETAILS[currentPlan];
  const billingStatus = schoolData?.billing_status;
  const hasActiveSubscription = schoolData?.stripe_subscription_id;

  const statusColors = {
    trial: 'bg-blue-50 text-blue-700',
    active: 'bg-emerald-50 text-emerald-700',
    past_due: 'bg-amber-50 text-amber-700',
    canceled: 'bg-slate-100 text-slate-600',
    unpaid: 'bg-red-50 text-red-700',
    incomplete: 'bg-amber-50 text-amber-700',
  };

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="school_admin" schoolName={school?.name} userName={user?.full_name} userId={user?.id} schoolId={schoolId} />
        <main className="md:ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your school's subscription and billing</p>
            </div>

            <TrialBanner />

            {message && (
              <Alert className={`mb-6 ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                <AlertDescription className={message.type === 'success' ? 'text-emerald-900' : 'text-amber-900'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Current Plan</span>
                    {billingStatus && (
                      <Badge className={`${statusColors[billingStatus]} border-0`}>
                        {billingStatus}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Your active subscription details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <h3 className="text-3xl font-bold text-slate-900">{planDetails.name}</h3>
                        <span className="text-lg text-slate-600">{planDetails.price}/month</span>
                      </div>
                      <ul className="space-y-2 mt-4">
                        {planDetails.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {schoolData?.trial_end_date && billingStatus === 'trial' && (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-sm text-slate-600">
                          Trial ends: <span className="font-medium">{new Date(schoolData.trial_end_date).toLocaleDateString()}</span>
                        </p>
                      </div>
                    )}

                    {schoolData?.subscription_current_period_end && billingStatus === 'active' && (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-sm text-slate-600">
                          Next billing date: <span className="font-medium">{new Date(schoolData.subscription_current_period_end).toLocaleDateString()}</span>
                        </p>
                        {schoolData?.subscription_cancel_at_period_end && (
                          <p className="text-sm text-amber-600 mt-1">
                            Subscription will cancel on this date
                          </p>
                        )}
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex gap-3">
                      {hasActiveSubscription ? (
                        <Button 
                          onClick={handleManageBilling} 
                          disabled={loading}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                          Manage Billing
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleUpgrade(currentPlan)} 
                          disabled={loading}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Start Subscription
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
              <div className="space-y-6">
                <PlanUsageCard userCount={usageCounts.userCount} classCount={usageCounts.classCount} />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Plan Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {PLAN_LIMITS[currentPlan]?.modules.map((mod) => (
                        <li key={mod} className="flex items-center gap-2 text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="capitalize">{mod.replace(/_/g, ' ')}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {!hasActiveSubscription && (
              <Card>
                  <CardHeader>
                    <CardTitle>Upgrade Your Plan</CardTitle>
                    <CardDescription>Choose a plan that fits your school's needs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.entries(PLAN_DETAILS).map(([key, plan]) => (
                        <div 
                          key={key}
                          className={`border rounded-lg p-4 ${key === currentPlan ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200'}`}
                        >
                          <h4 className="font-semibold text-lg mb-2">{plan.name}</h4>
                          <p className="text-2xl font-bold text-slate-900 mb-4">{plan.price}<span className="text-sm text-slate-600 font-normal">/mo</span></p>
                          <ul className="space-y-2 mb-4">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          {key !== currentPlan && (
                            <Button 
                              onClick={() => handleUpgrade(key)} 
                              disabled={loading}
                              variant="outline"
                              className="w-full"
                            >
                              Select Plan
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
            )}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}