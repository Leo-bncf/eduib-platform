import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { useUser } from '@/components/auth/UserContext';
import { usePlan } from '@/components/plan/PlanProvider';
import {
  Users, CreditCard, CheckCircle2, AlertCircle, Loader2,
  ExternalLink, Shield, ArrowUpCircle, RefreshCw,
} from 'lucide-react';
import { SCHOOL_ADMIN_SIDEBAR_LINKS } from '@/components/app/schoolAdminSidebarLinks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminTabNavigation from '@/components/admin/AdminTabNavigation';
import PlanUsageCard from '@/components/plan/PlanUsageCard';
import TrialBanner from '@/components/plan/TrialBanner';
import BillingStatusBanner from '@/components/plan/BillingStatusBanner';
import ModuleStatusGrid from '@/components/plan/ModuleStatusGrid';
import UpgradePrompt from '@/components/plan/UpgradePrompt';
import { PLAN_LIMITS, PLAN_NAMES, PLAN_PRICES, getUpgradePlans } from '@/components/plan/PlanConfig';
import { format } from 'date-fns';



const BILLING_STATUS_CONFIG = {
  trial:     { label: 'Free Trial',   color: 'bg-blue-100 text-blue-700 border-blue-200',    dot: 'bg-blue-500' },
  active:    { label: 'Active',       color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  past_due:  { label: 'Past Due',     color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  canceled:  { label: 'Canceled',     color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  unpaid:    { label: 'Suspended',    color: 'bg-red-100 text-red-700 border-red-200',       dot: 'bg-red-500' },
  incomplete:{ label: 'Incomplete',   color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
};

function StatusPill({ status }) {
  const cfg = BILLING_STATUS_CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${cfg.color}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function SchoolAdminBilling() {
  const { user, school, schoolId } = useUser();
  const plan = usePlan();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { data: schoolData, refetch } = useQuery({
    queryKey: ['school-billing', schoolId],
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
      setMessage({ type: 'success', text: 'Subscription activated successfully! Your plan has been updated.' });
      refetch();
    } else if (params.get('canceled')) {
      setMessage({ type: 'info', text: 'Checkout was canceled — no changes were made.' });
    }
  }, [refetch]);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('createCustomerPortalSession', { schoolId });
      window.location.href = response.data.url;
    } catch {
      setMessage({ type: 'error', text: 'Failed to open billing portal. Please try again.' });
      setLoading(false);
    }
  };

  const handleUpgradeCheckout = async (targetPlan) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', { schoolId, plan: targetPlan });
      window.location.href = response.data.url;
    } catch {
      setMessage({ type: 'error', text: 'Failed to start checkout. Please try again.' });
      setLoading(false);
    }
  };

  const currentPlan = schoolData?.plan || 'starter';
  const billingStatus = schoolData?.billing_status;
  const hasStripeSubscription = !!schoolData?.stripe_subscription_id;
  const upgradePlans = getUpgradePlans(currentPlan);
  const planLimits = PLAN_LIMITS[currentPlan];

  const userPct = planLimits?.max_users !== -1 ? Math.round((usageCounts.userCount / planLimits?.max_users) * 100) : 0;
  const classPct = planLimits?.max_classes !== -1 ? Math.round((usageCounts.classCount / planLimits?.max_classes) * 100) : 0;
  const hasAnyWarning = (planLimits?.max_users !== -1 && userPct >= 80) || (planLimits?.max_classes !== -1 && classPct >= 80);

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={SCHOOL_ADMIN_SIDEBAR_LINKS} role="school_admin" schoolName={school?.name} userName={user?.full_name} userId={user?.id} schoolId={schoolId} />

        <main className="md:ml-64 min-h-screen flex flex-col">
          <AdminTabNavigation
            tabs={[
              { id: 'status', label: 'Subscription Status', icon: CreditCard },
              { id: 'usage', label: 'Usage & Limits', icon: Users, badge: hasAnyWarning ? '!' : null },
              { id: 'modules', label: 'Plan Features', icon: Shield },
              ...(upgradePlans.length > 0 ? [{ id: 'upgrade', label: 'Upgrade', icon: ArrowUpCircle }] : []),
            ]}
            activeTab={billingTab}
            onTabChange={setBillingTab}
            colorScheme="indigo"
            title="Billing & Subscription"
            subtitle="Manage your school's plan, usage limits, and payment details"
            rightContent={
              <Button size="sm" variant="ghost" onClick={() => refetch()} className="gap-1.5 text-slate-500">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            }
          />

          <div className="flex-1 p-6 max-w-6xl space-y-5">
            <TrialBanner />
            <BillingStatusBanner />

            {message && (
              <Alert className={
                message.type === 'success' ? 'border-emerald-200 bg-emerald-50' :
                message.type === 'error' ? 'border-red-200 bg-red-50' :
                'border-blue-200 bg-blue-50'
              }>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-slate-500" />}
                <AlertDescription className={message.type === 'success' ? 'text-emerald-800' : message.type === 'error' ? 'text-red-800' : 'text-blue-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

              {/* ── SUBSCRIPTION STATUS ── */}
              {billingTab === 'status' && <div className="mt-5">
                <div className="grid md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">Current Plan</p>
                        <div className="flex items-center gap-3">
                          <h2 className="text-3xl font-black text-slate-900">{PLAN_NAMES[currentPlan]}</h2>
                          <p className="text-xl font-semibold text-slate-500">${PLAN_PRICES[currentPlan]}<span className="text-sm font-normal">/mo</span></p>
                        </div>
                      </div>
                      {billingStatus && <StatusPill status={billingStatus} />}
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Max Users</p>
                        <p className="text-lg font-bold text-slate-800">{planLimits?.max_users === -1 ? 'Unlimited' : planLimits?.max_users}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Max Classes</p>
                        <p className="text-lg font-bold text-slate-800">{planLimits?.max_classes === -1 ? 'Unlimited' : planLimits?.max_classes}</p>
                      </div>
                      {billingStatus === 'trial' && schoolData?.trial_end_date && (
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Trial Ends</p>
                          <p className="text-base font-semibold text-blue-700">{format(new Date(schoolData.trial_end_date), 'dd MMM yyyy')}</p>
                        </div>
                      )}
                      {billingStatus === 'active' && schoolData?.subscription_current_period_end && (
                        <div>
                          <p className="text-xs text-slate-400 font-medium">
                            {schoolData.subscription_cancel_at_period_end ? 'Cancels On' : 'Next Renewal'}
                          </p>
                          <p className={`text-base font-semibold ${schoolData.subscription_cancel_at_period_end ? 'text-orange-600' : 'text-slate-800'}`}>
                            {format(new Date(schoolData.subscription_current_period_end), 'dd MMM yyyy')}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Billing Email</p>
                        <p className="text-sm text-slate-700">{schoolData?.billing_email || school?.email || '—'}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      {hasStripeSubscription && (
                        <Button onClick={handleManageBilling} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                          Manage Billing in Stripe
                        </Button>
                      )}
                      {!hasStripeSubscription && upgradePlans.length > 0 && (
                        <Button onClick={() => handleUpgradeCheckout(currentPlan)} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                          Activate Subscription
                        </Button>
                      )}
                      {upgradePlans.length > 0 && (
                        <Button variant="outline" onClick={() => setShowUpgrade(true)} className="gap-1.5">
                          <ArrowUpCircle className="w-4 h-4" /> View Upgrade Options
                        </Button>
                      )}
                    </div>

                    {hasStripeSubscription && (
                      <p className="text-xs text-slate-400">
                        You'll be redirected to the Stripe billing portal to update payment methods, download invoices, or change your plan.
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <PlanUsageCard userCount={usageCounts.userCount} classCount={usageCounts.classCount} />

                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Included Modules</p>
                      <div className="space-y-1.5">
                        {(planLimits?.modules || []).map(mod => (
                          <div key={mod} className="flex items-center gap-2 text-sm text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="capitalize">{mod.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>}

              {/* ── USAGE & LIMITS ── */}
              {billingTab === 'usage' && <div className="mt-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <PlanUsageCard userCount={usageCounts.userCount} classCount={usageCounts.classCount} />

                    {hasAnyWarning && (
                      <Alert className="border-amber-200 bg-amber-50">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          <strong>Approaching plan limits.</strong> Consider upgrading your plan before limits are reached to avoid disruption.
                          {' '}
                          {upgradePlans.length > 0 && (
                            <button onClick={() => setShowUpgrade(true)} className="font-semibold underline cursor-pointer">
                              View upgrade options →
                            </button>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">What happens at limits?</p>
                    <div className="space-y-4 text-sm text-slate-600">
                      <div className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <p><strong>User limit reached:</strong> New invitations cannot be sent until existing accounts are deactivated or your plan is upgraded.</p>
                      </div>
                      <div className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <p><strong>Class limit reached:</strong> New classes cannot be created. Existing classes continue to function normally.</p>
                      </div>
                      <div className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <p><strong>No data is lost</strong> when limits are reached. All existing records remain fully accessible.</p>
                      </div>
                      <div className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <p><strong>Warnings appear</strong> at 80% and 95% of each limit so you have time to act before being blocked.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>}

              {/* ── PLAN FEATURES ── */}
              {billingTab === 'modules' && <div className="mt-5"><ModuleStatusGrid currentPlan={currentPlan} /></div>}

              {/* ── UPGRADE ── */}
              {billingTab === 'upgrade' && upgradePlans.length > 0 && (
                <div className="mt-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    {upgradePlans.map(targetPlan => {
                      const limits = PLAN_LIMITS[targetPlan];
                      const newFeatures = Object.entries(limits.features)
                        .filter(([k, v]) => v === true && !planLimits?.features[k])
                        .map(([k]) => k.replace(/_/g, ' '));
                      const newModules = limits.modules.filter(m => !planLimits?.modules.includes(m));

                      return (
                        <div key={targetPlan} className={`bg-white rounded-xl border-2 p-6 ${targetPlan === 'professional' ? 'border-indigo-300' : 'border-slate-200'}`}>
                          {targetPlan === 'professional' && (
                            <div className="flex justify-end mb-2">
                              <Badge className="bg-indigo-100 text-indigo-700 border-0">Most Popular</Badge>
                            </div>
                          )}
                          <div className="flex items-baseline gap-2 mb-1">
                            <h3 className="text-xl font-bold text-slate-900">{PLAN_NAMES[targetPlan]}</h3>
                          </div>
                          <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-3xl font-black text-slate-900">${PLAN_PRICES[targetPlan]}</span>
                            <span className="text-slate-500 text-sm">/month</span>
                          </div>

                          <div className="space-y-3 text-sm mb-5">
                            <div>
                              <p className="font-semibold text-slate-700 mb-1.5">Limits</p>
                              <p className="text-slate-600">Up to <strong>{limits.max_users === -1 ? 'Unlimited' : limits.max_users}</strong> users · <strong>{limits.max_classes === -1 ? 'Unlimited' : limits.max_classes}</strong> classes</p>
                            </div>
                            {newModules.length > 0 && (
                              <div>
                                <p className="font-semibold text-slate-700 mb-1.5">New Modules Unlocked</p>
                                <div className="space-y-1">
                                  {newModules.map(m => (
                                    <div key={m} className="flex items-center gap-2 text-emerald-700">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span className="capitalize">{m.replace(/_/g, ' ')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {newFeatures.length > 0 && (
                              <div>
                                <p className="font-semibold text-slate-700 mb-1.5">New Features</p>
                                <div className="space-y-1">
                                  {newFeatures.map(f => (
                                    <div key={f} className="flex items-center gap-2 text-emerald-700">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span className="capitalize">{f}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() => handleUpgradeCheckout(targetPlan)}
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-1.5"
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpCircle className="w-4 h-4" />}
                            Upgrade to {PLAN_NAMES[targetPlan]}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </main>
      </div>

      <UpgradePrompt open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </RoleGuard>
  );
}