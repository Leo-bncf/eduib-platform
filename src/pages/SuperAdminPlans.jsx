import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, Users, Zap, TrendingUp } from 'lucide-react';

/**
 * Super admin plan management view
 * Shows subscription and billing analysis
 */
export default function SuperAdminPlans() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          navigate('/');
          return;
        }

        const user = await base44.auth.me();
        if (user.role !== 'super_admin') {
          navigate('/super-admin-dashboard');
          return;
        }

        const allSchools = await base44.entities.School.list();
        setSchools(allSchools);

        // Calculate metrics
        const byPlan = {};
        const byBilling = {};

        allSchools.forEach(s => {
          const plan = s.plan || 'unknown';
          const billing = s.billing_status || 'none';

          byPlan[plan] = (byPlan[plan] || 0) + 1;
          byBilling[billing] = (byBilling[billing] || 0) + 1;
        });

        setMetrics({
          byPlan,
          byBilling,
          mrrEstimate: calculateMRR(allSchools),
          avgUserCount: calculateAvgUsers(allSchools)
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const calculateMRR = (schoolList) => {
    // Estimate based on plan (simplified)
    const rates = {
      starter: 0,
      professional: 99,
      enterprise: 299
    };

    return schoolList
      .filter(s => s.billing_status === 'active')
      .reduce((sum, s) => sum + (rates[s.plan] || 99), 0);
  };

  const calculateAvgUsers = (schoolList) => {
    return Math.ceil(schoolList.length / 10); // Simplified
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Button
          onClick={() => navigate('/SuperAdminDashboard')}
          variant="outline"
          className="mb-6 text-xs md:text-sm"
        >
          <ChevronLeft className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Plan Management</h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 md:mt-2">Manage school plans and subscriptions</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-50 border-purple-200">
            <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-slate-600 text-xs md:text-sm font-semibold">Est. MRR</p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 md:mt-2">
                    ${metrics?.mrrEstimate || 0}
                  </p>
                </div>
                <TrendingUp className="w-6 md:w-8 h-6 md:h-8 text-purple-600 opacity-20 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200">
            <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-slate-600 text-xs md:text-sm font-semibold">Paid Schools</p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 md:mt-2">
                    {schools.filter(s => s.billing_status === 'active').length}
                  </p>
                </div>
                <Zap className="w-6 md:w-8 h-6 md:h-8 text-blue-600 opacity-20 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-50 border-amber-200">
            <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-slate-600 text-xs md:text-sm font-semibold">On Trial</p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 md:mt-2">
                    {schools.filter(s => s.billing_status === 'trial').length}
                  </p>
                </div>
                <Users className="w-6 md:w-8 h-6 md:h-8 text-amber-600 opacity-20 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Schools by Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3 p-4 md:p-6 pt-0 md:pt-0">
              {Object.entries(metrics?.byPlan || {}).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between p-2 md:p-3 bg-slate-50 rounded-lg text-xs md:text-sm gap-2">
                  <span className="font-semibold text-slate-900 capitalize truncate">{plan}</span>
                  <Badge className="flex-shrink-0">{count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Billing Status Distribution */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Billing Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3 p-4 md:p-6 pt-0 md:pt-0">
              {Object.entries(metrics?.byBilling || {}).map(([status, count]) => {
                const colors = {
                  'active': 'bg-emerald-50 text-emerald-900',
                  'trial': 'bg-blue-50 text-blue-900',
                  'past_due': 'bg-red-50 text-red-900',
                  'canceled': 'bg-slate-50 text-slate-900',
                  'incomplete': 'bg-amber-50 text-amber-900',
                  'none': 'bg-slate-50 text-slate-900'
                };

                return (
                  <div key={status} className={`flex items-center justify-between p-2 md:p-3 ${colors[status] || 'bg-slate-50'} rounded-lg text-xs md:text-sm gap-2`}>
                    <span className="font-semibold capitalize truncate">{status || 'None'}</span>
                    <Badge className="flex-shrink-0">{count}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Schools by Billing Status */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">All Schools with Billing Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-semibold">School</th>
                    <th className="text-left py-2 px-2 font-semibold">Plan</th>
                    <th className="text-left py-2 px-2 font-semibold">Status</th>
                    <th className="text-left py-2 px-2 font-semibold hidden sm:table-cell">Trial End</th>
                    <th className="text-left py-2 px-2 font-semibold hidden md:table-cell">Period End</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school) => (
                    <tr
                      key={school.id}
                      className="border-b hover:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(`/SuperAdminSchoolDetail/${school.id}`)}
                    >
                      <td className="py-2 md:py-3 px-2">
                        <span className="font-semibold text-slate-900 truncate block">{school.name}</span>
                      </td>
                      <td className="py-2 md:py-3 px-2 capitalize text-xs">{school.plan || 'None'}</td>
                      <td className="py-2 md:py-3 px-2">
                        <Badge className="text-xs">
                          {school.billing_status || 'none'}
                        </Badge>
                      </td>
                      <td className="py-2 md:py-3 px-2 text-slate-600 hidden sm:table-cell text-xs">
                        {school.trial_end_date
                          ? new Date(school.trial_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : '—'
                        }
                      </td>
                      <td className="py-2 md:py-3 px-2 text-slate-600 hidden md:table-cell text-xs">
                        {school.subscription_current_period_end
                          ? new Date(school.subscription_current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : '—'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}