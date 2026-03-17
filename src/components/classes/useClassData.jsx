import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useClassData(schoolId) {
  const classes = useQuery({
    queryKey: ['school-classes', schoolId],
    queryFn: () => base44.entities.Class.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const subjects = useQuery({
    queryKey: ['school-subjects', schoolId],
    queryFn: () => base44.entities.Subject.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  const memberships = useQuery({
    queryKey: ['school-memberships', schoolId],
    queryFn: () => base44.entities.SchoolMembership.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const academicYears = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: () => base44.entities.AcademicYear.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const cohorts = useQuery({
    queryKey: ['cohorts', schoolId],
    queryFn: () => base44.entities.Cohort.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  return {
    classes: classes.data ?? [],
    subjects: subjects.data ?? [],
    memberships: memberships.data ?? [],
    academicYears: academicYears.data ?? [],
    cohorts: cohorts.data ?? [],
    isLoading: classes.isLoading,
  };
}