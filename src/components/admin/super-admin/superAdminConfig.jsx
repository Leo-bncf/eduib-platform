export const SUPER_ADMIN_ALLOWED_ROLES = ['super_admin', 'admin'];

export const DEFAULT_SCHOOL_PLAN = 'starter';
export const DEFAULT_SCHOOL_STATUS = 'onboarding';
export const DEFAULT_BILLING_STATUS = 'trial';
export const SCHOOL_TRIAL_DURATION_DAYS = 30;

export const SCHOOL_PLAN_PRICES = {
  starter: 99,
  professional: 299,
  enterprise: 799,
};

const PLAN_META = {
  starter: {
    label: 'Starter',
    light: 'bg-blue-100 text-blue-700 border-blue-200',
    dark: 'bg-blue-900/50 text-blue-300 border-blue-800',
  },
  professional: {
    label: 'Professional',
    light: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dark: 'bg-indigo-900/50 text-indigo-300 border-indigo-800',
  },
  enterprise: {
    label: 'Enterprise',
    light: 'bg-violet-100 text-violet-700 border-violet-200',
    dark: 'bg-violet-900/50 text-violet-300 border-violet-800',
  },
};

const SCHOOL_STATUS_META = {
  active: {
    label: 'Active',
    light: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dark: 'bg-emerald-900/50 text-emerald-300 border-emerald-800',
  },
  onboarding: {
    label: 'Onboarding',
    light: 'bg-blue-100 text-blue-700 border-blue-200',
    dark: 'bg-blue-900/50 text-blue-300 border-blue-800',
  },
  suspended: {
    label: 'Suspended',
    light: 'bg-red-100 text-red-700 border-red-200',
    dark: 'bg-red-900/50 text-red-300 border-red-800',
  },
  cancelled: {
    label: 'Cancelled',
    light: 'bg-slate-100 text-slate-600 border-slate-200',
    dark: 'bg-slate-700/50 text-slate-400 border-slate-600',
  },
};

const BILLING_STATUS_META = {
  trial: {
    label: 'Trial',
    light: 'bg-amber-100 text-amber-700 border-amber-200',
    dark: 'bg-amber-900/50 text-amber-300 border-amber-800',
  },
  active: {
    label: 'Paid',
    light: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dark: 'bg-emerald-900/50 text-emerald-300 border-emerald-800',
  },
  past_due: {
    label: 'Past Due',
    light: 'bg-red-100 text-red-700 border-red-200',
    dark: 'bg-red-900/50 text-red-300 border-red-800',
  },
  incomplete: {
    label: 'Incomplete',
    light: 'bg-orange-100 text-orange-700 border-orange-200',
    dark: 'bg-orange-900/50 text-orange-300 border-orange-800',
  },
  canceled: {
    label: 'Canceled',
    light: 'bg-slate-100 text-slate-600 border-slate-200',
    dark: 'bg-slate-700/50 text-slate-400 border-slate-600',
  },
  unpaid: {
    label: 'Unpaid',
    light: 'bg-red-100 text-red-700 border-red-200',
    dark: 'bg-red-900/50 text-red-300 border-red-800',
  },
};

export const SCHOOL_PLAN_OPTIONS = Object.entries(PLAN_META).map(([value, meta]) => ({
  value,
  label: meta.label,
  price: SCHOOL_PLAN_PRICES[value],
}));

export const SCHOOL_STATUS_OPTIONS = Object.entries(SCHOOL_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export const BILLING_STATUS_OPTIONS = Object.entries(BILLING_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export function canAccessSuperAdmin(user, allowedRoles = SUPER_ADMIN_ALLOWED_ROLES) {
  return !!user && allowedRoles.includes(user.role);
}

export function getPlanPrice(plan) {
  return SCHOOL_PLAN_PRICES[plan] || SCHOOL_PLAN_PRICES[DEFAULT_SCHOOL_PLAN];
}

export function getPlanMeta(plan, tone = 'dark') {
  const meta = PLAN_META[plan] || PLAN_META[DEFAULT_SCHOOL_PLAN];
  return { ...meta, color: meta[tone] };
}

export function getSchoolStatusMeta(status, tone = 'light') {
  const meta = SCHOOL_STATUS_META[status] || {
    label: status || 'Unknown',
    light: 'bg-slate-100 text-slate-600 border-slate-200',
    dark: 'bg-slate-700/50 text-slate-400 border-slate-600',
  };
  return { ...meta, color: meta[tone] };
}

export function getBillingStatusMeta(status, tone = 'light') {
  const normalizedStatus = status === 'cancelled' ? 'canceled' : status;
  const meta = BILLING_STATUS_META[normalizedStatus] || {
    label: normalizedStatus || 'No Plan',
    light: 'bg-slate-100 text-slate-600 border-slate-200',
    dark: 'bg-slate-700/50 text-slate-400 border-slate-600',
  };
  return { ...meta, color: meta[tone] };
}

export function isPaidSchool(school) {
  return school?.billing_status === 'active' || school?.billing_status === 'past_due';
}

export function isAtRiskSchool(school) {
  return school?.status === 'suspended' || school?.billing_status === 'past_due' || school?.billing_status === 'canceled';
}

export function getSchoolHealthIssues(school) {
  const issues = [];
  if (school?.status === 'suspended') issues.push('School is suspended');
  if (school?.billing_status === 'past_due') issues.push('Payment is past due');
  if (school?.billing_status === 'incomplete') issues.push('Billing setup incomplete');
  if (school?.status === 'onboarding') issues.push('School is still in setup phase');
  return issues;
}