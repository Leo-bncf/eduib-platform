import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/components/auth/UserContext';
import { useSchoolData, useSchoolMetrics } from '@/components/hooks/useDashboardData';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Users, Settings, FileText, BookOpen, LogOut } from 'lucide-react';
import SetupChecklist from '@/components/school/SetupChecklist';
import LoadingStateBase from '@/components/common/LoadingStateBase';

/**
 * School admin dashboard with onboarding awareness
 */
export default function SchoolAdminDashboard() {
  const navigate = useNavigate();
  const { user, schoolId } = useUser();

  const { data: school, isLoading: schoolLoading } = useSchoolData(schoolId);
  const { data: metrics, isLoading: metricsLoading } = useSchoolMetrics(schoolId);

  const { loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && !user) {
      base44.auth.redirectToLogin(createPageUrl('AppHome'));
    }
  }, [user, userLoading]);

  if (userLoading || !user || schoolLoading || metricsLoading) {
    return <LoadingStateBase />;
  }

  const isSetupComplete = metrics && metrics.setupProgress.completed === metrics.setupProgress.total;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">School Admin Dashboard</h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1 md:mt-2">Welcome, {user.full_name}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => base44.auth.logout()}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Setup Status Card */}
            {!isSetupComplete && (
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-amber-900 text-base md:text-lg">
                    <AlertCircle className="w-4 md:w-5 h-4 md:h-5 flex-shrink-0" />
                    School Setup In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                    <p className="text-xs md:text-sm text-amber-800">
                      Complete your school setup to unlock all features. You're {metrics.setupProgress.completed} of {metrics.setupProgress.total} steps complete.
                    </p>
                    <div className="w-full bg-amber-200 rounded-full h-2">
                      <div
                        className="bg-amber-600 h-2 rounded-full transition-all"
                        style={{ width: `${(metrics.setupProgress.completed / metrics.setupProgress.total) * 100}%` }}
                      />
                    </div>
                  <Button
                    onClick={() => navigate('/school-onboarding')}
                    className="w-full bg-amber-600 hover:bg-amber-700 gap-2 text-sm"
                  >
                    Continue Setup
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <Card>
                <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
                  <div className="text-center">
                    <BookOpen className="w-6 md:w-8 h-6 md:h-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-xl md:text-2xl font-bold text-slate-900">{metrics.academicYears}</p>
                    <p className="text-xs md:text-sm text-slate-600 mt-1">Academic Years</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
                  <div className="text-center">
                    <FileText className="w-6 md:w-8 h-6 md:h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-xl md:text-2xl font-bold text-slate-900">{metrics.subjects}</p>
                    <p className="text-xs md:text-sm text-slate-600 mt-1">Subjects</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
                  <div className="text-center">
                    <BookOpen className="w-6 md:w-8 h-6 md:h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-xl md:text-2xl font-bold text-slate-900">{metrics.classes}</p>
                    <p className="text-xs md:text-sm text-slate-600 mt-1">Classes</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
                  <div className="text-center">
                    <Users className="w-6 md:w-8 h-6 md:h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-xl md:text-2xl font-bold text-slate-900">{metrics.staff}</p>
                    <p className="text-xs md:text-sm text-slate-600 mt-1">Staff Members</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <Button variant="outline" className="gap-1 md:gap-2 text-xs md:text-sm">
                    <Users className="w-3 md:w-4 h-3 md:h-4" />
                    <span>Invite Staff</span>
                  </Button>
                  <Button variant="outline" className="gap-1 md:gap-2 text-xs md:text-sm">
                    <Settings className="w-3 md:w-4 h-3 md:h-4" />
                    <span>Settings</span>
                  </Button>
                  <Button variant="outline" className="gap-1 md:gap-2 text-xs md:text-sm">
                    <FileText className="w-3 md:w-4 h-3 md:h-4" />
                    <span>Classes</span>
                  </Button>
                  <Button variant="outline" className="gap-1 md:gap-2 text-xs md:text-sm">
                    <BookOpen className="w-3 md:w-4 h-3 md:h-4" />
                    <span>Subjects</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Setup Checklist */}
              {metrics && !isSetupComplete && (
                <SetupChecklist schoolId={schoolId} />
              )}

            {/* School Info Card */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">School Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs md:text-sm p-4 md:p-6 pt-0 md:pt-0">
                <div>
                  <p className="text-slate-600">Name</p>
                  <p className="font-semibold text-slate-900 truncate">{school.name}</p>
                </div>
                <div>
                  <p className="text-slate-600">Plan</p>
                  <p className="font-semibold text-slate-900 capitalize">{school.plan}</p>
                </div>
                <div>
                  <p className="text-slate-600">Status</p>
                  <p className="font-semibold text-slate-900 capitalize">{school.status}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}