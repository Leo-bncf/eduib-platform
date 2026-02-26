import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAllSchools, usePlatformMetrics } from '@/components/hooks/useDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Building2, DollarSign, AlertCircle, Plus } from 'lucide-react';
import LoadingStateBase from '@/components/common/LoadingStateBase';
import CreateSchoolDialog from '@/components/admin/CreateSchoolDialog';

/**
 * Super admin operations dashboard
 * Shows platform-wide metrics and school lifecycle overview
 */
export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { data: schools = [], isLoading, refetch } = useAllSchools();
  const metrics = usePlatformMetrics(schools);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        navigate('/');
        return;
      }
      
      const user = await base44.auth.me();
      if (user?.role !== 'super_admin') {
        navigate('/');
        return;
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSchoolCreated = () => {
    refetch();
  };

  if (isLoading) {
    return <LoadingStateBase />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900">Platform Operations</h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1 md:mt-2">Manage schools, billing, and platform health</p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create School</span>
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200">
          <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-slate-600 text-xs md:text-sm font-semibold">Total Schools</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 md:mt-2">{metrics.total}</p>
              </div>
              <Building2 className="w-6 md:w-8 h-6 md:h-8 text-blue-600 opacity-20 flex-shrink-0" />
            </div>
          </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-50 border-emerald-200">
          <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-slate-600 text-xs md:text-sm font-semibold">Active Schools</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 md:mt-2">{metrics.active}</p>
              </div>
              <TrendingUp className="w-6 md:w-8 h-6 md:h-8 text-emerald-600 opacity-20 flex-shrink-0" />
            </div>
          </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-50 border-purple-200">
          <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-slate-600 text-xs md:text-sm font-semibold">Paid Schools</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 md:mt-2">{metrics.paid}</p>
                <p className="text-xs text-slate-500 mt-0.5 md:mt-1">{metrics.trial} on trial</p>
              </div>
              <DollarSign className="w-6 md:w-8 h-6 md:h-8 text-purple-600 opacity-20 flex-shrink-0" />
            </div>
          </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-50 border-red-200">
          <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-slate-600 text-xs md:text-sm font-semibold">At Risk</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 md:mt-2">{metrics.atRisk}</p>
                <p className="text-xs text-slate-500 mt-0.5 md:mt-1">Billing or suspended</p>
              </div>
              <AlertCircle className="w-6 md:w-8 h-6 md:h-8 text-red-600 opacity-20 flex-shrink-0" />
            </div>
          </CardContent>
          </Card>
        </div>

        {/* School Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Onboarding Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Onboarding Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-700">In Setup</span>
                <Badge variant="outline">{metrics.onboarding}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-700">Fully Onboarded</span>
                <Badge className="bg-emerald-100 text-emerald-800">
                  {metrics.active}
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
                  {metrics.trial}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-700">Paying Customers</span>
                <Badge className="bg-emerald-100 text-emerald-800">
                  {metrics.paid}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-700">Suspended</span>
                <Badge className="bg-red-100 text-red-800">
                  {metrics.suspended}
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
                onClick={() => navigate('/super-admin-users')}
                variant="outline"
                className="w-full justify-start"
              >
                Manage Users
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
                    className="flex items-center justify-between p-2 md:p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer gap-2"
                    onClick={() => navigate(`/super-admin-school/${school.id}`)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 text-xs md:text-sm truncate">{school.name}</p>
                      <p className="text-xs text-slate-600 mt-0.5 truncate">
                        {school.city}, {school.country}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {school.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs hidden sm:inline-block">
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

        {/* Create School Dialog */}
        <CreateSchoolDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSchoolCreated={handleSchoolCreated}
        />
      </div>
    </div>
  );
}