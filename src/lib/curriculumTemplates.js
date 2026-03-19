/**
 * Curriculum Subject Templates
 * Pre-populated subject catalogs for each curriculum type.
 * Used in the onboarding wizard to seed a school's subject catalogue.
 */

export const CURRICULUM_SUBJECT_TEMPLATES = {
  ib_dp: [
    { name: 'English A: Language & Literature', code: 'EN-A-LL', ib_group: 'group1_language_literature', level: 'HL' },
    { name: 'English A: Literature', code: 'EN-A-LIT', ib_group: 'group1_language_literature', level: 'SL' },
    { name: 'Spanish B', code: 'SP-B', ib_group: 'group2_language_acquisition', level: 'SL' },
    { name: 'French B', code: 'FR-B', ib_group: 'group2_language_acquisition', level: 'SL' },
    { name: 'History', code: 'HI', ib_group: 'group3_individuals_societies', level: 'HL' },
    { name: 'Economics', code: 'EC', ib_group: 'group3_individuals_societies', level: 'SL' },
    { name: 'Biology', code: 'BI', ib_group: 'group4_sciences', level: 'HL' },
    { name: 'Chemistry', code: 'CH', ib_group: 'group4_sciences', level: 'HL' },
    { name: 'Physics', code: 'PH', ib_group: 'group4_sciences', level: 'SL' },
    { name: 'Mathematics: Analysis & Approaches', code: 'MA-AA', ib_group: 'group5_mathematics', level: 'HL' },
    { name: 'Mathematics: Applications & Interpretation', code: 'MA-AI', ib_group: 'group5_mathematics', level: 'SL' },
    { name: 'Visual Arts', code: 'VA', ib_group: 'group6_arts', level: 'HL' },
    { name: 'Theory of Knowledge', code: 'TOK', ib_group: 'core_tok', level: 'core' },
    { name: 'Extended Essay', code: 'EE', ib_group: 'core_ee', level: 'core' },
    { name: 'CAS', code: 'CAS', ib_group: 'core_cas', level: 'core' },
  ],

  ib_myp: [
    { name: 'Language & Literature', code: 'LANG-LIT', ib_group: 'language_literature', level: 'na' },
    { name: 'Language Acquisition', code: 'LANG-ACQ', ib_group: 'language_acquisition', level: 'na' },
    { name: 'Individuals & Societies', code: 'I-S', ib_group: 'individuals_societies', level: 'na' },
    { name: 'Sciences', code: 'SCI', ib_group: 'sciences', level: 'na' },
    { name: 'Mathematics', code: 'MATH', ib_group: 'mathematics', level: 'na' },
    { name: 'Arts', code: 'ARTS', ib_group: 'arts', level: 'na' },
    { name: 'Physical & Health Education', code: 'PHE', ib_group: 'physical_health_education', level: 'na' },
    { name: 'Design', code: 'DES', ib_group: 'design', level: 'na' },
  ],

  ib_pyp: [
    { name: 'Language', code: 'LANG', ib_group: 'language', level: 'na' },
    { name: 'Mathematics', code: 'MATH', ib_group: 'mathematics', level: 'na' },
    { name: 'Science', code: 'SCI', ib_group: 'science', level: 'na' },
    { name: 'Social Studies', code: 'SS', ib_group: 'social_studies', level: 'na' },
    { name: 'Arts', code: 'ARTS', ib_group: 'arts', level: 'na' },
    { name: 'Personal, Social & Physical Education', code: 'PDPE', ib_group: 'pdpe', level: 'na' },
  ],

  igcse: [
    { name: 'English Language', code: 'ENG-LANG', ib_group: 'languages', level: 'Core' },
    { name: 'English Literature', code: 'ENG-LIT', ib_group: 'languages', level: 'Extended' },
    { name: 'Mathematics', code: 'MATH', ib_group: 'mathematics', level: 'Extended' },
    { name: 'Additional Mathematics', code: 'ADD-MATH', ib_group: 'mathematics', level: 'Extended' },
    { name: 'Biology', code: 'BIO', ib_group: 'sciences', level: 'Extended' },
    { name: 'Chemistry', code: 'CHEM', ib_group: 'sciences', level: 'Extended' },
    { name: 'Physics', code: 'PHY', ib_group: 'sciences', level: 'Extended' },
    { name: 'History', code: 'HIST', ib_group: 'humanities_social_sciences', level: 'Core' },
    { name: 'Geography', code: 'GEO', ib_group: 'humanities_social_sciences', level: 'Core' },
    { name: 'Economics', code: 'ECON', ib_group: 'humanities_social_sciences', level: 'Core' },
    { name: 'Business Studies', code: 'BUS', ib_group: 'humanities_social_sciences', level: 'Core' },
    { name: 'Spanish as a Foreign Language', code: 'SPA', ib_group: 'languages', level: 'Core' },
    { name: 'French as a Foreign Language', code: 'FRE', ib_group: 'languages', level: 'Core' },
    { name: 'Art & Design', code: 'ART', ib_group: 'creative_vocational', level: 'Core' },
    { name: 'ICT', code: 'ICT', ib_group: 'creative_vocational', level: 'Core' },
    { name: 'Computer Science', code: 'CS', ib_group: 'creative_vocational', level: 'Core' },
  ],

  a_levels: [
    { name: 'English Language & Literature', code: 'ENG', ib_group: 'arts_humanities', level: 'A Level' },
    { name: 'History', code: 'HIST', ib_group: 'arts_humanities', level: 'A Level' },
    { name: 'Geography', code: 'GEO', ib_group: 'arts_humanities', level: 'A Level' },
    { name: 'Mathematics', code: 'MATH', ib_group: 'mathematics', level: 'A Level' },
    { name: 'Further Mathematics', code: 'FM', ib_group: 'mathematics', level: 'A Level' },
    { name: 'Biology', code: 'BIO', ib_group: 'sciences', level: 'A Level' },
    { name: 'Chemistry', code: 'CHEM', ib_group: 'sciences', level: 'A Level' },
    { name: 'Physics', code: 'PHY', ib_group: 'sciences', level: 'A Level' },
    { name: 'Economics', code: 'ECON', ib_group: 'social_sciences', level: 'A Level' },
    { name: 'Psychology', code: 'PSY', ib_group: 'social_sciences', level: 'A Level' },
    { name: 'Business', code: 'BUS', ib_group: 'social_sciences', level: 'A Level' },
    { name: 'Spanish', code: 'SPA', ib_group: 'languages', level: 'A Level' },
    { name: 'French', code: 'FRE', ib_group: 'languages', level: 'A Level' },
    { name: 'Computer Science', code: 'CS', ib_group: 'arts_humanities', level: 'A Level' },
    { name: 'Art & Design', code: 'ART', ib_group: 'arts_humanities', level: 'A Level' },
  ],

  us_common_core: [
    { name: 'English Language Arts', code: 'ELA', ib_group: 'english_language_arts', level: 'Standard' },
    { name: 'AP English Language', code: 'AP-ELA', ib_group: 'english_language_arts', level: 'AP' },
    { name: 'Algebra I', code: 'ALG1', ib_group: 'mathematics', level: 'Standard' },
    { name: 'Algebra II', code: 'ALG2', ib_group: 'mathematics', level: 'Standard' },
    { name: 'Pre-Calculus', code: 'PRECALC', ib_group: 'mathematics', level: 'Honors' },
    { name: 'AP Calculus', code: 'AP-CALC', ib_group: 'mathematics', level: 'AP' },
    { name: 'Biology', code: 'BIO', ib_group: 'science', level: 'Standard' },
    { name: 'Chemistry', code: 'CHEM', ib_group: 'science', level: 'Honors' },
    { name: 'Physics', code: 'PHY', ib_group: 'science', level: 'Standard' },
    { name: 'AP Biology', code: 'AP-BIO', ib_group: 'science', level: 'AP' },
    { name: 'US History', code: 'US-HIST', ib_group: 'social_studies', level: 'Standard' },
    { name: 'World History', code: 'WH', ib_group: 'social_studies', level: 'Standard' },
    { name: 'Spanish', code: 'SPA', ib_group: 'world_languages', level: 'Standard' },
    { name: 'French', code: 'FRE', ib_group: 'world_languages', level: 'Standard' },
    { name: 'Physical Education', code: 'PE', ib_group: 'physical_education', level: 'Standard' },
  ],

  ib_myp: [
    { name: 'Language & Literature', code: 'LANG-LIT', ib_group: 'language_literature', level: 'na' },
    { name: 'Language Acquisition', code: 'LANG-ACQ', ib_group: 'language_acquisition', level: 'na' },
    { name: 'Individuals & Societies', code: 'I-S', ib_group: 'individuals_societies', level: 'na' },
    { name: 'Sciences', code: 'SCI', ib_group: 'sciences', level: 'na' },
    { name: 'Mathematics', code: 'MATH', ib_group: 'mathematics', level: 'na' },
    { name: 'Arts', code: 'ARTS', ib_group: 'arts', level: 'na' },
    { name: 'Physical & Health Education', code: 'PHE', ib_group: 'physical_health_education', level: 'na' },
    { name: 'Design', code: 'DES', ib_group: 'design', level: 'na' },
  ],

  custom: [],
};

export function getSubjectTemplate(curriculum) {
  return CURRICULUM_SUBJECT_TEMPLATES[curriculum] || [];
}