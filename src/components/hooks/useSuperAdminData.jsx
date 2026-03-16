import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const DEFAULT_STALE_TIME = 5 * 60 * 1000;
export const SUPER_ADMIN_PLAN_PRICES = {
  starter: 99,
  professional: 299,
  enterprise: 799,
};

async function fetchSchools() {
  return base44.entities.School.list('-updated_date', 100);
}

export function useSuperAdminSchoolsQuery(options = {}) {
  return useQuery({
    queryKey: ['super-admin', 'schools'],
    queryFn: fetchSchools,
    staleTime: DEFAULT_STALE_TIME,
    ...options,
  });
}

export function useSuperAdminUsersQuery(options = {}) {
  return useQuery({
    queryKey: ['super-admin', 'users'],
    queryFn: async () => {
      const [schools, usersRes] = await Promise.all([
        fetchSchools(),
        base44.functions.invoke('listAllUsers', {}),
      ]);

      const schoolMap = Object.fromEntries(schools.map((school) => [school.id, school.name]));
      const users = (usersRes.data?.users || []).map((user) => ({
        ...user,
        school_name: user.active_school_id ? schoolMap[user.active_school_id] || 'Unknown' : '—',
      }));

      return { schools, users };
    },
    staleTime: DEFAULT_STALE_TIME,
    ...options,
  });
}

export function useSuperAdminAuditLogsQuery(options = {}) {
  return useQuery({
    queryKey: ['super-admin', 'audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 500),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    ...options,
  });
}

export function useSuperAdminSchoolDetailQuery(schoolId, options = {}) {
  return useQuery({
    queryKey: ['super-admin', 'school-detail', schoolId],
    queryFn: async () => {
      const [schools, academicYears, terms, subjects, classes, members] = await Promise.all([
        base44.entities.School.filter({ id: schoolId }),
        base44.entities.AcademicYear.filter({ school_id: schoolId }),
        base44.entities.Term.filter({ school_id: schoolId }),
        base44.entities.Subject.filter({ school_id: schoolId }),
        base44.entities.Class.filter({ school_id: schoolId }),
        base44.entities.SchoolMembership.filter({ school_id: schoolId }),
      ]);

      return {
        school: schools[0] || null,
        stats: {
          academicYears: academicYears.length,
          terms: terms.length,
          subjects: subjects.length,
          classes: classes.length,
          staff: members.length,
        },
        members,
      };
    },
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!schoolId && (options.enabled ?? true),
    ...options,
  });
}

export function getSuperAdminPlatformMetrics(schools) {
  return {
    total: schools.length,
    active: schools.filter((school) => school.status === 'active').length,
    onboarding: schools.filter((school) => school.status === 'onboarding').length,
    trial: schools.filter((school) => school.billing_status === 'trial').length,
    paid: schools.filter((school) => school.billing_status === 'active' || school.billing_status === 'past_due').length,
    atRisk: schools.filter((school) => school.billing_status === 'past_due' || school.billing_status === 'canceled').length,
    suspended: schools.filter((school) => school.status === 'suspended').length,
  };
}

export function getSuperAdminBillingMetrics(schools) {
  const totalMRR = schools
    .filter((school) => school.billing_status === 'active')
    .reduce((sum, school) => sum + (SUPER_ADMIN_PLAN_PRICES[school.plan] || SUPER_ADMIN_PLAN_PRICES.starter), 0);

  return {
    totalMRR,
    stats: {
      active: schools.filter((school) => school.billing_status === 'active').length,
      trial: schools.filter((school) => school.billing_status === 'trial').length,
      pastDue: schools.filter((school) => school.billing_status === 'past_due').length,
    },
  };
}

export function getSuperAdminPlanMetrics(schools) {
  const byPlan = {};
  const byBilling = {};

  schools.forEach((school) => {
    const plan = school.plan || 'unknown';
    const billing = school.billing_status || 'none';
    byPlan[plan] = (byPlan[plan] || 0) + 1;
    byBilling[billing] = (byBilling[billing] || 0) + 1;
  });

  const mrrEstimate = schools
    .filter((school) => school.billing_status === 'active')
    .reduce((sum, school) => sum + (SUPER_ADMIN_PLAN_PRICES[school.plan] || SUPER_ADMIN_PLAN_PRICES.starter), 0);

  return {
    byPlan,
    byBilling,
    mrrEstimate,
    paidSchools: schools.filter((school) => school.billing_status === 'active').length,
    trialSchools: schools.filter((school) => school.billing_status === 'trial').length,
  };
}