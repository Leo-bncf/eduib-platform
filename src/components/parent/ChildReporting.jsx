import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, TrendingUp, Download, Loader2, BarChart3, Users, Briefcase } from 'lucide-react';

export default function ChildReporting({ schoolId, studentId, studentName }) {
  const [downloading, setDownloading] = useState(null);

  // Fetch term reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['parentReports', schoolId, studentId],
    queryFn: () => base44.entities.Report.filter({ school_id: schoolId, entity_type: 'student', entity_id: studentId }),
  });

  // Fetch predicted grades for analytics
  const { data: predictedGrades = [] } = useQuery({
    queryKey: ['parentPredictedGrades', schoolId, studentId],
    queryFn: () => base44.entities.PredictedGrade.filter({ school_id: schoolId, student_id: studentId }),
  });

  // Fetch grades for trend analytics
  const { data: grades = [] } = useQuery({
    queryKey: ['parentGrades', schoolId, studentId],
    queryFn: () => base44.entities.GradeItem.filter({ school_id: schoolId, student_id: studentId }),
  });

  // Fetch cohort data for class context
  const { data: cohorts = [], isLoading: cohortsLoading } = useQuery({
    queryKey: ['parentCohorts', schoolId, studentId],
    queryFn: async () => {
      const memberships = await base44.entities.SchoolMembership.filter({ 
        user_id: studentId, 
        school_id: schoolId 
      });
      if (memberships.length === 0) return [];
      
      const cohortIds = memberships
        .filter(m => m.role === 'student')
        .map(m => m.grade_level)
        .filter(Boolean);
      
      if (cohortIds.length === 0) return [];
      
      return base44.entities.Cohort.filter({ 
        school_id: schoolId,
        grade_level: { $in: cohortIds }
      });
    },
  });

  // Fetch student submissions/portfolio
  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ['parentSubmissions', schoolId, studentId],
    queryFn: () => base44.entities.Submission.filter({ 
      school_id: schoolId, 
      student_id: studentId,
      status: 'submitted'
    }),
  });

  const handleDownloadReport = async (reportId) => {
    setDownloading(reportId);
    try {
      const response = await base44.functions.invoke('generateReportPDF', {
        reportId,
        studentId,
        schoolId,
      });
      
      if (response.data?.url) {
        const link = document.createElement('a');
        link.href = response.data.url;
        link.download = `report-${reportId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to download report:', error);
    } finally {
      setDownloading(null);
    }
  };

  const calculateGradeTrends = () => {
    if (grades.length < 2) return null;
    
    const sorted = [...grades].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    const latest = sorted[0]?.percentage || 0;
    const previous = sorted[1]?.percentage || 0;
    const trend = latest - previous;
    
    return {
      current: latest.toFixed(1),
      trend: trend.toFixed(1),
      direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
    };
  };

  const trends = calculateGradeTrends();
  const hasAnalyticsPermission = reports.some(r => r.analytics_enabled);
  const hasCohortPermission = reports.some(r => r.cohort_insights_enabled);
  const hasPortfolioPermission = reports.some(r => r.portfolio_enabled);

  return (
    <div className="space-y-6">
      {/* PDF Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            PDF Reports
          </CardTitle>
          <CardDescription>Download term reports, progress snapshots, and assessment summaries</CardDescription>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div>
                    <h4 className="font-medium text-slate-900">{report.name || 'Term Report'}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Generated {new Date(report.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadReport(report.id)}
                    disabled={downloading === report.id}
                    className="gap-2"
                  >
                    {downloading === report.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription>No reports available yet. Check back after grading periods conclude.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analytics Section */}
      {hasAnalyticsPermission && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Performance Analytics
            </CardTitle>
            <CardDescription>View {studentName}'s trends in grades and performance (if enabled by school)</CardDescription>
          </CardHeader>
          <CardContent>
            {trends ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Current Average</p>
                    <p className="text-2xl font-bold text-slate-900">{trends.current}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Grade Trend</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-slate-900">{trends.trend}%</p>
                      <TrendingUp 
                        className={`w-5 h-5 ${
                          trends.direction === 'up' ? 'text-emerald-600 rotate-0' : 
                          trends.direction === 'down' ? 'text-red-600 rotate-180' : 
                          'text-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  Based on recent grade submissions and assessments
                </p>
              </div>
            ) : (
              <Alert>
                <AlertDescription>Insufficient grade data to display trends. More grades will be available as the term progresses.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}