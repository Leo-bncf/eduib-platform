/**
 * Curriculum Configuration
 * Central source of truth for all curriculum-specific settings.
 * Every conditional rendering in the app should read from this config
 * via the useCurriculum() hook rather than checking curriculum strings directly.
 */

export const CURRICULUM_OPTIONS = [
  { value: 'ib_dp',         label: 'IB Diploma Programme (DP)',     description: 'Full IB DP with CAS, EE, TOK and 1-7 grading' },
  { value: 'ib_myp',        label: 'IB Middle Years Programme (MYP)', description: 'IB MYP with criterion-based assessment' },
  { value: 'ib_pyp',        label: 'IB Primary Years Programme (PYP)', description: 'IB PYP inquiry-based learning' },
  { value: 'igcse',         label: 'IGCSE / Cambridge',             description: 'Cambridge IGCSE A*–G letter grading' },
  { value: 'a_levels',      label: 'A Levels',                      description: 'UK A Levels with AS/A2 and A*–E grading' },
  { value: 'us_common_core', label: 'US Common Core',               description: 'US system with percentage/GPA grading' },
  { value: 'custom',        label: 'Custom / Other',                 description: 'Custom curriculum with flexible settings' },
];

const CURRICULA = {
  ib_dp: {
    label: 'IB Diploma Programme',
    shortLabel: 'IB DP',

    // Grade scale
    gradeScale: {
      type: 'numeric',
      min: 1,
      max: 7,
      passMark: 4,
      displayLabel: '1–7 Scale',
    },

    // Subject structure
    subjectLevels: ['HL', 'SL'],
    subjectGroups: [
      'group1_language_literature',
      'group2_language_acquisition',
      'group3_individuals_societies',
      'group4_sciences',
      'group5_mathematics',
      'group6_arts',
      'core_tok',
      'core_ee',
      'core_cas',
    ],
    subjectGroupLabels: {
      group1_language_literature: 'Group 1 – Language & Literature',
      group2_language_acquisition: 'Group 2 – Language Acquisition',
      group3_individuals_societies: 'Group 3 – Individuals & Societies',
      group4_sciences: 'Group 4 – Sciences',
      group5_mathematics: 'Group 5 – Mathematics',
      group6_arts: 'Group 6 – Arts',
      core_tok: 'Core – Theory of Knowledge',
      core_ee: 'Core – Extended Essay',
      core_cas: 'Core – CAS',
    },

    // Grade levels / year groups
    gradeLevels: ['DP1', 'DP2'],

    // Roles
    coordinatorRole: 'ib_coordinator',
    coordinatorLabel: 'IB Coordinator',

    // Feature flags
    features: {
      predictedGrades: true,
      coreModules: true,      // CAS, EE, TOK tab
      casTracking: true,
      eeTracking: true,
      tokTracking: true,
      ibGradeScale: true,
      subjectGroups: true,
      subjectLevels: true,    // HL/SL
    },

    // Student sidebar core tab
    coreTab: {
      label: 'IB Core',
      page: 'StudentIBCore',
    },
  },

  ib_myp: {
    label: 'IB Middle Years Programme',
    shortLabel: 'IB MYP',

    gradeScale: {
      type: 'numeric',
      min: 1,
      max: 7,
      passMark: 3,
      displayLabel: '1–7 Scale',
    },

    subjectLevels: [],
    subjectGroups: [
      'language_acquisition',
      'language_literature',
      'individuals_societies',
      'sciences',
      'mathematics',
      'arts',
      'physical_health_education',
      'design',
    ],
    subjectGroupLabels: {
      language_acquisition: 'Language Acquisition',
      language_literature: 'Language & Literature',
      individuals_societies: 'Individuals & Societies',
      sciences: 'Sciences',
      mathematics: 'Mathematics',
      arts: 'Arts',
      physical_health_education: 'Physical & Health Education',
      design: 'Design',
    },

    gradeLevels: ['MYP1', 'MYP2', 'MYP3', 'MYP4', 'MYP5'],

    coordinatorRole: 'ib_coordinator',
    coordinatorLabel: 'MYP Coordinator',

    features: {
      predictedGrades: false,
      coreModules: false,
      casTracking: false,
      eeTracking: false,
      tokTracking: false,
      ibGradeScale: true,
      subjectGroups: true,
      subjectLevels: false,
    },

    coreTab: null,
  },

  ib_pyp: {
    label: 'IB Primary Years Programme',
    shortLabel: 'IB PYP',

    gradeScale: {
      type: 'descriptive',
      values: ['Beginning', 'Approaching', 'Meeting', 'Exceeding'],
      displayLabel: 'Descriptive',
    },

    subjectLevels: [],
    subjectGroups: ['language', 'mathematics', 'science', 'social_studies', 'arts', 'pdpe'],
    subjectGroupLabels: {
      language: 'Language',
      mathematics: 'Mathematics',
      science: 'Science',
      social_studies: 'Social Studies',
      arts: 'Arts',
      pdpe: 'Personal, Social & Physical Education',
    },

    gradeLevels: ['PYP1', 'PYP2', 'PYP3', 'PYP4', 'PYP5'],

    coordinatorRole: 'ib_coordinator',
    coordinatorLabel: 'PYP Coordinator',

    features: {
      predictedGrades: false,
      coreModules: false,
      casTracking: false,
      eeTracking: false,
      tokTracking: false,
      ibGradeScale: false,
      subjectGroups: true,
      subjectLevels: false,
    },

    coreTab: null,
  },

  igcse: {
    label: 'IGCSE / Cambridge',
    shortLabel: 'IGCSE',

    gradeScale: {
      type: 'letter',
      values: ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'U'],
      passMark: 'C',
      displayLabel: 'A*–U',
    },

    subjectLevels: ['Core', 'Extended'],
    subjectGroups: [
      'languages',
      'humanities_social_sciences',
      'sciences',
      'mathematics',
      'creative_vocational',
    ],
    subjectGroupLabels: {
      languages: 'Languages',
      humanities_social_sciences: 'Humanities & Social Sciences',
      sciences: 'Sciences',
      mathematics: 'Mathematics',
      creative_vocational: 'Creative & Vocational',
    },

    gradeLevels: ['Year 9', 'Year 10', 'Year 11'],

    coordinatorRole: 'coordinator',
    coordinatorLabel: 'Examinations Coordinator',
    labels: { predictedGrades: 'Grade Forecasts' },

    features: {
      predictedGrades: true,
      coreModules: false,
      casTracking: false,
      eeTracking: false,
      tokTracking: false,
      ibGradeScale: false,
      subjectGroups: true,
      subjectLevels: true,
    },

    coreTab: null,
  },

  a_levels: {
    label: 'A Levels',
    shortLabel: 'A Levels',

    gradeScale: {
      type: 'letter',
      values: ['A*', 'A', 'B', 'C', 'D', 'E', 'U'],
      passMark: 'E',
      displayLabel: 'A*–U',
    },

    subjectLevels: ['AS', 'A2', 'A Level'],
    subjectGroups: [
      'arts_humanities',
      'sciences',
      'social_sciences',
      'mathematics',
      'languages',
      'vocational',
    ],
    subjectGroupLabels: {
      arts_humanities: 'Arts & Humanities',
      sciences: 'Sciences',
      social_sciences: 'Social Sciences',
      mathematics: 'Mathematics',
      languages: 'Languages',
      vocational: 'Vocational',
    },

    gradeLevels: ['Year 12', 'Year 13'],

    coordinatorRole: 'coordinator',
    coordinatorLabel: 'Academic Coordinator',
    labels: { predictedGrades: 'Grade Forecasts' },

    features: {
      predictedGrades: true,
      coreModules: false,
      casTracking: false,
      eeTracking: false,
      tokTracking: false,
      ibGradeScale: false,
      subjectGroups: true,
      subjectLevels: true,
    },

    coreTab: null,
  },

  us_common_core: {
    label: 'US Common Core',
    shortLabel: 'US',

    gradeScale: {
      type: 'percent',
      min: 0,
      max: 100,
      passMark: 60,
      displayLabel: 'Percentage / GPA',
      gpaScale: { min: 0, max: 4.0 },
    },

    subjectLevels: ['Standard', 'Honors', 'AP'],
    subjectGroups: [
      'english_language_arts',
      'mathematics',
      'science',
      'social_studies',
      'world_languages',
      'arts',
      'physical_education',
      'electives',
    ],
    subjectGroupLabels: {
      english_language_arts: 'English Language Arts',
      mathematics: 'Mathematics',
      science: 'Science',
      social_studies: 'Social Studies',
      world_languages: 'World Languages',
      arts: 'Arts',
      physical_education: 'Physical Education',
      electives: 'Electives',
    },

    gradeLevels: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],

    coordinatorRole: 'coordinator',
    coordinatorLabel: 'Academic Coordinator',

    features: {
      predictedGrades: false,
      coreModules: false,
      casTracking: false,
      eeTracking: false,
      tokTracking: false,
      ibGradeScale: false,
      subjectGroups: true,
      subjectLevels: true,
    },

    coreTab: null,
  },

  custom: {
    label: 'Custom Curriculum',
    shortLabel: 'Custom',

    gradeScale: {
      type: 'percent',
      min: 0,
      max: 100,
      passMark: 50,
      displayLabel: 'Percentage',
    },

    subjectLevels: [],
    subjectGroups: [],
    subjectGroupLabels: {},

    gradeLevels: [],

    coordinatorRole: 'coordinator',
    coordinatorLabel: 'Coordinator',

    features: {
      predictedGrades: false,
      coreModules: false,
      casTracking: false,
      eeTracking: false,
      tokTracking: false,
      ibGradeScale: false,
      subjectGroups: false,
      subjectLevels: false,
    },

    coreTab: null,
  },
};

/**
 * Get curriculum config by key.
 * Falls back to ib_dp to preserve backward compatibility with existing schools.
 */
export function getCurriculumConfig(curriculum) {
  return CURRICULA[curriculum] || CURRICULA['ib_dp'];
}

/**
 * Format a grade value according to the curriculum's scale.
 */
export function formatGrade(value, curriculum) {
  if (value === null || value === undefined) return '—';
  const config = getCurriculumConfig(curriculum);
  const scale = config.gradeScale;

  if (scale.type === 'numeric') return `${value}`;
  if (scale.type === 'letter') return `${value}`;
  if (scale.type === 'percent') return `${value}%`;
  if (scale.type === 'descriptive') return `${value}`;
  return `${value}`;
}

export default CURRICULA;