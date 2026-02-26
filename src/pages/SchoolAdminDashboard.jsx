import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Users, Settings, FileText, BookOpen } from 'lucide-react';
import SetupChecklist from '@/components/school/SetupChecklist';
import OnboardingProgress from '@/components/school/OnboardingProgress';

/**
 * School admin dashboard with onboarding awareness
 */
export default function SchoolAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [setupProgress, setSetupProgress] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          navigate('/');
          return;
        }

        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Get user's school
        const memberships = await base44.entities.SchoolMembership.filter({
          user_id: currentUser.id
        });

        if (!memberships || memberships.length === 0) {
          navigate('/no-school');
          return;
        }

        const schoolId = memberships[0].school_id;
        const schools = await base44.entities.School.filter({ id: schoolId });

        if (schools.length > 0) {
          setSchool(schools[0]);

          // Load setup stats
          const [academicYears, terms, subjects, classes, members] = await Promise.all([
            base44.entities.AcademicYear.filter({ school_id: schoolId }),
            base44.entities.Term.filter({ school_id: schoolId }),
            base44.entities.Subject.filter({ school_id: schoolId }),
            base44.entities.Class.filter({ school_id: schoolId }),
            base44.entities.SchoolMembership.filter({ school_id: schoolId })
          ]);

          const completedSetupItems = [
            schools[0].name ? 1 : 0,
            academicYears.length > 0 ? 1 : 0,
            terms.length > 0 ? 1 : 0,
            subjects.length > 0 ? 1 : 0,
            classes.length > 0 ? 1 : 0,
            members.length > 1 ? 1 : 0
          ];

          setSetupProgress({
            completed: completedSetupItems.reduce((a, b) => a + b, 0),
            total: 6
          });

          setStats({
            academicYears: academicYears.length,
            terms: terms.length,
            subjects: subjects.length,
            classes: classes.length,
            staff: Math.max(0, members.length - 1)
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const isSetupComplete = setupProgress && setupProgress.completed === setupProgress.total;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">School Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome, {user?.full_name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Setup Status Card */}
            {!isSetupComplete && (
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <AlertCircle className="w-5 h-5" />
                    School Setup In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-amber-800">
                    Complete your school setup to unlock all features. You're {setupProgress?.completed || 0} of {setupProgress?.total || 6} steps complete.
                  </p>
                  {setupProgress && (
                    <div className="w-full bg-amber-200 rounded-full h-2">
                      <div
                        className="bg-amber-600 h-2 rounded-full transition-all"
                        style={{ width: `${(setupProgress.completed / setupProgress.total) * 100}%` }}
                      />
                    </div>
                  )}
                  <Button
                    onClick={() => navigate('/school-onboarding')}
                    className="w-full bg-amber-600 hover:bg-amber-700 gap-2"
                  >
                    Continue Setup
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BookOpen className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{stats?.academicYears || 0}</p>
                    <p className="text-sm text-slate-600 mt-1">Academic Years</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{stats?.subjects || 0}</p>
                    <p className="text-sm text-slate-600 mt-1">Subjects</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{stats?.classes || 0}</p>
                    <p className="text-sm text-slate-600 mt-1">Classes</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{stats?.staff || 0}</p>
                    <p className="text-sm text-slate-600 mt-1">Staff Members</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="gap-2">
                    <Users className="w-4 h-4" />
                    Invite Staff
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Settings className="w-4 h-4" />
                    School Settings
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    View Classes
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Manage Subjects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Setup Checklist */}
            {setupProgress && !isSetupComplete && (
              <SetupChecklist
                schoolId={school?.id}
                onNavigate={(taskId) => {
                  // Navigate to specific setup step
                }}
              />
            )}

            {/* School Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">School Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Name</p>
                  <p className="font-semibold text-slate-900">{school?.name}</p>
                </div>
                <div>
                  <p className="text-slate-600">Plan</p>
                  <p className="font-semibold text-slate-900 capitalize">{school?.plan}</p>
                </div>
                <div>
                  <p className="text-slate-600">Status</p>
                  <p className="font-semibold text-slate-900 capitalize">{school?.status}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}