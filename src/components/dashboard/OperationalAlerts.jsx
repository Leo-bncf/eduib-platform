import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  AlertCircle, UserX, RefreshCw, CreditCard, CheckSquare, ArrowRight, CheckCircle2, ShieldAlert
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
      action: 'Assign Teachers',
      link: 'SchoolAdminEnrollments',
    });
  }

  if (studentsWithoutClasses.length > 0) {
    alerts.push({
      id: 'no-enroll',
      severity: 'warning',
      icon: UserX,
      title: `${studentsWithoutClasses.length} Student${studentsWithoutClasses.length > 1 ? 's' : ''} Not Enrolled`,
      desc: 'These students are not enrolled in any class and cannot access assignments or attendance.',
      action: 'Manage Enrollments',
      link: 'SchoolAdminEnrollments',
    });
  }

  if (failedSyncs && failedSyncs.length > 0) {
    alerts.push({
      id: 'sync-error',
      severity: 'error',
      icon: RefreshCw,
      title: `Timetable Sync Error${failedSyncs.length > 1 ? 's' : ''}`,
      desc: `${failedSyncs.length} timetable sync(s) failed. Your schedule data may be out of date.`,
      action: 'View Timetable',
      link: 'SchoolAdminTimetable',
    });
  }

  if (school?.billing_status === 'past_due') {
    alerts.push({
      id: 'billing',
      severity: 'error',
      icon: CreditCard,
      title: 'Payment Past Due',
      desc: 'Your subscription payment is overdue. Update your payment method to avoid service interruption.',
      action: 'Manage Billing',
      link: 'SchoolAdminBilling',
    });
  }

  if (school?.billing_status === 'unpaid' || school?.billing_status === 'incomplete') {
    alerts.push({
      id: 'billing-unpaid',
      severity: 'error',
      icon: ShieldAlert,
      title: 'Subscription Unpaid',
      desc: 'Your subscription is unpaid. Please update your payment details immediately.',
      action: 'Manage Billing',
      link: 'SchoolAdminBilling',
    });
  }

  if (setupDone < setupTotal) {
    const missing = [];
    if (!setupSteps.academicYears) missing.push('academic year');
    if (!setupSteps.terms) missing.push('terms');
    if (!setupSteps.subjects) missing.push('subjects');
    if (!setupSteps.classes) missing.push('classes');
    if (!setupSteps.staff) missing.push('staff');
    alerts.push({
      id: 'onboarding',
      severity: 'info',
      icon: CheckSquare,
      title: `Onboarding Incomplete (${setupDone}/${setupTotal})`,
      desc: `Missing: ${missing.join(', ')}. Complete setup to unlock the full platform.`,
      action: 'Continue Setup',
      link: 'SchoolOnboarding',
    });
  }

  return alerts;
}

const severityStyles = {
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-800',
    action: 'text-red-700 hover:text-red-900',
    dot: 'bg-red-500',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-600',
    title: 'text-amber-800',
    action: 'text-amber-700 hover:text-amber-900',
    dot: 'bg-amber-500',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    action: 'text-blue-700 hover:text-blue-900',
    dot: 'bg-blue-500',
  },
};

export default function OperationalAlerts({ data }) {
  const alerts = buildAlerts(data);

  if (alerts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">All systems operational</p>
          <p className="text-xs text-emerald-600 mt-0.5">No urgent issues detected. Your school is running smoothly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => {
        const s = severityStyles[alert.severity];
        const Icon = alert.icon;
        return (
          <div key={alert.id} className={`border rounded-md p-4 flex items-start gap-3 ${s.container}`}>
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${s.icon}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${s.title}`}>{alert.title}</p>
              <p className="text-sm text-slate-600 mt-0.5 leading-snug">{alert.desc}</p>
            </div>
            <Link
              to={createPageUrl(alert.link)}
              className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${s.action} transition-colors`}
            >
              {alert.action}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}