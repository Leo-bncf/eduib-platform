import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  AlertCircle, UserX, RefreshCw, CreditCard, CheckSquare,
  ArrowRight, CheckCircle2, ShieldAlert, ChevronDown, ChevronUp,
} from 'lucide-react';

function buildAlerts(data) {
  const { studentsWithoutClasses, classesWithoutTeachers, failedSyncs, school, setupSteps, setupDone, setupTotal } = data;
  const alerts = [];

  if (classesWithoutTeachers.length > 0) {
    alerts.push({
      id: 'no-teacher',
      severity: 'error',
      icon: AlertCircle,
      title: `${classesWithoutTeachers.length} Class${classesWithoutTeachers.length > 1 ? 'es' : ''} Without Teachers`,
      desc: 'Students in these classes have no assigned teacher. Assign teachers to restore full functionality.',
      detail: classesWithoutTeachers.slice(0, 5).map(c => c.name).join(', ') + (classesWithoutTeachers.length > 5 ? ` +${classesWithoutTeachers.length - 5} more` : ''),
      action: 'Assign Teachers',
      link: 'SchoolAdminEnrollments',
    });
  }

  if (studentsWithoutClasses.length > 0) {
    alerts.push({
      id: 'no-enroll',
      severity: 'warning',
      icon: UserX,
      title: `${studentsWithoutClasses.length} Student${studentsWithoutClasses.length > 1 ? 's' : ''} Not Enrolled in Any Class`,
      desc: 'These students cannot access assignments, attendance, or grades until enrolled.',
      detail: studentsWithoutClasses.slice(0, 5).map(s => s.user_name || s.user_email).join(', ') + (studentsWithoutClasses.length > 5 ? ` +${studentsWithoutClasses.length - 5} more` : ''),
      action: 'Manage Enrollments',
      link: 'SchoolAdminEnrollments',
    });
  }

  if (failedSyncs && failedSyncs.length > 0) {
    alerts.push({
      id: 'sync-error',
      severity: 'error',
      icon: RefreshCw,
      title: `Timetable Sync Error${failedSyncs.length > 1 ? 's' : ''} Detected`,
      desc: `${failedSyncs.length} timetable sync${failedSyncs.length > 1 ? 's' : ''} failed. Schedule data may be outdated.`,
      detail: null,
      action: 'View Timetable',
      link: 'SchoolAdminTimetable',
    });
  }

  if (school?.billing_status === 'past_due') {
    alerts.push({
      id: 'billing',
      severity: 'error',
      icon: CreditCard,
      title: 'Subscription Payment Past Due',
      desc: 'Your payment is overdue. Update your payment method to avoid service interruption.',
      detail: null,
      action: 'Manage Billing',
      link: 'SchoolAdminBilling',
    });
  }

  if (school?.billing_status === 'unpaid' || school?.billing_status === 'incomplete') {
    alerts.push({
      id: 'billing-unpaid',
      severity: 'error',
      icon: ShieldAlert,
      title: 'Subscription Unpaid — Action Required',
      desc: 'Your subscription is currently unpaid. Platform access may be restricted.',
      detail: null,
      action: 'Manage Billing',
      link: 'SchoolAdminBilling',
    });
  }

  if (setupDone < setupTotal) {
    const missing = [];
    if (!setupSteps.academicYears) missing.push('Academic year');
    if (!setupSteps.terms) missing.push('Terms');
    if (!setupSteps.subjects) missing.push('Subjects');
    if (!setupSteps.classes) missing.push('Classes');
    if (!setupSteps.staff) missing.push('Staff accounts');
    alerts.push({
      id: 'onboarding',
      severity: 'info',
      icon: CheckSquare,
      title: `Onboarding Incomplete — ${setupDone} of ${setupTotal} Steps Done`,
      desc: 'Complete your school setup to unlock the full platform for staff and students.',
      detail: `Missing: ${missing.join(' · ')}`,
      action: 'Continue Setup',
      link: 'SchoolOnboarding',
    });
  }

  return alerts;
}

const severityStyles = {
  error: {
    container: 'bg-red-50 border-red-200',
    leftBar: 'bg-red-500',
    icon: 'text-red-500',
    title: 'text-red-900',
    detail: 'text-red-700 bg-red-100 border-red-200',
    action: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    leftBar: 'bg-amber-500',
    icon: 'text-amber-500',
    title: 'text-amber-900',
    detail: 'text-amber-700 bg-amber-100 border-amber-200',
    action: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    leftBar: 'bg-blue-500',
    icon: 'text-blue-500',
    title: 'text-blue-900',
    detail: 'text-blue-700 bg-blue-100 border-blue-200',
    action: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
};

function AlertCard({ alert }) {
  const [expanded, setExpanded] = useState(false);
  const s = severityStyles[alert.severity];
  const Icon = alert.icon;

  return (
    <div className={`border rounded-lg overflow-hidden ${s.container}`}>
      <div className="flex items-start gap-3 p-4">
        <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${s.leftBar} -ml-4 mr-1`} />
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${s.icon}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold leading-snug ${s.title}`}>{alert.title}</p>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alert.desc}</p>

          {alert.detail && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? 'Hide details' : 'Show details'}
              </button>
              {expanded && (
                <div className={`mt-2 px-3 py-2 rounded-md border text-xs font-medium ${s.detail}`}>
                  {alert.detail}
                </div>
              )}
            </div>
          )}
        </div>
        <Link
          to={createPageUrl(alert.link)}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${s.action} whitespace-nowrap shadow-sm`}
        >
          {alert.action}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default function OperationalAlerts({ data }) {
  const alerts = buildAlerts(data);
  const errorCount = alerts.filter(a => a.severity === 'error').length;
  const warnCount = alerts.filter(a => a.severity === 'warning').length;

  if (alerts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-900">All Systems Operational</p>
          <p className="text-xs text-emerald-700 mt-0.5">No issues detected. Your school is running smoothly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        {errorCount > 0 && (
          <span className="inline-flex items-center gap-1 font-bold text-red-600">
            <AlertCircle className="w-3.5 h-3.5" /> {errorCount} critical
          </span>
        )}
        {warnCount > 0 && (
          <span className="inline-flex items-center gap-1 font-bold text-amber-600">
            <AlertCircle className="w-3.5 h-3.5" /> {warnCount} warning{warnCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Alert cards — errors first, then warnings, then info */}
      {['error', 'warning', 'info'].flatMap(sev =>
        alerts.filter(a => a.severity === sev).map(alert => (
          <AlertCard key={alert.id} alert={alert} />
        ))
      )}
    </div>
  );
}