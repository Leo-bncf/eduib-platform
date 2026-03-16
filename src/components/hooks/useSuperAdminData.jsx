import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  getPlanPrice,
  getSchoolHealthIssues,
  isAtRiskSchool,
  isPaidSchool,
} from '@/components/admin/super-admin/superAdminConfig';

const DEFAULT_STALE_TIME = 5 * 60 * 1000;
const ENTITY_LIMIT = 2000;

async function fetchSchools() {
  return base44.entities.School.list('-updated_date', 200);
}

function buildCountMap(records) {
  return records.reduce((acc, record) => {
    if (!record.school_id) return acc;
    acc[record.school_id] = (acc[record.school_id] || 0) + 1;
    return acc;
  }, {});
}

function buildOnboardingSummary(schoolId, counts) {
  const items = [
    { label: 'School Profile', completed: true },
    { label: 'Academic Years', completed: (counts.academicYears[schoolId] || 0) > 0 },
    { label: 'Terms', completed: (counts.terms[schoolId] || 0) > 0 },
    { label: 'Subjects', completed: (counts.subjects[schoolId] || 0) > 0 },
    { label: 'Classes', completed: (counts.classes[schoolId] || 0) > 0 },
  ];

  const completedCount = items.filter((item) => item.completed).length;

  return {
    progress: (completedCount / items.length) * 100,
    items,
  };
}

export function useSuperAdminSchoolsQuery(options = {}) {
  return useQuery({
    queryKey: ['super-admin', 'schools'],
    queryFn: fetchSchools,
    staleTime: DEFAULT_STALE_TIME,
    ...options,
  });
}

export function useSuperAdminSchoolOverviewQuery(options = {}) {
  return useQuery({
    queryKey: ['super-admin', 'school-overview'],
    queryFn: async () => {
      const [schools, academicYears, terms, subjects, classes] = await Promise.all([
        fetchSchools(),
        base44.entities.AcademicYear.list('-created_date', ENTITY_LIMIT),
        base44.entities.Term.list('-created_date', ENTITY_LIMIT),
        base44.entities.Subject.list('-created_date', ENTITY_LIMIT),
        base44.entities.Class.list('-created_date', ENTITY_LIMIT),
      ]);

      const counts = {
        academicYears: buildCountMap(academicYears),
        terms: buildCountMap(terms),
        subjects: buildCountMap(subjects),
        classes: buildCountMap(classes),
      };

      const onboardingBySchool = Object.fromEntries(
        schools.map((school) => [school.id, buildOnboardingSummary(school.id, counts)])
      );

      return { schools, onboardingBySchool };
    },
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

export function useSuperAdminAnalyticsQuery(options = {}) {
  return useQuery({
    queryKey: ['super-admin', 'analytics'],
    queryFn: async () => {
      const [
        schools,
        memberships,
        auditLogs,
        classes,
        subjects,
        messages,
        attendanceRecords,
        behaviorRecords,
        casExperiences,
      ] = await Promise.all([
        fetchSchools(),
        base44.entities.SchoolMembership.list('-created_date', ENTITY_LIMIT),
        base44.entities.AuditLog.list('-created_date', ENTITY_LIMIT),
        base44.entities.Class.list('-created_date', ENTITY_LIMIT),
        base44.entities.Subject.list('-created_date', ENTITY_LIMIT),
        base44.entities.Message.list('-created_date', ENTITY_LIMIT),
        base44.entities.AttendanceRecord.list('-created_date', ENTITY_LIMIT),
        base44.entities.BehaviorRecord.list('-created_date', ENTITY_LIMIT),
        base44.entities.CASExperience.list('-created_date', ENTITY_LIMIT),
      ]);

      return {
        schools,
        memberships,
        auditLogs,
        classes,
        subjects,
        messages,
        attendanceRecords,
        behaviorRecords,
        casExperiences,
      };
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function usePaginatedItems(items, pageSize, page) {
  return useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      page: safePage,
      totalItems,
      totalPages,
      paginatedItems: items.slice(start, start + pageSize),
    };
  }, [items, page, pageSize]);
}

export function getSuperAdminPlatformMetrics(schools) {
  return {
    total: schools.length,
    active: schools.filter((school) => school.status === 'active').length,
    onboarding: schools.filter((school) => school.status === 'onboarding').length,
    trial: schools.filter((school) => school.billing_status === 'trial').length,
    paid: schools.filter((school) => isPaidSchool(school)).length,
    atRisk: schools.filter((school) => isAtRiskSchool(school)).length,
    suspended: schools.filter((school) => school.status === 'suspended').length,
  };
}

export function getSuperAdminBillingMetrics(schools) {
  const totalMRR = schools
    .filter((school) => school.billing_status === 'active')
    .reduce((sum, school) => sum + getPlanPrice(school.plan), 0);

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
    .reduce((sum, school) => sum + getPlanPrice(school.plan), 0);

  return {
    byPlan,
    byBilling,
    mrrEstimate,
    paidSchools: schools.filter((school) => school.billing_status === 'active').length,
    trialSchools: schools.filter((school) => school.billing_status === 'trial').length,
  };
}

export function getSuperAdminSchoolHealth(school) {
  const issues = getSchoolHealthIssues(school);
  return {
    issues,
    isAtRisk: issues.length > 0,
  };
}