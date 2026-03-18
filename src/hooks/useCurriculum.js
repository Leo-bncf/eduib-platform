import { useUser } from '@/components/auth/UserContext';
import { getCurriculumConfig, formatGrade as _formatGrade } from '@/lib/curriculumConfig';

/**
 * Primary hook for curriculum-aware logic.
 * Use this anywhere you need to conditionally render or behave based on curriculum.
 *
 * Example:
 *   const { features, config, gradeLevels } = useCurriculum();
 *   if (features.coreModules) { ... }
 */
export function useCurriculum() {
  const { school } = useUser();
  const curriculum = school?.curriculum || 'ib_dp';
  const config = getCurriculumConfig(curriculum);

  return {
    curriculum,
    config,
    features: config.features,
    gradeScale: config.gradeScale,
    gradeLevels: config.gradeLevels,
    subjectLevels: config.subjectLevels,
    subjectGroups: config.subjectGroups,
    subjectGroupLabels: config.subjectGroupLabels,
    coreTab: config.coreTab,
    coordinatorRole: config.coordinatorRole,
    coordinatorLabel: config.coordinatorLabel,
    label: config.label,
    shortLabel: config.shortLabel,
    isIB: ['ib_dp', 'ib_myp', 'ib_pyp'].includes(curriculum),
    isIBDP: curriculum === 'ib_dp',
    formatGrade: (value) => _formatGrade(value, curriculum),
  };
}

export default useCurriculum;