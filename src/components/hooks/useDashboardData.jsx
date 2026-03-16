import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Optimized dashboard data fetching hook with built-in caching and batching
 */
export function useSchoolMetrics(schoolId) {
  return useQuery({
    queryKey: ['school-metrics', schoolId],
    queryFn: async () => {
      const [academicYears, terms, subjects, classes, members] = await Promise.all([
        base44.entities.AcademicYear.filter({ school_id: schoolId }),
        base44.entities.Term.filter({ school_id: schoolId }),
        base44.entities.Subject.filter({ school_id: schoolId }),
        base44.entities.Class.filter({ school_id: schoolId }),
        base44.entities.SchoolMembership.filter({ school_id: schoolId }),
      ]);

      const completedSetupItems = [
        academicYears.length > 0 ? 1 : 0,
        terms.length > 0 ? 1 : 0,
        subjects.length > 0 ? 1 : 0,
        classes.length > 0 ? 1 : 0,
        members.length > 1 ? 1 : 0,
      ];

      return {
        academicYears: academicYears.length,
        terms: terms.length,
        subjects: subjects.length,
        classes: classes.length,
        staff: Math.max(0, members.length - 1),
        setupProgress: {
          completed: completedSetupItems.reduce((a, b) => a + b, 0),
          total: 5,
        },
      };
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSchoolData(schoolId) {
  return useQuery({
    queryKey: ['school', schoolId],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ id: schoolId });
      return schools[0] || null;
    },
    enabled: !!schoolId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAllSchools(options = {}) {
  return useQuery({
    queryKey: ['schools'],
    queryFn: () => base44.entities.School.list('-updated_date', 100),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function usePlatformMetrics(schools) {
  return {
    total: schools.length,
    active: schools.filter(s => s.status === 'active').length,
    onboarding: schools.filter(s => s.status === 'onboarding').length,
    trial: schools.filter(s => s.billing_status === 'trial').length,
    paid: schools.filter(s => s.billing_status === 'active' || s.billing_status === 'past_due').length,
    atRisk: schools.filter(s => s.billing_status === 'past_due' || s.billing_status === 'canceled').length,
    suspended: schools.filter(s => s.status === 'suspended').length,
  };
}