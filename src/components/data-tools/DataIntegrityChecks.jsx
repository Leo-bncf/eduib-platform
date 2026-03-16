import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ShieldCheck, Loader2, CheckCircle2, AlertTriangle, AlertCircle,
  Users, BookOpen, UserCheck, Link2, RefreshCw
} from 'lucide-react';

async function runChecks(schoolId) {
  const [memberships, classes, assignments, submissions, gradeItems] = await Promise.all([
    base44.entities.SchoolMembership.filter({ school_id: schoolId }),
    base44.entities.Class.filter({ school_id: schoolId }),
    base44.entities.Assignment.filter({ school_id: schoolId }),
    base44.entities.Submission.filter({ school_id: schoolId }),
    base44.entities.GradeItem.filter({ school_id: schoolId }),
  ]);

  const issues = [];

  // 1. Students not enrolled in any class
  const activeStudents = memberships.filter(m => m.role === 'student' && m.status === 'active');
  const enrolledIds = new Set(classes.flatMap(c => c.student_ids || []));
  const unenrolledStudents = activeStudents.filter(s => !enrolledIds.has(s.user_id));
  if (unenrolledStudents.length > 0) {
    issues.push({
      id: 'unenrolled-students',
      severity: 'warning',
      icon: Users,
      title: `${unenrolledStudents.length} student(s) not enrolled in any class`,
      desc: 'These students cannot access assignments, grades, or attendance records.',
      affectedCount: unenrolledStudents.length,
      resolution: 'Go to Enrollments to assign them to classes.',
    });
  }

  // 2. Classes without teachers
  const classesNoTeacher = classes.filter(c => {
    const legacyOk = c.teacher_ids && c.teacher_ids.length > 0;
    const assignOk = c.subject_teacher_assignments && c.subject_teacher_assignments.some(a => a.teacher_ids?.length > 0);
    return !legacyOk && !assignOk;
  });
  if (classesNoTeacher.length > 0) {
    issues.push({
      id: 'classes-no-teacher',
      severity: 'error',
      icon: BookOpen,
      title: `${classesNoTeacher.length} class(es) have no teacher assigned`,
      desc: 'Students in these classes have no teacher for instruction or grading.',
      affectedCount: classesNoTeacher.length,
      resolution: 'Go to Enrollments → Assign Teachers.',
    });
  }

  // 3. Classes without any students
  const classesNoStudents = classes.filter(c => !c.student_ids || c.student_ids.length === 0);
  if (classesNoStudents.length > 0) {
    issues.push({
      id: 'classes-no-students',
      severity: 'info',
      icon: UserCheck,
      title: `${classesNoStudents.length} class(es) have no students enrolled`,
      desc: 'Empty classes may be stale or need student roster setup.',
      affectedCount: classesNoStudents.length,
      resolution: 'Review and enroll students or archive the classes.',
    });
  }

  // 4. Submissions referencing deleted assignments
  const assignmentIds = new Set(assignments.map(a => a.id));
  const orphanSubmissions = submissions.filter(s => !assignmentIds.has(s.assignment_id));
  if (orphanSubmissions.length > 0) {
    issues.push({
      id: 'orphan-submissions',
      severity: 'warning',
      icon: Link2,
      title: `${orphanSubmissions.length} submission(s) reference missing assignments`,
      desc: 'These submissions are orphaned — their parent assignment no longer exists.',
      affectedCount: orphanSubmissions.length,
      resolution: 'These records are harmless but can be cleaned up by a Super Admin.',
    });
  }

  // 5. GradeItems without a student_id (and not templates)
  const brokenGrades = gradeItems.filter(g => !g.student_id && !g.is_template);
  if (brokenGrades.length > 0) {
    issues.push({
      id: 'broken-grades',
      severity: 'warning',
      icon: AlertCircle,
      title: `${brokenGrades.length} grade record(s) missing student reference`,
      desc: 'These grade items have no linked student and may be data entry errors.',
      affectedCount: brokenGrades.length,
      resolution: 'Review these grade records in the Gradebook.',
    });
  }

  return {
    issues,
    checkedAt: new Date().toISOString(),
    totalChecks: 5,
    passedChecks: 5 - issues.length,
  };
}

const severityStyles = {
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};
const severityIcon = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: AlertCircle,
};
const severityBadge = {
  error: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
};

export default function DataIntegrityChecks({ schoolId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    const r = await runChecks(schoolId);
    setResult(r);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">Data Integrity Scanner</h3>
          <p className="text-sm text-slate-500">Run automated checks to detect inconsistencies and broken references across your school data.</p>
        </div>
        <Button onClick={handleRun} disabled={loading} className="flex-shrink-0 bg-slate-800 hover:bg-slate-900">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          {result ? 'Re-run' : 'Run Checks'}
        </Button>
      </div>

      {!result && !loading && (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-md p-10 text-center">
          <ShieldCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Click "Run Checks" to scan your school data for issues</p>
          <p className="text-xs text-slate-400 mt-1">Checks take only a few seconds</p>
        </div>
      )}

      {loading && (
        <div className="bg-slate-50 border border-slate-200 rounded-md p-10 text-center">
          <Loader2 className="w-8 h-8 text-slate-400 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-slate-500">Scanning data...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          {/* Summary */}
          <div className={`border rounded-md p-4 flex items-center gap-4 ${result.issues.length === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
            {result.issues.length === 0 ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-bold ${result.issues.length === 0 ? 'text-emerald-800' : 'text-slate-900'}`}>
                {result.issues.length === 0
                  ? 'All checks passed — your data looks clean!'
                  : `${result.issues.length} issue${result.issues.length > 1 ? 's' : ''} found across ${result.totalChecks} checks`
                }
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {result.passedChecks}/{result.totalChecks} checks passed • Scanned {new Date(result.checkedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Issues list */}
          {result.issues.map(issue => {
            const SIcon = severityIcon[issue.severity];
            const IssueIcon = issue.icon;
            return (
              <div key={issue.id} className={`border rounded-md p-4 ${severityStyles[issue.severity]}`}>
                <div className="flex items-start gap-3">
                  <SIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold">{issue.title}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityBadge[issue.severity]}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-sm mt-1 opacity-80">{issue.desc}</p>
                    <p className="text-xs mt-2 font-medium opacity-70">→ {issue.resolution}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}