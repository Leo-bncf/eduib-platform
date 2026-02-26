import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Users, Building2, DollarSign, AlertCircle } from 'lucide-react';

/**
 * Super admin operations dashboard
 * Shows platform-wide metrics and school lifecycle overview
 */
export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          navigate('/');
          return;
        }

        const user = await base44.auth.me();

        // Check if user is super admin
        if (user.role !== 'admin') {
          navigate('/dashboard');
          return;
        }

        // Load all schools
        const allSchools = await base44.entities.School.list();
        setSchools(allSchools);

        // Calculate metrics
        const activeSchools = allSchools.filter(s => s.status === 'active').length;
        const onboardingSchools = allSchools.filter(s => s.status === 'onboarding').length;
        const trialSchools = allSchools.filter(s => s.billing_status === 'trial').length;
        const paidSchools = allSchools.filter(s => 
          s.billing_status === 'active' || s.billing_status === 'past_due'
        ).length;
        const atRiskSchools = allSchools.filter(s => 
          s.billing_status === 'past_due' || s.billing_status === 'canceled'
        ).length;

        setMetrics({
          total: allSchools.length,
          active: activeSchools,
          onboarding: onboardingSchools,
          trial: trialSchools,
          paid: paidSchools,
          atRisk: atRiskSchools,
          suspended: allSchools.filter(s => s.status === 'suspended').length
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Platform Operations</h1>
          <p className="text-slate-600 mt-2">Manage schools, billing, and platform health</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-semibold">Total Schools</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{metrics?.total || 0}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-50 border-emerald-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-semibold">Active Schools</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{metrics?.active || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-semibold">Paid Schools</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{metrics?.paid || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">{metrics?.trial || 0} on trial</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-semibold">At Risk</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{metrics?.atRisk || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Billing or suspended</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* School Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Onboarding Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Onboarding Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-700">In Setup</span>
                <Badge variant="outline">{metrics?.onboarding || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-700">Fully Onboarded</span>
                <Badge className="bg-emerald-100 text-emerald-800">
                  {metrics?.active || 0}
                </Badge>
              </div>
              <Button
                onClick={() => navigate('/super-admin-schools')}
                className="w-full mt-4"
                variant="outline"
              >
                View All Schools
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Health */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subscription Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-700">Trial Active</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {metrics?.trial || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-700">Paying Customers</span>
                <Badge className="bg-emerald-100 text-emerald-800">
                  {metrics?.paid || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-700">Suspended</span>
                <Badge className="bg-red-100 text-red-800">
                  {metrics?.suspended || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => navigate('/super-admin-schools')}
                variant="outline"
                className="w-full justify-start"
              >
                Manage Schools
              </Button>
              <Button
                onClick={() => navigate('/super-admin-plans')}
                variant="outline"
                className="w-full justify-start"
              >
                View Plans & Billing
              </Button>
              <Button
                onClick={() => navigate('/super-admin-audit-logs')}
                variant="outline"
                className="w-full justify-start"
              >
                Audit Logs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Schools Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Schools Needing Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {schools
                .filter(s => 
                  s.status === 'onboarding' || 
                  s.billing_status === 'past_due' || 
                  s.billing_status === 'incomplete'
                )
                .slice(0, 5)
                .map((school) => (
                  <div
                    key={school.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/super-admin-school/${school.id}`)}
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{school.name}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {school.city}, {school.country}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {school.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {school.billing_status || 'no-plan'}
                      </Badge>
                    </div>
                  </div>
                ))}

              {schools.filter(s => 
                s.status === 'onboarding' || 
                s.billing_status === 'past_due' || 
                s.billing_status === 'incomplete'
              ).length === 0 && (
                <p className="text-center text-slate-600 py-4 text-sm">
                  All schools are in good standing
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}